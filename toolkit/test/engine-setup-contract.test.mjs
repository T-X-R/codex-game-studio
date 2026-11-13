import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, rm, readdir, realpath } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { test } from 'node:test';
import { parse } from 'yaml';
import { planEngineSetup } from '../dist/engine-setup.js';
import { applyInstall } from '../dist/install.js';
const engine = { name: 'Godot', version: '4.6.1', language: 'GDScript', code_root: 'src', test_root: 'tests' };
async function fixture(t, config = '{}\n', mirror) {
  const root = await realpath(await mkdtemp(join(tmpdir(), 'studio setup contract 测试 ')));
  t.after(() => rm(root, { recursive: true, force: true }));
  await writeFile(join(root, 'project.yaml'), config);
  if (mirror !== undefined) { await mkdir(join(root, 'docs')); await writeFile(join(root, 'docs/technical-preferences.md'), mirror); }
  return root;
}

test('setup records chosen platform, budgets and runner in one config/mirror transaction', async t => {
  const notes = '\r\n## Owner Notes\r\nKEEP: no speculative addon or cash platform decisions.\r\n';
  const root = await fixture(t, '# keep\nproject:\n  name: Lantern\ncommands:\n  run: actual-game\n', '# Technical Preferences\r\n'+notes);
  const input = { engine, platform: { targets: ['PC', 'Console'], primary_input: 'Gamepad', gamepad_support: 'Full', touch_support: 'None' }, performance: { target_framerate: 60, frame_budget_ms: 16.6, draw_call_limit: 1200, memory_ceiling_mb: 512 }, testing: { framework: 'gdUnit4' }, qa: { coverage_minimum: 80 } };
  const { plan, execution } = await planEngineSetup(root, JSON.stringify(input));
  assert.equal(execution.state, 'not_assessed');
  assert.deepEqual(plan.changes.map(c => c.path), ['project.yaml', 'docs/technical-preferences.md']);
  assert.equal((await readFile(join(root, 'project.yaml'), 'utf8')).includes('platform:'), false);
  await applyInstall(plan);
  const actual = parse(await readFile(join(root, 'project.yaml'), 'utf8'));
  for (const block of ['platform','performance','testing','qa']) assert.deepEqual(actual[block], input[block]);
  assert.equal(actual.commands.run, 'actual-game'); assert.equal(actual.project.name, 'Lantern');
  const mirror = await readFile(join(root, 'docs/technical-preferences.md'), 'utf8');
  for (const [label,value] of [['Target Platforms','PC, Console'],['Primary Input','Gamepad'],['Gamepad Support','Full'],['Touch Support','None'],['Target Framerate','60'],['Frame Budget','16.6'],['Draw Calls','1200'],['Memory Ceiling','512'],['Framework','gdUnit4'],['Minimum Coverage','80']]) assert.ok(mirror.includes(`**${label}**: ${value}`), label);
  assert.match(mirror, /\*\*Input Methods\*\*: .*keyboard\/mouse.*gamepad/i);
  assert.ok(mirror.includes(notes)); assert.equal(mirror.replaceAll('\r\n','').includes('\n'),false);
  assert.equal((await planEngineSetup(root, JSON.stringify(input))).plan.changes.length, 0);
});

test('explicit deferred choices remain null placeholders without inventing budgets, input or tests', async t => {
  const root = await fixture(t);
  const input = {engine,platform:{targets:['Web'],primary_input:null,gamepad_support:'Partial',touch_support:'Partial'},performance:{target_framerate:null,frame_budget_ms:null,draw_call_limit:null,memory_ceiling_mb:null},testing:{framework:null}};
  await applyInstall((await planEngineSetup(root, JSON.stringify(input))).plan);
  const actual=parse(await readFile(join(root,'project.yaml'),'utf8'));assert.deepEqual(actual.performance,input.performance);assert.equal(actual.platform.primary_input,null);assert.equal(actual.testing.framework,null);
  const mirror=await readFile(join(root,'docs/technical-preferences.md'),'utf8');for(const label of ['Primary Input','Target Framerate','Frame Budget','Draw Calls','Memory Ceiling','Framework'])assert.ok(mirror.includes(`**${label}**: [TO BE CONFIGURED]`),label);
});

for (const [name,version,language,code,testRoot] of [['Godot','4.6.1','GDScript','src','tests'],['Unity','6000.0.1f1','C#','Assets','Assets/Tests'],['Web',null,'JavaScript','src','tests']]) {
  test(`${name} omission uses source engine-table roots without materializing overrides or game directories`,async t=>{
    const root=await fixture(t);const {plan,layout}=await planEngineSetup(root,JSON.stringify({engine:{name,version,language}}));
    assert.equal(layout.code_root.value,code);assert.equal(layout.test_root.value,testRoot);assert.equal(layout.code_root.state,'missing');assert.equal(layout.test_root.state,'missing');
    const config=parse(plan.changes.find(c=>c.path==='project.yaml').after);assert.equal(Object.hasOwn(config.engine,'code_root'),false);assert.equal(Object.hasOwn(config.engine,'test_root'),false);assert.deepEqual(await readdir(root),['project.yaml']);
  });
}

test('omitted Unreal module stays unresolved without guessing or writing a placeholder path',async t=>{
 const root=await fixture(t);const {plan,layout,warnings}=await planEngineSetup(root,JSON.stringify({engine:{name:'Unreal',version:'5.7',language:'C++'}}));
 assert.equal(layout.code_root.value,'Source');assert.equal(layout.test_root.state,'not_assessed');assert.match(layout.test_root.reason,/module|explicit project directory/i);assert.ok(warnings.some(w=>/test_root|module/i.test(w)));const config=parse(plan.changes.find(c=>c.path==='project.yaml').after);assert.equal(Object.hasOwn(config.engine,'test_root'),false);assert.deepEqual(await readdir(root),['project.yaml']);
});

test('new setup fields reject unknown shapes or invalid values before either file changes',async t=>{
 const root=await fixture(t);for(const extra of [{platform:{targets:'PC'}},{platform:{targets:[1]}},{platform:{targets:['']}},{platform:{primary_input:{mode:'Gamepad'}}},{platform:{gamepad_support:'Always'}},{platform:{typo:'PC'}},{performance:{target_framerate:-1}},{performance:{frame_budget_ms:-1}},{performance:{draw_call_limit:[]}},{performance:{memory_ceiling_mb:true}},{testing:{framework:['gdUnit4']}},{testing:{typo:'gdUnit4'}}])await assert.rejects(planEngineSetup(root,JSON.stringify({engine,...extra})),{code:'INVALID_ARGUMENT'});
 assert.equal(await readFile(join(root,'project.yaml'),'utf8'),'{}\n');assert.deepEqual(await readdir(root),['project.yaml']);
});

const both = 'GDScript (gameplay/UI scripting), C# (performance-critical systems), C++ via GDExtension (native only)';
const rich = '\uFEFF# Technical Preferences\r\n\r\n## Engine & Language\r\n- **Engine**: Godot 4.6\r\n- **Language**: '+both+'\r\n\r\n## Naming Conventions\r\n### GDScript (.gd)\r\n- **Variables**: snake_case\r\n### C# (.cs)\r\n- **Variables**: _camelCase\r\n\r\n## Engine Specialists\r\n### File Extension Routing\r\n| .gd | GDScript role |\r\n| .cs, .csproj | C# role |\r\n| Cross-language | Primary Godot role |\r\n\r\n## Owner Notes\r\nBoth dates remain undecided.\r\n- **Language**: literal example\r\n- **Variables**: preserve-owner-value\r\n\r\n';
const configured = JSON.stringify({ engine });

test('approved Both, per-file naming/routing and owner notes survive shared-field sync byte-for-byte',async t=>{
 const root=await fixture(t,configured,rich);const input=JSON.stringify({engine,naming:{variables:'snake_case'},testing:{framework:'gdUnit4'}});
 const {plan}=await planEngineSetup(root,input);await applyInstall(plan);const after=await readFile(join(root,'docs/technical-preferences.md'),'utf8');
 assert.ok(after.startsWith('\uFEFF'));assert.ok(after.includes(`**Language**: ${both}`));
 for(const marker of ['### GDScript','### File Extension Routing','## Owner Notes']){const start=rich.indexOf(marker),end=rich.indexOf('\r\n## ',start+1);assert.ok(after.includes(rich.slice(start,end<0?undefined:end)),marker);}
 assert.ok(after.includes('## Naming Conventions\r\n\r\n- **Variables**: snake_case\r\n\r\n### GDScript'));
 assert.equal(after.replaceAll('\r\n','').includes('\n'),false);assert.equal((await planEngineSetup(root,input)).plan.changes.length,0);
});

test('language or engine changes conflict with approved Both or actual per-file contexts, including dry planning',async t=>{
 for(const doc of [rich,rich.replace(`- **Language**: ${both}\r\n`,'')])for(const change of [{...engine,language:'C#'},{...engine,name:'Unity',version:'6000.0.1f1',language:'C#'}]){
  const root=await fixture(t,configured,doc);await assert.rejects(planEngineSetup(root,JSON.stringify({engine:change})),{code:'FILE_CONFLICT'});assert.equal(await readFile(join(root,'project.yaml'),'utf8'),configured);assert.equal(await readFile(join(root,'docs/technical-preferences.md'),'utf8'),doc);
 }
});

test('prose Both and unused specialists never invent a Both choice; literal fenced/comment labels stay untouched',async t=>{
 const literal='```md\n- **Language**: Both\n- **Engine**: example\n```\n<!--\n- **Language**: Both\n-->\n<!--\n- **Language**: Both --> visible tail\n    - **Language**: indented code\n';
 const doc='# Preferences\nBoth options remain possible.\n## Engine & Language\n- **Language**: GDScript\n'+literal+'\n## Owner Notes\n- **Language**: Both\n';
 const root=await fixture(t,configured,doc);const {plan}=await planEngineSetup(root,JSON.stringify({engine:{...engine,language:'C#'},specialists:{additional:['godot-gdscript-specialist','godot-csharp-specialist']}}));await applyInstall(plan);const after=await readFile(join(root,'docs/technical-preferences.md'),'utf8');assert.ok(after.includes(literal));assert.ok(after.includes('## Owner Notes\n- **Language**: Both\n'));assert.match(after,/## Engine & Language\n- \*\*Language\*\*: C#/);
});

test('duplicate actual sections/labels conflict but nested and owner labels are not duplicates',async t=>{
 for(const doc of ['## Engine & Language\n- **Language**: GDScript\n- **Language**: C#\n','## Engine & Language\n## 1. **Engine & Language**\n']){const root=await fixture(t,configured,doc);await assert.rejects(planEngineSetup(root,JSON.stringify({engine})),{code:'FILE_CONFLICT'});}
});

test('new Both must be established explicitly by workflow, unchanged C# annotation is preserved',async t=>{
 const root=await fixture(t);await applyInstall((await planEngineSetup(root,JSON.stringify({engine,specialists:{additional:['godot-csharp-specialist']}}))).plan);assert.match(await readFile(join(root,'docs/technical-preferences.md'),'utf8'),/\*\*Language\*\*: GDScript\n/);
 const csharp={...engine,language:'C#'};const doc='# Preferences\n## Engine & Language\n- **Language**: C# (.NET 8+, primary), C++ via GDExtension (native plugins only)';const second=await fixture(t,JSON.stringify({engine:csharp}),doc);const {plan}=await planEngineSetup(second,JSON.stringify({engine:csharp}));assert.ok(plan.changes.find(c=>c.path==='docs/technical-preferences.md').after.includes(doc));
});

test('coverage supports explicit null and bounds; supplied roots stay validated and omitted overrides stay intact',async t=>{
 const root=await fixture(t,JSON.stringify({engine:{...engine,code_root:'game',test_root:'checks'}}));for(const value of [-1,101,1.2,'80',{},[]])await assert.rejects(planEngineSetup(root,JSON.stringify({engine,qa:{coverage_minimum:value}})),{code:'INVALID_ARGUMENT'});
 const {code_root,test_root,...withoutRoots}=engine;const plan=await planEngineSetup(root,JSON.stringify({engine:withoutRoots,qa:{coverage_minimum:null}}));assert.equal(plan.layout.code_root.value,'game');assert.equal(plan.layout.test_root.value,'checks');await applyInstall(plan.plan);assert.equal(parse(await readFile(join(root,'project.yaml'),'utf8')).qa.coverage_minimum,null);
 for(const bad of ['../outside','/tmp/absolute','.agents','Source/<Module>/Private/Tests'])await assert.rejects(planEngineSetup(root,JSON.stringify({engine:{...engine,test_root:bad}})),e=>['INVALID_ARGUMENT','UNSAFE_PATH'].includes(e.code));
});

test('field updates preserve inline and spanning HTML comments without exposing hidden labels',async t=>{
 for(const comment of [' <!-- owner note -->',' <!-- owner note\r\n- **Engine**: hidden example\r\n-->']){
  const doc='# Preferences\r\n## Engine & Language\r\n- **Language**: GDScript'+comment+'\r\n';const root=await fixture(t,configured,doc);const input=JSON.stringify({engine:{...engine,language:'C#'}});
  await applyInstall((await planEngineSetup(root,input)).plan);const after=await readFile(join(root,'docs/technical-preferences.md'),'utf8');assert.ok(after.includes('- **Language**: C#'+comment+'\r\n'));assert.equal((await planEngineSetup(root,input)).plan.changes.length,0);
 }
});

test('plus-form Both stays explicit and conflicts with a primary-language change',async t=>{
 for(const choice of ['GDScript + C#','GDScript + C# (approved)']){
  const doc='# Preferences\n## Engine & Language\n- **Language**: '+choice+'\n';const root=await fixture(t,configured,doc);await applyInstall((await planEngineSetup(root,JSON.stringify({engine}))).plan);assert.ok((await readFile(join(root,'docs/technical-preferences.md'),'utf8')).includes('**Language**: '+choice+'\n'));
  await assert.rejects(planEngineSetup(root,JSON.stringify({engine:{...engine,language:'C#'}})),{code:'FILE_CONFLICT'});
 }
});

test('engine transition conflicts with populated Unreal routing but preserves unconfigured templates and unrelated examples',async t=>{
 const old=JSON.stringify({engine:{...engine,name:'Unreal',version:'5.7',language:'C++'}});const route='### File Extension Routing\n| Extension | Specialist |\n| --- | --- |\n| .cpp, .h | unreal-specialist |\n| .uasset | ue-blueprint-specialist |\n';
 const root=await fixture(t,old,'# Preferences\n## Engine Specialists\n'+route);await assert.rejects(planEngineSetup(root,JSON.stringify({engine})),{code:'FILE_CONFLICT'});assert.equal(await readFile(join(root,'project.yaml'),'utf8'),old);
 for(const body of ['### File Extension Routing\n[TO BE CONFIGURED]\n','### File Extension Routing\n| .cpp | [TO BE CONFIGURED] |\n| .uasset | - |\n','### File Extension Routing\n| Extension | Specialist |\n| --- | --- |\n','### File Extension Routing\n```md\n| .cpp | unreal-specialist |\n```\n','### File Extension Routing\n<!--\n| .cpp | unreal-specialist |\n-->\n']){const root=await fixture(t,old,'# Preferences\n## Engine Specialists\n'+body+'\n## Owner Notes\n'+route);await applyInstall((await planEngineSetup(root,JSON.stringify({engine}))).plan);assert.ok((await readFile(join(root,'docs/technical-preferences.md'),'utf8')).includes('## Owner Notes\n'+route));}
});


test('interleaved visible value text after a comment is a conflict, not silently discarded',async t=>{
 const doc='# Preferences\n## Engine & Language\n- **Language**: GDScript <!-- owner --> plus explicit context\n';const root=await fixture(t,configured,doc);await assert.rejects(planEngineSetup(root,JSON.stringify({engine})),{code:'FILE_CONFLICT'});assert.equal(await readFile(join(root,'docs/technical-preferences.md'),'utf8'),doc);
});
