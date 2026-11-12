import { mkdtemp, mkdir, writeFile, readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { registryCommand } from '../dist/registry.js';
const root=await mkdtemp(join(tmpdir(),'game-studio-registry-parity-'));
const write=async(path,text)=>{await mkdir(dirname(join(root,path)),{recursive:true});await writeFile(join(root,path),text);};
const source=fileURLToPath(new URL('../../.claude/scripts/registry.sh', import.meta.url));
const cases=[];
const compare=async(args)=>{
 const original=spawnSync('bash',[source,'--root',root,...args],{cwd:root,encoding:'utf8'});
 const current=await registryCommand(root,args,root);
 assert.equal(current.exitCode,original.status,JSON.stringify(args)+original.stderr);
 const rows=original.stdout.trim().split('\n').map(l=>l.split('\t'));
 if(['list','get','slice'].includes(args[0])){
  const entries=rows.filter(r=>r[0]==='ENTRY').map(r=>r.slice(1,8));
  const now=current.data.entries.map(e=>[e.registry,e.section,e.key,e.name,String(e.fields.status??'-'),String(e.fields[{entities:'source',tr:'gdd',architecture:'adr'}[e.registry]]??'-'),String(e.line)]);
  assert.deepEqual(now,entries,args.join(' '));
 }
 if(args[0]==='refs')assert.deepEqual(current.data.references.map(r=>[r.registry,r.name,r.how,r.path,String(r.line)]),rows.filter(r=>r[0]==='REF').map(r=>r.slice(1)),args.join(' '));
 if(['validate','compare'].includes(args[0])){
  const codes=['DUPLICATE','TR_UNKNOWN','PATH_MISSING','STATUS','LAYOUT','UNQUOTED','REMOVED'];
  for(const code of codes)assert.equal(current.data.diagnostics.filter(d=>d.code===code).length,rows.filter(r=>r[0]===code).length,args.join(' ')+' '+code);
  if(args[0]==='compare'){const removed=rows.find(r=>r[0]==='removed')[1];assert.equal(current.data.removed,removed==='-'?null:Number(removed));}
 }
 if(args[0]==='next-id'&&current.exitCode===0){const row=rows.find(r=>r[0]==='next');assert.deepEqual([current.data.next.kind,current.data.next.scope??'-',current.data.next.id,current.data.next.highest??'-',String(current.data.next.distinctIdsSeen)],row.slice(1));}
 cases.push({command:args,sourceExitCode:original.status,portableExitCode:current.exitCode,status:'PASS',sourceOutputSha256:createHash('sha256').update(original.stdout).digest('hex'),portableOutputSha256:createHash('sha256').update(JSON.stringify(current)).digest('hex')});
};
await write('design/registry/entities.yaml','entities:\n  - name: health\n    source: design/gdd/health.md\n    status: active\n    referenced_by:\n      - design/gdd/combat.md\nitems: []\n');
await write('docs/architecture/tr-registry.yaml','requirements:\n- id: TR-combat-001\n  status: deprecated\n  gdd: design/gdd/combat.md\n- id: TR-combat-009\n  status: "superseded-by: TR-combat-010"\n  gdd: design/gdd/combat.md\n- id: TR-combat-ai-099\n  status: active\n');
await write('docs/registry/architecture.yaml','state_ownership:\n  - state: round\n    status: superseded_by: ADR-0012\n    adr: docs/architecture/adr-0001-round.md\ninterfaces: []\n');
await write('design/gdd/health.md','# Health\n');await write('design/gdd/combat.md','# Combat\n');await write('docs/architecture/adr-0001-round.md','# ADR\n');
await write('production/epics/combat/story-001.md','TR-combat-001 TR-unknown-001\nXTR-unknown-002 TR-unknown-003x\n');
for(const args of [['list'],['list','entities'],['list','--system','combat'],['get','health','round'],['refs','health'],['refs','TR-combat-001'],['refs','design/gdd/combat.md'],['slice','design/gdd/combat.md'],['validate'],['next-id','tr','combat'],['next-id','tr','unused']])await compare(args);
await write('old.yaml','entities:\n  - name: health\n    status: old-invalid\n  - name: damage\n    status: active\n');
await write('new.yaml','entities:\n  - name: health\n    status: old-invalid\n  - name: shield\n    status: new-invalid\n');
for(const args of [['compare','entities','old.yaml','new.yaml'],['compare','entities','old.yaml','absent.yaml'],['compare','entities','absent.yaml','new.yaml']])await compare(args);
await write('design/registry/entities.yaml','entities:\n  - name: health\n    source: missing.md\n    status: invalid\n  - name: health\n    status: deprecated\n');
await compare(['validate']);
await write('design/registry/entities.yaml','entities: [{name: health}]\n');await compare(['list','entities']);await compare(['validate']);
await write('docs/architecture/adr-0012-old.md','');await write('production/qa/bugs/BUG-0009-fixed.md','');await write('production/sprints/sprint-008.md','');await write('production/sprints/sprint-999-retrospective.md','');await write('design/live-ops/seasons/S5_test.md','');await write('design/assets/asset-manifest.md','ASSET-002 ASSET-004');await write('design/assets/specs/test.md','ASSET-009');await write('docs/tech-debt-register.md','TD-015 TD-002');
for(const args of [['next-id','adr'],['next-id','bug'],['next-id','asset'],['next-id','td'],['next-id','story','combat'],['next-id','sprint'],['next-id','season']])await compare(args);
const result={date:'2026-11-12',status:'partial',scope:'Selected source registry helper parity; no semantic design approval or complete source-layout equivalence',root,sourceSha256:createHash('sha256').update(await readFile(source)).digest('hex'),cases};
const evidence=join(root,'parity.json');
await writeFile(evidence,JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({root,evidence,cases:cases.length,status:'PASS for selected comparisons'}));
