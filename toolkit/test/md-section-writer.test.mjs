import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm, stat, lstat, chmod, link, symlink, readdir, rename } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const { mdSectionCommand, formatMdSection } = await import(process.env.MD_SECTION_MODULE ?? '../dist/md-section.js');
const source = process.env.MD_SECTION_SOURCE ?? resolve(import.meta.dirname, '../../.claude/scripts/md-section.sh');
const wrapper = process.env.MD_SECTION_WRAPPER ?? fileURLToPath(new URL('../resources/studio/scripts/md-section.mjs', import.meta.url));
async function fixture(t, content = '# Root\nold\n') {
  const root = await mkdtemp(join(tmpdir(), 'md-writer-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const path = 'document with spaces.md'; await writeFile(join(root, path), content);
  return { root, path, full: join(root, path) };
}
const payload = s => ({ readInput: async () => Buffer.from(s) });
async function state(full) { const s = await stat(full); return { bytes: await readFile(full), mode: s.mode, inode: s.ino, mtime: s.mtimeMs }; }
const call = (root, args, input) => spawnSync(process.execPath, [wrapper, '--project', root, ...args], { input, encoding: 'utf8', timeout: 5000 });

// Each differential command runs on its own real file, in an owned directory.
// Identical relative FILE makes the complete source TSV comparable as-is.
test('writer text/exit/bytes match real Bash across source field and section boundaries', { skip: process.platform === 'win32' }, async t => {
  const corpus = [
    ['# Root\r\n## 01. **Part** <!-- note --> ###\r\nold\r\n### Child\r\nchild\r\n## Next\nlast', ['replace','part'], '\n \t\r\n  replacement  \r\n\r\ninside\n\t\n'],
    ['# Root\n## Part\r\nold\n## Next\r\nlast', ['replace','## Part'], 'new\n'],
    ['# Part\n\nnew', ['replace','Part'], 'new\n'],
    ['# Part\n\nnew\n', ['replace','Part'], 'new\n'],
    ['# Part\nold', ['insert-before','Part'], 'front\n'],
    ['intro\n# Part\nold', ['insert-before','Part'], 'front\n'],
    ['front\n \t\r\n# Part\nold', ['insert-before','Part'], 'front\n'],
    ['front\nother\n# Part\nold\n', ['insert-before','Part'], 'front\n'],
    ['# Part\na\n## Part\nb\n', ['replace','Part'], 'new\n'],
    ['# Part\na\n## Part\nb\n', ['replace','## Part'], 'new\n'],
    ['# Part\na\n', ['replace','missing'], ' \t\r\n'],
    ['# Part\na\n', ['replace','missing'], 'new\n'],
    ['# Part\na\n', ['replace','Part\nignored'], 'new\r\r\n'],
    ['## Span `<!--`\nold\n', ['replace','Span `<!--`'], 'new\n'],
    ['# Root\n```\nStatus: code\n```\n<!--\nStatus: comment\n-->\n> - **Status**:\tDraft <!-- note -->\n', ['set-field','STATUS','Ready'], undefined],
    ['# Root\n~~~\nStatus: code\n~~~\n<!-- Status: comment -->\n## Status: heading\nStatus: Draft\nStatus: Later\n', ['set-field','Status','Ready'], undefined],
    ['Status: Ready', ['set-field','Status','Ready'], undefined],
    ['Status: Draft', ['set-field','Status','Ready'], undefined],
    ['Status: Draft\n', ['set-field','Status','A\rB'], undefined],
    ['Status: Draft\n', ['set-field','Status','A\nB'], undefined],
    ['Status: Draft\n', ['set-field','Status',''], undefined],
    ['Status: Draft\n', ['set-field','Status','Ready','--after','absent'], undefined],
    ['Owner: Pat\nOwner: Sam\n', ['set-field','Status','Ready','--after','Owner'], undefined],
    ['_Status_: Draft\n', ['set-field','Status','Ready'], undefined],
    ['# Root\nbody\n', ['set-field','Status','Ready','--after','Owner'], undefined],
    ['# Root\nbody\n', ['set-field','Status','Ready'], undefined],
    ['# --text\nold\n', ['replace','--text'], 'new\n'],
    ['--text: Draft\n', ['set-field','--text','--project'], undefined],
    ['Status: Draft\n', ['set-field','Status','--anything'], undefined],
    ['Status: Draft\n', ['set-field','Status',String.raw`literal $(do-not-run) \value`], undefined],
  ];
  for (const style of ['Status: ', '**Status:** ', '**Status**:\t', '> **Status**: ', '- **Status:** ', '  > - **Status**:\t']) {
    for (const eol of ['\n','\r\n']) {
      corpus.push([`${style}Draft${eol}`, ['set-field','status','Ready'], undefined]);
      corpus.push([`# Root\n${style.replace('Status','Owner')}Pat${eol}tail`, ['set-field','Status','Ready','--after','Owner'], undefined]);
    }
  }
  for (const [i, [content, args, input]] of corpus.entries()) await t.test(`case ${i + 1}: ${args[0]}`, async t => {
    const {root} = await fixture(t); const old = join(root,'old'), next = join(root,'next');
    await mkdir(old); await mkdir(next); await writeFile(join(old,'doc.md'),content); await writeFile(join(next,'doc.md'),content);
    const argv=[args[0],'doc.md',...args.slice(1)];
    const oracle=spawnSync('bash',[source,...argv],{cwd:old,input,encoding:'utf8',timeout:5000});
    const actual=call(next,['--text',...argv],input);
    assert.equal(oracle.error,undefined);assert.equal(actual.error,undefined);
    assert.equal(actual.status,oracle.status);assert.equal(actual.stdout,oracle.stdout);
    assert.deepEqual(await readFile(join(next,'doc.md')),await readFile(join(old,'doc.md')));
  });
});

test('writes retain exact mixed EOL rules and no-op bytes/inode/mtime', async t => {
  const cases = [
    ['# A\r\nold\n# B\nlast',['replace','A'],'new\n','# A\r\n\r\nnew\r\n\r\n# B\nlast\n'],
    ['# A\nold\r\n# B\r\nlast',['replace','A'],'new\n','# A\n\nnew\n\n# B\r\nlast\n'],
    ['# Root\n> - **Owner:**\tPat\r\nend',['set-field','Status','Ready','--after','Owner'],undefined,'# Root\n> - **Owner:**\tPat\r\n> - **Status:**\tReady\r\nend\n'],
  ];
  for (const [content,args,input,expected] of cases) {
    const {root,path,full}=await fixture(t,content);const result=await mdSectionCommand(root,[args[0],path,...args.slice(1)],input===undefined?{}:payload(input));
    assert.equal(result.data.applied,true);assert.equal(result.data.qualityAssessed,false);assert.equal(await readFile(full,'utf8'),expected);
    const before=await state(full);const again=await mdSectionCommand(root,[args[0],path,...args.slice(1)],input===undefined?{}:payload(input));
    assert.equal(again.data.action,'unchanged');assert.equal(again.data.applied,false);assert.deepEqual(await state(full),before);
  }
  for(const content of ['Status: Ready','front\n \t\n# A\nlast']) {
    const {root,path,full}=await fixture(t,content);const before=await state(full);
    const args=content.startsWith('Status')?['set-field',path,'Status','Ready']:['insert-before',path,'A'];
    const r=await mdSectionCommand(root,args,payload('front\n'));assert.equal(r.data.action,'unchanged');assert.deepEqual(await state(full),before);
  }
});

test('empty stdin, missing/duplicate headings and fields reject without file effects', async t => {
  const {root,path,full}=await fixture(t,'# A\nold\n## A\nchild\n');const before=await state(full);
  for(const [args,input,exit] of [
    [['replace',path,'A'],' \t\r\n',2], [['replace',path,'absent'],'new',3],
    [['insert-before',path,'A'],'new',4], [['set-field',path,'Status','Ready'],undefined,3],
    [['set-field',path,'Status','A\nB'],undefined,2], [['set-field',path,'Status','Ready','--after'],undefined,2],
  ]) await assert.rejects(mdSectionCommand(root,args,input===undefined?{}:payload(input)),e=>e.exitCode===exit);
  assert.deepEqual(await state(full),before);assert.deepEqual(await readdir(root),[path]);
});

test('input acquisition is lazy after target/argument validation and never used by set-field/readers', async t => {
  const {root,path}=await fixture(t,'Status: Draft\n# A\nold\n');let calls=0;
  const input={readInput:async()=>{calls++;return Buffer.from('new');}};
  await assert.rejects(mdSectionCommand(root,['replace','absent'],input),e=>e.exitCode===1);
  await assert.rejects(mdSectionCommand(root,['replace',path],input),e=>e.exitCode===2);
  await mdSectionCommand(root,['set-field',path,'Status','Ready'],input);
  await mdSectionCommand(root,['list',path],input);assert.equal(calls,0);
  await mdSectionCommand(root,['replace',path,'A'],input);assert.equal(calls,1);
});

test('invalid UTF-8 is refused without corrupting files while existing readers retain decoding behavior', async t => {
  const {root,path,full}=await fixture(t,Buffer.from([0x23,0x20,0x41,0x0a,0xff,0x0a]));const before=await state(full);
  await assert.rejects(mdSectionCommand(root,['replace',path,'A'],payload('new')),e=>e.code==='INVALID_UTF8'&&e.exitCode===1);
  assert.deepEqual(await state(full),before);assert.equal((await mdSectionCommand(root,['list',path])).data.headings.length,1);
  const valid=await fixture(t,'# A\nold\n');const unchanged=await state(valid.full);
  await assert.rejects(mdSectionCommand(valid.root,['replace',valid.path,'A'],{readInput:async()=>Buffer.from([0xff])}),e=>e.code==='INVALID_UTF8'&&e.exitCode===2);
  assert.deepEqual(await state(valid.full),unchanged);
});

test('dry-run reports unapplied action without file, directory, mode or inode effects', async t => {
  for(const args of [['replace','A'],['insert-before','A'],['set-field','Status','Ready'],['set-field','Owner','Pat','--after','Status']]) {
    const {root,path,full}=await fixture(t,'Status: Draft\n# A\nold\n');const before=await state(full),dir=await stat(root),entries=await readdir(root);
    const r=await mdSectionCommand(root,[args[0],path,...args.slice(1)],{...payload('new'),dryRun:true});
    assert.equal(r.data.dryRun,true);assert.equal(r.data.applied,false);assert.match(formatMdSection(r.data),/^dry_run\ttrue\napplied\tfalse\nfile\t/);
    assert.deepEqual(await state(full),before);assert.deepEqual(await readdir(root),entries);assert.equal((await stat(root)).mtimeMs,dir.mtimeMs);
  }
  const {root,path}=await fixture(t);await assert.rejects(mdSectionCommand(root,['list',path],{dryRun:true}),e=>e.exitCode===2);
});

test('hardlinks cannot write through or silently detach; no-op and existing reads remain valid', async t => {
  const {root,path,full}=await fixture(t,'Status: Draft\n');const outside=await fixture(t,'unused');
  const alias=join(outside.root,'alias.md');await link(full,alias);const before=await state(full),other=await state(alias);
  await assert.rejects(mdSectionCommand(root,['set-field',path,'Status','Ready']),e=>e.code==='UNSAFE_PATH'&&e.exitCode===4);
  assert.deepEqual(await state(full),before);assert.deepEqual(await state(alias),other);assert.deepEqual(await readdir(root),[path]);
  assert.equal((await mdSectionCommand(root,['set-field',path,'Status','Draft'])).data.action,'unchanged');
  assert.equal((await mdSectionCommand(root,['list',path])).exitCode,0);
  const inside=join(root,'alias.md');await link(full,inside);
  await assert.rejects(mdSectionCommand(root,['set-field','alias.md','Status','Ready']),e=>e.exitCode===4);
  assert.equal((await lstat(full)).nlink,3);assert.deepEqual(await state(full),before);
});

test('actual write permission and ordinary modes are retained without changing shared atomicWrite', {skip:process.platform==='win32'}, async t => {
  const {root,path,full}=await fixture(t,'Status: Draft\n');
  await chmod(full,0o444);t.after(()=>chmod(full,0o600).catch(()=>{}));const before=await state(full);
  const probe=spawnSync(process.execPath,['--input-type=module','-e',"import{open}from'node:fs/promises';await(await open(process.argv[1],'r+')).close()",full]);
  if(probe.status===0)t.skip('This account can write mode0444; no permission-refusal claim.');
  else {
    const r=call(root,['set-field',path,'Status','Ready']);assert.equal(r.status,1);assert.equal(JSON.parse(r.stdout).error.code,'WRITE_FAILED');
    assert.deepEqual(await state(full),before);assert.deepEqual(await readdir(root),[path]);
  }
});

test('mode preservation ignores process umask for existing regular files', {skip:process.platform==='win32'}, async t => {
  for(const mode of [0o600,0o640,0o666,0o755]){
    const {root,path,full}=await fixture(t,'Status: Draft\n');await chmod(full,mode);
    const r=spawnSync(process.execPath,['--input-type=module','-e',`process.umask(0o077);const{mdSectionCommand}=await import(${JSON.stringify(new URL('../dist/md-section.js',import.meta.url).href)});await mdSectionCommand(process.argv[1],['set-field',process.argv[2],'Status','Ready']);`,root,path],{encoding:'utf8'});
    assert.equal(r.status,0,r.stderr);assert.equal((await stat(full)).mode&0o777,mode);assert.equal(await readFile(full,'utf8'),'Status: Ready\n');
  }
});

test('unsafe paths and actual external links never mutate target or outside content', async t => {
  const {root,path,full}=await fixture(t,'Status: Draft\n');const outside=await fixture(t,'Status: Outside\n');const before=await state(full),other=await state(outside.full);
  for(const p of ['../outside.md','/tmp/outside.md','a/../b','a\\b','a:b','./'+path])await assert.rejects(mdSectionCommand(root,['set-field',p,'Status','Ready']),e=>e.code==='UNSAFE_PATH'&&e.exitCode===4);
  await symlink(outside.root,join(root,'linked'),process.platform==='win32'?'junction':'dir');
  await assert.rejects(mdSectionCommand(root,['set-field','linked/'+outside.path,'Status','Ready']),e=>e.code==='UNSAFE_PATH'&&e.exitCode===4);
  assert.deepEqual(await state(full),before);assert.deepEqual(await state(outside.full),other);
});

test('concurrent byte/identity changes and newly linked targets reject with the new state preserved', async t => {
  for(const mutation of ['bytes','identity','hardlink']){
    const {root,path,full}=await fixture(t,'# A\nold\n');let changed;
    const input={readInput:async()=>{
      if(mutation==='bytes')await writeFile(full,'# A\nconcurrent\n');
      if(mutation==='identity'){await writeFile(join(root,'replacement.md'),'# A\nold\n');await rename(join(root,'replacement.md'),full);}
      if(mutation==='hardlink')await link(full,join(root,'alias.md'));
      changed=await state(full);return Buffer.from('new');
    }};
    await assert.rejects(mdSectionCommand(root,['replace',path,'A'],input),e=>e.exitCode===4&&e.code===(mutation==='hardlink'?'UNSAFE_PATH':'FILE_CONFLICT'));
    assert.deepEqual(await state(full),changed);assert.ok(!(await readdir(root)).some(s=>s.endsWith('.tmp')));
  }
});

test('wrapper supports literal write operands, after style, dry-run and strict trailing flags', async t => {
  const {root,path,full}=await fixture(t,'Status: Draft\nOwner: Pat\n# --text\nold\n');
  let r=call(root,['set-field',path,'Status','--text']);assert.equal(r.status,0);assert.equal(JSON.parse(r.stdout).applied,true);
  r=call(root,['set-field',path,'Status','--project','--text']);assert.equal(r.status,0);assert.match(r.stdout,/\tset\n/);
  r=call(root,['--text','replace',path,'--text'],'new');assert.equal(r.status,0);assert.match(r.stdout,/\treplaced\n/);
  r=call(root,['set-field',path,'Added','Value','--after','Owner']);assert.equal(r.status,0);assert.equal(JSON.parse(r.stdout).action,'added');
  const before=await state(full);
  r=call(root,['--text','set-field',path,'Status','Ready','--dry-run']);assert.equal(r.status,0);assert.match(r.stdout,/^dry_run\ttrue\napplied\tfalse\n/);
  for(const args of [ ['set-field',path,'Status','Ready','--unknown'],['set-field',path,'Status','Ready','--text','--text'], ['set-field',path,'Status','Ready','--after','Owner','--after','Owner'],['set-field',path,'Status','Ready','--dry-run','--dry-run'],['list',path,'--dry-run'] ])assert.equal(call(root,args).status,2,args.join(' '));
  assert.deepEqual(await state(full),before);
});

test('second insert and field addition are no-ops without temporary directory effects', async t => {
  for(const args of [['insert-before','A'],['set-field','Owner','Pat','--after','Status']]) {
    const {root,path,full}=await fixture(t,'Status: Draft\n# A\nold');
    const command=[args[0],path,...args.slice(1)];
    const first=await mdSectionCommand(root,command,payload('front\n'));assert.equal(first.data.applied,true);
    const before=await state(full),dir=await stat(root);
    const second=await mdSectionCommand(root,command,payload('front\n'));
    assert.equal(second.data.action,'unchanged');assert.deepEqual(await state(full),before);
    assert.equal((await stat(root)).mtimeMs,dir.mtimeMs);assert.deepEqual(await readdir(root),[path]);
  }
});

test('a non-writable parent rejects atomic staging without changing the document', {skip:process.platform==='win32'}, async t => {
  const {root,path,full}=await fixture(t,'Status: Draft\n');const before=await state(full);await chmod(root,0o555);
  try {
    const probe=spawnSync(process.execPath,['--input-type=module','-e',"import{writeFile,unlink}from'node:fs/promises';await writeFile(process.argv[1],'probe',{flag:'wx'});await unlink(process.argv[1])",join(root,'permission-probe')]);
    if(probe.status===0){t.skip('This account can stage in mode0555; no parent-permission-refusal claim.');return;}
    const r=call(root,['set-field',path,'Status','Ready']);assert.equal(r.status,1);assert.equal(JSON.parse(r.stdout).error.code,'WRITE_FAILED');
    assert.deepEqual(await state(full),before);assert.deepEqual(await readdir(root),[path]);
  } finally {await chmod(root,0o700);}
});

test('UTF-8 BOM, literal metacharacters and non-ASCII content survive unrelated writes', async t => {
  const initial='\uFEFFpreamble 中文\r\n# Section\r\nold\r\n# Tail\n🧭 untouched';
  const {root,path,full}=await fixture(t,initial);
  await mdSectionCommand(root,['replace',path,'Section'],payload('新内容 $() \\value\n'));
  assert.equal(await readFile(full,'utf8'),'\uFEFFpreamble 中文\r\n# Section\r\n\r\n新内容 $() \\value\r\n\r\n# Tail\n🧭 untouched\n');
});
