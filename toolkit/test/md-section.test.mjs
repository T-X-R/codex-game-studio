import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm, symlink, copyFile, stat } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const { mdSectionCommand, formatMdSection } = await import(process.env.MD_SECTION_MODULE ?? '../dist/md-section.js');
const source = process.env.MD_SECTION_SOURCE ?? resolve(import.meta.dirname, '../../.claude/scripts/md-section.sh');
const wrapperSource = process.env.MD_SECTION_WRAPPER ?? resolve(import.meta.dirname, '../../studio/scripts/md-section.mjs');
async function fixture(t, content = '') {
  const root = await mkdtemp(join(tmpdir(), 'studio-md-section-')); t.after(() => rm(root, { recursive: true, force: true }));
  const path = 'document with spaces.md'; await writeFile(join(root, path), content); return { root, path };
}
async function parity(t, root, path, args) {
  return t.test(args.join(' '), { skip: process.platform === 'win32' }, async () => {
    const old = spawnSync('bash', [source, args[0], join(root, path), ...args.slice(1)], { encoding: 'utf8' });
    assert.equal(old.error, undefined);
    try { const r = await mdSectionCommand(root, [args[0], path, ...args.slice(1)]); assert.equal(r.exitCode, old.status); assert.equal(formatMdSection(r.data), old.stdout); }
    catch (e) { if (e.code && e.exitCode) { assert.equal(e.exitCode, old.status); assert.equal(old.stdout, ''); } else throw e; }
  });
}
test('list/extract retain hierarchy, numeric/emphasis/title normalization, level selectors and ASCII case', async t => {
  const content = '# Parent\nlead\n## 1. **Overview** <!-- fill --> ###\nbody\n### Child\nchild\n## 2) __RULES__\nend\n## save_slot\nx\n## ÉTAT\nstate\n';
  const { root, path } = await fixture(t, content);
  const r = await mdSectionCommand(root, ['list', path]);
  assert.equal(r.data.qualityAssessed, false); assert.equal(r.data.headings.length, 6);
  assert.deepEqual(r.data.headings[1], { level: 2, first: 3, last: 6, title: '1. **Overview** <!-- fill -->' });
  assert.equal((await mdSectionCommand(root, ['extract', path, 'overview', '--body'])).data.content, 'body\n### Child\nchild\n');
  for (const args of [['list'], ['status'], ['extract','OVERVIEW'], ['extract','rules','--body'], ['extract','## save_slot'], ['status','ÉTAT','état','save slot']]) await parity(t, root, path, args);
});
test('fences, HTML comments and code spans follow the retained parser, including documented observation quirks', async t => {
  const content = '# Root\n```md\n## Hidden\n[TBD]\n````\n<!--\n## Hidden comment\nTODO in comment\n-->\n## Span `<!--`\nreal\n## Empty\n<!-- [TBD] -->\n---\n***\n___\n### Empty child\n\n## Fence only\n~~~~ js\n## Hidden too\n~~~\n~~~~\n## Placeholder\n[To be written]\n## Unclosed span `<!--\n## Hidden until comment end\n-->\n## Visible\nvalue\n';
  const { root, path } = await fixture(t, content);
  const r = await mdSectionCommand(root, ['status', path]);
  assert.equal(r.data.sections.find(s => s.title === 'Empty').status, 'EMPTY');
  assert.equal(r.data.sections.find(s => s.title === 'Fence only').status, 'COMPLETE');
  assert.equal(r.data.sections.find(s => s.title === 'Root').status, 'PLACEHOLDER'); // Source scans line-leading TODO even inside a comment.
  for (const args of [['list'], ['status'], ['extract','Empty'], ['extract','Visible'], ['status','Hidden','Span `<!--`']]) await parity(t, root, path, args);
});
test('duplicate matches expand status rows while extraction refuses ambiguity; missing status is an observation', async t => {
  const { root, path } = await fixture(t, '# Repeat\na\n## Repeat\nb\n## Other\n');
  const r = await mdSectionCommand(root, ['status', path, 'repeat', 'missing', 'repeat']);
  assert.deepEqual(r.data.counts, { sections: 4, complete: 4, empty: 0, placeholder: 0, not_found: 1 }); assert.equal(r.exitCode, 0);
  await assert.rejects(mdSectionCommand(root, ['extract', path, 'repeat']), e => e.exitCode === 4 && e.code === 'AMBIGUOUS_HEADING');
  await assert.rejects(mdSectionCommand(root, ['extract', path, 'missing']), e => e.exitCode === 3);
  for (const args of [['status','repeat','missing','repeat'], ['extract','repeat'], ['extract','missing'], ['extract','# Repeat'], ['extract','## repeat']]) await parity(t, root, path, args);
});
test('CRLF, absent final newline, empty files and exact heading boundaries match Bash without writes', async t => {
  for (const content of ['', 'plain', '##\r\n', '   ## Allowed\r\ntext\r\n    ## Indented\r\n####### Seven\r\n##not heading\r\n##\tTabbed\r\nlast']) {
    const { root, path } = await fixture(t, content); const before = await stat(join(root, path));
    for (const args of [['list'], ['status'], ['status',''], ['extract','Allowed','--body'], ['extract','Tabbed']]) await parity(t, root, path, args);
    assert.equal(await readFile(join(root, path), 'utf8'), content); assert.equal((await stat(join(root, path))).mtimeMs, before.mtimeMs);
  }
});
test('CRLF sections preserve inclusive line bounds and normalize extraction with no final newline', async t => {
  const content = '# Root\r\nintro\r\n## Child\r\nbody\r\n\r\n# Next\r\nlast';
  const { root, path } = await fixture(t, content), before = await stat(join(root, path));
  const listed = await mdSectionCommand(root, ['list', path]);
  assert.deepEqual(listed.data.headings, [
    { level: 1, first: 1, last: 5, title: 'Root' },
    { level: 2, first: 3, last: 5, title: 'Child' },
    { level: 1, first: 6, last: 7, title: 'Next' },
  ]);
  assert.equal((await mdSectionCommand(root, ['extract', path, 'Root', '--body'])).data.content, 'intro\n## Child\nbody\n\n');
  assert.equal((await mdSectionCommand(root, ['extract', path, 'Next'])).data.content, '# Next\nlast\n');
  assert.deepEqual((await mdSectionCommand(root, ['status', path])).data.counts, { sections: 3, complete: 3, empty: 0, placeholder: 0, not_found: 0 });
  assert.deepEqual(await readFile(join(root, path)), Buffer.from(content));
  assert.equal((await stat(join(root, path))).mtimeMs, before.mtimeMs);
});
test('usage, missing/nonfile input and unsafe paths fail without exposing contents', async t => {
  const { root, path } = await fixture(t, '# Title\nsecret\n');
  for (const args of [[], ['replace',path,'Title'], ['insert-before',path,'Title'], ['set-field',path,'Status'], ['list',path,'extra'], ['extract',path], ['extract',path,'Title','bad']]) await assert.rejects(mdSectionCommand(root,args),e=>e.exitCode===2);
  for (const p of ['../escape.md', '/tmp/escape.md', 'a/../b', 'a\\b', 'a:b', './document with spaces.md']) await assert.rejects(mdSectionCommand(root,['list',p]),e=>e.code==='UNSAFE_PATH' && e.exitCode===4);
  await assert.rejects(mdSectionCommand(root,['list','missing.md']),e=>e.exitCode===1);
  await assert.rejects(mdSectionCommand(root,['list','missing.md','extra']),e=>e.exitCode===1); // Source checks readability before command-specific arguments.
  await mkdir(join(root,'dir')); await assert.rejects(mdSectionCommand(root,['list','dir']),e=>e.exitCode===1);
  const outside = await fixture(t, '# Outside\nprivate content\n');
  await symlink(outside.root,join(root,'linked'),process.platform==='win32'?'junction':'dir');
  await assert.rejects(mdSectionCommand(root,['list','linked/'+outside.path]),e=>e.code==='UNSAFE_PATH' && e.exitCode===4);
  assert.equal(await readFile(join(outside.root,outside.path),'utf8'),'# Outside\nprivate content\n');
  assert.equal(await readFile(join(root,path),'utf8'),'# Title\nsecret\n');
});
test('thin bundled resource returns JSON observations, source text and exact exit classes', async t => {
  const {root,path}=await fixture(t,'# Root\n## Status\n[TBD]\n');
  const built=dirname(fileURLToPath(new URL(process.env.MD_SECTION_MODULE ?? '../dist/md-section.js',import.meta.url)));
  await writeFile(join(root,'package.json'),'{"type":"module"}'); await mkdir(join(root,'dist'));
  for(const f of ['md-section.js','files.js','contract.js']) await copyFile(join(built,f),join(root,'dist',f));
  await mkdir(join(root,'resources/studio/scripts'),{recursive:true}); const wrapper=join(root,'resources/studio/scripts/md-section.mjs'); await copyFile(wrapperSource,wrapper);
  const call=args=>spawnSync(process.execPath,[wrapper,...args],{encoding:'utf8'});
  let r=call(['--project',root,'status',path]); assert.equal(r.status,0); assert.equal(JSON.parse(r.stdout).qualityAssessed,false); assert.equal(JSON.parse(r.stdout).sections[1].status,'PLACEHOLDER');
  r=call(['--project',root,'extract',path,'Status','--body','--text']); assert.equal(r.status,0); assert.equal(r.stdout,'[TBD]\n');
  assert.equal(call(['--project',root,'extract',path,'Missing']).status,3);
  assert.equal(call(['--project',root,'extract',path,'Missing','--text']).status,3);
  assert.equal(call(['--project',root,'list','../escape.md']).status,4);
  assert.equal(call(['--project',root,'list','missing.md']).status,1);
  for(const args of [[], ['list',path], ['--project',root,'replace',path,'Status'], ['--project',root,'--project',root,'list',path], ['--unknown','--help']]) assert.equal(call(args).status,2);
  assert.equal(call(['--help']).status,0); assert.equal(await readFile(join(root,path),'utf8'),'# Root\n## Status\n[TBD]\n');
});
test('mixed parser inputs preserve exact Bash text across comment, span and fence transitions', { skip: process.platform === 'win32' }, async t => {
  const blocks = ['## 01. **Section** ###', '### Child', '## __Section__', '# Tail', '    ## Indented', '##\tTabbed\t###', '<!--', '-->', '<!-- closed -->', 'prefix <!-- hidden --> suffix', 'TODO original', '_TODO original', ' [TBD]', '[To be designed]', '```js', '````', '~~~', '~~~~', '``` <!-- ignored', '## Span ``x ` <!-- y``', '## Unclosed `<!--', '`<!--` literal', '`` unmatched ` <!-- comment', '---', '***', '___', '', 'text', '## 2) save_slot', '## SECTION', '## ÉTAT'];
  const { root, path } = await fixture(t); let seed = 59060;
  for (let i = 0; i < 48; i++) {
    const lines = ['# Root'];
    for (let n = 0; n < 24; n++) { seed = (seed * 1664525 + 1013904223) >>> 0; lines.push(blocks[seed % blocks.length]); }
    const content = lines.join(i % 2 ? '\r\n' : '\n') + (i % 3 ? '\n' : ''); await writeFile(join(root,path),content);
    for (const args of [['list'], ['status'], ['status','section','## Section','missing'], ['extract','Root','--body']]) {
      const old = spawnSync('bash',[source,args[0],join(root,path),...args.slice(1)],{encoding:'utf8'}); assert.equal(old.error,undefined);
      const result = await mdSectionCommand(root,[args[0],path,...args.slice(1)]);
      assert.equal(result.exitCode,old.status,`mixed input ${i}: ${args}`); assert.equal(formatMdSection(result.data),old.stdout,`mixed input ${i}: ${args}`);
    }
    assert.equal(await readFile(join(root,path),'utf8'),content);
  }
});
