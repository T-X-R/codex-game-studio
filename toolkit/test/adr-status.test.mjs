import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm, copyFile, link, symlink } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const { readAdrStatus, formatAdrStatus } = await import(process.env.ADR_STATUS_MODULE ?? '../dist/adr-status.js');
const retainedSource = resolve(import.meta.dirname, '../../.claude/scripts/adr-status.sh');
const sourceTemplate = '.claude/docs/templates/architecture-decision-record.md';
const templateText = '# ADR\n## Status\n[Proposed | Accepted]\n## Date\n[YYYY-MM-DD]\n## Last Verified\n[YYYY-MM-DD]\n## Decision\n[The decision]\n## Engine Compatibility\n| **Layer** | [Foundation | Core] |\n## ADR Dependencies\n| **Depends On** | [ADR-NNNN or None] |\n';
const template = { path: sourceTemplate, content: templateText };
const adr = (status = 'Accepted', depends = 'ADR-0002, ADR-0001') => `# Health\n## Status\n> Select one\n${status}\n## Date\n2026-10-01\n## Last Verified\n2026-11-10\n## Decision\nOwn health.\n## Engine Compatibility\n| **Layer** | Core |\n## ADR Dependencies\n| **Depends On** | ${depends} |\n`;
async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'studio-adr-status-')); t.after(() => rm(root, { recursive: true, force: true }));
  const write = async (path, content) => { await mkdir(dirname(join(root, path)), { recursive: true }); await writeFile(join(root, path), content); };
  return { root, write };
}
function source(root, selectors = []) { const r = spawnSync('bash', [retainedSource, '--root', root, ...selectors], { encoding: 'utf8' }); assert.equal(r.error, undefined); return r; }
const parity = async (t, name, root, result, selectors) => t.test(name, { skip: process.platform === 'win32' }, () => {
  const old = source(root, selectors); assert.equal(old.status, result.exitCode); assert.equal(formatAdrStatus(result), old.stdout);
});

test('one-pass statuses preserve all statuses, date precedence, successors and dependency observations', async t => {
  const { root, write } = await fixture(t); await write(sourceTemplate, templateText);
  const values = ['Accepted', 'Proposed', 'Deprecated', '**Superseded by ADR-0009**', '[Proposed | Accepted]', 'Exploring'];
  for (const [i, status] of values.entries()) await write(`docs/architecture/adr-000${i + 1}-state.md`, adr(status));
  await write('docs/architecture/adr-0007-empty.md', '');
  const r = await readAdrStatus(root, { template });
  assert.equal(r.qualityAssessed, false); assert.equal(r.adrs.length, 7);
  assert.deepEqual(r.counts, { accepted: 1, proposed: 1, deprecated: 1, superseded: 1, unfilled: 1, other: 1, no_status: 1 });
  assert.equal(r.adrs[3].supersededBy, 'adr-0009'); assert.equal(r.adrs[0].version, '2026-11-10');
  assert.deepEqual(r.adrs[0].dependsOn, ['adr-0002']); assert.equal(r.adrs[6].missing.length, 6);
  await parity(t, 'retained Bash status table differential', root, r);
  assert.equal(await readFile(join(root, 'docs/architecture/adr-0001-state.md'), 'utf8'), adr());
});
test('selectors resolve numeric aliases by first filename, deduplicate files and retain missing entries', async t => {
  const { root, write } = await fixture(t); await write('docs/architecture/adr-0003-a 测试.md', adr());
  await write('docs/architecture/adr-0003-z.md', adr('Proposed'));
  await link(join(root, 'docs/architecture/adr-0003-a 测试.md'), join(root, 'hardlink.md'));
  const selectors = ['3', 'ADR-0003', './docs/architecture/adr-0003-a 测试.md', 'hardlink.md', 'docs/architecture/adr-0003-z.md', '0099', 'missing.md'];
  const r = await readAdrStatus(root, { selectors });
  assert.equal(r.exitCode, 3); assert.deepEqual(r.adrs.map(a => a.path), ['docs/architecture/adr-0003-a 测试.md', 'docs/architecture/adr-0003-z.md']);
  assert.deepEqual(r.missingSelectors, ['0099', 'missing.md']);
  await parity(t, 'retained Bash selector differential', root, r, selectors);
  await link(join(root, 'docs/architecture/adr-0003-a 测试.md'), join(root, 'docs/architecture/adr-0003-hardlink.md'));
  const all = await readAdrStatus(root); assert.equal(all.adrs.length, 3);
  await parity(t, 'retained Bash all-files hardlink differential', root, all);
});
test('Markdown parser retains numbered headings, comments/fences, empty sections and template-line counts', async t => {
  const { root, write } = await fixture(t); await write(sourceTemplate, templateText);
  const content = '# ADR\r\n```md\r\n## Status\r\nAccepted\r\n```\r\n<!--\r\n## Status\r\nProposed\r\n-->\r\n## 1. Status ###\r\n> guidance\r\n\r\n## 2) Date\r\n[YYYY-MM-DD]\r\n## Last Verified\r\n> no value yet\r\n## Decision\r\n[The decision]\r\n| **Layer** | [Foundation | Core] |\r\n## ADR Dependencies\r\n| **Depends On** | [ADR-NNNN or None] |\r\n';
  await write('docs/architecture/adr-0001-empty-status.md', content);
  const r = await readAdrStatus(root, { template }), a = r.adrs[0];
  assert.equal(a.status, 'OTHER'); assert.equal(a.date, 'UNFILLED'); assert.equal(a.lastVerified, 'UNFILLED'); assert.equal(a.version, 'unversioned');
  assert.equal(a.layer, 'UNFILLED'); assert.equal(a.dependsOn, 'UNFILLED'); assert.equal(a.unfilled, 4); assert.deepEqual(a.missing, ['Engine Compatibility']);
  await parity(t, 'retained Bash Markdown differential', root, r);
});
test('discovery is one level, byte-sorted, and empty versus unknown data remain observations', async t => {
  const { root, write } = await fixture(t);
  const empty = await readAdrStatus(root); assert.equal(empty.adrs.length, 0); assert.equal(empty.exitCode, 0); assert.equal(empty.qualityAssessed, false);
  await write('docs/architecture/nested/adr-0001-hidden.md', adr());
  await write('docs/architecture/ADR-0002-upper.md', adr());
  await write('docs/architecture/adr-10.md', '## Status\nAccepted\n## Date\n2026-01-02\n## ADR Dependencies\n| **Depends On** | ADR-10 |\n');
  await write('docs/architecture/adr-2.md', '# No status\n');
  await write('docs/architecture/adr-invalid.md', '## Status\n');
  const r = await readAdrStatus(root);
  assert.deepEqual(r.adrs.map(a => a.id), ['adr-10', 'adr-2', null]);
  assert.equal(r.adrs[0].dependsOn, 'none'); assert.equal(r.adrs[0].version, '2026-01-02'); assert.equal(r.adrs[1].status, null); assert.equal(r.adrs[2].status, 'OTHER');
  await parity(t, 'retained Bash discovery differential', root, r);
});
test('unsafe selectors and linked ADRs cannot read outside the project', async t => {
  const { root, write } = await fixture(t);
  await assert.rejects(readAdrStatus(root, { selectors: ['../outside.md'] }), e => e.code === 'UNSAFE_PATH');
  await write('outside/adr-0001.md', adr()); await mkdir(join(root, 'docs'));
  await symlink(join(root, 'outside'), join(root, 'docs/architecture'), process.platform === 'win32' ? 'junction' : 'dir');
  await assert.rejects(readAdrStatus(root), e => e.code === 'UNSAFE_PATH');
});
test('thin resource reads its actual bundled template and preserves process exit codes', async t => {
  const { root, write } = await fixture(t);
  const built = dirname(fileURLToPath(new URL(process.env.ADR_STATUS_MODULE ?? '../dist/adr-status.js', import.meta.url)));
  await write('package.json', '{"type":"module"}'); await mkdir(join(root, 'dist'));
  for (const file of ['adr-status.js', 'files.js', 'contract.js']) await copyFile(join(built, file), join(root, 'dist', file));
  await mkdir(join(root, 'resources/studio/scripts'), { recursive: true }); const wrapper = join(root, 'resources/studio/scripts/adr-status.mjs');
  await copyFile(resolve(import.meta.dirname, '../../studio/scripts/adr-status.mjs'), wrapper);
  await write('resources/studio/templates/architecture-decision-record.md', templateText);
  await write('docs/architecture/adr-0001.md', adr('Proposed'));
  const call = args => spawnSync(process.execPath, [wrapper, ...args], { encoding: 'utf8' });
  let r = call(['--project', root]); assert.equal(r.status, 0); const result = JSON.parse(r.stdout);
  assert.equal(result.templatePath, 'studio/templates/architecture-decision-record.md'); assert.equal(result.templateSections, 6); assert.equal(result.adrs[0].status, 'Proposed'); assert.equal(result.qualityAssessed, false);
  r = call(['--project', root, '1', '99', '--text']); assert.equal(r.status, 3); assert.match(r.stdout, /NOT_FOUND\t99/);
  assert.equal(call(['--project', root, '../escape.md']).status, 4); assert.equal(call(['--project', join(root, 'absent')]).status, 1);
  assert.equal(call(['--unknown', '--help']).status, 2); assert.equal(call(['--project', root, '-h']).status, 0);
});
