import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm, realpath } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { test } from 'node:test';
import { parse, parseDocument } from 'yaml';
import { planConfigSetMany } from '../dist/config-write.js';
import { applyInstall } from '../dist/install.js';

test('explicit null survives new nested flow mappings and existing scalar replacements',async t=>{
 for(const before of ['{}\n','# owner\n{ engine: { name: Web, version: "8.3.4" }, platform: { primary_input: Mouse } }\n']){
  const root=await realpath(await mkdtemp(join(tmpdir(),'studio flow null ')));t.after(()=>rm(root,{recursive:true,force:true}));await writeFile(join(root,'project.yaml'),before);
  const entries=[['engine.name','Web'],['engine.version','null'],['platform.primary_input','null'],['testing.framework','null'],['qa.coverage_minimum','null']];
  const {plan}=await planConfigSetMany(root,entries);assert.equal(await readFile(join(root,'project.yaml'),'utf8'),before);await applyInstall(plan);
  const after=await readFile(join(root,'project.yaml'),'utf8'),document=parseDocument(after);for(const [key,value]of entries){assert.equal(document.hasIn(key.split('.')),true,key);assert.equal(document.getIn(key.split('.')),value==='null'?null:value,key);}
  assert.equal(parse(after).platform.primary_input,null);if(before.startsWith('# owner'))assert.ok(after.startsWith('# owner\n'));assert.equal((await planConfigSetMany(root,entries)).plan.changes.length,0);
 }
});
