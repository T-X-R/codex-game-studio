import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, realpath, mkdir, readFile, writeFile, readdir, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { scaffoldPrototype } from '../dist/prototype.js';
import { planGrowthCopy } from '../dist/grow-copy.js';
import { applyInstall, planDetach } from '../dist/install.js';
const cli = fileURLToPath(new URL('../dist/cli.js', import.meta.url));
async function fixture(t) {
  const root = await realpath(await mkdtemp(join(tmpdir(), 'studio grow copy ')));
  t.after(() => rm(root, { recursive: true, force: true }));
  await writeFile(join(root, 'project.yaml'), 'engine:\n  name: Web\n');
  await scaffoldPrototype(root, 'demo');
  return root;
}
test('copy planning is read-only; apply preserves prototype bytes and installs matching pinned tooling', async t => {
  const root = await fixture(t);
  const source = join(root, 'prototypes/demo/index.html');
  const html = await readFile(source);
  const original = await stat(source);
  await writeFile(join(root, 'prototypes/demo/assets/image.png'), Buffer.from([0, 255, 128, 13]));
  const tree = await readdir(root, { recursive: true });
  const result = await planGrowthCopy(root, 'demo');
  assert.deepEqual(await readdir(root, { recursive: true }), tree);
  assert.equal(result.verification.state, 'not_assessed');
  assert.ok(result.remaining.includes('TypeScript conversion and game-rule tests'));
  await applyInstall(result.plan);
  assert.deepEqual(await readFile(source), html);
  assert.equal((await stat(source)).mtimeMs, original.mtimeMs);
  assert.deepEqual(await readFile(join(root, 'assets/image.png')), Buffer.from([0, 255, 128, 13]));
  assert.match(await readFile(join(root, 'index.html'), 'utf8'), /type="module" src="\.\/src\/main.js"/);
  assert.match(await readFile(join(root, 'src/main.js'), 'utf8'), /import '\.\/config.js'/);
  assert.deepEqual(await readFile(join(root, 'src/config.js')), await readFile(join(root, 'prototypes/demo/config.js')));
  const pkg = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
  const lock = JSON.parse(await readFile(join(root, 'package-lock.json'), 'utf8'));
  assert.equal(pkg.name, 'demo'); assert.equal(lock.name, 'demo'); assert.equal(lock.packages[''].name, 'demo');
  assert.deepEqual(pkg.devDependencies, lock.packages[''].devDependencies);
  assert.equal(pkg.devDependencies.vite, '8.3.4');
  assert.equal(JSON.parse(await readFile(join(root, 'tsconfig.json'), 'utf8')).compilerOptions.strict, true);
  await applyInstall(await planDetach(root));
  assert.deepEqual(await readFile(join(root, 'assets/image.png')), Buffer.from([0, 255, 128, 13]));
  await assert.rejects(planGrowthCopy(root, 'demo'), { code: 'GROWTH_BLOCKED' });
});
test('existing assets and late source or target edits block all writes', async t => {
  for (const conflict of ['asset', 'source', 'target', 'configuration']) {
    const root = await fixture(t);
    await writeFile(join(root, 'prototypes/demo/assets/image.png'), 'source image');
    if (conflict === 'asset') {
      await mkdir(join(root, 'assets'));
      await writeFile(join(root, 'assets/image.png'), 'existing image');
      await assert.rejects(planGrowthCopy(root, 'demo'), { code: 'FILE_CONFLICT' });
    } else {
      const { plan } = await planGrowthCopy(root, 'demo');
      const path = conflict === 'source' ? 'prototypes/demo/index.html' : conflict === 'configuration' ? 'project.yaml' : 'index.html';
      await writeFile(join(root, path), 'concurrent edit');
      await assert.rejects(applyInstall(plan), { code: 'FILE_CONFLICT' });
      assert.equal(await readFile(join(root, path), 'utf8'), 'concurrent edit');
    }
    await assert.rejects(readFile(join(root, 'package.json')), { code: 'ENOENT' });
  }
});
test('copy never evaluates configuration, preserves user ignores and carries tuning only into development', async t => {
  const root = await fixture(t);
  await writeFile(join(root, '.gitignore'), '# mine\r\nnode_modules/\r\n');
  const dangerous = 'throw new Error("must not execute while copying");';
  await writeFile(join(root, 'prototypes/demo/config.js'), dangerous);
  const source = join(root, 'prototypes/demo/index.html');
  await writeFile(source, (await readFile(source, 'utf8')).replace('</body>', '<script src="tune.js"></script>\n</body>'));
  await writeFile(join(root, 'prototypes/demo/tune.js'), 'window.panelLoaded = true;');
  await writeFile(join(root, 'prototypes/demo/feel-log.md'), '<!-- PROTOTYPE - NOT FOR PRODUCTION -->\nPlayer said: keep movement.\n');
  const result = await planGrowthCopy(root, 'demo');
  await applyInstall(result.plan);
  assert.equal(await readFile(join(root, 'src/config.js'), 'utf8'), dangerous);
  assert.match(await readFile(join(root, '.gitignore'), 'utf8'), /^# mine\r\nnode_modules\/\r\n/);
  assert.equal((await readFile(join(root, '.gitignore'), 'utf8')).match(/node_modules\//g).length, 1);
  assert.match(await readFile(join(root, 'src/main.js'), 'utf8'), /import.meta.env.DEV/);
  assert.doesNotMatch(await readFile(join(root, 'index.html'), 'utf8'), /tune.js/);
  assert.equal(await readFile(join(root, 'design/feel-log.md'), 'utf8'), 'Player said: keep movement.\n');
});
test('additional scripts are reported for explicit migration before any partial copy', async t => {
  for (const script of ['<script src="vendor.js"></script>', '<script type="module">export {};</script>', '<script>window.other = 1;</script>']) {
    const root = await fixture(t);
    const path = join(root, 'prototypes/demo/index.html');
    await writeFile(path, (await readFile(path, 'utf8')).replace('</body>', `${script}</body>`));
    await assert.rejects(planGrowthCopy(root, 'demo'), { code: 'GROWTH_REQUIRES_CONVERSION' });
    await assert.rejects(readFile(join(root, 'package.json')), { code: 'ENOENT' });
  }
});
test('an explicitly different Web version cannot silently receive a newer pinned build tool', async t => {
  const root = await fixture(t);
  await writeFile(join(root, 'project.yaml'), 'engine:\n  name: Web\n  version: "7.3.1"\n');
  await assert.rejects(planGrowthCopy(root, 'demo'), { code: 'GROWTH_REQUIRES_CONVERSION' });
  await assert.rejects(readFile(join(root, 'package.json')), { code: 'ENOENT' });
});
test('hookless imports without configuration still copy and unmatched files are explicitly listed', async t => {
  const root = await fixture(t);
  await rm(join(root, 'prototypes/demo/config.js'));
  await writeFile(join(root, 'prototypes/demo/index.html'), '<html><body><script>document.title = "imported";</script></body></html>');
  await writeFile(join(root, 'prototypes/demo/notes.txt'), 'do not silently lose this');
  const result = await planGrowthCopy(root, 'demo');
  assert.ok(result.left.includes('notes.txt'));
  await applyInstall(result.plan);
  assert.equal(await readFile(join(root, 'src/main.js'), 'utf8'), 'document.title = "imported";');
  await assert.rejects(readFile(join(root, 'src/config.js')), { code: 'ENOENT' });
});
test('CLI requires the explicit copy stage, supports dry-run, and reports pending verification', async t => {
  const root = await fixture(t);
  const run = (...args) => spawnSync(process.execPath, [cli, 'prototype', 'grow', 'demo', '--project', root, '--json', ...args], { encoding: 'utf8' });
  assert.equal(run().status, 2);
  let result = run('--stage', 'copy', '--dry-run');
  assert.equal(result.status, 0, result.stdout);
  assert.equal(JSON.parse(result.stdout).data.outcome, 'planned');
  await assert.rejects(readFile(join(root, 'package.json')), { code: 'ENOENT' });
  result = run('--stage', 'copy');
  assert.equal(result.status, 0, result.stdout);
  assert.equal(JSON.parse(result.stdout).data.outcome, 'copied');
  assert.equal(JSON.parse(result.stdout).data.verification.state, 'not_assessed');
});
