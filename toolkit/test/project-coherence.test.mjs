import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, mkdir, writeFile, readFile, rm, symlink, chmod, readdir, realpath } from 'node:fs/promises';
import { join, dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { inspectProjectCoherence, formatProjectCoherence } from '../dist/project-coherence.js';
const sourceScript = resolve(import.meta.dirname, '../../.claude/scripts/project-coherence.sh');
async function fixture(t, engine = {}) {
 const root = await realpath(await mkdtemp(join(tmpdir(), 'coherence 游戏 '))); t.after(() => rm(root, { recursive: true, force: true }));
 const write = async (p,s) => { await mkdir(dirname(join(root,p)),{recursive:true}); await writeFile(join(root,p),s); };
 await write('project.yaml',JSON.stringify({engine:{name:'Godot',version:'4.7.2',language:'GDScript',code_root:'game',...engine}}));
 await write('docs/engine-reference/godot/VERSION.md','| **Engine Version** | Godot 4.7 |\n| **Installed at pin time** | 4.7.1.stable.official |\n');
 await write('game/main.gd','extends Node3D\n');
 return {root,write};
}
const row=(r,id)=>r.observations.find(x=>x.check===id);
test('static reference series and actual Godot renderer/backend observations never launch a process',async t=>{
 const {root,write}=await fixture(t,{rendering:'Forward+',physics:'Jolt'});
 await write('project.godot','config_version=5\n[rendering]\nrenderer/rendering_method="gl_compatibility"\n[physics]\n3d/physics_engine="Jolt Physics"\n');
 const before=await readFile(join(root,'project.yaml'));
 const r=await inspectProjectCoherence(root);
 assert.equal(r.qualityAssessed,false);assert.equal(r.exitCode,0);
 assert.equal(row(r,'reference-installed-record').state,'MATCH');assert.equal(row(r,'reference-series').state,'MATCH');
 assert.equal(row(r,'installed-series').state,'NOT_CHECKED');assert.equal(r.probes.length,0);
 assert.equal(row(r,'godot-renderer').state,'DIFFERS');assert.equal(row(r,'godot-physics').state,'MATCH');
 assert.deepEqual(await readFile(join(root,'project.yaml')),before);
});
test('missing installed row, unknown dates, missing project and unsupported engine comparisons stay explicit',async t=>{
 const {root,write}=await fixture(t);
 await write('docs/engine-reference/godot/VERSION.md','| **Engine Version** | Godot 4.6 |\n');
 let r=await inspectProjectCoherence(root);assert.equal(row(r,'reference-installed-record').state,'DIFFERS');assert.equal(row(r,'reference-series').state,'DIFFERS');
 assert.equal(row(r,'godot-renderer').state,'NOT_CHECKED');
 await write('docs/engine-reference/godot/VERSION.md','| **Engine Version** | Godot 4.7 |\n| **Installed at pin time** | NOT DETERMINED — offline |\n');
 r=await inspectProjectCoherence(root);assert.equal(row(r,'reference-installed-record').state,'NOT_CHECKED');
 await write('project.yaml','{}');r=await inspectProjectCoherence(root);assert.equal(row(r,'engine').state,'NOT_CHECKED');
});
test('custom code root, mixed scenes and unknown physics do not use source false-MATCH shortcuts',async t=>{
 const {root,write}=await fixture(t,{physics:'Jolt'});await write('project.godot','config_version=5\n');
 await write('game/main.gd','extends Node2D\n');let r=await inspectProjectCoherence(root);assert.equal(row(r,'godot-physics').state,'DIFFERS');
 await write('game/three.tscn','[node name="Root" type="Node3D"]\n');r=await inspectProjectCoherence(root);assert.equal(row(r,'godot-physics').state,'NOT_CHECKED');
 await write('game/main.gd','# extends Node2D\nvar sample = "Node2D"\nextends Node\n');await rm(join(root,'game/three.tscn'));
 r=await inspectProjectCoherence(root);assert.equal(row(r,'godot-physics').state,'NOT_CHECKED');assert.equal(r.shape.twoD.length,0);
});
test('export preset name and quoted res runner paths are checked independently of command execution',async t=>{
 const {root,write}=await fixture(t);
 await write('project.yaml',JSON.stringify({engine:{name:'Godot',version:'4.7.2'},commands:{build:{default:'godot --export-release "Web" out.zip'},test:'godot -s "res://addons/gdUnit4/bin/runner file.gd"'}}));
 await write('export_presets.cfg','[preset.0]\nname="Desktop"\n');
 let r=await inspectProjectCoherence(root);assert.equal(row(r,'export-preset').state,'DIFFERS');assert.equal(row(r,'test-runner').state,'DIFFERS');
 await write('export_presets.cfg','[preset.0]\nname="Web"\n');await write('addons/gdUnit4/bin/runner file.gd','extends Node\n');
 r=await inspectProjectCoherence(root);assert.equal(row(r,'export-preset').state,'MATCH');assert.equal(row(r,'test-runner').state,'MATCH');
 assert.match(formatProjectCoherence(r),/Observations only/);
});
test('Web reads actual bundler detection, does not turn range or missing bundler into installed pin',async t=>{
 const {root,write}=await fixture(t,{name:'Web',version:null});
 await write('package.json',JSON.stringify({scripts:{build:'webpack'},devDependencies:{webpack:'^5.99.9',vite:'6.0.1'}}));
 await write('docs/engine-reference/web/VERSION.md','| `vite` | 6.0.1 |\n| **Installed at pin time** | PER PROJECT |\n');
 let r=await inspectProjectCoherence(root);assert.equal(r.web.bundlers[0].name,'webpack');assert.equal(row(r,'installed-series').state,'NOT_CHECKED');
 await write('project.yaml','engine:\n  name: Web\n  version: "5.99.1"\n');await write('node_modules/webpack/package.json','{"version":"5.99.9"}');
 r=await inspectProjectCoherence(root);assert.equal(row(r,'installed-series').state,'MATCH');assert.equal(row(r,'reference-series').state,'NOT_CHECKED');
 await write('package.json','{}');r=await inspectProjectCoherence(root);assert.equal(row(r,'installed-series').state,'NOT_CHECKED');
});
async function fakeEditor(root, name, version, body = '') {
 const file=join(root,name);await writeFile(file,`#!/bin/sh\nprintf '%s\\n' "$@" >> '${join(root,'probe-argv.log').replaceAll("'","'\\''")}'\n${body || `printf '%s\\n' '${version}'`}\n`);await chmod(file,0o755);return file;
}
test('Godot probe is explicit, records exact argv, compares patch series, and retains real Bash observations', {skip:process.platform==='win32'}, async t=>{
 const {root,write}=await fixture(t,{physics:'Jolt',rendering:'Compatibility'});
 const binary=await fakeEditor(root,'Godot-fixture','4.7.9.stable.official');
 await write('project.yaml',`engine:\n  name: Godot\n  version: "4.7.2"\n  path: "${binary}"\n  code_root: game\n  physics: Jolt\n  rendering: Compatibility\n`);
 await write('project.godot','[rendering]\nrenderer/rendering_method="gl_compatibility"\n[physics]\n3d/physics_engine="Jolt Physics"\n');
 await inspectProjectCoherence(root);await assert.rejects(readFile(join(root,'probe-argv.log')),{code:'ENOENT'});
 const r=await inspectProjectCoherence(root,{probe:true});assert.equal(row(r,'installed-series').state,'MATCH');assert.deepEqual(r.probes[0].args,['--version']);assert.equal(await readFile(join(root,'probe-argv.log'),'utf8'),'--version\n');
 const old=spawnSync('bash',[sourceScript],{env:{...process.env,CLAUDE_PROJECT_DIR:root},encoding:'utf8'});
 assert.equal(old.status,0,old.stderr);assert.match(old.stdout,/\[MATCH\].*installed binary/);assert.match(old.stdout,/\[MATCH\].*engine.rendering/);assert.match(old.stdout,/Observations only/);
});
test('explicit different or stale targets do not probe another engine; wrapper never becomes editor', {skip:process.platform==='win32'}, async t=>{
 const {root,write}=await fixture(t);const one=await fakeEditor(root,'Godot-one','4.7.2.stable');const two=await fakeEditor(root,'Godot-two','4.6.9.stable');
 await write('project.yaml',JSON.stringify({engine:{name:'Godot',version:'4.7.2',path:one},commands:{test:`"${two}" --headless`}}));
 let r=await inspectProjectCoherence(root,{probe:true});assert.equal(r.probes.length,0);assert.match(row(r,'installed-series').reason,/different targets/);
 await write('project.yaml',JSON.stringify({engine:{name:'Godot',version:'4.7.2',path:join(root,'gone')},commands:{test:`"${two}" --headless`}}));
 r=await inspectProjectCoherence(root,{probe:true});assert.equal(r.probes.length,0);
 await write('project.yaml',JSON.stringify({engine:{name:'Godot',version:'4.7.2',path:one},commands:{test:'bash scripts/test.sh'}}));
 r=await inspectProjectCoherence(root,{probe:true});assert.equal(r.probes[0].executable,one);assert.equal(row(r,'test-runner').state,'DIFFERS');
});
test('Unity uses the real editor spelling and -version; 6000.N aliases 6.N; it never probes bare Unity CLI', {skip:process.platform==='win32'}, async t=>{
 const {root,write}=await fixture(t,{name:'Unity',version:'6000.3.23f1'});const editor=await fakeEditor(root,'Unity','6000.3.24f1');
 await write('project.yaml',JSON.stringify({engine:{name:'Unity',version:'6000.3.23f1',path:editor}}));
 await write('docs/engine-reference/unity/VERSION.md','| **Engine Version** | Unity 6.3 LTS |\n| **Installed at pin time** | 6000.3.23f1 |\n');
 const r=await inspectProjectCoherence(root,{probe:true});assert.equal(row(r,'reference-series').state,'MATCH');assert.equal(row(r,'installed-series').state,'MATCH');assert.deepEqual(r.probes[0].args,['-version']);
 await write('project.yaml','engine:\n  name: Unity\n  version: null\n');const absent=await inspectProjectCoherence(root,{probe:true});assert.equal(absent.probes.length,0);assert.match(row(absent,'installed-series').reason,/bare Unity/);
});
test('Unreal reads bounded Build.version without launching editor, handles engine root and explicit Cmd path', async t=>{
 const {root,write}=await fixture(t,{name:'Unreal',version:'5.8.1',path:'sdk'});
 await write('sdk/Engine/Build/Build.version','{"MajorVersion":5,"MinorVersion":8,"PatchVersion":3}');
 await write('sdk/Engine/Binaries/Linux/UnrealEditor-Cmd','this must never execute');
 let r=await inspectProjectCoherence(root,{probe:true});assert.equal(row(r,'installed-series').state,'MATCH');assert.equal(r.probes.length,0);assert.match(row(r,'installed-series').sources.at(-1),/Build.version/);
 await write('project.yaml',JSON.stringify({engine:{name:'Unreal',version:'5.8.1'},commands:{test:`"${join(root,'sdk/Engine/Binaries/Linux/UnrealEditor-Cmd')}" game.uproject -ExecCmds="Automation RunTests"`}}));
 // Engine flag=value quoting is literal and does not require shell evaluation.
 r=await inspectProjectCoherence(root);assert.equal(row(r,'installed-series').state,'MATCH');
 await write('project.yaml',JSON.stringify({engine:{name:'Unreal',version:'5.8.1'},commands:{test:`"${join(root,'sdk/Engine/Binaries/Linux/UnrealEditor-Cmd')}" game.uproject`}}));
 r=await inspectProjectCoherence(root);assert.equal(row(r,'installed-series').state,'MATCH');assert.equal(r.probes.length,0);
 await write('sdk/Engine/Build/Build.version','{"MajorVersion":"5","MinorVersion":8}');r=await inspectProjectCoherence(root);assert.equal(row(r,'installed-series').state,'NOT_CHECKED');
});
test('probe failures and timeouts remain observations, not successful series matches', {skip:process.platform==='win32'}, async t=>{
 const {root,write}=await fixture(t);const binary=await fakeEditor(root,'Godot-failed','',"echo '4.7.2.stable'; exit 9");
 await write('project.yaml',JSON.stringify({engine:{name:'Godot',version:'4.7.2',path:binary}}));
 let r=await inspectProjectCoherence(root,{probe:true});assert.equal(r.exitCode,0);assert.equal(r.probes[0].exitCode,9);assert.equal(row(r,'installed-series').state,'NOT_CHECKED');
 await fakeEditor(root,'Godot-failed','','sleep 5');r=await inspectProjectCoherence(root,{probe:true,timeoutMs:100});assert.equal(r.probes[0].exitCode,124);assert.equal(row(r,'installed-series').state,'NOT_CHECKED');
});
test('unsafe metadata, links, malformed YAML and size limits cannot masquerade as agreement',async t=>{
 const {root,write}=await fixture(t);await write('project.yaml','engine: [broken');await assert.rejects(inspectProjectCoherence(root),{code:'INVALID_CONFIG'});
 await write('project.yaml','x'.repeat(1024*1024+1));await assert.rejects(inspectProjectCoherence(root),{code:'INVALID_CONFIG'});
 await write('project.yaml',JSON.stringify({engine:{name:'Godot',version:'4.7.2',code_root:'../outside',physics:'Jolt'}}));let r=await inspectProjectCoherence(root);assert.equal(row(r,'godot-physics').state,'NOT_CHECKED');
 await write('private/VERSION.md','| **Engine Version** | Godot 4.7 |');await rm(join(root,'docs/engine-reference/godot'),{recursive:true});await symlink(join(root,'private'),join(root,'docs/engine-reference/godot'),process.platform==='win32'?'junction':'dir');
 r=await inspectProjectCoherence(root);assert.equal(row(r,'reference-series').state,'NOT_CHECKED');assert.match(row(r,'reference-series').reason,/Symbolic link/);
});
test('source hardcoded-src physics false-MATCH is retained as an intentional differential', {skip:process.platform==='win32'},async t=>{
 const {root,write}=await fixture(t);await write('project.yaml','engine:\n  name: Godot\n  version: "4.7.2"\n  code_root: game\n  physics: Jolt\n');await write('project.godot','config_version=5\n');await write('game/main.gd','extends Node2D\n');
 const old=spawnSync('bash',[sourceScript],{env:{...process.env,CLAUDE_PROJECT_DIR:root},encoding:'utf8'});assert.equal(old.status,0);assert.match(old.stdout,/\[MATCH\].*no 2D nodes found under src/);
 assert.equal(row(await inspectProjectCoherence(root),'godot-physics').state,'DIFFERS');
});
test('thin installed-layout wrapper produces JSON/text and honors usage and no-probe behavior',async t=>{
 const {root}=await fixture(t);const wrapper=resolve(import.meta.dirname,'../resources/studio/scripts/project-coherence.mjs');
 const run=args=>spawnSync(process.execPath,[wrapper,...args],{encoding:'utf8'});
 let r=run(['--project',root]);assert.equal(r.status,0,r.stdout+r.stderr);assert.equal(JSON.parse(r.stdout).qualityAssessed,false);assert.equal(JSON.parse(r.stdout).probes.length,0);
 r=run(['--project',root,'--text']);assert.equal(r.status,0);assert.match(r.stdout,/NOT CHECKED/);assert.match(r.stdout,/Observations only/);
 for(const args of [[],['--project',root,'--project',root],['--project',root,'--timeout','0'],['--bad'],['--project']])assert.equal(run(args).status,2);
 assert.equal(run(['--help']).status,0);
});
test('duplicate/empty reference rows and major.minor mismatch cannot claim agreement',async t=>{
 const {root,write}=await fixture(t);
 await write('docs/engine-reference/godot/VERSION.md','| **Engine Version** | Godot 4.7 |\n| **Engine Version** | Godot 4.6 |\n| **Installed at pin time** | |\n');
 let r=await inspectProjectCoherence(root);assert.equal(row(r,'reference-installed-record').state,'DIFFERS');assert.equal(row(r,'reference-series').state,'NOT_CHECKED');
 await write('project.yaml','engine:\n  name: Godot\n  version: 4.7.x\n');r=await inspectProjectCoherence(root);assert.equal(row(r,'reference-series').state,'NOT_CHECKED');
});
test('renderer and backend defaults are unknown; exact custom-root mixed backend remains observable',async t=>{
 const {root,write}=await fixture(t,{physics:'Jolt',rendering:'Forward+'});await write('game/two.gd','extends Node2D\n');await write('project.godot','[physics]\n3d/physics_engine="Jolt Physics"\n');
 let r=await inspectProjectCoherence(root);assert.equal(row(r,'godot-renderer').state,'NOT_CHECKED');assert.equal(row(r,'godot-physics').state,'MATCH');assert.equal(r.shape.twoD.length,1);assert.equal(r.shape.threeD.length,1);
 await write('project.godot','[physics]\n3d/physics_engine="GodotPhysics3D"\n');r=await inspectProjectCoherence(root);assert.equal(row(r,'godot-physics').state,'DIFFERS');
});
test('source links make shape incomplete and metadata is byte-preserved by repeated observations',async t=>{
 const {root,write}=await fixture(t,{physics:'Jolt'});await write('project.godot','[physics]\n3d/physics_engine="Jolt Physics"\n');await write('external/two.gd','extends Node2D\n');await symlink(join(root,'external'),join(root,'game/linked'),process.platform==='win32'?'junction':'dir');
 const before=await readFile(join(root,'project.yaml'));const names=await readdir(root);const r=await inspectProjectCoherence(root);assert.equal(r.shape.complete,false);assert.equal(row(r,'godot-physics').state,'NOT_CHECKED');assert.deepEqual(await readFile(join(root,'project.yaml')),before);assert.deepEqual(await readdir(root),names);
});
test('Web installed same/different series and exact declaration without install remain distinct',async t=>{
 const {root,write}=await fixture(t,{name:'Web',version:'6.0.1'});await write('package.json','{"devDependencies":{"vite":"6.0.1"},"scripts":{"build":"vite build"}}');await write('docs/engine-reference/web/VERSION.md','| `vite` | 6.0.1 |\n| **Installed at pin time** | PER PROJECT |\n');
 let r=await inspectProjectCoherence(root);assert.equal(row(r,'reference-series').state,'MATCH');assert.equal(row(r,'installed-series').state,'NOT_CHECKED');
 await write('node_modules/vite/package.json','{"version":"6.1.0"}');r=await inspectProjectCoherence(root);assert.equal(row(r,'installed-series').state,'DIFFERS');assert.equal(r.probes.length,0);
});
test('bare Unity selection is unresolved even when a same-named CLI exists on PATH', {skip:process.platform==='win32'}, async t=>{
 const {root,write}=await fixture(t,{name:'Unity',version:'6000.3.23f1'});await fakeEditor(root,'Unity','6000.3.23f1');
 const previous=process.env.PATH;process.env.PATH=root+':'+previous;
 try {
  for(const entry of [{engine:{name:'Unity',version:'6000.3.23f1',path:'Unity'}},{engine:{name:'Unity',version:'6000.3.23f1'},commands:{test:'Unity -runTests'}}]){
   await write('project.yaml',JSON.stringify(entry));const r=await inspectProjectCoherence(root,{probe:true});
   assert.equal(r.probes.length,0);assert.match(row(r,'installed-series').reason,/Bare Unity/);
  }
  await assert.rejects(readFile(join(root,'probe-argv.log')),{code:'ENOENT'});
 } finally {process.env.PATH=previous;}
});
test('Unreal explicit missing root does not fall through to another PATH engine; malformed association is explicit',async t=>{
 const {root,write}=await fixture(t,{name:'Unreal',version:'5.8.1',path:'gone-sdk'});
 let r=await inspectProjectCoherence(root,{probe:true});assert.equal(r.candidates.length,1);assert.equal(r.probes.length,0);assert.equal(row(r,'installed-series').state,'NOT_CHECKED');
 await write('project.yaml','engine:\n  name: Unreal\n  version: "5.8.1"\n');await write('Game.uproject','{bad');
 r=await inspectProjectCoherence(root);assert.match(row(r,'installed-series').reason,/valid JSON/);
 await write('Game.uproject','{"EngineAssociation":"{source-build-guid}"}');await write('Other.uproject','{}');
 r=await inspectProjectCoherence(root);assert.match(row(r,'installed-series').reason,/Multiple/);assert.equal(r.probes.length,0);
});
test('commented and fenced Markdown rows do not override real pins, and platform command provenance is retained',async t=>{
 const {root,write}=await fixture(t);await write('docs/engine-reference/godot/VERSION.md','<!--\r\n| **Engine Version** | Godot 1.0 |\r\n-->\r\n```\r\n| **Engine Version** | Godot 2.0 |\r\n```\r\n| **Engine Version** | Godot 4.7 |\r\n| **Installed at pin time** | NOT DETERMINED |\r\n');
 const platform=process.platform==='darwin'?'macos':process.platform==='win32'?'windows':'linux';
 await write('project.yaml',JSON.stringify({engine:{name:'Godot',version:'4.7.2'},commands:{test:{[platform]:'godot -s tests/runner.gd',default:'godot -s tests/wrong.gd'}}}));await write('tests/runner.gd','extends Node\n');
 const r=await inspectProjectCoherence(root);assert.equal(row(r,'reference-series').state,'MATCH');assert.equal(row(r,'test-runner').state,'MATCH');assert.match(row(r,'test-runner').sources[0],new RegExp(platform));
});
test('Unreal source permits missing patch metadata; malformed fields and linked metadata stay unresolved',async t=>{
 const {root,write}=await fixture(t,{name:'Unreal',version:'5.8.2',path:'sdk'});await write('sdk/Engine/Build/Build.version','{"MajorVersion":5,"MinorVersion":8}');
 let r=await inspectProjectCoherence(root);assert.equal(row(r,'installed-series').state,'MATCH');assert.equal(row(r,'installed-series').observed,'5.8');
 await write('sdk/Engine/Build/Build.version','{"MajorVersion":5,"MinorVersion":8,"PatchVersion":"2"}');r=await inspectProjectCoherence(root);assert.equal(row(r,'installed-series').state,'NOT_CHECKED');
 await write('other/Build.version','{"MajorVersion":5,"MinorVersion":8}');await rm(join(root,'sdk/Engine/Build'),{recursive:true});await symlink(join(root,'other'),join(root,'sdk/Engine/Build'),process.platform==='win32'?'junction':'dir');
 r=await inspectProjectCoherence(root,{probe:true});assert.equal(row(r,'installed-series').state,'NOT_CHECKED');assert.equal(r.probes.length,0);
});

test('uncertain declared versions and ambiguous/history reference descriptions cannot establish series agreement',async t=>{
 const {root,write}=await fixture(t);
 for(const [version,pin]of [['NOT DETERMINED (last checked 4.7)','Godot 4.7'],['4.7.2','Godot 4.7 or 4.8 (not selected)'],['4.7.2','NOT DETERMINED (previously Godot 4.7)'],['4.7.x','Godot 4.7']]){
  await write('project.yaml',JSON.stringify({engine:{name:'Godot',version}}));await write('docs/engine-reference/godot/VERSION.md',`| **Engine Version** | ${pin} |\n| **Installed at pin time** | NOT DETERMINED |\n`);const r=await inspectProjectCoherence(root);assert.equal(row(r,'reference-series').state,'NOT_CHECKED',JSON.stringify({version,pin}));assert.equal(r.probes.length,0);
 }
});
test('mixed-width/type code fences never contribute reference rows or fake pin records',async t=>{
 const {root,write}=await fixture(t);
 for(const [outer,inner]of [['````','```'],['~~~','```']]){
  await write('docs/engine-reference/godot/VERSION.md',`${outer}markdown\n${inner}\n| **Engine Version** | Godot 4.7 |\n| **Installed at pin time** | 4.7.2 |\n${inner}\n${outer}\n`);const r=await inspectProjectCoherence(root);assert.equal(row(r,'reference-series').state,'NOT_CHECKED');assert.equal(row(r,'reference-installed-record').state,'DIFFERS');
 }
});
test('malformed duplicate target INI settings remain unknown instead of being discarded into unique MATCH',async t=>{
 const {root,write}=await fixture(t,{rendering:'Compatibility',physics:'Jolt'});
 await write('project.godot','[rendering]\nrenderer/rendering_method="gl_compatibility"\nrenderer/rendering_method="unterminated\n[physics]\n3d/physics_engine="Jolt Physics"\n3d/physics_engine="unterminated\n');
 let r=await inspectProjectCoherence(root);assert.equal(row(r,'godot-renderer').state,'NOT_CHECKED');assert.equal(row(r,'godot-physics').state,'NOT_CHECKED');
 await write('project.yaml',JSON.stringify({engine:{name:'Godot',version:'4.7.2'},commands:{build:'godot --export-release Web out.zip'}}));await write('export_presets.cfg','[preset.0]\nname="Web"\nname="unterminated\n');r=await inspectProjectCoherence(root);assert.equal(row(r,'export-preset').state,'NOT_CHECKED');
});
test('blank declared commands never produce observations from engine-table default runners',async t=>{
 const {root,write}=await fixture(t);await write('project.yaml',JSON.stringify({engine:{name:'Godot',version:'4.7.2'},commands:{build:'\t',test:'   '}}));await write('project.godot','config_version=5\n');await write('addons/gdUnit4/bin/GdUnitCmdTool.gd','extends Node\n');const r=await inspectProjectCoherence(root);assert.equal(row(r,'test-runner').state,'NOT_CHECKED');assert.equal(row(r,'test-runner').declared,null);assert.equal(row(r,'test-runner').sources[0],'project.yaml:commands.test');
});

test('explicit literal metacharacter editor path is one version-only process, while historical output stays unknown', {skip:process.platform==='win32'},async t=>{
 const {root,write}=await fixture(t);const editor=await fakeEditor(root,'Godot literal ; touch SENTINEL','4.7.2.stable.official.fixture');await write('project.yaml',JSON.stringify({engine:{name:'Godot',version:'4.7.2',path:editor}}));
 const before=await readFile(join(root,'project.yaml'));let r=await inspectProjectCoherence(root);assert.equal(r.probes.length,0);await assert.rejects(readFile(join(root,'probe-argv.log')),{code:'ENOENT'});
 r=await inspectProjectCoherence(root,{probe:true});assert.equal(r.probes.length,1);assert.equal(r.probes[0].executable,editor);assert.deepEqual(r.probes[0].args,['--version']);assert.equal(r.probes[0].source,'project.yaml:engine.path');assert.equal(row(r,'installed-series').state,'MATCH');await assert.rejects(readFile(join(root,'SENTINEL')),{code:'ENOENT'});
 await fakeEditor(root,'Godot literal ; touch SENTINEL','4.7.2 (previously 4.6)');r=await inspectProjectCoherence(root,{probe:true});assert.equal(r.probes.length,1);assert.equal(row(r,'installed-series').state,'NOT_CHECKED');assert.deepEqual(await readFile(join(root,'project.yaml')),before);
});

test('full upstream Web VERSION table reads Vite Pinned cell, not Published/history/Node columns',async t=>{
 const full=await readFile(resolve(import.meta.dirname,'../../docs/engine-reference/web/VERSION.md'),'utf8');
 assert.match(full,/\| Package \| Pinned \| Published \| First release of this major \| Node \|/);
 const pin=full.match(/^\| `vite` \| ([^|]+)\|/m)?.[1].trim();assert.ok(pin);
 const {root,write}=await fixture(t,{name:'Web',version:pin});await write('docs/engine-reference/web/VERSION.md',full);await write('package.json',JSON.stringify({scripts:{build:'vite build'},devDependencies:{vite:pin}}));await write('node_modules/vite/package.json',JSON.stringify({name:'vite',version:pin}));
 let r=await inspectProjectCoherence(root);assert.equal(row(r,'reference-series').state,'MATCH');assert.equal(row(r,'reference-series').observed,pin);assert.equal(row(r,'installed-series').state,'MATCH');assert.equal(row(r,'reference-installed-record').state,'NOT_CHECKED');assert.equal(r.probes.length,0);
 await write('project.yaml',JSON.stringify({engine:{name:'Web',version:'6.1.0'}}));r=await inspectProjectCoherence(root);assert.equal(row(r,'reference-series').state,'DIFFERS');assert.equal(row(r,'reference-series').observed,pin);assert.equal(await readFile(join(root,'docs/engine-reference/web/VERSION.md'),'utf8'),full);
});

test('Web multicolumn history and unselected pin prose never become current reference version',async t=>{
 const {root,write}=await fixture(t,{name:'Web',version:'8.3.4'});await write('package.json','{"scripts":{"build":"vite build"},"devDependencies":{"vite":"8.3.4"}}');
 const header='| Package | Pinned | Published | First release of this major | Node |\n|---|---|---|---|---|\n';
 for(const text of ['## Pinned versions\n### History\n'+header+'| `vite` | 8.3.4 | 2026-10-08 | 8.0.0 | >=22 |\n','## History\n'+header+'| `vite` | 8.3.4 | 2026-10-08 | 8.0.0 | >=22 |\n','## Pinned versions\n| Package | Previous | Published | First release | Node |\n| `vite` | 8.3.4 | 2026-10-08 | 8.0.0 | >=22 |\n','## Pinned versions\n'+header+'| `vite` | previously 8.3.4; not selected | 2026-10-08 | 8.0.0 | >=22 |\n']){
  await write('docs/engine-reference/web/VERSION.md',text);const r=await inspectProjectCoherence(root);assert.equal(row(r,'reference-series').state,'NOT_CHECKED');
 }
});
