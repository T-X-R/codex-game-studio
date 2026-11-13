import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { parse, stringify } from 'yaml';
import { inspectCatalog } from '../dist/content-catalog.js';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'studio-catalog-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const catalog = parse(await readFile(new URL('../../studio-tests/catalog.yaml', import.meta.url), 'utf8'));
  for (const kind of ['skills', 'agents', 'aliases']) {
    for (const row of catalog[kind]) row.migration_state = 'pending';
  }
  catalog.skills[0].migration_state = 'partial'; catalog.agents[0].migration_state = 'partial';
  const write = async (path, text = '# Fixture\n') => { await mkdir(dirname(join(root, path)), { recursive: true }); await writeFile(join(root, path), text); };
  for (const kind of ['skills', 'agents']) for (const row of catalog[kind]) {
    await write(kind === 'skills' ? `.claude/skills/${row.name}/SKILL.md` : `.claude/agents/${row.name}.md`);
    await write(row.spec); if (row.migration_state !== 'pending') await write(row.target);
  }
  for (const row of catalog.aliases) await write(`.claude/skills/${row.name}/SKILL.md`);
  const save = () => write('studio-tests/catalog.yaml', stringify(catalog));
  await save(); return { root, catalog, write, save };
}

test('catalog accounts for the original 75 workflows, 49 roles and three aliases without claiming completion', async t => {
  const { root } = await fixture(t);
  const result = await inspectCatalog(root);
  assert.equal(result.status, 'valid'); assert.deepEqual(result.issues, []);
  assert.equal(result.counts.skills.total, 75); assert.equal(result.counts.agents.total, 49);
  assert.equal(result.counts.aliases.total, 3);
  assert.equal(result.declaredComplete, false); assert.equal(result.behaviorVerified, false);
  const complete = await inspectCatalog(root, true);
  assert.equal(complete.status, 'invalid'); assert.ok(complete.issues.some(x => x.code === 'MIGRATION_INCOMPLETE'));
});

test('omitted roles, duplicate identities and broken alias mappings fail reconciliation', async t => {
  const { root, catalog, save } = await fixture(t);
  catalog.agents.pop(); catalog.skills[1].name = catalog.skills[0].name;
  catalog.aliases[0].replacement = 'nonexistent'; await save();
  const result = await inspectCatalog(root);
  for (const code of ['INVENTORY_COUNT', 'UNACCOUNTED_SOURCE', 'DUPLICATE_SOURCE', 'INVALID_ALIAS']) {
    assert.ok(result.issues.some(x => x.code === code), code);
  }
});

test('missing or untracked targets and missing behavioral specs are not hidden by declared states', async t => {
  const { root, catalog, write, save } = await fixture(t);
  const partial = catalog.agents.find(x => x.migration_state === 'partial');
  await rm(join(root, partial.target));
  const pending = catalog.skills.find(x => x.migration_state === 'pending'); await write(pending.target);
  await write('.codex/agents/game-studio-unlisted.toml');
  await rm(join(root, pending.spec));
  catalog.skills[0].target = '../outside.md'; await save();
  const result = await inspectCatalog(root);
  for (const code of ['MISSING_TARGET', 'STATE_MISMATCH', 'MISSING_SPEC', 'INVALID_TARGET', 'UNTRACKED_TARGET']) assert.ok(result.issues.some(x => x.code === code), code);
});

test('verified declarations need Codex behavior specs and evidence, while retired aliases cannot stay active', async t => {
  const { root, catalog, write, save } = await fixture(t);
  catalog.agents.find(x => x.migration_state === 'partial').migration_state = 'verified';
  await write('.agents/skills/game-studio-help/SKILL.md');
  await save(); const result = await inspectCatalog(root);
  assert.ok(result.issues.some(x => x.code === 'MISSING_EVIDENCE'));
  assert.ok(result.issues.some(x => x.code === 'ACTIVE_ALIAS'));
});

test('malformed catalogs and missing retained input trees return explicit errors', async t => {
  const { root, write } = await fixture(t);
  await write('studio-tests/catalog.yaml', 'version: 3\nskills: [bad\n');
  assert.equal((await inspectCatalog(root)).status, 'invalid');
  await write('studio-tests/catalog.yaml', 'version: 3\ntarget_platform: codex\nskills: null\nagents: []\naliases: []\n');
  const result = await inspectCatalog(root);
  assert.ok(result.issues.some(x => x.code === 'INVALID_CATALOG'));
  await rm(join(root, '.claude/agents'), { recursive: true });
  assert.ok((await inspectCatalog(root)).issues.some(x => x.code === 'MISSING_SOURCE_TREE'));
});

test('complete declarations remain distinct from verified behavior and fail when evidence disappears', async t => {
  const { root, catalog, write, save } = await fixture(t);
  await write('studio-tests/codex-fixture.md'); await write('docs/evidence/fixture.json', '{"fixture":true}\n');
  for (const kind of ['skills', 'agents', 'aliases']) for (const row of catalog[kind]) {
    row.migration_state = 'verified'; row.codex_spec = 'studio-tests/codex-fixture.md'; row.evidence = ['docs/evidence/fixture.json'];
    if (row.target) await write(row.target);
  }
  await save(); const declared = await inspectCatalog(root, true);
  assert.equal(declared.status, 'valid'); assert.equal(declared.declaredComplete, true);
  assert.equal(declared.behaviorVerified, false);
  await rm(join(root, 'docs/evidence/fixture.json'));
  assert.equal((await inspectCatalog(root, true)).status, 'invalid');
});

test('source command validates the live catalog and complete mode follows its declarations', () => {
  const script = fileURLToPath(new URL('../scripts/lint-content.mjs', import.meta.url));
  const normal = spawnSync(process.execPath, [script], { cwd: tmpdir(), encoding: 'utf8' });
  assert.equal(normal.status, 0, normal.stdout + normal.stderr);
  const result = JSON.parse(normal.stdout);
  assert.equal(result.catalog.counts.skills.total, 75); assert.equal(result.catalog.counts.agents.total, 49);
  const complete = spawnSync(process.execPath, [script, '--complete'], { encoding: 'utf8' });
  assert.equal(complete.status, result.catalog.declaredComplete ? 0 : 1);
  if (!result.catalog.declaredComplete) assert.ok(JSON.parse(complete.stdout).catalog.issues.some(x => x.code === 'MIGRATION_INCOMPLETE'));
});
