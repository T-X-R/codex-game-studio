// Offline harness tests only: no real npm, git, Codex, engine or network call.
import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,readFile,writeFile,cp,readdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
const source = process.env.QA_HOST_SOURCE ?? fileURLToPath(new URL('./qa-role-host.mjs',import.meta.url));
const sourceFixtureDir = fileURLToPath(new URL('./fixtures/',import.meta.url));
const roleSource = fileURLToPath(new URL('../../.codex/agents/',import.meta.url));
const evidence = process.env.QA_HOST_EVIDENCE_DIR ?? await mkdtemp(join(tmpdir(),'qa-host-offline-evidence-'));
await mkdir(evidence,{recursive:true});
const restoredConfig = '# Existing project settings\nmodel = "existing-host-model"\nmodel_reasoning_effort = "high"\napproval_policy = "on-request"\nsandbox_mode = "workspace-write"\n';
const execStub = `import {mkdirSync,writeFileSync,cpSync} from 'node:fs';
import {join} from 'node:path';
export function execFileSync(executable,args,options){
 if(executable!==process.execPath)throw new Error('Only the offline Node wrapper is permitted');
 const command=args[1];
 if(command==='pack')return JSON.stringify([{filename:'HARNESS-ONLY.tgz'}]);
 if(command==='install')return '{}';
 if(command==='init'){
  const root=args[2];mkdirSync(join(root,'.codex/agents'),{recursive:true});
  cpSync(process.env.HARNESS_ROLE_SOURCE,join(root,'.codex/agents'),{recursive:true});
  writeFileSync(join(root,'.codex/config.toml'),process.env.HARNESS_RESTORED_CONFIG);
  writeFileSync(join(root,'owner.txt'),'owner bytes\\r\\n');return '{}';
 }
 if(command==='restore')return '{}';
 throw new Error('Unexpected attempted process '+command);
}
`;
const processStub = `import {readFile,writeFile,mkdir,appendFile,symlink} from 'node:fs/promises';
import {join} from 'node:path';
export async function runProcess(executable,args,options={}){
 if(executable==='git'){if(args[0]!=='init')throw new Error('Only fake git init allowed');await mkdir(join(args.at(-1),'.git'));return {exitCode:0,stdout:'',stderr:'',signal:null};}
 if(executable!=='codex')throw new Error('Unexpected native executable '+executable);
 const workspace=options.cwd,profile=args.includes('--profile')?args[args.indexOf('--profile')+1]:null;
 const configuration=workspace?await readFile(join(workspace,'.codex/config.toml'),'utf8'):null;
 const profileText=profile?await readFile(join(process.env.CODEX_HOME,profile+'.config.toml'),'utf8'):null;
 await appendFile(process.env.HARNESS_CALL_LOG,JSON.stringify({kind:'OFFLINE_STUB',executable,args,configuration,profileText,
 env:{CODEX_HOME:process.env.CODEX_HOME,MODEL_SENTINEL:process.env.MODEL_SENTINEL,APPROVAL_SENTINEL:process.env.APPROVAL_SENTINEL}})+'\\n');
 if(args.includes('--version'))return {exitCode:0,stdout:'codex HARNESS-STUB-NOT-NATIVE',stderr:'',signal:null};
 if(args.includes('prompt-input'))return {exitCode:0,stdout:JSON.stringify({kind:'OFFLINE_STUB',configuration,observedPolicy:'stub fixture value, not an actual default'}),stderr:'preflight stub stderr retained',signal:null};
 if(args[0]!=='exec')throw new Error('Unexpected Codex stub operation');
 const variant=process.env.HARNESS_VARIANT, scenario=process.env.HARNESS_SCENARIO;
 const put=async(path,bytes)=>{await mkdir(join(workspace,path,'..'),{recursive:true});await writeFile(join(workspace,path),bytes);};
 if(scenario==='godot-specialist-signals-guide'&&variant!=='missing')await put('docs/architecture/signals-and-calls.md','HARNESS GENERATED PLACEHOLDER, NOT ROLE OUTPUT\\n');
 if(scenario==='audit'){await put('production/qa/audit.md','HARNESS QA PLACEHOLDER');await put('production/qa/bugs/BUG-0008.md','HARNESS BUG PLACEHOLDER');}
 if(variant==='extra')await put('production/qa/unauthorized.md','not authorized');
 if(variant==='changed')await put('owner.txt','changed');
 if(variant==='directory')await mkdir(join(workspace,'unauthorized-empty-directory'));
 if(variant==='link'){const outside=join(process.env.CODEX_HOME,'outside');await mkdir(outside);await writeFile(join(outside,'keep.txt'),'outside');await symlink(outside,join(workspace,'unauthorized-link'),process.platform==='win32'?'junction':'dir');}
 if(variant==='guide-link'){const {rm}=await import('node:fs/promises');await rm(join(workspace,'docs/architecture/signals-and-calls.md'));const outside=join(process.env.CODEX_HOME,'outside-guide');await mkdir(outside);await symlink(outside,join(workspace,'docs/architecture/signals-and-calls.md'),process.platform==='win32'?'junction':'dir');}
 await writeFile(args[args.indexOf('-o')+1],'HARNESS FINAL, NOT NATIVE EVIDENCE');
 const stdout=JSON.stringify({type:'thread.started',thread_id:'HARNESS-ONLY'})+'\\n'+JSON.stringify({type:'turn.completed'})+'\\n'+(variant==='truncated'?'{"incomplete":':variant==='scalar'?'null\\n':'');
 return {exitCode:0,stdout,stderr:'exec stub stderr retained',signal:null};
}
`;
async function runCase(scenario,variant='normal') {
 const root=await mkdtemp(join(tmpdir(),'qa host harness ')); const tool=join(root,'toolkit');
 await mkdir(join(tool,'test'),{recursive:true}); await mkdir(join(tool,'dist'));
 await cp(sourceFixtureDir,join(tool,'test/fixtures'),{recursive:true});
 await mkdir(join(tool,'node_modules')); await cp(fileURLToPath(new URL('../node_modules/yaml/',import.meta.url)),join(tool,'node_modules/yaml'),{recursive:true});
 await mkdir(join(root,'.codex/agents'),{recursive:true}); await cp(roleSource,join(root,'.codex/agents'),{recursive:true});
 const raw=await readFile(source,'utf8');
 const needle="import { execFileSync } from 'node:child_process';";
 assert.equal(raw.split(needle).length,2,'Expected exactly one packaging process import');
 await writeFile(join(tool,'test/qa-role-host.mjs'),raw.replace(needle,"import { execFileSync } from './offline-exec.mjs';"));
 await writeFile(join(tool,'test/offline-exec.mjs'),execStub); await writeFile(join(tool,'dist/process.js'),processStub);
 await writeFile(join(tool,'dist/runtime.js'),"export async function npmPath(){return '/OFFLINE-npm-stub';}\n");
 await writeFile(join(tool,'package.json'),'{"type":"module"}');
 const home=join(root,'isolated-codex-home');await mkdir(home);await writeFile(join(home,'config.toml'),'# owner global sentinel\n');
 const temp=join(root,'runs');await mkdir(temp);const callLog=join(root,'calls.jsonl');
 const env={...process.env,TMPDIR:temp,TMP:temp,TEMP:temp,CODEX_HOME:home,HARNESS_ROLE_SOURCE:join(root,'.codex/agents'),HARNESS_RESTORED_CONFIG:restoredConfig,HARNESS_CALL_LOG:callLog,HARNESS_SCENARIO:scenario,HARNESS_VARIANT:variant,MODEL_SENTINEL:'inherited-model',APPROVAL_SENTINEL:'inherited-approval'};
 const result=spawnSync(process.execPath,[join(tool,'test/qa-role-host.mjs'),scenario],{cwd:root,env,encoding:'utf8',timeout:30000});
 const directories=(await readdir(temp)).filter(x=>x.startsWith('game-studio-qa-role-'));
 const directory=directories.length===1?join(temp,directories[0]):null;
 const readJson=async name=>{try{return JSON.parse(await readFile(join(directory,name),'utf8'));}catch(error){if(error.code==='ENOENT'||!directory)return null;throw error;}};
 const calls=await readFile(callLog,'utf8').then(x=>x.trim().split('\n').filter(Boolean).map(x=>JSON.parse(x))).catch(e=>{if(e.code==='ENOENT')return [];throw e;});
 const observation={kind:'OFFLINE_HARNESS_ONLY',scenario,variant,root,directory,status:result.status,stdout:result.stdout,stderr:result.stderr,calls,report:await readJson('report.json'),fixture:await readJson('fixture.json'),after:await readJson('after.json'),preflight:await readJson('preflight-result.json')};
 await writeFile(join(evidence,scenario+'-'+variant+'.json'),JSON.stringify(observation,null,2)+'\n');
 assert.equal(await readFile(join(home,'config.toml'),'utf8'),'# owner global sentinel\n');
 assert.deepEqual((await readdir(home)).filter(x=>x.startsWith('game-studio-qa-')),[],'temporary profile cleaned');
 return observation;
}
const six=['godot-specialist-signals-guide','godot-specialist-foreign-concepts','godot-specialist-abstract-version-gap','godot-specialist-language-hot-path','godot-specialist-physics-46','godot-specialist-unity-mismatch'];
test('six inherited-policy fixtures use actual host path without model/effort/policy/features/capacity overrides (offline stub)',async()=>{
 for(const scenario of six){const r=await runCase(scenario);assert.equal(r.status,3,r.stderr);assert.equal(r.report.status,'not_assessed');assert.equal(r.report.sandbox,null);assert.equal(r.report.inheritHostSettings,true);
  const calls=r.calls.filter(x=>x.args[0]!=='--version');assert.equal(calls.length,2);
  for(const call of calls){for(const flag of ['--sandbox','--model','-m','--config','-c','--enable','--disable','--ask-for-approval','--dangerously-bypass-approvals-and-sandbox'])assert.ok(!call.args.includes(flag),flag);assert.equal(call.configuration,restoredConfig);assert.doesNotMatch(call.profileText,/model|sandbox|approval|hooks|features|max_concurrent/);assert.equal(call.env.MODEL_SENTINEL,'inherited-model');assert.equal(call.env.APPROVAL_SENTINEL,'inherited-approval');}
  assert.ok(r.after);assert.equal(r.preflight.stderr,'preflight stub stderr retained');assert.deepEqual(r.report.changed,[]);assert.deepEqual(r.report.outsideScope,[]);
 }
});
test('legacy readonly and write fixtures retain old sandbox/features/marker/capacity behavior (offline stub)',async()=>{
 for(const scenario of ['readonly','audit']) {const r=await runCase(scenario);assert.equal(r.status,3,r.stderr);const exec=r.calls.find(x=>x.args[0]==='exec');assert.equal(exec.args[exec.args.indexOf('--sandbox')+1],scenario==='readonly'?'read-only':'workspace-write');assert.ok(exec.args.includes('skills.include_instructions=false'));assert.ok(exec.args.includes('--disable'));assert.match(exec.configuration,/max_concurrent_threads_per_session = 1/);assert.match(exec.configuration,/QA_CONFIG_/);}
});
test('truncated JSON preserves actual raw events, preflight and terminal report with parseErrors (offline stub)',async()=>{
 for(const variant of ['truncated','scalar']) {const r=await runCase('godot-specialist-foreign-concepts',variant);assert.equal(r.status,3,r.stderr);assert.equal(r.report.threadId,'HARNESS-ONLY');assert.equal(r.report.parseErrors.length,1);assert.equal(r.report.parseErrors[0].line,3);assert.ok((await readFile(join(r.directory,'events.jsonl'),'utf8')).endsWith(variant==='truncated'?'{"incomplete":':'null\n'));}
});
test('read-only extra report, existing-file edit and unauthorized directory/link are retained failures (offline stub)',async()=>{
 for(const variant of ['extra','changed','directory','link']){const r=await runCase('godot-specialist-foreign-concepts',variant);assert.equal(r.status,1,r.stderr);assert.ok(r.report);assert.ok(r.after);assert.ok(variant==='changed'?r.report.changed.includes('owner.txt'):r.report.outsideScope.length>0);}
});
test('authorized guide still rejects missing artifact, other new files and a symlink at exact allowed name (offline stub)',async()=>{
 for(const variant of ['missing','extra','guide-link']){const r=await runCase('godot-specialist-signals-guide',variant);assert.equal(r.status,1,r.stderr);assert.ok(r.report);if(variant!=='missing')assert.ok(r.report.outsideScope.length>0);}
});
