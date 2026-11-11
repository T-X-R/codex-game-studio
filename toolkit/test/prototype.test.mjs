import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, readFile, writeFile, mkdir, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { scaffoldPrototype, importPrototype, packagePrototype } from '../dist/prototype.js';
async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'game-studio-prototype-'));
  t.after(() => rm(root, { recursive: true, force: true })); return root;
}
test('scaffold previews without writes, escapes user prose and refuses overwrite', async t => {
  const root = await fixture(t);
  await scaffoldPrototype(root, 'test-game', "x '</script> 雨", 'why -->\nnow?', true);
  await assert.rejects(readFile(join(root, 'prototypes/test-game/index.html')), { code: 'ENOENT' });
  await scaffoldPrototype(root, 'test-game', "x '</script> 雨", 'why -->\nnow?');
  const html = await readFile(join(root, 'prototypes/test-game/index.html'), 'utf8');
  assert.ok(html.includes('&lt;/script&gt;'));
  assert.ok(!html.includes("const TITLE = 'x '</script>"));
  assert.match(html, /window.game/);
  await assert.rejects(scaffoldPrototype(root, 'test-game'), { code: 'FILE_CONFLICT' });
  await assert.rejects(scaffoldPrototype(root, '../escape'), { code: 'INVALID_ARGUMENT' });
});
test('import and package preserve binary assets and source files while excluding development evidence', async t => {
  const root = await fixture(t);
  const source = await fixture(t);
  await writeFile(join(source, 'index.html'), '<script src="tune.js"></script><canvas></canvas>');
  await writeFile(join(source, 'image.png'), Buffer.from([0, 255, 128, 12]));
  await writeFile(join(source, 'tune.js'), '');
  await mkdir(join(source, 'evidence'));
  await writeFile(join(source, 'evidence/log.txt'), 'private evidence');
  await importPrototype(root, source, 'imported');
  await packagePrototype(root, 'prototypes/imported', 'builds/imported');
  assert.deepEqual(await readFile(join(root, 'builds/imported/image.png')), Buffer.from([0, 255, 128, 12]));
  assert.equal(await readFile(join(root, 'builds/imported/index.html'), 'utf8'), '<canvas></canvas>');
  await assert.rejects(readFile(join(root, 'builds/imported/evidence/log.txt')), { code: 'ENOENT' });
  assert.ok((await readFile(join(source, 'index.html'), 'utf8')).includes('tune.js'));
  await assert.rejects(packagePrototype(root, 'prototypes/imported', 'builds/imported'), { code: 'FILE_CONFLICT' });
});
test('imports refuse symbolic links instead of copying files outside the source', async t => {
  const root = await fixture(t);
  const source = await fixture(t);
  await writeFile(join(source, 'index.html'), 'game');
  await symlink(join(source, 'index.html'), join(source, 'linked.html'));
  await assert.rejects(importPrototype(root, source, 'unsafe'), { code: 'UNSAFE_PATH' });
});


test('template values are replaced once and cannot inject script through another placeholder', async t => {
  const root = await fixture(t);
  await scaffoldPrototype(root, 'escaping', '@QUESTION@', '";throw new Error(); //\u2028bad');
  const html = await readFile(join(root, 'prototypes/escaping/index.html'), 'utf8');
  assert.ok(html.includes('const TITLE = "@QUESTION@";'));
  const config = await readFile(join(root, 'prototypes/escaping/config.js'), 'utf8');
  assert.ok(!config.includes('\u2028'));
});
