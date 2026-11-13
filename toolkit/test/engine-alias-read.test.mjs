import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {readSettings,enums} from '../dist/config.js';
async function fixture(primary,engineLabel='UE5 5.7.1') {
  const root=await mkdtemp(join(tmpdir(),'engine alias ')); await mkdir(join(root,'docs'));
  const yaml=`engine:\n  name: ${JSON.stringify(primary)}\n`;
  const md=`# Technical Preferences\n\n**Engine**: ${engineLabel}\n`;
  await writeFile(join(root,'project.yaml'),yaml); await writeFile(join(root,'docs/technical-preferences.md'),md);
  return {root,yaml,md};
}
test('reader normalizes only exact UE5 primary and preference aliases with raw provenance and no write-enum expansion',async()=>{
  for (const primary of ['UE5','ue5','',null]) {
    const f=await fixture(primary); const r=await readSettings(f.root,['engine.name']);
    assert.equal(r.settings['engine.name'].value,'Unreal');
    assert.equal(r.settings['engine.name'].source,primary?'project.yaml':'docs/technical-preferences.md');
    assert.equal(r.annotations['engine.name'].projectValue,primary);
    assert.ok(r.warnings.some(x=>x.includes('UE5')&&x.includes('Unreal')));
    assert.equal(await readFile(join(f.root,'project.yaml'),'utf8'),f.yaml); assert.equal(await readFile(join(f.root,'docs/technical-preferences.md'),'utf8'),f.md);
  }
  assert.ok(!enums['engine.name'].includes('UE5'));
  const {planConfigSet}=await import('../dist/config-write.js'); const unchanged=await fixture('Godot');
  await assert.rejects(planConfigSet(unchanged.root,'engine.name','UE5'));
  assert.equal(await readFile(join(unchanged.root,'project.yaml'),'utf8'),unchanged.yaml);
});
test('reader retains unrelated invalid-value behavior and canonical primary preference precedence',async()=>{
  const bad=await fixture('UE55','[TO BE CONFIGURED]'); const r=await readSettings(bad.root,['engine.name']);
  assert.equal(r.settings['engine.name'].value,null); assert.ok(r.warnings.some(x=>x.includes('Invalid engine.name')));
  const canonical=await fixture('Godot'); const chosen=await readSettings(canonical.root,['engine.name']);
  assert.equal(chosen.settings['engine.name'].value,'Godot'); assert.equal(chosen.settings['engine.name'].source,'project.yaml');
});
