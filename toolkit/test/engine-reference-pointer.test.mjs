import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { planAttach } from '../dist/attach.js';
import { applyInstall, planDetach, planInstall } from '../dist/install.js';
import { planEngineReferences } from '../dist/engine-references.js';
async function fixture(t) {
 const root=await mkdtemp(join(tmpdir(),'studio reference pointer ')); t.after(()=>rm(root,{recursive:true,force:true}));
 await writeFile(join(root,'project.yaml'),'engine:\n  name: Godot\n  version: "4.7"\n'); return root;
}
test('stable project-owned reference pointer survives engine change and detach preserves research',async t=>{
 const root=await fixture(t); await writeFile(join(root,'AGENTS.md'),'# Local rules\n');
 await applyInstall(await planAttach(root)); const before=await readFile(join(root,'AGENTS.md'),'utf8');
 assert.match(before,/docs\/technical-preferences\.md/); assert.match(before,/docs\/engine-reference\/<engine>\/VERSION\.md/);
 assert.doesNotMatch(before,/@docs\/engine-reference|Godot 4\.7/);
 await applyInstall((await planEngineReferences(root)).plan);
 const version=await readFile(join(root,'docs/engine-reference/godot/VERSION.md'),'utf8');
 await writeFile(join(root,'project.yaml'),'engine:\n  name: Unity\n  version: "6000.3.26f1"\n');
 assert.deepEqual((await planAttach(root)).changes,[]); assert.equal(await readFile(join(root,'AGENTS.md'),'utf8'),before);
 await applyInstall(await planDetach(root));
 assert.equal(await readFile(join(root,'AGENTS.md'),'utf8'),'# Local rules\n');
 assert.equal(await readFile(join(root,'docs/engine-reference/godot/VERSION.md'),'utf8'),version);
});
for(const where of ['inside','outside']) test(`edited-owned AGENTS ${where} managed block is rejected without changing ownership`,async t=>{
 const root=await fixture(t); await applyInstall(await planAttach(root));
 const manifest=await readFile(join(root,'.game-studio/install.json'),'utf8');
 let text=await readFile(join(root,'AGENTS.md'),'utf8'); text=where==='inside'?text.replace('## Codex Game Studio','## My custom workflow'):text+'\nMy outside rule\n';
 await writeFile(join(root,'AGENTS.md'),text);
 await assert.rejects(planAttach(root),{code:'FILE_CONFLICT'});
 assert.equal(await readFile(join(root,'AGENTS.md'),'utf8'),text);
 assert.equal(await readFile(join(root,'.game-studio/install.json'),'utf8'),manifest);
});
test('malformed managed markers are rejected without rewrite',async t=>{
 const root=await fixture(t); const content='# My instructions\n<!-- game-studio:start -->\n'; await writeFile(join(root,'AGENTS.md'),content);
 await assert.rejects(planAttach(root),{code:'FILE_CONFLICT'}); assert.equal(await readFile(join(root,'AGENTS.md'),'utf8'),content);
});

test('unchanged previously owned integration can update through normal installer hash checks',async t=>{
 const root=await fixture(t);
 const old='# Local rules\n\n<!-- game-studio:start -->\n## Codex Game Studio\nOld installed pointer.\n<!-- game-studio:end -->\n';
 // A real old ownership record, created by the installer; never rewrite its hash.
 await applyInstall(await planInstall(root,{'AGENTS.md':old},'0.1.0-alpha.0'));
 const manifest=JSON.parse(await readFile(join(root,'.game-studio/install.json'),'utf8'));
 const planned=await planAttach(root); const change=planned.changes.find(c=>c.path==='AGENTS.md');
 assert.equal(change.before,old); assert.match(change.after,/docs\/engine-reference\/<engine>\/VERSION\.md/);
 await applyInstall(planned); const next=JSON.parse(await readFile(join(root,'.game-studio/install.json'),'utf8'));
 assert.equal(next.files['AGENTS.md'].original,manifest.files['AGENTS.md'].original);
 assert.ok((await readFile(join(root,'AGENTS.md'),'utf8')).startsWith('# Local rules\n'));
});
