import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, readdir, symlink, lstat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const runtime = fileURLToPath(new URL('../dist/test-scaffold.js', import.meta.url));
const call = async (...args) => (await import(runtime)).scaffoldTests(...args);
async function fixture(engine, extra = '', files = {}) {
  const root = await mkdtemp(join(tmpdir(), 'test scaffold '));
  await writeFile(join(root, 'project.yaml'), `engine:\n  name: ${engine}\n  version: ${engine === 'Godot' ? '4.7.2' : engine === 'Unity' ? '6000.3.1f1' : '5.7.1'}\n${extra}`);
  for (const [path, bytes] of Object.entries(files)) { await mkdir(join(root, path, '..'), { recursive: true }); await writeFile(join(root, path), bytes); }
  return root;
}
const file = (data, path) => data.files.find(x => x.path === path);
const needs = data => data.needs.map(x => x.id);
const webFiles = { 'package.json': JSON.stringify({ scripts: { build: 'webpack', test: 'vitest run && playwright test', 'test:unit': 'vitest run', 'test:e2e': 'playwright test' }, devDependencies: { webpack: '5.99.0', vitest: '4.0.0', '@playwright/test': '1.56.0' } }), 'package-lock.json': '{"lockfileVersion":3}' };

test('preview has every Godot path and NEEDS, does not write; create is fill-only and repeat preserves bytes', async () => {
  const root = await fixture('Godot');
  const preview = await call(root, 'godot', { dryRun: true, date: '2026-11-13' });
  assert.equal(preview.exitCode, 0); assert.equal(preview.data.qualityAssessed, false);
  assert.equal(preview.data.files.length, 6); assert.ok(preview.data.files.every(x => x.state === 'WOULD_CREATE'));
  assert.deepEqual(await readdir(root), ['project.yaml']); assert.ok(needs(preview.data).includes('gdunit4'));
  const result = await call(root, 'Godot', { date: '2026-11-13' });
  assert.ok(result.data.files.every(x => x.state === 'CREATED'));
  assert.match(await readFile(join(root, 'tests/unit/.gdignore_placeholder'), 'utf8'), /not.*\.gdignore/);
  assert.match(await readFile(join(root, 'tests/unit/.gdignore_placeholder'), 'utf8'), /^# Unit tests go here — one subdirectory per system \(e\.g\., tests\/unit\/combat\/\)/);
  assert.match(await readFile(join(root, 'tests/integration/.gdignore_placeholder'), 'utf8'), /^# Integration tests go here — one subdirectory per system/);
  await writeFile(join(root, 'tests/README.md'), 'owner bytes\r\n');
  const again = await call(root, 'godot', {}); assert.ok(again.data.files.every(x => x.state === 'EXISTS'));
  assert.equal(await readFile(join(root, 'tests/README.md'), 'utf8'), 'owner bytes\r\n');
});

test('Unity creates source asmdefs only at effective Assets test root, flags assembly visibility and never installs', async () => {
  const root = await fixture('Unity', '  test_root: Assets/QA Tests\n', { 'Packages/manifest.json': '{"dependencies":{"com.unity.test-framework":"1.4.6"}}', 'Assets/Game.asmdef': '{"name":"Game"}' });
  const { data } = await call(root, 'unity', {});
  assert.equal(file(data, 'Assets/QA Tests/EditMode/EditModeTests.asmdef').state, 'CREATED');
  const asm = JSON.parse(await readFile(join(root, 'Assets/QA Tests/EditMode/EditModeTests.asmdef')));
  assert.deepEqual(asm.references, ['UnityEngine.TestRunner', 'UnityEditor.TestRunner']);
  assert.ok(needs(data).includes('game_assembly_references')); assert.ok(needs(data).includes('unity_license'));
  assert.ok(!needs(data).includes('unity_test_framework')); assert.equal(await readFile(join(root, 'Assets/Game.asmdef'), 'utf8'), '{"name":"Game"}');
});

test('Unreal project, actual module, editor target and explicit filter are separate identities', async () => {
  const root = await fixture('Unreal', '  test_root: Source/ActualModule/Private/Checks\ncommands:\n  test: UnrealEditor -ExecCmds="Automation RunTests ProductSpec.; Quit"\n', { 'Shooter.uproject': '{"Modules":[{"Name":"ActualModule","Type":"Runtime"}]}', 'Source/ToolsEditor.Target.cs': 'Type = TargetType.Editor;' });
  const { data } = await call(root, 'unreal', {});
  assert.equal(file(data, 'Source/ActualModule/Private/Checks/README.md').state, 'CREATED');
  const ci = await readFile(join(root, '.github/workflows/tests.yml'), 'utf8');
  assert.match(ci, /ToolsEditor Win64/); assert.match(ci, /Shooter\.uproject/); assert.match(ci, /RunTests ProductSpec\./);
  assert.doesNotMatch(ci, /ActualModule\.uproject|RunTests Shooter\./);
  assert.match(await readFile(join(root, 'tests/README.md'), 'utf8'), /Source\/ActualModule\/Private\/Checks/);
});

test('Unreal ambiguity skips only module README and records unresolved identity needs', async () => {
  const root = await fixture('Unreal'); const { data, exitCode } = await call(root, 'unreal', {});
  assert.equal(exitCode, 3); assert.equal(file(data, 'Source/<Module>/Private/Tests/README.md').state, 'SKIPPED');
  for (const id of ['module', 'project_name', 'editor_target', 'test_prefix', 'ue_root']) assert.ok(needs(data).includes(id), id);
  assert.equal(file(data, 'tests/smoke/critical-paths.md').state, 'CREATED');
});

test('non-Vite Web keeps real runner/build/lock commands and reuses exact canonical Playwright', async () => {
  const root = await fixture('Web', '', webFiles); const { data, exitCode } = await call(root, 'web', {});
  assert.equal(exitCode, 0); assert.equal(file(data, 'playwright.config.ts').state, 'CREATED');
  const canonical = await readFile(fileURLToPath(new URL('../resources/studio/templates/web-growth/playwright.config.ts', import.meta.url)), 'utf8');
  assert.equal(await readFile(join(root, 'playwright.config.ts'), 'utf8'), canonical);
  const readme = await readFile(join(root, 'tests/README.md'), 'utf8');
  assert.match(readme, /webpack/); assert.doesNotMatch(readme, /Web \(Vite|dist-single|page-shot\.sh/);
  const ci = await readFile(join(root, '.github/workflows/tests.yml'), 'utf8');
  assert.match(ci, /npm ci/); assert.match(ci, /npm run build/); assert.match(ci, /npm test/); assert.match(ci, /GAME_STUDIO_BROWSER/);
  assert.doesNotMatch(ci, /playwright install/); assert.ok(needs(data).includes('npm_install'));
});

test('other Web runner still gets README, CI and roots without silently introducing Playwright', async () => {
  const root = await fixture('Web', '', { 'package.json': '{"scripts":{"build":"webpack","test":"jest"},"devDependencies":{"webpack":"5.0.0","jest":"30.0.0"}}', 'package-lock.json': '{}' });
  const { data, exitCode } = await call(root, 'web', {});
  assert.equal(exitCode, 3); assert.equal(file(data, 'playwright.config.ts').state, 'SKIPPED');
  assert.equal(file(data, '.github/workflows/tests.yml').state, 'CREATED');
  assert.match(await readFile(join(root, 'tests/README.md'), 'utf8'), /jest/);
  assert.ok(needs(data).includes('browser_test_setup'));
});

test('existing Playwright JS config is preserved without a competing TS config', async () => {
  const root = await fixture('Web', '', { ...webFiles, 'playwright.config.js': 'owner config\n' });
  const { data } = await call(root, 'web', {}); assert.equal(file(data, 'playwright.config.ts').state, 'SKIPPED');
  assert.equal(await readFile(join(root, 'playwright.config.js'), 'utf8'), 'owner config\n');
});

test('malformed package JSON rejects before writes; unresolved lock manager only creates explicit pending CI', async () => {
  const broken = await fixture('Web', '', { 'package.json': '{broken' });
  await assert.rejects(call(broken, 'web', {}), /JSON|package/i); assert.deepEqual((await readdir(broken)).sort(), ['package.json', 'project.yaml']);
  const root = await fixture('Web', '', { ...webFiles, 'yarn.lock': '# lock' });
  const { data } = await call(root, 'web', {});
  assert.ok(needs(data).includes('web_install')); assert.ok(needs(data).includes('web_test'));
  assert.match(await readFile(join(root, '.github/workflows/tests.yml'), 'utf8'), /exit 1/);
  assert.equal(await readFile(join(root, 'package-lock.json'), 'utf8'), '{"lockfileVersion":3}');
});

test('existing target symlink is EXISTS; symlink ancestor is refused and never writes outside', async () => {
  const root = await fixture('Godot'); const outside = await mkdtemp(join(tmpdir(), 'scaffold outside '));
  await mkdir(join(root, 'tests')); await symlink(outside, join(root, 'tests/README.md'), process.platform === 'win32' ? 'junction' : 'dir');
  const result = await call(root, 'godot', {}); assert.equal(file(result.data, 'tests/README.md').state, 'EXISTS');
  assert.ok(result.data.needs.some(x=>x.id==='expected_regular_file' && x.path==='tests/README.md'));
  assert.equal((await lstat(join(root, 'tests/README.md'))).isSymbolicLink(), true);
  const unsafe = await fixture('Godot'); await symlink(outside, join(unsafe, 'tests'), process.platform === 'win32' ? 'junction' : 'dir');
  await assert.rejects(call(unsafe, 'godot', {}), /Symbolic link/);
  assert.deepEqual((await readdir(unsafe)).sort(), ['project.yaml', 'tests']);
  assert.deepEqual(await readdir(outside), []);
});

test('two concurrent fills never overwrite files and preserve a real per-path outcome', async () => {
  const root = await fixture('Godot'); const outcomes = await Promise.all([call(root, 'godot', {date:'2026-01-01'}), call(root, 'godot', {date:'2026-02-02'})]);
  const text = await readFile(join(root, 'tests/README.md'), 'utf8');
  assert.ok(text.includes('2026-01-01') || text.includes('2026-02-02'));
  for (const item of outcomes) assert.ok(item.data.files.every(x => ['CREATED','EXISTS','FAILED'].includes(x.state)));
  assert.equal(outcomes.flatMap(x => x.data.files).filter(x => x.path === 'tests/README.md' && x.state === 'CREATED').length, 1);
});

test('engine mismatch, unsafe names, invalid Unity root and engine-specific flags reject without writes', async () => {
  const root = await fixture('Godot');
  for (const [engine, opts] of [['UE5',{}],['unity',{}],['godot',{module:'Wrong'}],['godot',{date:'bad'}]]) await assert.rejects(call(root, engine, opts));
  const unity = await fixture('Unity', '  test_root: tests\n'); await assert.rejects(call(unity,'unity',{}), /Assets|Packages/);
  const ue = await fixture('Unreal'); await assert.rejects(call(ue,'unreal',{module:'../escape'}));
  assert.deepEqual(await readdir(root), ['project.yaml']);
});

test('list is path-only via installed wrapper in a path with spaces, invalid/duplicate options fail', async () => {
  const root = await fixture('Godot');
  const wrapper = fileURLToPath(new URL('../resources/studio/scripts/test-scaffold.mjs', import.meta.url));
  const run = (...args) => spawnSync(process.execPath, [wrapper, '--project', root, ...args], { encoding:'utf8' });
  const list = run('godot','--list'); assert.equal(list.status,0,list.stdout+list.stderr); assert.equal(list.stdout.trim().split('\n').length,6); assert.ok(list.stdout.includes('.gdignore_placeholder'));
  for (const args of [['godot','--dry-run','--list'],['godot','--date','2026-01-01','--date','2026-01-02'],['godot','--wat']]) assert.equal(run(...args).status,2);
  assert.deepEqual(await readdir(root), ['project.yaml']);
});

test('a parent file produces a per-path FAILED while independent paths still fill; no overwrite', async () => {
  const root = await fixture('Godot','',{'.github':'owner'});
  const result = await call(root,'godot',{});
  assert.equal(result.exitCode,4); assert.equal(file(result.data,'.github/workflows/tests.yml').state,'FAILED');
  assert.equal(file(result.data,'tests/README.md').state,'CREATED'); assert.equal(await readFile(join(root,'.github'),'utf8'),'owner');
});

test('custom Godot test root, old keep file and full version/local override semantics are retained', async () => {
  const root = await fixture('Godot','  test_root: qa tests\n',{'project.local.yaml':'engine:\n  version: 9.9.9\n','qa tests/unit/.gitkeep':'legacy keep\n'});
  const {data}=await call(root,'godot',{});
  assert.equal(file(data,'qa tests/unit/.gdignore_placeholder').state,'CREATED');
  assert.equal(await readFile(join(root,'qa tests/unit/.gitkeep'),'utf8'),'legacy keep\n');
  assert.match(await readFile(join(root,'tests/README.md'),'utf8'),/-a "res:\/\/qa tests"/);
  const ci=await readFile(join(root,'.github/workflows/tests.yml'),'utf8'); assert.match(ci,/godot-version: '4\.7\.2'/); assert.match(ci,/qa tests\/unit/); assert.doesNotMatch(ci,/9\.9\.9/);
  assert.ok(data.warnings.some(x=>x.includes('not locally overridable')));
});

test('Web missing package still fills domain docs and smoke seed with explicit missing inputs', async () => {
  const root=await fixture('Web'); const {data,exitCode}=await call(root,'web',{});
  assert.equal(exitCode,3); assert.equal(file(data,'tests/README.md').state,'CREATED'); assert.equal(file(data,'tests/smoke/critical-paths.md').state,'CREATED');
  for (const id of ['package_json','web_install','web_test','browser_test_setup']) assert.ok(needs(data).includes(id));
  assert.doesNotMatch(await readFile(join(root,'tests/README.md'),'utf8'),/\*\*Engine\*\*: Web \(Vite/);
});

test('malformed Unity package is rejected before any write and missing framework remains NEEDS', async () => {
  const root=await fixture('Unity','',{'Packages/manifest.json':'{broken'});
  await assert.rejects(call(root,'unity',{}),/JSON/); assert.deepEqual((await readdir(root)).sort(),['Packages','project.yaml']);
  const missing=await fixture('Unity'); const result=await call(missing,'unity',{}); assert.ok(needs(result.data).includes('unity_test_framework'));
});

test('non-default Web test root changes only canonical Playwright testDir', async () => {
  const root=await fixture('Web','  test_root: qa tests\n',webFiles);
  const result=await call(root,'web',{}); assert.equal(result.exitCode,0);
  const canonical=await readFile(fileURLToPath(new URL('../resources/studio/templates/web-growth/playwright.config.ts',import.meta.url)),'utf8');
  assert.equal(await readFile(join(root,'playwright.config.ts'),'utf8'),canonical.replace("testDir: 'tests/integration'",'testDir: "qa tests/integration"'));
});

test('missing package resource is a visible per-path SKIPPED and never a silent empty file', async () => {
  const {cp,rm,realpath}=await import('node:fs/promises');
  const isolated=await mkdtemp(join(tmpdir(),'scaffold installed resource '));
  const base=fileURLToPath(new URL('..',import.meta.url));
  await cp(join(base,'dist'),join(isolated,'dist'),{recursive:true});
  await mkdir(join(isolated,'resources/studio/templates'),{recursive:true}); await mkdir(join(isolated,'resources/studio/scripts'),{recursive:true});
  for (const name of ['test-scaffold','web-growth']) await cp(join(base,'resources/studio/templates',name),join(isolated,'resources/studio/templates',name),{recursive:true});
  await cp(join(base,'resources/studio/engines'),join(isolated,'resources/studio/engines'),{recursive:true});
  await cp(join(base,'resources/studio/scripts/test-scaffold.mjs'),join(isolated,'resources/studio/scripts/test-scaffold.mjs'));
  await writeFile(join(isolated,'package.json'),'{"type":"module"}');
  await symlink(await realpath(join(base,'node_modules')),join(isolated,'node_modules'),process.platform==='win32'?'junction':'dir');
  await rm(join(isolated,'resources/studio/templates/test-scaffold/smoke.md'));
  const root=await fixture('Godot'); const proc=spawnSync(process.execPath,[join(isolated,'resources/studio/scripts/test-scaffold.mjs'),'--project',root,'godot'],{encoding:'utf8'});
  assert.equal(proc.status,3,proc.stdout+proc.stderr); const result=JSON.parse(proc.stdout);
  assert.equal(file(result,'tests/smoke/critical-paths.md').state,'SKIPPED'); assert.ok(needs(result).includes('template_resource'));
  await assert.rejects(readFile(join(root,'tests/smoke/critical-paths.md')), {code:'ENOENT'});
});

test('Web CI does not invent a build prerequisite when the actual test script needs none', async () => {
  const root=await fixture('Web','',{'package.json':'{"scripts":{"test":"jest"},"devDependencies":{"jest":"30.0.0"}}','package-lock.json':'{}'});
  const {data}=await call(root,'web',{});
  assert.ok(!needs(data).includes('web_build'));
  const ci=await readFile(join(root,'.github/workflows/tests.yml'),'utf8'); assert.match(ci,/npm test/); assert.doesNotMatch(ci,/- name: Build|exit 1/);
});

test('all generated workflow YAML parses, rendered inputs leave no internal tokens, smoke retains eight real conditional checks', async () => {
  const {parseDocument}=await import('yaml');
  for (const engine of ['Godot','Unity','Unreal','Web']) {
    const root=await fixture(engine,'',engine==='Web'?webFiles:{});
    const result=await call(root,engine,{});
    const raw=await readFile(join(root,'.github/workflows/tests.yml'),'utf8');
    assert.equal(parseDocument(raw).errors.length,0,raw); assert.doesNotMatch(raw,/@[A-Z_]+@/);
    const doc=await readFile(join(root,'tests/README.md'),'utf8'); assert.doesNotMatch(doc,/@[A-Z_]+@|\.claude\//);
    if (engine==='Unity') assert.match(doc,/\| Logic .*`Assets\/Tests\/EditMode\//);
    const smoke=await readFile(join(root,'tests/smoke/critical-paths.md'),'utf8');
    assert.equal([...smoke.matchAll(/^\d\. /gm)].length,8); assert.match(smoke,/once save system is implemented/); assert.match(smoke,/game-studio-smoke-check/);
    assert.equal(result.data.qualityAssessed,false);
  }
});


test('existing directory or dangling-link leaf stays untouched but is explicitly unresolved', async () => {
  const root=await fixture('Godot');
  await mkdir(join(root,'.github/workflows/tests.yml'),{recursive:true});
  await mkdir(join(root,'tests/smoke'),{recursive:true});
  const outside=await mkdtemp(join(tmpdir(),'scaffold missing link '));
  const {rm}=await import('node:fs/promises');
  await symlink(outside,join(root,'tests/smoke/critical-paths.md'),process.platform==='win32'?'junction':'dir');
  await rm(outside,{recursive:true});
  const {data,exitCode}=await call(root,'godot',{});
  assert.equal(exitCode,0);
  for (const path of ['.github/workflows/tests.yml','tests/smoke/critical-paths.md']) {
    assert.equal(file(data,path).state,'EXISTS'); assert.match(file(data,path).reason,/regular file is unresolved/);
    assert.ok(data.needs.some(x=>x.path===path && x.id==='expected_regular_file'));
  }
  assert.ok((await lstat(join(root,'.github/workflows/tests.yml'))).isDirectory());
  assert.ok((await lstat(join(root,'tests/smoke/critical-paths.md'))).isSymbolicLink());
});


test('unsafe dependency-observation path rejects before any scaffolding write', async () => {
  const root=await fixture('Godot'); const outside=await mkdtemp(join(tmpdir(),'scaffold dependency '));
  await symlink(outside,join(root,'addons'),process.platform==='win32'?'junction':'dir');
  await assert.rejects(call(root,'godot',{}),/Symbolic link/);
  assert.deepEqual((await readdir(root)).sort(),['addons','project.yaml']);
  assert.deepEqual(await readdir(outside),[]);
});


test('selected but undeclared Web tools remain explicit NEEDS without forcing them onto other runners', async () => {
  const root=await fixture('Web','',{'package.json':'{"scripts":{"test":"vitest run && playwright test"}}','package-lock.json':'{}'});
  const {data}=await call(root,'web',{});
  assert.ok(needs(data).includes('vitest')); assert.ok(needs(data).includes('@playwright/test'));
  assert.equal(file(data,'playwright.config.ts').state,'SKIPPED');
});

test('independent review: every Unreal .uproject in local README uses actual project, only test names use filter',async()=>{
  const root=await fixture('Unreal','  test_root: Source/ActualModule/Private/Checks\ncommands:\n  test: UnrealEditor -ExecCmds="Automation RunTests ProductSpec.; Quit"\n',{'Shooter.uproject':'{"Modules":[{"Name":"ActualModule","Type":"Runtime"}]}','Source/ToolsEditor.Target.cs':'Type = TargetType.Editor;','Source/ActualModule/ActualModule.Build.cs':'// existing rules\n'});
  await call(root,'unreal',{}); const doc=await readFile(join(root,'Source/ActualModule/Private/Checks/README.md'),'utf8');
  assert.equal([...doc.matchAll(/Shooter\.uproject/g)].length,4); assert.doesNotMatch(doc,/ProductSpec\.uproject/); assert.match(doc,/RunTests ProductSpec\./); assert.match(doc,/Git Bash/);
});
test('independent review: empty/null engine and UE5 alias use actual settings without rewriting input; other invalid/conflicting values reject',async()=>{
  for (const [primary,label,arg,want] of [['','Godot 4.7.2','godot','Godot'],[null,'Godot 4.7.2','godot','Godot'],['UE5','UE5 5.7.1','unreal','Unreal'],['','UE5 5.7.1','unreal','Unreal']]) {
    const root=await fixture('Godot','',{'docs/technical-preferences.md':`# Technical Preferences\n\n**Engine**: ${label}\n`});
    const yaml=`engine:\n  name: ${JSON.stringify(primary)}\n`; await writeFile(join(root,'project.yaml'),yaml);
    const {data}=await call(root,arg,{dryRun:true}); assert.equal(data.engine,want); assert.equal(data.engineSelection.source,primary?'project.yaml':'docs/technical-preferences.md');
    assert.equal(await readFile(join(root,'project.yaml'),'utf8'),yaml); assert.deepEqual((await readdir(root)).sort(),['docs','project.yaml']);
  }
  for (const primary of ['Bogus','UE55','Unity',false]) {
    const root=await fixture('Godot','',{'docs/technical-preferences.md':'**Engine**: Godot 4.7.2\n'}); const yaml=`engine:\n  name: ${JSON.stringify(primary)}\n`; await writeFile(join(root,'project.yaml'),yaml);
    await assert.rejects(call(root,'godot',{}),/engine|Engine/); assert.deepEqual((await readdir(root)).sort(),['docs','project.yaml']);
  }
});
test('independent review: declared Web Node26 and npm pin are explicitly unresolved in needs and generated CI',async()=>{
  const root=await fixture('Web','',{'package.json':JSON.stringify({engines:{node:'>=26'},packageManager:'npm@11.6.0',scripts:{build:'webpack',test:'jest'},devDependencies:{webpack:'5.99.0',jest:'30.0.0'}}),'package-lock.json':'{"lockfileVersion":3}'});
  const {data}=await call(root,'web',{}); const ci=await readFile(join(root,'.github/workflows/tests.yml'),'utf8');
  assert.ok(data.needs.some(x=>x.id==='ci_runtime'&&x.message.includes('>=26'))); assert.ok(data.needs.some(x=>x.id==='ci_package_manager'&&x.message.includes('npm@11.6.0')));
  assert.match(ci,/>=26/); assert.match(ci,/npm@11\.6\.0/); assert.match(ci,/UNRESOLVED/);
  assert.equal(JSON.parse(await readFile(join(root,'package.json'))).engines.node,'>=26');
});
