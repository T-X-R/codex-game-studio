import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, readdir, writeFile, rm, realpath, symlink, cp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { planEngineReferences } from '../dist/engine-references.js';
import { applyInstall, planDetach } from '../dist/install.js';
const wrapper = new URL('../resources/studio/scripts/engine-references.mjs', import.meta.url);
async function fixture(t, engine = 'Godot', version = '4.7', files = {}) {
  const root = await realpath(await mkdtemp(join(tmpdir(), 'studio references ')));
  t.after(() => rm(root, { recursive: true, force: true }));
  for (const [path, content] of Object.entries({ 'project.yaml': JSON.stringify({engine:{name:engine,version}}), ...files })) {
    await mkdir(join(root,path,'..'), {recursive:true}); await writeFile(join(root,path),content);
  }
  return root;
}
for (const [engine,version,count] of [['Godot','4.7',12],['Unity','6000.3.26f1',16],['Unreal','5.8',17],['Web','8.0.3',7]]) {
  test(`${engine} plans and copies complete project-owned historical resources`, async t => {
    const root=await fixture(t,engine,version); const original=await readFile(join(root,'project.yaml'),'utf8');
    const result=await planEngineReferences(root);
    assert.equal(result.outcome.state,'planned'); assert.equal(result.files.filter(x=>x.state==='create').length,count+1);
    assert.equal(result.qualityAssessed,false); assert.equal(result.installedVersionAssessed,false);
    assert.deepEqual(await readdir(root),['project.yaml']);
    await applyInstall(result.plan);
    assert.equal(await readFile(join(root,'project.yaml'),'utf8'),original);
    for(const change of result.plan.changes) assert.equal(await readFile(join(root,change.path),'utf8'),change.after);
    assert.equal((await planEngineReferences(root)).outcome.state,'already_present');
    assert.equal((await planEngineReferences(root)).plan.changes.length,0);
    assert.equal((await planDetach(root)).changes.length,0);
    if(engine==='Web') { assert.ok(result.warnings.some(x=>x.includes('Vite'))); assert.equal(result.reference.templatePin,'8.3.4'); }
    else assert.equal(result.reference.seriesRelation,'same_series');
  });
}
test('different and unknown pins remain explicit observations without config changes',async t=>{
 for(const version of ['4.1','^4.7',null, {unknown:true}]) {
  const root=await fixture(t,'Godot',version); const result=await planEngineReferences(root);
  assert.deepEqual(result.projectPin,version); assert.equal(result.reference.templatePin,'Godot 4.7');
  assert.equal(result.reference.seriesRelation,version==='4.1'?'different_series':'unknown'); assert.ok(result.warnings.length);
 }
});
test('existing partial and empty directories are preserved, never mixed with snapshot',async t=>{
 const root=await fixture(t,'Godot','4.7',{'docs/engine-reference/godot/VERSION.md':'| **Engine Version** | Godot 4.8 |\n'});
 const result=await planEngineReferences(root); assert.equal(result.outcome.state,'preserved'); assert.equal(result.plan.changes.length,0);
 assert.equal(result.reference.projectReferencePin,'Godot 4.8'); assert.ok(result.files.some(x=>x.state==='missing'));
 const empty=await fixture(t); await mkdir(join(empty,'docs/engine-reference/godot'),{recursive:true});
 assert.equal((await planEngineReferences(empty)).outcome.state,'preserved'); assert.deepEqual(await readdir(join(empty,'docs/engine-reference/godot')),[]);
});
test('custom README and other engines coexist unchanged',async t=>{
 const root=await fixture(t,'Godot','4.7',{'docs/engine-reference/README.md':'my guide\r\n','docs/engine-reference/unity/custom.md':'my unity'});
 const result=await planEngineReferences(root); await applyInstall(result.plan);
 assert.equal(await readFile(join(root,'docs/engine-reference/README.md'),'utf8'),'my guide\r\n');
 assert.equal(await readFile(join(root,'docs/engine-reference/unity/custom.md'),'utf8'),'my unity');
});
for(const changed of ['project.yaml','docs/engine-reference/README.md','docs/engine-reference/godot/VERSION.md']) {
 test(`late conflict at ${changed} prevents every planned write`,async t=>{
  const root=await fixture(t,'Godot','4.7',{'docs/engine-reference/README.md':'existing'}); const result=await planEngineReferences(root);
  await mkdir(join(root,changed,'..'),{recursive:true}); await writeFile(join(root,changed),'concurrent');
  await assert.rejects(applyInstall(result.plan),{code:'FILE_CONFLICT'});
  await assert.rejects(readFile(join(root,'docs/engine-reference/godot/deprecated-apis.md')),{code:'ENOENT'});
 });
}
test('unsafe links and non-directory selected path fail before changes',async t=>{
 const root=await fixture(t); await mkdir(join(root,'docs/engine-reference'),{recursive:true});
 await writeFile(join(root,'docs/engine-reference/godot'),'wrong type');
 await assert.rejects(planEngineReferences(root),{code:'FILE_CONFLICT'});
 const linked=await fixture(t); await mkdir(join(linked,'docs/engine-reference'),{recursive:true});
 await symlink(root,join(linked,'docs/engine-reference/godot'),process.platform === 'win32' ? 'junction' : 'dir');
 await assert.rejects(planEngineReferences(linked),{code:'UNSAFE_PATH'});
});
test('missing or unsupported engine is never defaulted',async t=>{
 for(const engine of [null,'Other']) await assert.rejects(planEngineReferences(await fixture(t,engine)),{code:'INVALID_CONFIG'});
 const root=await fixture(t,'Godot','4.7',{'project.yaml':'engine: [broken'}); await assert.rejects(planEngineReferences(root),{code:'INVALID_CONFIG'});
});
test('actual installed script dry run is side-effect free and rejects duplicate flags',async t=>{
 const root=await fixture(t); const run=args=>spawnSync(process.execPath,[fileURLToPath(wrapper),...args],{encoding:'utf8'});
 const dry=run(['--project',root,'--dry-run']); assert.equal(dry.status,0,dry.stderr); const data=JSON.parse(dry.stdout);
 assert.equal(data.dryRun,true); assert.equal(data.applied,false); assert.equal(data.outcome.state,'planned');
 assert.deepEqual(await readdir(root),['project.yaml']);
 assert.equal(run(['--project',root,'--project',root]).status,2);
 const applied=run(['--project',root]); assert.equal(applied.status,0,applied.stderr); assert.equal(JSON.parse(applied.stdout).outcome.state,'created');
 assert.equal(JSON.parse(run(['--project',root]).stdout).outcome.state,'already_present');
});

test('reference rows exclude fenced/commented/history material and retain uncertain literal observations',async t=>{
 for(const version of ['Godot 4.7 or 4.8','NOT DETERMINED (last checked 4.7)','>=4.7','4.7.x']) {
  const root=await fixture(t,'Godot',version); assert.equal((await planEngineReferences(root)).reference.seriesRelation,'unknown');
 }
 const root=await fixture(t,'Godot','4.7',{'docs/engine-reference/godot/VERSION.md':'# Reference\n<!--\n| **Engine Version** | Godot 9.9 |\n-->\n```\n| **Engine Version** | Godot 8.8 |\n```\n| **Engine Version** | Godot 4.7 |\n## History\n| **Engine Version** | Godot 3.0 |\n'});
 assert.equal((await planEngineReferences(root)).reference.projectReferencePin,'Godot 4.7');
 const duplicate=await fixture(t,'Godot','4.7',{'docs/engine-reference/godot/VERSION.md':'| **Engine Version** | Godot 4.7 |\n| **Engine Version** | Godot 4.8 |\n'});
 assert.equal((await planEngineReferences(duplicate)).reference.projectReferencePin,null);
});

test('missing required bundled VERSION rejects the whole initial copy',async t=>{
 const parent=await fixture(t); const runtime=join(parent,'runtime package with spaces'); await mkdir(runtime,{recursive:true});
 await cp(fileURLToPath(new URL('../dist/',import.meta.url)),join(runtime,'dist'),{recursive:true});
 await cp(fileURLToPath(new URL('../package.json',import.meta.url)),join(runtime,'package.json'));
 await symlink(await realpath(fileURLToPath(new URL('../node_modules/',import.meta.url))),join(runtime,'node_modules'),process.platform==='win32'?'junction':'dir');
 const resources=join(runtime,'resources/studio'); await mkdir(join(resources,'scripts'),{recursive:true});
 await cp(fileURLToPath(wrapper),join(resources,'scripts/engine-references.mjs'));
 await cp(fileURLToPath(new URL('../resources/studio/engine-reference/',import.meta.url)),join(resources,'engine-reference'),{recursive:true});
 await rm(join(resources,'engine-reference/godot/VERSION.md'));
 const root=await fixture(t); const before=await readFile(join(root,'project.yaml'),'utf8');
 const run=spawnSync(process.execPath,[join(resources,'scripts/engine-references.mjs'),'--project',root],{encoding:'utf8'});
 assert.equal(run.status,3,run.stdout+run.stderr); assert.equal(JSON.parse(run.stdout).error.code,'RESOURCE_MISSING');
 assert.deepEqual(await readdir(root),['project.yaml']); assert.equal(await readFile(join(root,'project.yaml'),'utf8'),before);
});
test('Web pin belongs to the current contiguous five-column table, never a later history table',async t=>{
 const header='| Package | Pinned | Published | First release of this major | Node |\n| --- | --- | --- | --- | --- |\n';
 const body='| `typescript` | 7.0.2 | 2026-07-08 | 7.0.2 | `>=16.20` |\n';
 const history='\nHistorical example:\n| Package | Pinned |\n| --- | --- |\n| `vite` | 5.4.0 |\n';
 const root=await fixture(t,'Web','8.3.4',{'docs/engine-reference/web/VERSION.md':'# Web\n## Pinned versions\n'+header+body+history});
 assert.equal((await planEngineReferences(root)).reference.projectReferencePin,null);
 const duplicate=await fixture(t,'Web','8.3.4',{'docs/engine-reference/web/VERSION.md':'# Web\n## Pinned versions\n'+header+'| `vite` | 8.3.4 | 2026-10-08 | 8.0.0 | `^20.19 \\|\\| >=22.12` |\n| `vite` | 8.0.1 | 2026-03-15 | 8.0.0 | node |\n'});
 assert.equal((await planEngineReferences(duplicate)).reference.projectReferencePin,null);
});
