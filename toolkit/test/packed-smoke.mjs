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
  assert.ok(packed.files.some(file => file.path === 'resources/studio/templates/web-setup/.gitignore.tmpl'));
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
  const roles = ['qa-tester', 'qa-lead', 'game-designer', 'lead-programmer', 'gameplay-programmer', 'systems-designer', 'ui-programmer', 'ux-designer', 'accessibility-specialist', 'analytics-engineer', 'audio-director', 'economy-designer', 'godot-specialist'].map(role => `.codex/agents/game-studio-${role}.toml`);
  for (const role of roles) {
    assert.equal(await readFile(join(project, role), 'utf8'),
      await readFile(join(packageRoot, '..', role), 'utf8'));
  }
  for (const file of ['SKILL.md', 'references/facts-and-policy.md', 'references/checklist.md', 'references/qa-lead-gate.md']) {
    const path = `.agents/skills/game-studio-story-readiness/${file}`;
    assert.deepEqual(await readFile(join(project, path)), await readFile(join(packageRoot, '..', path)));
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
  for (const skill of ['design-system', 'design-review', 'architecture-decision', 'create-architecture', 'architecture-review', 'next-step', 'sprint-status', 'story-done', 'setup-engine']) {
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
  const webDetector = command(globalCli, 'resource', 'path', 'studio/scripts/web-detect.mjs').data.path;
  assert.deepEqual(await readFile(webDetector), await readFile(join(packageRoot, '../studio/scripts/web-detect.mjs')));
  const existingWeb = join(temp, 'existing webpack game');
  await mkdir(join(existingWeb, 'SRC'), { recursive: true });
  const webPackage = JSON.stringify({ scripts: { dev: 'vite', build: 'webpack', test: 'jest' },
    devDependencies: { vite: '^7.3.1', webpack: '^5.99.0', jest: '^30.0.0' }, dependencies: { phaser: '^3.90.0' } });
  await writeFile(join(existingWeb, 'package.json'), webPackage);
  await writeFile(join(existingWeb, 'package-lock.json'), '{}');
  await writeFile(join(existingWeb, 'SRC/game.js'), 'window.game = game;');
  const webFacts = JSON.parse(execute(webDetector, ['--project', existingWeb]));
  assert.equal(webFacts.qualityAssessed, false);
  assert.equal(webFacts.bundlers[0].name, 'webpack');
  assert.equal(webFacts.engineVersion.value, null);
  assert.equal(webFacts.engineVersion.declared, '^5.99.0');
  assert.equal(webFacts.commands.build.command, 'npm run build');
  assert.deepEqual(webFacts.files.codeRootCandidates, ['SRC']);
  assert.equal(webFacts.hook.state, 'present');
  assert.equal(webFacts.testRunners[0].name, 'jest');
  assert.equal(webFacts.libraries[0].package, 'phaser');
  assert.equal(await readFile(join(existingWeb, 'package.json'), 'utf8'), webPackage);
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
  const legacyTr = 'requirements:\n- id: TR-demo-007\n  status: superseded-by: TR-demo-008\n';
  await writeFile(join(registryProject, 'docs/architecture/tr-registry.yaml'), legacyTr);
  const legacyObservation = JSON.parse(execute(registryHelper, ['--project', registryProject, 'list', 'tr']));
  assert.equal(legacyObservation.qualityAssessed, false);
  assert.equal(legacyObservation.registries[0].state, 'read');
  assert.equal(legacyObservation.entries[0].fields.status, 'superseded-by: TR-demo-008');
  assert.ok(legacyObservation.diagnostics.some(row => row.code === 'UNQUOTED'));
  assert.equal(await readFile(join(registryProject, 'docs/architecture/tr-registry.yaml'), 'utf8'), legacyTr);
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
  const godotRole = '.codex/agents/game-studio-godot-specialist.toml';
  const restoredGodotRole = command(launcher, 'resource', 'path', godotRole, '--project', project).data.path;
  assert.ok(restoredGodotRole.startsWith(join(project, '.game-studio/node_modules')));
  assert.deepEqual(await readFile(restoredGodotRole), await readFile(join(packageRoot, '..', godotRole)));
  const setupId = '.agents/skills/game-studio-setup-engine';
  const restoredSetup = JSON.parse(execute(launcher, ['resource', 'path', setupId, '--json'], project)).data.path;
  assert.ok(restoredSetup.startsWith(join(project, '.game-studio/node_modules')));
  const setupFiles = (await readdir(restoredSetup, { recursive: true, withFileTypes: true })).filter(file => file.isFile());
  assert.equal(setupFiles.length, 14);
  for (const file of setupFiles) {
    const name = relative(restoredSetup, join(file.parentPath, file.name));
    assert.deepEqual(await readFile(join(restoredSetup, name)), await readFile(join(packageRoot, '..', setupId, name)));
  }
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
  const reviewProject = join(temp, 'review inputs 项目');
  command(globalCli, 'init', reviewProject, '--engine', 'web');
  command(globalCli, 'restore', '--project', reviewProject, '--archive', archive, '--offline');
  const reviewInputs = join(reviewProject, '.agents/skills/game-studio-architecture-review/scripts/review-inputs.mjs');
  for (const [path, content] of [
    ['design/gdd/combat.md', 'Combat rules'], ['design/gdd/other.md', 'Other rules'],
    ['docs/architecture/adr-0001.md', 'Decision'], ['docs/architecture/tr-registry.yaml', 'requirements: []'],
    ['docs/architecture/architecture.md', 'Architecture'], ['docs/engine-reference/web/VERSION.md', 'Web'],
    ['docs/engine-reference/web/current-best-practices.md', 'Reference'], ['docs/engine-reference/web/modules/core.md', 'Core'],
  ]) {
    await mkdir(join(reviewProject, path, '..'), { recursive: true });
    await writeFile(join(reviewProject, path), content + '\n');
  }
  const reviewSet = JSON.parse(execute(reviewInputs, ['list'], reviewProject));
  assert.equal(reviewSet.qualityAssessed, false); assert.equal(reviewSet.engine, 'Web');
  for (const path of ['design/gdd/other.md', 'docs/architecture/tr-registry.yaml',
    'docs/architecture/architecture.md', 'docs/engine-reference/web/current-best-practices.md',
    '.agents/skills/game-studio-architecture-review/references/writes-and-records.md']) assert.ok(reviewSet.inputs.includes(path), path);
  assert.ok(reviewSet.inputs.some(path => path.startsWith('.game-studio/node_modules/') && path.endsWith('/studio/scripts/review-receipts.mjs')));
  await writeFile(join(reviewProject, 'review.md'), execute(reviewInputs, ['hash'], reviewProject));
  assert.match(execute(reviewInputs, ['check', 'review.md'], reviewProject), /UNCHANGED: docs\/architecture\/tr-registry.yaml/);
  await writeFile(join(reviewProject, 'docs/architecture/tr-registry.yaml'), 'requirements: [changed]\n');
  assert.match(execute(reviewInputs, ['check', 'review.md'], reviewProject), /CHANGED: docs\/architecture\/tr-registry.yaml/);
  await rm(join(reviewProject, 'docs/engine-reference/web/modules/core.md'));
  assert.throws(() => execute(reviewInputs, ['hash'], reviewProject), error => error.status === 2 && /UNRESOLVED:/.test(error.stderr.toString()));
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
  const factsHelper = JSON.parse(execute(launcher, ['resource', 'path', 'studio/scripts/story-facts.mjs', '--json'], project)).data.path;
  assert.ok(factsHelper.startsWith(join(project, '.game-studio/node_modules')));
  assert.deepEqual(await readFile(factsHelper), await readFile(join(packageRoot, '../studio/scripts/story-facts.mjs')));
  const facts = JSON.parse(execute(factsHelper, ['--project', storyProject, '--all', '--lint']));
  assert.equal(facts.status, 'observed'); assert.equal(facts.qualityAssessed, false);
  assert.equal(facts.counts.TODO, 1); assert.equal(facts.counts.IN_REVIEW, 1);
  assert.equal(facts.lint.filter(row => row.rule === 'type_missing').length, 2);
  assert.throws(() => execute(factsHelper, ['--project', storyProject, 'production/epics/one/story-01.md', 'missing.md']), error => {
    assert.equal(error.status, 3);
    const partial = JSON.parse(error.stdout);
    assert.equal(partial.stories.length, 1); assert.deepEqual(partial.missingPaths, ['missing.md']);
    return true;
  });
  await writeFile(join(storyProject, 'production/sprint-status.yaml'), 'stories: [broken\n');
  assert.throws(() => execute(factsHelper, ['--project', storyProject, '--sprint']), error => {
    assert.equal(error.status, 1);
    const result = JSON.parse(error.stdout);
    assert.equal(result.status, 'not_assessed'); assert.equal(result.error.code, 'INVALID_SPRINT');
    return true;
  });
  await writeFile(join(storyProject, 'production/sprint-status.yaml'), 'stories: [{file: production/epics/one/story-02.md, status: review}]\n');
  const sprintFacts = JSON.parse(execute(factsHelper, ['--project', storyProject, '--sprint']));
  assert.equal(sprintFacts.stories.length, 1); assert.equal(sprintFacts.stories[0].sprintStatus, 'review');
  const sectionHelper = JSON.parse(execute(launcher, ['resource', 'path', 'studio/scripts/md-section.mjs', '--json'], project)).data.path;
  const restoredWebDetector = JSON.parse(execute(launcher, ['resource', 'path', 'studio/scripts/web-detect.mjs', '--json'], project)).data.path;
  assert.ok(restoredWebDetector.startsWith(join(project, '.game-studio/node_modules')));
  assert.deepEqual(JSON.parse(execute(restoredWebDetector, ['--project', existingWeb])), webFacts);
  assert.match(execute(restoredWebDetector, ['--project', existingWeb, '--text']), /engine_version\t-\tpackage.json \^5\.99\.0/);
  const globalPageShot = command(globalCli, 'resource', 'path', 'studio/scripts/page-shot.mjs').data.path;
  const restoredPageShot = JSON.parse(execute(launcher, ['resource', 'path', 'studio/scripts/page-shot.mjs', '--json'], project)).data.path;
  assert.ok(restoredPageShot.startsWith(join(project, '.game-studio/node_modules')));
  await writeFile(join(existingWeb, 'index.html'), '<h1>Existing page</h1>');
  for (const helper of [globalPageShot, restoredPageShot]) {
    assert.deepEqual(await readFile(helper), await readFile(join(packageRoot, '../studio/scripts/page-shot.mjs')));
    assert.equal(execute(helper, ['--which', '--browser', process.execPath]).trim(), process.execPath);
    const planned = JSON.parse(execute(helper, ['--project', existingWeb, 'index.html', 'shot', '--browser', process.execPath, '--dry-run']));
    assert.equal(planned.status, 'planned'); assert.equal(planned.replayAssessed, false);
    assert.equal(planned.qualityAssessed, false); assert.deepEqual(planned.attempts, []);
    assert.equal(new URL(planned.url).searchParams.has('manual'), false);
    assert.equal(await readFile(join(existingWeb, 'index.html'), 'utf8'), '<h1>Existing page</h1>');
    await assert.rejects(readFile(join(existingWeb, 'shot/report.json')), { code: 'ENOENT' });
  }
  for (const [runtime, entry] of [['global', globalCli], ['restored', launcher]]) {
    const testScaffold = command(entry, 'resource', 'path', 'studio/scripts/test-scaffold.mjs', '--project', project).data.path;
    assert.deepEqual(await readFile(testScaffold), await readFile(join(packageRoot, '../studio/scripts/test-scaffold.mjs')));
    if (runtime === 'restored') assert.ok(testScaffold.startsWith(join(project, '.game-studio/node_modules')));
    for (const name of await readdir(join(packageRoot, '../studio/templates/test-scaffold'))) {
      const id = `studio/templates/test-scaffold/${name}`;
      const installed = command(entry, 'resource', 'path', id, '--project', project).data.path;
      assert.deepEqual(await readFile(installed), await readFile(join(packageRoot, '..', id)));
    }
    const parseHelper = command(entry, 'resource', 'path', 'studio/scripts/godot-parse-check.gd', '--project', project).data.path;
    assert.deepEqual(await readFile(parseHelper), await readFile(join(packageRoot, '../studio/scripts/godot-parse-check.gd')));
    if (runtime === 'restored') assert.ok(parseHelper.startsWith(join(project, '.game-studio/node_modules')));
    const referenceHelper = command(entry, 'resource', 'path', 'studio/scripts/engine-references.mjs', '--project', project).data.path;
    const coherenceHelper = command(entry, 'resource', 'path', 'studio/scripts/project-coherence.mjs', '--project', project).data.path;
    for (const [helper, name] of [[referenceHelper, 'engine-references'], [coherenceHelper, 'project-coherence']]) {
      assert.deepEqual(await readFile(helper), await readFile(join(packageRoot, `../studio/scripts/${name}.mjs`)));
      if (runtime === 'restored') assert.ok(helper.startsWith(join(project, '.game-studio/node_modules')));
    }
    for (const [engine, version] of [['Godot', '4.7'], ['Unity', '6000.3.26f1'], ['Unreal', '5.8'], ['Web', '8.3.4']]) {
      const target = join(temp, `${runtime} ${engine} references`);
      await mkdir(target);
      const config = JSON.stringify({ engine: { name: engine, version } });
      await writeFile(join(target, 'project.yaml'), config);
      const preview = JSON.parse(execute(referenceHelper, ['--project', target, '--dry-run']));
      assert.equal(preview.outcome.state, 'planned');
      assert.equal(preview.applied, false);
      assert.deepEqual(await readdir(target), ['project.yaml']);
      const created = JSON.parse(execute(referenceHelper, ['--project', target]));
      assert.equal(created.outcome.state, 'created');
      assert.equal(created.installedVersionAssessed, false);
      const source = join(packageRoot, '../studio/engine-reference', engine.toLowerCase());
      for (const file of await readdir(source, { recursive: true, withFileTypes: true })) {
        if (!file.isFile()) continue;
        const name = relative(source, join(file.parentPath, file.name));
        assert.deepEqual(await readFile(join(target, 'docs/engine-reference', engine.toLowerCase(), name)), await readFile(join(source, name)));
      }
      assert.deepEqual(await readFile(join(target, 'docs/engine-reference/README.md')), await readFile(join(packageRoot, '../studio/engine-reference/README.md')));
      assert.equal(JSON.parse(execute(referenceHelper, ['--project', target])).outcome.state, 'already_present');
      const observed = JSON.parse(execute(coherenceHelper, ['--project', target]));
      assert.equal(observed.status, 'observed');
      assert.equal(observed.qualityAssessed, false);
      assert.deepEqual(observed.probes, []);
      if (engine !== 'Web') assert.equal(observed.observations.find(row => row.check === 'reference-series').state, 'MATCH');
      assert.match(execute(coherenceHelper, ['--project', target, '--text']), /Observations only/);
      assert.equal(await readFile(join(target, 'project.yaml'), 'utf8'), config);
      if (engine === 'Web') {
        await writeFile(join(target, 'package.json'), JSON.stringify({ scripts: { build: 'webpack', test: 'playwright test' },
          devDependencies: { webpack: '5.99.0', '@playwright/test': '1.56.0' } }));
        await writeFile(join(target, 'package-lock.json'), '{}');
      }
      const scaffoldArgs = ['--project', target, engine];
      if (engine === 'Unreal') scaffoldArgs.push('--module', 'ActualModule', '--project-name', 'Shooter', '--test-prefix', 'ProductSpec');
      const plannedTests = JSON.parse(execute(testScaffold, [...scaffoldArgs, '--dry-run']));
      assert.equal(plannedTests.qualityAssessed, false);
      const expectedScaffoldCount = { Godot: 6, Unity: 6, Unreal: 5, Web: 7 }[engine];
      assert.equal(plannedTests.files.length, expectedScaffoldCount);
      assert.ok(plannedTests.files.every(file => file.state === 'WOULD_CREATE'));
      await assert.rejects(readFile(join(target, 'tests/README.md')), { code: 'ENOENT' });
      const scaffolded = JSON.parse(execute(testScaffold, scaffoldArgs));
      assert.equal(scaffolded.files.length, expectedScaffoldCount);
      assert.ok(scaffolded.files.every(file => file.state === 'CREATED'));
      assert.match(await readFile(join(target, 'tests/README.md'), 'utf8'), /^# Test Infrastructure/);
      if (engine === 'Unreal') for (const id of ['editor_target', 'module_build_rules', 'project_file', 'ue_root']) {
        assert.ok(scaffolded.needs.some(need => need.id === id));
      }
      await writeFile(join(target, 'tests/README.md'), 'Owner-maintained test instructions\r\n');
      const repeated = JSON.parse(execute(testScaffold, scaffoldArgs));
      assert.equal(repeated.files.length, expectedScaffoldCount);
      assert.ok(repeated.files.every(file => file.state === 'EXISTS'));
      assert.equal(await readFile(join(target, 'tests/README.md'), 'utf8'), 'Owner-maintained test instructions\r\n');
      assert.equal(await readFile(join(target, 'project.yaml'), 'utf8'), config);
    }
    for (const starter of ['none', 'three', 'phaser', 'pixi']) {
      const freshWeb = join(temp, `${runtime} ${starter} starter`);
      await mkdir(freshWeb);
      const configuration = 'engine:\n  name: Web\n  version: "8.3.4"\n  language: TypeScript\n';
      await writeFile(join(freshWeb, 'project.yaml'), configuration);
      const args = ['engine', 'scaffold', '--project', freshWeb, '--starter', starter, '--title', 'Packed <game>'];
      const preview = command(entry, ...args, '--dry-run');
      assert.equal(preview.data.outcome.state, 'planned');
      assert.deepEqual(await readdir(freshWeb), ['project.yaml']);
      const created = command(entry, ...args);
      assert.equal(created.data.outcome.state, 'created');
      assert.equal(created.data.verification.state, 'not_assessed');
      assert.equal(created.data.changes.filter(c => c.action === 'create').length, 14);
      assert.deepEqual(await readFile(join(freshWeb, '.gitignore')), await readFile(join(packageRoot, '../studio/templates/web-setup/.gitignore.tmpl')));
      assert.match(await readFile(join(freshWeb, 'index.html'), 'utf8'), /<title>Packed &lt;game&gt;<\/title>/);
      const source = starter === 'none' ? 'web-growth' : `web-starters/${starter}`;
      for (const file of ['package.json', 'package-lock.json']) {
        assert.deepEqual(await readFile(join(freshWeb, file)), await readFile(join(packageRoot, '../studio/templates', source, file)));
      }
      assert.equal(await readFile(join(freshWeb, 'project.yaml'), 'utf8'), configuration);
      assert.ok(!(await readdir(freshWeb)).includes('node_modules'));
      assert.throws(() => command(entry, ...args), error => error.status === 3);
    }
  }
  assert.ok(sectionHelper.startsWith(join(project, '.game-studio/node_modules')));
  assert.deepEqual(await readFile(sectionHelper), await readFile(join(packageRoot, '../studio/scripts/md-section.mjs')));
  const sectionText = '# Root\r\n## Rules\r\nfirst\r\n### Detail\r\nsecond\r\n## End\r\nlast';
  await writeFile(join(storyProject, 'sections.md'), sectionText);
  const section = JSON.parse(execute(sectionHelper, ['--project', storyProject, 'extract', 'sections.md', 'Rules', '--body']));
  assert.equal(section.qualityAssessed, false); assert.equal(section.content, 'first\n### Detail\nsecond\n');
  assert.equal(execute(sectionHelper, ['--project', storyProject, 'extract', 'sections.md', 'Rules', '--body', '--text']), section.content);
  const missingSection = JSON.parse(execute(sectionHelper, ['--project', storyProject, 'status', 'sections.md', 'Missing']));
  assert.equal(missingSection.counts.not_found, 1);
  assert.throws(() => execute(sectionHelper, ['--project', storyProject, 'extract', 'sections.md', 'Missing']), error => error.status === 3);
  assert.throws(() => execute(sectionHelper, ['--project', storyProject, 'replace', 'sections.md', 'Rules']), error => error.status === 2);
  assert.equal(await readFile(join(storyProject, 'sections.md'), 'utf8'), sectionText);
  const writeSection = (args, input) => execFileSync(process.execPath,
    [sectionHelper, '--project', storyProject, ...args],
    { cwd: temp, input, encoding: 'utf8', timeout: 5000 });
  const preview = JSON.parse(writeSection(['replace', 'sections.md', 'Rules', '--dry-run'], 'updated\n'));
  assert.equal(preview.action, 'replaced'); assert.equal(preview.applied, false);
  assert.equal(preview.dryRun, true); assert.equal(preview.qualityAssessed, false);
  assert.equal(await readFile(join(storyProject, 'sections.md'), 'utf8'), sectionText);
  const replacement = JSON.parse(writeSection(['replace', 'sections.md', 'Rules'], 'updated\n'));
  assert.equal(replacement.applied, true);
  assert.equal(await readFile(join(storyProject, 'sections.md'), 'utf8'), '# Root\r\n## Rules\r\n\r\nupdated\r\n\r\n## End\r\nlast\n');
  assert.equal(writeSection(['insert-before', 'sections.md', 'Rules', '--text'], 'Status: Draft\n'),
    'file\tsections.md\tinserted\nline\t3\t-\n');
  assert.equal(JSON.parse(writeSection(['set-field', 'sections.md', 'Status', '--text'])).action, 'set');
  const written = await readFile(join(storyProject, 'sections.md'), 'utf8');
  assert.match(written, /Status: --text\r\n/);
  assert.equal(JSON.parse(writeSection(['set-field', 'sections.md', 'Status', '--text'])).action, 'unchanged');
  assert.throws(() => writeSection(['replace', 'sections.md', 'Missing'], 'payload\n'), error => error.status === 3);
  assert.equal(await readFile(join(storyProject, 'sections.md'), 'utf8'), written);
  const adrHelper = JSON.parse(execute(launcher, ['resource', 'path', 'studio/scripts/adr-status.mjs', '--json'], project)).data.path;
  assert.ok(adrHelper.startsWith(join(project, '.game-studio/node_modules')));
  assert.deepEqual(await readFile(adrHelper), await readFile(join(packageRoot, '../studio/scripts/adr-status.mjs')));
  const adrTemplatePath = JSON.parse(execute(launcher, ['resource', 'path', 'studio/templates/architecture-decision-record.md', '--json'], project)).data.path;
  const adrTemplate = await readFile(adrTemplatePath, 'utf8');
  assert.equal(adrTemplate, await readFile(join(packageRoot, '../studio/templates/architecture-decision-record.md'), 'utf8'));
  await mkdir(join(storyProject, 'docs/architecture'), { recursive: true });
  await writeFile(join(storyProject, 'docs/architecture/adr-0001.md'), adrTemplate);
  await writeFile(join(storyProject, 'docs/architecture/adr-0002.md'), '## Status\nSuperseded by ADR-0003\n');
  const adrRows = JSON.parse(execute(adrHelper, ['--project', storyProject]));
  assert.equal(adrRows.status, 'observed'); assert.equal(adrRows.qualityAssessed, false);
  assert.equal(adrRows.templatePath, 'studio/templates/architecture-decision-record.md');
  assert.equal(adrRows.templateSections, adrTemplate.split('\n').filter(line => /^## /.test(line)).length);
  assert.ok(adrRows.templateSections > 0);
  assert.deepEqual(adrRows.adrs[0].missing, []); assert.ok(adrRows.adrs[0].unfilled > 0);
  assert.equal(adrRows.adrs[1].status, 'Superseded'); assert.equal(adrRows.adrs[1].supersededBy, 'adr-0003');
  assert.throws(() => execute(adrHelper, ['--project', storyProject, '2', '99']), error => {
    assert.equal(error.status, 3);
    const partial = JSON.parse(error.stdout);
    assert.equal(partial.adrs.length, 1); assert.deepEqual(partial.missingSelectors, ['99']);
    assert.equal(partial.qualityAssessed, false);
    return true;
  });
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
  }, naming: { variables: 'camelCase' }, platform: { targets: ['PC'], primary_input: 'Gamepad', gamepad_support: 'Full', touch_support: 'None' },
  performance: { target_framerate: 60, frame_budget_ms: 16.6, draw_call_limit: 1200, memory_ceiling_mb: 512 },
  testing: { framework: 'Vitest' }, qa: { coverage_minimum: null } }));
  const beforeSetup = await readFile(join(project, 'project.yaml'), 'utf8');
  const setupPreview = command(launcher, 'engine', 'setup', '--input', setupInput, '--dry-run', '--project', project);
  assert.deepEqual(setupPreview.data.changes.map(change => change.path), ['project.yaml', 'docs/technical-preferences.md']);
  assert.equal(await readFile(join(project, 'project.yaml'), 'utf8'), beforeSetup);
  const setup = command(globalCli, 'engine', 'setup', '--input', setupInput, '--project', project);
  assert.equal(setup.status, 'ok'); assert.equal(setup.data.execution.state, 'not_assessed');
  assert.equal(command(launcher, 'config', 'get', 'engine.version', '--project', project).data.settings['engine.version'].value, '7.3.1');
  assert.match(await readFile(join(project, 'docs/technical-preferences.md'), 'utf8'), /\*\*Engine\*\*: Web 7\.3\.1/);
  assert.equal(command(launcher, 'config', 'get', 'performance.frame_budget_ms', '--project', project).data.settings['performance.frame_budget_ms'].value, 16.6);
  const technicalMirror = await readFile(join(project, 'docs/technical-preferences.md'), 'utf8');
  for (const line of ['**Target Platforms**: PC', '**Primary Input**: Gamepad', '**Frame Budget**: 16.6', '**Framework**: Vitest', '**Minimum Coverage**: [TO BE CONFIGURED]']) assert.ok(technicalMirror.includes(line));
  assert.equal(command(launcher, 'engine', 'setup', '--input', setupInput, '--project', project).data.changes.length, 0);
  const unversionedInput = 'unversioned-web.json';
  await writeFile(join(project, unversionedInput), JSON.stringify({ engine: {
    name: 'Web', version: null, language: 'JavaScript', code_root: '.', test_root: 'tests',
  } }));
  const pinnedConfig = await readFile(join(project, 'project.yaml'), 'utf8');
  command(launcher, 'engine', 'setup', '--input', unversionedInput, '--dry-run', '--project', project);
  assert.equal(await readFile(join(project, 'project.yaml'), 'utf8'), pinnedConfig);
  command(globalCli, 'engine', 'setup', '--input', unversionedInput, '--project', project);
  assert.equal(command(launcher, 'config', 'get', 'engine.version', '--project', project).data.settings['engine.version'].value, null);
  assert.match(await readFile(join(project, 'docs/technical-preferences.md'), 'utf8'), /^- \*\*Engine\*\*: Web$/m);
  assert.equal(command(launcher, 'engine', 'setup', '--input', unversionedInput, '--project', project).data.changes.length, 0);
  command(launcher, 'engine', 'setup', '--input', setupInput, '--project', project);
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
  const configuredEditor = join(temp, 'missing editor 测试');
  command(globalCli, 'config', 'set', 'engine.path', configuredEditor, '--project', godotProject);
  const inspectedPath = command(godotLauncher, 'engine', 'inspect', '--project', godotProject).data.engine.path;
  assert.equal(inspectedPath.value, configuredEditor);
  assert.equal(inspectedPath.source, 'project.yaml');
  assert.equal(command(godotLauncher, 'engine', 'verify', '--dry-run', '--project', godotProject).data.command.executable, configuredEditor);
  assert.equal(command(godotLauncher, 'engine', 'verify', '--dry-run', '--executable', 'override-editor', '--project', godotProject).data.command.executable, 'override-editor');
  command(godotLauncher, 'engine', 'setup', '--input', 'engine.json', '--project', godotProject);
  assert.ok((await readFile(join(godotProject, 'docs/technical-preferences.md'), 'utf8')).includes(`**Engine Path**: ${configuredEditor}`));
  command(godotLauncher, 'config', 'set', 'engine.path', 'null', '--project', godotProject);
  assert.equal(command(godotLauncher, 'engine', 'verify', '--dry-run', '--project', godotProject).data.command.executable, 'godot');
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
