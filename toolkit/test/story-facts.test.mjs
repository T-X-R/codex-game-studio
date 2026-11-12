import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm, symlink, copyFile, cp } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const { readStoryFacts, formatStoryFacts } = await import(process.env.STORY_FACTS_MODULE ?? '../dist/story-facts.js');
const source = resolve(import.meta.dirname, '../../.claude/scripts/story-facts.sh');
async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'studio-story-facts-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const write = async (path, content) => { await mkdir(dirname(join(root, path)), { recursive: true }); await writeFile(join(root, path), content); };
  return { root, write };
}
const sample = '> **Status**: Ready\n> **Type**: Logic\nLayer: Core\nEstimate: 2h\nADR: ADR-0001, ADR-0002\nTR-combat-001\n## Acceptance Criteria\n- [ ] Health clamps to 0.\n- [x] Event carries new health.\n## QA Test Cases\n- **AC-1** verify\n## Test Evidence\nStatus: Planned\n## Dependencies\nDepends on: Story 001\n';
function retained(root, args) {
  const r = spawnSync('bash', [source, '--root', root, ...args], { encoding: 'utf8' });
  assert.equal(r.error, undefined); return r;
}
test('story facts retain observations, recursive discovery, byte order and source TSV', async t => {
  const { root, write } = await fixture(t);
  for (const path of ['production/epics/战斗/story-10 test.md', 'production/epics/战斗/nested/story-2.md', 'production/epics/.hidden/story-1.md']) await write(path, sample.replaceAll('\n', '\r\n'));
  const r = await readStoryFacts(root, { lint: true });
  assert.equal(r.qualityAssessed, false); assert.equal(r.stories.length, 3);
  assert.deepEqual(r.stories[0].adrs, ['adr-0001', 'adr-0002']);
  assert.deepEqual(r.stories[0].trIds, ['TR-combat-001']);
  assert.equal(r.stories[0].ac, 2); assert.equal(r.stories[0].qaCases, 1);
  assert.equal(r.stories[0].testEvidence, 'Planned'); assert.equal(r.stories[0].dependsOn, 'Story 001');
  await t.test('retained Bash TSV differential', { skip: process.platform === 'win32' }, () => assert.equal(formatStoryFacts(r), retained(root, ['--lint']).stdout));
  assert.equal(await readFile(join(root, r.stories[0].path), 'utf8'), sample.replaceAll('\n', '\r\n'));
});
test('lint respects type granularity, comment/fence and inline code marker boundaries', async t => {
  const { root, write } = await fixture(t); const path = 'production/epics/a/story-1.md';
  const text = sample + '\n```md\nTODO hidden\n```\n<!-- UNRESOLVED hidden\nTBD hidden -->\n`<!--` TODO visible\nTBD_word ? UNRESOLVED\n';
  await write(path, text);
  for (const granularity of ['coarse', 'balanced', 'fine']) {
    const r = await readStoryFacts(root, { lint: true, granularity });
    assert.equal(r.lint.some(x => x.rule === 'ac_below_min'), granularity === 'coarse');
    assert.deepEqual(r.lint.filter(x => x.rule === 'marker').map(x => x.detail.split(' ')[0]), ['TODO', 'UNRESOLVED']);
    await t.test(`retained Bash ${granularity} differential`, { skip: process.platform === 'win32' }, () => assert.equal(formatStoryFacts(r), retained(root, ['--lint', '--granularity', granularity]).stdout));
  }
});
test('sprint scope retains listed order, quoted paths, partial missing rows and empty versus absent plans', async t => {
  const { root, write } = await fixture(t);
  let r = await readStoryFacts(root, { scope: 'sprint' }); assert.equal(r.sprintMissing, true); assert.equal(r.exitCode, 3);
  await write('production/sprint-status.yaml', 'stories: []\n');
  r = await readStoryFacts(root, { scope: 'sprint' }); assert.equal(r.sprintMissing, false); assert.equal(r.exitCode, 0); assert.equal(r.stories.length, 0);
  await write('production/epics/a/story-1 space.md', sample);
  await write('production/sprint-status.yaml', 'stories:\n  - file: "production/epics/a/story-1 space.md" # own\n    status: in-progress\n  - file: production/epics/a/story-missing.md # absent\n    status: todo\nother:\n  file: ignored.md\n');
  r = await readStoryFacts(root, { scope: 'sprint', lint: true });
  assert.equal(r.exitCode, 3); assert.equal(r.stories[0].sprintStatus, 'in-progress'); assert.deepEqual(r.missingPaths, ['production/epics/a/story-missing.md']);
  await t.test('retained Bash partial sprint differential', { skip: process.platform === 'win32' }, () => { const old = retained(root, ['--sprint', '--lint']); assert.equal(old.status, 3); assert.equal(formatStoryFacts(r), old.stdout); });
});
test('empty files are retained as unknown observations instead of disappearing', async t => {
  const { root, write } = await fixture(t); await write('production/epics/a/story-empty.md', '');
  const r = await readStoryFacts(root, { lint: true });
  assert.equal(r.stories.length, 1); assert.equal(r.stories[0].state, 'NO_STATUS'); assert.equal(r.stories[0].ac, null);
  assert.deepEqual(r.lint.map(x => x.rule), ['no_status', 'type_missing', 'no_tr_id', 'no_ac_section']);
  assert.equal(r.exitCode, 0); assert.equal(r.qualityAssessed, false);
});
test('explicit paths keep repeated requests and unfilled fields without assigning a verdict', async t => {
  const { root, write } = await fixture(t); const path = 'production/epics/a/story-1.md';
  await write(path, 'Status: Draft\nType: [type]\nLayer: [layer]\nEstimate: [hours]\nEpic: [epic]\nManifest Version: [date]\nADR: N/A — reason\n');
  const r = await readStoryFacts(root, { scope: 'paths', paths: [path, path, 'absent.md'], lint: true });
  assert.equal(r.exitCode, 3); assert.equal(r.stories.length, 2); assert.equal(r.stories[0].type, 'UNFILLED'); assert.deepEqual(r.stories[0].adrs, ['n/a']);
  assert.equal(r.lint.filter(x => x.rule === 'unfilled').length, 10);
  await t.test('retained Bash explicit paths differential', { skip: process.platform === 'win32' }, () => assert.equal(formatStoryFacts(r), retained(root, [path, path, 'absent.md', '--lint']).stdout));
});
test('unsafe paths, invalid granularity and non-directory discovery do not become clean empty scopes', async t => {
  const { root, write } = await fixture(t);
  await assert.rejects(readStoryFacts(root, { scope: 'paths', paths: ['../outside.md'] }), e => e.code === 'UNSAFE_PATH');
  await assert.rejects(readStoryFacts(root, { granularity: 'tiny' }), e => e.exitCode === 2);
  await write('production/epics', 'not a directory'); await assert.rejects(readStoryFacts(root), e => e.code === 'ENOTDIR');
});
test('linked story directories are rejected before following them', async t => {
  const { root, write } = await fixture(t); await write('outside/story-1.md', sample); await mkdir(join(root, 'production/epics'), { recursive: true });
  await symlink(join(root, 'outside'), join(root, 'production/epics/linked'), process.platform === 'win32' ? 'junction' : 'dir');
  await assert.rejects(readStoryFacts(root), e => e.code === 'UNSAFE_PATH');
});

test('resource process exposes JSON and source text with real exit codes and flag order', async t => {
  const { root, write } = await fixture(t);
  const built = dirname(fileURLToPath(new URL(process.env.STORY_FACTS_MODULE ?? '../dist/story-facts.js', import.meta.url)));
  await write('package.json', '{"type":"module"}'); await mkdir(join(root, 'dist'));
  await cp(resolve(import.meta.dirname, '../node_modules/yaml'), join(root, 'node_modules/yaml'), { recursive: true });
  for (const name of ['story-facts.js', 'files.js', 'contract.js']) await copyFile(join(built, name), join(root, 'dist', name));
  await mkdir(join(root, 'resources/studio/scripts'), { recursive: true });
  const wrapper = join(root, 'resources/studio/scripts/story-facts.mjs');
  await copyFile(resolve(import.meta.dirname, '../../studio/scripts/story-facts.mjs'), wrapper);
  const call = args => spawnSync(process.execPath, [wrapper, ...args], { encoding: 'utf8' });
  const path = 'production/epics/a/story-1.md'; await write(path, sample);
  let r = call(['--project', root, '--all', '--lint']);
  assert.equal(r.status, 0); assert.equal(JSON.parse(r.stdout).stories.length, 1);
  assert.equal(JSON.parse(r.stdout).lint[0].detail, '2 < 3 (Logic)');
  r = call(['--project', root, 'missing.md', '--all', '--lint', '--granularity=balanced', '--text']);
  assert.equal(r.status, 0); assert.equal(r.stdout, formatStoryFacts(await readStoryFacts(root, { lint: true, granularity: 'balanced' })));
  r = call(['--project', root, '--all', path, 'missing.md']);
  assert.equal(r.status, 3); assert.equal(JSON.parse(r.stdout).stories.length, 1); assert.deepEqual(JSON.parse(r.stdout).missingPaths, ['missing.md']);
  r = call(['--project', root, '--sprint']); assert.equal(r.status, 3); assert.equal(JSON.parse(r.stdout).sprintMissing, true);
  assert.equal(call(['--project', join(root, 'absent')]).status, 1);
  assert.equal(call(['--project', root, '--granularity', 'tiny']).status, 2);
  assert.equal(call(['--project', root, '../escape.md']).status, 4);
  assert.equal(call(['--project']).status, 2);
  assert.equal(call(['--project', root, '--help']).status, 0);
  assert.equal(call(['--unknown', '--help']).status, 2);
  assert.equal(call(['--granularity', 'tiny', '-h']).status, 0);
  await write('production/sprint-status.yaml', 'stories: [broken');
  r = call(['--project', root, '--sprint']); assert.equal(r.status, 1); assert.equal(JSON.parse(r.stdout).error.code, 'INVALID_SPRINT');
  await write('production/sprint-status.yaml', 'stories: {}');
  assert.equal(call(['--project', root, '--sprint']).status, 1);
  await write('production/sprint-status.yaml', 'stories: []');
  r = call(['--project', root, '--sprint']); assert.equal(r.status, 0); assert.equal(JSON.parse(r.stdout).stories.length, 0);
  const aliases = 'a: &a [' + Array(10).fill('x').join(', ') + ']\nb: &b [' + Array(10).fill('*a').join(', ') + ']\nc: [' + Array(10).fill('*b').join(', ') + ']\nstories: []\n';
  await write('production/sprint-status.yaml', aliases);
  r = call(['--project', root, '--sprint']);
  assert.equal(r.status, 1); assert.equal(JSON.parse(r.stdout).error.code, 'INVALID_SPRINT');
  assert.match(JSON.parse(r.stdout).error.message, /alias/i);
  assert.equal(await readFile(join(root, path), 'utf8'), sample);
});

test('all story types and state groups retain distinct observations across granularity settings', async t => {
  const { root, write } = await fixture(t);
  const types = ['Logic', 'Integration', 'Visual/Feel', 'UI', 'Config/Data'];
  const status = ['Complete', 'In Review', 'In Progress', 'Not Started', 'Blocked: ADR', 'Draft', null, 'DONEK'];
  for (const [i, v] of status.entries()) await write(`production/epics/a/story-${i}.md`, `${v === null ? '' : `Status: ${v}\n`}Type: ${types[i % types.length]}\n## Acceptance Criteria\n- [ ] An observable state exists.\n`);
  for (const granularity of ['coarse', 'balanced', 'fine']) {
    const r = await readStoryFacts(root, { lint: true, granularity });
    assert.deepEqual(r.counts, { COMPLETE: 2, IN_REVIEW: 1, IN_PROGRESS: 1, TODO: 1, BLOCKED: 1, OTHER: 1, NO_STATUS: 1 });
    assert.equal(r.lint.filter(x => x.rule === 'ac_below_min').length, granularity === 'fine' ? 0 : 7);
    await t.test(`retained Bash types/states ${granularity} differential`, { skip: process.platform === 'win32' }, () => assert.equal(formatStoryFacts(r), retained(root, ['--lint', '--granularity', granularity]).stdout));
  }
});

test('sprint syntax and unsupported structures fail rather than looking like an empty sprint', async t => {
  const { root, write } = await fixture(t);
  for (const text of ['stories: [broken', 'stories: wrong', 'stories: {file: x.md}', 'stories: [null]', 'stories: [{id: missing-file}]', 'stories: [{file: 42}]', '[]']) {
    await write('production/sprint-status.yaml', text);
    await assert.rejects(readStoryFacts(root, { scope: 'sprint' }), e => e.code === 'INVALID_SPRINT');
  }
  await write('production/epics/a/story-1.md', sample);
  await write('production/sprint-status.yaml', 'stories: [{file: "production/epics/a/story-1.md", status: "in-progress"}]');
  const result = await readStoryFacts(root, { scope: 'sprint' });
  assert.equal(result.stories.length, 1); assert.equal(result.stories[0].sprintStatus, 'in-progress');
});
