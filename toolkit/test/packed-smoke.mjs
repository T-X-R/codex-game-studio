import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, readdir, writeFile, rm, realpath } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { tmpdir } from 'node:os';
import { npmPath } from '../dist/runtime.js';
const packageRoot = fileURLToPath(new URL('..', import.meta.url));
const temp = await realpath(await mkdtemp(join(tmpdir(), 'game-studio-pack-')));
const npm = await npmPath();
function execute(entry, args, cwd = temp) {
  return execFileSync(process.execPath, [entry, ...args], { cwd, encoding: 'utf8', timeout: 120000,
    env: { ...process.env, npm_config_ignore_scripts: 'true' }, stdio: ['ignore', 'pipe', 'pipe'] });
}
function command(entry, ...args) { return JSON.parse(execute(entry, [...args, '--json'])); }
try {
  const [packed] = JSON.parse(execute(npm, ['pack', packageRoot, '--pack-destination', temp, '--ignore-scripts', '--json']));
  assert.ok(packed.files.some(file => file.path === 'resources/studio/onboarding/game-studio/SKILL.md'));
  assert.ok(packed.files.every(file => !file.path.startsWith('src/') && !file.path.includes('.claude')));
  const archive = join(temp, packed.filename);
  const prefix = join(temp, 'cli');
  execute(npm, ['install', '--prefix', prefix, archive, '--ignore-scripts', '--no-audit', '--no-fund', '--prefer-offline']);
  const globalRoot = join(prefix, 'node_modules/@t-x-r/game-studio');
  const globalCli = join(globalRoot, 'dist/cli.js');
  const { inspectContent } = await import(pathToFileURL(join(globalRoot, 'dist/content-tree.js')).href);
  const contentRoot = join(globalRoot, 'resources');
  assert.equal((await inspectContent(contentRoot)).status, 'valid');
  const reference = join(contentRoot, '.agents/skills/game-studio-project-settings/references/choosing-settings.md');
  const referenceBytes = await readFile(reference);
  await rm(reference);
  try {
    const broken = await inspectContent(contentRoot);
    assert.equal(broken.status, 'invalid');
    assert.ok(broken.issues.some(issue => issue.code === 'MISSING_RESOURCE' && issue.path.endsWith('game-studio-project-settings/SKILL.md')));
  } finally { await writeFile(reference, referenceBytes); }
  await writeFile(reference, Buffer.concat([referenceBytes, Buffer.from('\nRun `game-studio removed-command --json`.\n')]));
  try {
    const stale = await inspectContent(contentRoot);
    assert.equal(stale.status, 'invalid');
    assert.ok(stale.issues.some(issue => issue.code === 'INVALID_COMMAND_EXAMPLE' && issue.path.endsWith('/choosing-settings.md')));
  } finally { await writeFile(reference, referenceBytes); }
  assert.equal((await inspectContent(contentRoot)).status, 'valid');
  assert.equal(command(globalCli, 'version').status, 'ok');
  const project = join(temp, '我的 game');
  assert.equal(command(globalCli, 'init', project, '--engine', 'web').status, 'ok');
  const roles = ['qa-tester', 'qa-lead', 'game-designer', 'lead-programmer', 'gameplay-programmer', 'systems-designer'].map(role => `.codex/agents/game-studio-${role}.toml`);
  for (const role of roles) {
    assert.equal(await readFile(join(project, role), 'utf8'),
      await readFile(join(packageRoot, '..', role), 'utf8'));
  }
  for (const gate of ['ql-story-ready', 'ql-test-coverage', 'lp-code-review', 'lp-feasibility']) {
    const id = `studio/docs/director-gates/${gate}.md`;
    const result = command(globalCli, 'resource', 'path', id);
    assert.equal(await readFile(result.data.path, 'utf8'), await readFile(join(packageRoot, '..', id), 'utf8'));
  }
  for (const stage of ['systems-design', 'technical-setup', 'pre-production', 'production', 'polish', 'release']) {
    const id = `studio/docs/phase-gates/gate-${stage}.md`;
    const result = command(globalCli, 'resource', 'path', id);
    assert.equal(await readFile(result.data.path, 'utf8'), await readFile(join(packageRoot, '..', id), 'utf8'));
  }
  for (const name of ['difficulty-curve', 'player-journey', 'systems-index', 'game-design-document', 'architecture-decision-record', 'guidance/game-design-document-guide']) {
    const id = `studio/templates/${name}.md`;
    const result = command(globalCli, 'resource', 'path', id);
    assert.equal(await readFile(result.data.path, 'utf8'), await readFile(join(packageRoot, '..', id), 'utf8'));
  }
  for (const path of ['SKILL.md', ...['tiers', 'checks', 'assessment', 'verdict', 'stage', 'next-steps'].map(name => `references/${name}.md`)]) {
    const id = `.agents/skills/game-studio-gate-check/${path}`;
    assert.equal(await readFile(join(project, id), 'utf8'), await readFile(join(packageRoot, '..', id), 'utf8'));
  }
  for (const path of ['SKILL.md', 'references/reviews.md', 'references/index-and-handoff.md']) {
    const id = `.agents/skills/game-studio-map-systems/${path}`;
    assert.equal(await readFile(join(project, id), 'utf8'), await readFile(join(packageRoot, '..', id), 'utf8'));
  }
  for (const skill of ['design-system', 'design-review', 'architecture-decision', 'create-architecture', 'architecture-review']) {
    const path = `.agents/skills/game-studio-${skill}`;
    const source = join(packageRoot, '..', path);
    const expected = [];
    for (const entry of await readdir(source, { recursive: true, withFileTypes: true })) {
      if (!entry.isFile()) continue;
      const local = relative(source, join(entry.parentPath, entry.name));
      expected.push(local);
      assert.deepEqual(await readFile(join(project, path, local)), await readFile(join(source, local)));
    }
    const installed = (await readdir(join(project, path), { recursive: true, withFileTypes: true }))
      .filter(entry => entry.isFile()).map(entry => relative(join(project, path), join(entry.parentPath, entry.name)));
    assert.deepEqual(installed.sort(), expected.sort());
  }
  const registryHelper = command(globalCli, 'resource', 'path', 'studio/scripts/registry.mjs').data.path;
  assert.deepEqual(await readFile(registryHelper), await readFile(join(packageRoot, '../studio/scripts/registry.mjs')));
  const registryProject = join(temp, 'registry 项目');
  await mkdir(join(registryProject, 'docs/architecture'), { recursive: true });
  await writeFile(join(registryProject, 'docs/architecture/tr-registry.yaml'), 'requirements:\n- id: TR-demo-007\n  status: deprecated\n');
  const nextId = JSON.parse(execute(registryHelper, ['--project', registryProject, 'next-id', 'tr', 'demo']));
  assert.equal(nextId.qualityAssessed, false);
  assert.equal(nextId.next.id, 'TR-demo-008');
  const observations = JSON.parse(execute(registryHelper, ['--project', registryProject, 'validate']));
  assert.deepEqual(observations.diagnostics, []);
  assert.deepEqual(observations.registries.map(row => row.state), ['missing', 'read', 'missing']);
  const designResource = 'studio/docs/roles/game-designer.md';
  const designPath = command(globalCli, 'resource', 'path', designResource).data.path;
  assert.equal(await readFile(designPath, 'utf8'), await readFile(join(packageRoot, '..', designResource), 'utf8'));
  await assert.rejects(readFile(join(project, '.codex/config.toml')), { code: 'ENOENT' });
  assert.match(await readFile(join(project, '.agents/skills/game-studio-prototype/SKILL.md'), 'utf8'), /name: game-studio-prototype/);
  for (const path of ['SKILL.md', 'references/choosing-settings.md']) {
    assert.equal(await readFile(join(project, '.agents/skills/game-studio-project-settings', path), 'utf8'),
      await readFile(join(packageRoot, '../.agents/skills/game-studio-project-settings', path), 'utf8'));
  }
  for (const path of ['SKILL.md', 'references/runners.md', 'references/checks.md', 'references/verdict.md']) {
    assert.equal(await readFile(join(project, '.agents/skills/game-studio-smoke-check', path), 'utf8'),
      await readFile(join(packageRoot, '../.agents/skills/game-studio-smoke-check', path), 'utf8'));
  }
  assert.equal(await readFile(join(project, '.agents/skills/game-studio-prototype/references/grow.md'), 'utf8'),
    await readFile(join(packageRoot, '../.agents/skills/game-studio-prototype/references/grow.md'), 'utf8'));
  for (const path of ['hook.ts', 'tune.ts']) {
    assert.equal(await readFile(join(globalRoot, 'resources/studio/templates/web-growth-support', path), 'utf8'),
      await readFile(join(packageRoot, '../studio/templates/web-growth-support', path), 'utf8'));
  }
  command(globalCli, 'restore', '--project', project, '--archive', archive, '--offline');
  const launcher = join(project, '.game-studio/run.cjs');
  const receipts = JSON.parse(execute(launcher, ['resource', 'path', 'studio/scripts/review-receipts.mjs', '--json'], project)).data.path;
  assert.ok(receipts.startsWith(join(project, '.game-studio/node_modules')));
  assert.deepEqual(await readFile(receipts), await readFile(join(packageRoot, '../studio/scripts/review-receipts.mjs')));
  const receiptWrapper = join(project, '.agents/skills/game-studio-design-review/scripts/review-receipts.mjs');
  const receiptInput = 'receipt input 数据.md';
  await writeFile(join(project, receiptInput), 'reviewed content\n');
  const stamps = execute(receipts, ['hash', receiptInput], project);
  assert.equal(execute(receiptWrapper, ['hash', receiptInput], project), stamps);
  await writeFile(join(project, 'receipt-log.md'), `## Review\n${stamps}`);
  assert.match(execute(receiptWrapper, ['check', 'receipt-log.md', receiptInput], project), /UNCHANGED:/);
  await writeFile(join(project, receiptInput), 'changed content\n');
  assert.match(execute(receiptWrapper, ['check', 'receipt-log.md', receiptInput], project), /CHANGED:/);
  assert.throws(() => execute(receiptWrapper, ['hash', receiptInput], temp), error =>
    error.status === 2 && /pinned project runtime/.test(error.stderr.toString()));
  await rm(join(project, receiptInput));
  await rm(join(project, 'receipt-log.md'));
  const storyHelper = JSON.parse(execute(launcher, ['resource', 'path', 'studio/scripts/story-status.mjs', '--json'], project)).data.path;
  assert.ok(storyHelper.startsWith(join(project, '.game-studio/node_modules')));
  assert.deepEqual(await readFile(storyHelper), await readFile(join(packageRoot, '../studio/scripts/story-status.mjs')));
  const storyProject = join(temp, 'story 项目');
  await mkdir(join(storyProject, 'production/epics/one'), { recursive: true });
  await writeFile(join(storyProject, 'production/epics/one/story-01.md'), 'Status: Ready\n');
  await writeFile(join(storyProject, 'production/epics/one/story-02.md'), '> **Status**: In Review\n');
  const storyRows = JSON.parse(execute(storyHelper, ['--project', storyProject]));
  assert.equal(storyRows.status, 'observed'); assert.equal(storyRows.qualityAssessed, false);
  assert.deepEqual(storyRows.counts, { complete: 0, total: 2 });
  assert.deepEqual(storyRows.stories.map(row => row.group), ['IN_REVIEW', 'TODO']);
  assert.match(execute(storyHelper, ['--project', storyProject, '--text']), /^IN_REVIEW    production\/epics\/one\/story-02.md\nTODO/);
  assert.throws(() => execute(storyHelper, []), error => error.status === 2);
  const artifacts = command(launcher, 'check', '--kind', 'artifacts', '--project', project).data;
  assert.equal(artifacts.counts.groups, 7);
  assert.equal(artifacts.counts.steps, 49);
  assert.equal(artifacts.qualityAssessed, false);
  assert.ok(artifacts.catalog.startsWith(join(project, '.game-studio/node_modules')));
  const minimal = command(launcher, 'check', '--kind', 'artifacts', '--path', 'minimal', '--project', project).data;
  assert.equal(minimal.counts.steps, 5);
  assert.equal(minimal.groups[0].steps.find(step => step.id === 'engine-setup').status, 'PRESENT');
  assert.equal(minimal.groups[0].steps.find(step => step.id === 'game-brief').status, 'ABSENT');
  assert.equal(minimal.groups[0].steps.find(step => step.id === 'story-done').status, 'NO_CHECK');
  await mkdir(join(project, 'docs/architecture'), { recursive: true });
  for (const [id, target] of [['01', '02'], ['02', '01'], ['03', '01']]) {
    await writeFile(join(project, `docs/architecture/adr-${id}.md`), `## ADR Dependencies\n| **Depends On** | ADR-${target} |\n`);
  }
  const graph = command(launcher, 'check', '--kind', 'adr-deps', '--project', project).data;
  assert.deepEqual(graph.cycles.map(cycle => cycle.id), ['adr-01', 'adr-02']);
  assert.deepEqual(graph.blockedByCycle, ['adr-03']);
  assert.deepEqual(graph.order, []);
  assert.equal(graph.qualityAssessed, false);
  for (const id of ['01', '02', '03']) await rm(join(project, `docs/architecture/adr-${id}.md`));
  assert.throws(() => command(launcher, 'check', '--kind', 'adr-deps', '--project', project), error => {
    assert.equal(error.status, 3);
    assert.equal(JSON.parse(error.stdout).status, 'not_assessed');
    return true;
  });
  await mkdir(join(project, 'design/gdd'), { recursive: true });
  const gddText = '## Overview\n[To be designed]\n## Detailed Design\nDamage is clamped.\n';
  await writeFile(join(project, 'design/gdd/combat.md'), gddText);
  const gdd = command(launcher, 'check', '--kind', 'gdd', '--project', project);
  assert.equal(gdd.data.qualityAssessed, false);
  assert.deepEqual(gdd.data.files[0].present, ['Overview', 'Detailed Rules']);
  assert.deepEqual(gdd.data.files[0].placeholder, ['Overview']);
  assert.equal(await readFile(join(project, 'design/gdd/combat.md'), 'utf8'), gddText);
  await rm(join(project, 'design/gdd/combat.md'));
  assert.throws(() => command(launcher, 'check', '--kind', 'gdd', '--project', project), error => {
    assert.equal(error.status, 3);
    assert.equal(JSON.parse(error.stdout).status, 'not_assessed');
    return true;
  });
  const installedContent = command(launcher, 'check', '--kind', 'content', '--project', project);
  assert.equal(installedContent.status, 'ok');
  assert.equal(installedContent.data.scope, 'project-content');
  assert.equal(installedContent.data.behaviorVerified, false);
  assert.ok(installedContent.data.resourceRoot.startsWith(join(project, '.game-studio', 'node_modules')));
  const installedSkill = join(project, '.agents/skills/game-studio-start/SKILL.md');
  const installedSkillBytes = await readFile(installedSkill);
  await writeFile(installedSkill, Buffer.concat([installedSkillBytes, Buffer.from('\n`game-studio removed-command`\n')]));
  try {
    assert.throws(() => command(launcher, 'check', '--kind', 'content', '--project', project), error => {
      assert.equal(error.status, 5);
      const failed = JSON.parse(error.stdout);
      assert.equal(failed.status, 'failed');
      assert.ok(failed.data.issues.some(issue => issue.code === 'INVALID_COMMAND_EXAMPLE' && issue.root === project));
      return true;
    });
  } finally { await writeFile(installedSkill, installedSkillBytes); }
  assert.equal(command(launcher, 'check', '--kind', 'content', '--project', project).status, 'ok');
  assert.equal(command(launcher, 'status', '--project', project).data.settings['engine.name'].value, 'Web');
  command(globalCli, 'config', 'set', 'project.stage', 'Concept', '--project', project);
  assert.equal(await readFile(join(project, 'production/stage.txt'), 'utf8'), 'Concept\n');
  command(launcher, 'config', 'set', 'modes.automation', 'autonomous', '--local', '--project', project);
  assert.equal(command(globalCli, 'config', 'get', 'modes.automation', '--project', project).data.settings['modes.automation'].source, 'project.local.yaml');
  const automation = command(launcher, 'config', 'get', 'modes.automation', '--project', project);
  assert.equal(automation.data.annotations['modes.automation'].locallyOverridable, true);
  assert.equal(automation.data.annotations['modes.automation'].localValue, 'autonomous');
  const reserved = command(launcher, 'config', 'set', 'accessibility.target', 'standard', '--project', project);
  assert.ok(reserved.warnings.some(message => /reserved/.test(message)));
  for (const keys of [[], ['accessibility.target']]) {
    const view = command(launcher, 'config', 'get', ...keys, '--project', project);
    assert.equal(view.data.annotations['accessibility.target'].reserved, true);
    assert.ok(view.warnings.some(message => message.includes('accessibility.target') && /reserved/.test(message)));
  }
  assert.equal(command(launcher, 'config', 'get', 'engine_values', '--project', project).data.settings.engine_values.value.name.value, 'Web');
  assert.equal(command(launcher, 'config', 'get', 'gate_level', '--project', project).data.settings.gate_level.value.config.smokeCheck, 'blocking');
  assert.equal(command(launcher, 'config', 'get', 'engine_row', '--project', project).data.settings.engine_row.value.commands.test, 'npm test');
  const engineInspection = command(launcher, 'engine', 'inspect', '--project', project);
  assert.equal(engineInspection.data.engine.name.value, 'Web');
  assert.equal(engineInspection.data.execution.state, 'not_assessed');
  const setupInput = 'engine-setup.json';
  await writeFile(join(project, setupInput), JSON.stringify({ engine: {
    name: 'Web', version: '7.3.1', language: 'TypeScript', code_root: 'src', test_root: 'tests',
  }, naming: { variables: 'camelCase' } }));
  const beforeSetup = await readFile(join(project, 'project.yaml'), 'utf8');
  const setupPreview = command(launcher, 'engine', 'setup', '--input', setupInput, '--dry-run', '--project', project);
  assert.deepEqual(setupPreview.data.changes.map(change => change.path), ['project.yaml', 'docs/technical-preferences.md']);
  assert.equal(await readFile(join(project, 'project.yaml'), 'utf8'), beforeSetup);
  const setup = command(globalCli, 'engine', 'setup', '--input', setupInput, '--project', project);
  assert.equal(setup.status, 'ok'); assert.equal(setup.data.execution.state, 'not_assessed');
  assert.equal(command(launcher, 'config', 'get', 'engine.version', '--project', project).data.settings['engine.version'].value, '7.3.1');
  assert.match(await readFile(join(project, 'docs/technical-preferences.md'), 'utf8'), /\*\*Engine\*\*: Web 7\.3\.1/);
  assert.equal(command(launcher, 'engine', 'setup', '--input', setupInput, '--project', project).data.changes.length, 0);
  await writeFile(join(project, 'test-fixture.cjs'), 'console.log("packed test executed");\n');
  command(launcher, 'config', 'set', 'commands.test', 'node test-fixture.cjs', '--project', project);
  assert.equal(command(launcher, 'test', '--output', 'production/evidence/packed-test', '--project', project).data.processExitCode, 0);
  assert.match(await readFile(join(project, 'production/evidence/packed-test/stdout.log'), 'utf8'), /packed test executed/);
  const beforeOverride = await readFile(join(project, 'project.yaml'), 'utf8');
  const override = command(launcher, 'test', '--kind', 'smoke', '--command', 'node test-fixture.cjs',
    '--timeout', '1800000', '--output', 'production/evidence/packed-override', '--project', project);
  assert.equal(override.data.source, 'invocation:--command');
  assert.equal(override.data.processExitCode, 0);
  assert.equal(override.data.timeoutMs, 1800000);
  assert.equal(await readFile(join(project, 'project.yaml'), 'utf8'), beforeOverride);
  await writeFile(join(project, 'checkpoint-draft.md'), '**Current task:** Prototype movement\n**Next step:** Test controls\n');
  command(launcher, 'checkpoint', 'save', '--input', 'checkpoint-draft.md', '--expect-hash', 'missing', '--project', project);
  assert.equal(command(globalCli, 'checkpoint', 'show', '--project', project).data.fields['Next step'], 'Test controls');
  command(globalCli, 'prototype', 'scaffold', 'smoke', '--project', project);
  const growth = command(globalCli, 'prototype', 'grow-check', 'smoke', '--project', project);
  assert.equal(growth.data.eligible, true);
  assert.equal(growth.data.verification.state, 'not_assessed');
  await writeFile(join(project, 'package.json'), '{"name":"existing-game"}\n');
  try {
    command(launcher, 'prototype', 'grow-check', 'smoke', '--project', project);
    assert.fail('An existing game must block prototype growth');
  } catch (error) {
    assert.equal(error.status, 4); assert.equal(JSON.parse(error.stdout).data.eligible, false);
  }
  assert.equal(await readFile(join(project, 'package.json'), 'utf8'), '{"name":"existing-game"}\n');
  await rm(join(project, 'package.json'));
  assert.equal(command(globalCli, 'check', 'prototypes/smoke', '--project', project).status, 'ok');
  command(globalCli, 'package', 'prototypes/smoke', '--output', 'builds/smoke', '--project', project);
  assert.ok(await readFile(join(project, 'builds/smoke/index.html')));
  const godotProject = join(temp, 'Godot scaffold');
  command(globalCli, 'init', godotProject, '--engine', 'godot');
  command(globalCli, 'restore', '--project', godotProject, '--archive', archive, '--offline');
  const godotLauncher = join(godotProject, '.game-studio/run.cjs');
  await writeFile(join(godotProject, 'engine.json'), JSON.stringify({ engine: {
    name: 'Godot', version: '4.6.1', language: 'GDScript', rendering: 'Compatibility', code_root: 'src', test_root: 'tests',
  } }));
  command(godotLauncher, 'engine', 'setup', '--input', 'engine.json', '--project', godotProject);
  assert.equal(command(godotLauncher, 'engine', 'scaffold', '--dry-run', '--project', godotProject).data.outcome.state, 'planned');
  await assert.rejects(readFile(join(godotProject, 'project.godot')), { code: 'ENOENT' });
  assert.equal(command(godotLauncher, 'engine', 'scaffold', '--project', godotProject).data.outcome.state, 'created');
  assert.equal(command(godotLauncher, 'engine', 'scaffold', '--project', godotProject).data.outcome.state, 'already_present');
  assert.equal(command(godotLauncher, 'engine', 'verify', '--dry-run', '--project', godotProject).data.status, 'planned');
  try {
    command(godotLauncher, 'engine', 'verify', '--executable', join(temp, 'missing-editor'), '--project', godotProject);
    assert.fail('A missing editor must not pass verification');
  } catch (error) {
    assert.equal(error.status, 3); assert.equal(JSON.parse(error.stdout).status, 'not_assessed');
  }
  command(globalCli, 'detach', '--project', godotProject);
  assert.match(await readFile(join(godotProject, 'project.godot'), 'utf8'), /config_version=5/);
  const lock = await readFile(join(project, '.game-studio/package-lock.json'), 'utf8');
  assert.equal(JSON.parse(lock).packages['node_modules/@t-x-r/game-studio'].resolved, 'file:runtime.tgz');
  await rm(archive);
  assert.ok((await readFile(join(project, '.game-studio/runtime.tgz'))).length > 0);
  command(globalCli, 'restore', '--project', project, '--offline');
  assert.equal(await readFile(join(project, '.game-studio/package-lock.json'), 'utf8'), lock);
  const packageFile = join(globalRoot, 'package.json');
  const metadata = JSON.parse(await readFile(packageFile, 'utf8'));
  metadata.version = '999.0.0';
  await writeFile(packageFile, JSON.stringify(metadata));
  const resource = command(globalCli, 'resource', 'path', 'studio/docs/integration.md', '--project', project);
  assert.ok(resource.data.path.startsWith(join(project, '.game-studio/node_modules')));
  command(globalCli, 'skills', 'setup', '--home', join(temp, 'codex-home'));
  command(globalCli, 'skills', 'remove', '--home', join(temp, 'codex-home'));
  command(globalCli, 'detach', '--project', project);
  for (const role of roles) await assert.rejects(readFile(join(project, role)), { code: 'ENOENT' });
  assert.ok(await readFile(join(project, 'project.yaml'), 'utf8'));
  assert.match(await readFile(join(project, 'docs/technical-preferences.md'), 'utf8'), /Web 7\.3\.1/);
  assert.match(await readFile(join(project, 'production/session-state/active.md'), 'utf8'), /Test controls/);
  console.log('Packed install, exact runtime restore, single-hop dispatch, onboarding and detach passed.');
} finally { await rm(temp, { recursive: true, force: true }); }
