import { lstat, mkdir, open, readFile, readdir } from 'node:fs/promises';
import { basename, dirname, join } from 'node:path';
import { parseConfig, readSettings } from './config.js';
import { StudioError } from './contract.js';
import { resolveEngineRow } from './engine.js';
import { canonicalRoot, hash, safePath } from './files.js';
import { resourcePath } from './resources.js';
import { detectWeb } from './web-detect.js';

export interface TestScaffoldOptions {
  dryRun?: boolean; list?: boolean; module?: string; projectName?: string; testPrefix?: string; date?: string;
}
type Row = { path: string; state: 'CREATED' | 'WOULD_CREATE' | 'EXISTS' | 'SKIPPED' | 'FAILED'; reason?: string; sha256?: string };
type Need = { id: string; path: string; message: string };
const engines = ['Godot', 'Unity', 'Unreal', 'Web'];
const readme = 'tests/README.md', ci = '.github/workflows/tests.yml';

async function info(path: string) {
  try { return await lstat(path); } catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null; throw error; }
}
async function text(root: string, relative: string): Promise<string | null> {
  const path = await safePath(root, relative), stat = await info(path);
  if (!stat) return null;
  if (!stat.isFile() || stat.size > 1024 * 1024) throw new StudioError('INVALID_INPUT', `Expected a regular file of at most 1 MiB: ${relative}`, 4);
  return readFile(path, 'utf8');
}
function json(raw: string | null, path: string): Record<string, unknown> {
  if (raw === null) return {};
  try { const value: unknown = JSON.parse(raw); if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(); return value as Record<string, unknown>; }
  catch { throw new StudioError('INVALID_INPUT', `Expected a JSON object: ${path}`); }
}
function record(value: unknown): Record<string, unknown> { return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}; }
function safeName(value: string | undefined, name: string, prefix = false) {
  if (value !== undefined && !(prefix ? /^[A-Za-z0-9_]+(?:\.[A-Za-z0-9_]+)*\.?$/ : /^[A-Za-z0-9_]+$/).test(value)) throw new StudioError('INVALID_ARGUMENT', `Invalid ${name}`);
}
const quoted = (value: string) => JSON.stringify(value);
const pending = (message: string) => `echo ${quoted(message)} >&2; exit 1`;
const browserStep = `      - name: Locate installed browser
        shell: bash
        run: |
          browser=""
          for executable in google-chrome google-chrome-stable chromium chromium-browser; do
            if candidate="$(command -v "$executable")" && [ -x "$candidate" ]; then browser="$candidate"; break; fi
          done
          if [ -z "$browser" ]; then echo "No installed Chromium-family browser; provision one explicitly" >&2; exit 1; fi
          printf 'GAME_STUDIO_BROWSER=%s\\n' "$browser" >> "$GITHUB_ENV"

`;

/** Fill missing test infrastructure only. No installer ownership, processes, network or quality verdict. */
export async function scaffoldTests(rootInput: string, engineInput: string, options: TestScaffoldOptions = {}) {
  const engine = engines.find(x => x.toLowerCase() === engineInput.toLowerCase());
  if (!engine || options.dryRun && options.list) throw new StudioError('INVALID_ARGUMENT', 'Choose godot|unity|unreal|web and at most one of --dry-run or --list');
  if (engine !== 'Unreal' && [options.module, options.projectName, options.testPrefix].some(x => x !== undefined)) throw new StudioError('INVALID_ARGUMENT', 'Module, project name and test prefix apply only to Unreal');
  safeName(options.module, 'module'); safeName(options.projectName, 'project name'); safeName(options.testPrefix, 'test prefix', true);
  const today = new Date(); const date = options.date ?? `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new StudioError('INVALID_ARGUMENT', 'Date must be YYYY-MM-DD');
  const project = await canonicalRoot(rootInput);
  if (!(await info(project))?.isDirectory()) throw new StudioError('INVALID_ARGUMENT', 'Project root must be an existing directory');
  const configText = await text(project, 'project.yaml');
  const config = configText === null ? null : parseConfig(configText, 'project.yaml');
  const configured = config?.getIn(['engine','name']);
  const normalizedPrimary = typeof configured==='string' && /^UE5$/i.test(configured) ? 'Unreal' : configured;
  if (configured!==undefined && configured!==null && configured!=='' && !engines.includes(normalizedPrimary as string)) throw new StudioError('INVALID_CONFIG','Invalid project.yaml engine.name; resolve it explicitly rather than ignoring it');
  // Guard the existing settings reader's optional inputs before it reads them.
  await text(project,'project.local.yaml');
  if (await text(project,'docs/technical-preferences.md')===null) await text(project,'.claude/docs/technical-preferences.md');
  for (const path of ['production/review-mode.txt','production/stage.txt']) await text(project,path);
  const effective = await readSettings(project,['engine.name','engine.version','engine.code_root','engine.test_root']);
  const settings = effective.settings;
  if (settings['engine.name']!.value!==null && settings['engine.name']!.value!==engine) throw new StudioError('INVALID_CONFIG','Engine argument conflicts with effective engine.name');
  const engineSelection = settings['engine.name']!.value===null ? {value:engine,source:'argument',projectValue:configured??null} : {...settings['engine.name']!,projectValue:configured??null};
  settings['engine.name'] = {value:engine,source:engineSelection.source};
  const rawVersion = settings['engine.version']!.value;
  const version = typeof rawVersion==='string' && /^[A-Za-z0-9._+-]+$/.test(rawVersion) ? rawVersion : '';
  const warnings = ['Scaffolding does not run tests, install dependencies, configure secrets or enforce branch protection. Existing paths remain owner-owned.',...effective.warnings];
  let module = options.module, projectName = options.projectName, prefix = options.testPrefix?.replace(/\.$/, ''), editorTarget: string | undefined;
  if (engine === 'Unreal') {
    const projects = (await readdir(project, { withFileTypes:true })).filter(e => e.isFile() && /^[A-Za-z0-9_]+\.uproject$/.test(e.name));
    if (!projectName && projects.length === 1) projectName = projects[0]!.name.slice(0,-9);
    const selected = projectName ? `${projectName}.uproject` : null;
    const descriptor = selected ? json(await text(project, selected), selected) : {};
    const modules = Array.isArray(descriptor.Modules) ? descriptor.Modules.map(record).filter(x => typeof x.Name === 'string' && /^[A-Za-z0-9_]+$/.test(x.Name) && x.Type === 'Runtime').map(x => x.Name as string) : [];
    const configuredRoot = settings['engine.test_root']!.value;
    const rootModule = typeof configuredRoot === 'string' ? /^Source\/([A-Za-z0-9_]+)\/Private\//.exec(configuredRoot)?.[1] : undefined;
    if (module && rootModule && module !== rootModule) throw new StudioError('INVALID_ARGUMENT','Module conflicts with engine.test_root');
    module ??= rootModule ?? (modules.length === 1 ? modules[0] : undefined);
    if (module && configuredRoot === null) settings['engine.test_root'] = { value:`Source/${module}/Private/Tests`,source:options.module ? '--module' : 'actual project module' };
    if (!prefix) {
      const command = config?.getIn(['commands','test']);
      const matches = typeof command === 'string' ? [...command.matchAll(/Automation\s+RunTests\s+([A-Za-z0-9_]+(?:\.[A-Za-z0-9_]+)*\.)(?=[;"\s]|$)/g)] : [];
      if (matches.length === 1) prefix = matches[0]![1]!.slice(0,-1);
    }
    const sourcePath = await safePath(project, 'Source');
    if ((await info(sourcePath))?.isDirectory()) {
      const candidates: string[] = [];
      for (const entry of await readdir(sourcePath, {withFileTypes:true})) {
        if (!entry.isFile() || !/^[A-Za-z0-9_]+\.Target\.cs$/.test(entry.name)) continue;
        const raw = await text(project, `Source/${entry.name}`);
        if (/^\s*(?:this\.)?Type\s*=\s*TargetType\.Editor\s*;/m.test((raw ?? '').replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, ''))) candidates.push(entry.name.replace(/\.Target\.cs$/,''));
      }
      if (candidates.length === 1) editorTarget = candidates[0];
    }
  }
  const row = await resolveEngineRow(project, settings, {allowMissing:true}) as { test_root: {value:string | null;state:string;reason?:string} };
  let testRoot = row.test_root.value;
  if (row.test_root.state === 'invalid') throw new StudioError('INVALID_CONFIG', row.test_root.reason ?? 'Invalid test root');
  if (engine === 'Unreal' && row.test_root.state === 'not_assessed') testRoot = 'Source/<Module>/Private/Tests';
  if (!testRoot) throw new StudioError('INVALID_CONFIG','Set engine.test_root before scaffolding');
  if (testRoot !== 'Source/<Module>/Private/Tests' && !/^[A-Za-z0-9_ .\/-]+$/.test(testRoot)) throw new StudioError('INVALID_CONFIG','Test root contains unsupported documentation or shell characters');
  if (testRoot === '.') throw new StudioError('INVALID_CONFIG','Choose a test subdirectory, not the whole project');
  if (engine === 'Unity' && !/^(Assets|Packages)\/.+/.test(testRoot)) throw new StudioError('INVALID_CONFIG','Unity test root must be inside Assets or Packages');
  if (engine === 'Unreal' && testRoot !== 'Source/<Module>/Private/Tests' && !/^Source\/[A-Za-z0-9_]+\/Private\/.+/.test(testRoot)) throw new StudioError('INVALID_CONFIG','Unreal test root must be inside an actual Source module Private directory');
  const files: Row[] = [], needs: Need[] = [];
  const need = (id:string, path:string, message:string) => { if (!needs.some(x=>x.id===id && x.path===path)) needs.push({id,path,message}); };
  const tokens: Record<string,string> = { ENGINE: version ? `${engine} ${version}` : `${engine} [version]`, DATE:date, MODULE:module??'<Module>', TESTROOT:testRoot,
    DOCPROJECT:projectName??'<Project>', CIPROJECT:projectName??'[ProjectName]', TEST_PREFIX:prefix??'[TestPrefix]', EDITOR_TARGET:editorTarget??'[EditorTarget]',
    GODOTVER:/^\d+\.\d+\.\d+(?:[-.](?:stable|rc|beta|alpha)\d*)?$/.test(version) ? version : '[FULL GODOT VERSION, e.g. 4.7.2]' };
  const unityManifest = engine==='Unity' ? json(await text(project,'Packages/manifest.json'),'Packages/manifest.json') : {};
  let web: Awaited<ReturnType<typeof detectWeb>>['data'] | undefined;
  let playwright = false, otherConfig: string | undefined;
  if (engine === 'Web' && !options.list) {
    web = (await detectWeb(project)).data;
    const pkg = json(await text(project,'package.json'),'package.json');
    const dependencies = {...record(pkg.dependencies),...record(pkg.devDependencies),...record(pkg.peerDependencies),...record(pkg.optionalDependencies)};
    playwright = typeof dependencies['@playwright/test'] === 'string';
    for (const extension of ['js','mjs','cjs','mts','cts']) if (await info(await safePath(project,`playwright.config.${extension}`))) otherConfig ??= `playwright.config.${extension}`;
    const pm = web.packageManager?.name, commands = web.commands;
    const runners = web.testRunners?.filter(x=>x.name!=='none').map(x=>`${x.name} (${x.source})`) ?? [];
    tokens.ENGINE = `Web (${web.bundlers?.[0]?.name ?? 'bundler unknown'} ${web.engineVersion?.value ?? '[version unknown]'})`;
    tokens.WEB_FRAMEWORK = runners.join('; ') || '[Choose the test tools for this project]';
    tokens.WEB_COMMANDS = ['build','test','smoke'].map(k=>commands?.[k]?.command ? `${commands[k]!.command} # ${k}: ${commands[k]!.source}` : `# ${k}: no resolved command; configure this first`).join('\n');
    const scripts = record(pkg.scripts);
    for (const key of ['test:unit','test:e2e']) if (typeof scripts[key]==='string' && pm && pm!=='?') tokens.WEB_COMMANDS += `\n${pm} run ${key}`;
    tokens.WEB_RUNTIME = playwright ? 'Playwright uses GAME_STUDIO_BROWSER when explicitly set, otherwise its installed Chromium. Resolve an actual executable before running browser tests; missing browsers are not a pass. Provisioning a browser is a separate authorized action. The generated config does not start a server or select a URL: preserve the project test fixtures and their actual build/URL contract.' : 'Preserve the actual runner and its configuration. Browser coverage remains a separate requirement; choose and configure it with the owner instead of silently replacing the existing test runner.';
    if (typeof scripts['build:single']==='string') tokens.WEB_RUNTIME += '\nThe project declares build:single. When its actual fixtures target dist-single/index.html and window.game, run that build before those browser tests; do not infer this contract for other projects.';
    tokens.WEB_BUILD_STEP = commands?.build?.command ? `      - name: Build\n        run: ${quoted(commands.build.command)}\n\n` : '';
    tokens.WEB_BROWSER_STEP = playwright ? browserStep : '';
    const nodeConstraint = record(pkg.engines).node, managerDeclaration = typeof pkg.packageManager==='string' ? pkg.packageManager : null;
    const toolchainNotes: string[] = [];
    if (nodeConstraint!==undefined) {
      const observation = JSON.stringify(nodeConstraint);
      need('ci_runtime',ci,`UNRESOLVED: Node24 is a template default, not verified against package.json engines.node ${observation}. Set a compatible project-approved CI runtime before enabling this workflow.`);
      toolchainNotes.push(`      # UNRESOLVED: Node24 template default; reconcile engines.node ${observation} before enabling.`);
    }
    if (managerDeclaration) {
      need('ci_package_manager',ci,`UNRESOLVED: provision and verify the actual packageManager ${managerDeclaration} on CI; setup-node does not establish this package-manager pin.`);
      toolchainNotes.push(`      # UNRESOLVED: provision/verify packageManager ${JSON.stringify(managerDeclaration)}; setup-node alone does not establish it.`);
    }
    tokens.WEB_TOOLCHAIN_NOTE = toolchainNotes.length ? toolchainNotes.join('\n')+'\n' : '';

    tokens.WEB_PM_STEP = pm && !['npm','?'].includes(pm) ? `      - name: Check configured package manager\n        run: command -v ${pm} || { echo "Provision the project-pinned ${pm} version on this runner" >&2; exit 1; }\n\n` : '';
    for (const key of ['install','test']) {
      const command = commands?.[key]?.command;
      tokens[`WEB_${key.toUpperCase()}`] = quoted(command ?? pending(`Configure the project's ${key} command before enabling this workflow`));
      if (!command) need(`web_${key}`,ci,`No resolved ${key} command; settle package manager/lock/scripts without changing the game stack, then update this workflow step`);
    }
    if (pm && !['npm','?'].includes(pm)) need('ci_package_manager',ci,`Provision the actual project-pinned ${pm} version on the CI runner; the helper does not install it`);
    if (web.testRunners?.some(x=>x.name==='vitest') && typeof dependencies.vitest!=='string') need('vitest','package.json','The observed script invokes Vitest without a declared root dependency; resolve the actual workspace/tool dependency and pin before running it');
    if (web.testRunners?.some(x=>x.name==='playwright') && !playwright) need('@playwright/test','package.json','The canonical browser config imports @playwright/test; verify and settle the actual project/workspace dependency before adding that config');
    if (!playwright) need('browser_test_setup','package.json','Preserve the current runner; choose and configure browser test coverage with its owner. Canonical Playwright is available if selected.');
    if (web.packageJson.state==='absent') need('package_json','package.json','Set up the actual Web project and its scripts first');
    if (!(await info(await safePath(project,'node_modules')))?.isDirectory()) need('npm_install','node_modules',`Dependencies are not installed: ${commands?.install?.command ?? 'settle a package manager and frozen lock install'}. Installation is a separate authorized action.`);
    if (!web.scan?.complete && web.packageJson.state==='present') warnings.push('Web scan is incomplete; do not infer absence from the observed subset');
  }
  // Complete guarded dependency reads before any project write.
  const gdunitPresent = engine==='Godot' && !options.list && (await info(await safePath(project,'addons/gdUnit4/bin/GdUnitCmdTool.gd')))?.isFile();
  const moduleRulesPresent = engine==='Unreal' && module && !options.list && (await info(await safePath(project,`Source/${module}/${module}.Build.cs`)))?.isFile();
  const projectFilePresent = engine==='Unreal' && projectName && !options.list && (await info(await safePath(project,`${projectName}.uproject`)))?.isFile();
  const targets: {path:string; template?:string; skip?:string; canonical?:boolean}[] = [{path:readme,template:`readme_${engine.toLowerCase()}.md`},{path:'production/qa/evidence/.gitkeep'}];
  if (engine==='Godot') for (const folder of ['unit','integration']) targets.push({path:`${testRoot}/${folder}/.gdignore_placeholder`,template:'godot-placeholder.txt'});
  if (engine==='Unity') for (const [folder,name] of [['EditMode','edit'],['PlayMode','play']]) targets.push({path:`${testRoot}/${folder}/${folder}Tests.asmdef`,template:`asmdef_${name}.json`});
  if (engine==='Unreal') targets.push({path:`${testRoot}/README.md`,template:'unreal_tests_readme.md',...(!module ? {skip:'No settled game module; choose --module or configure its actual test root'}:{})});
  if (engine==='Web') {
    for (const folder of ['unit','integration']) targets.push({path:`${testRoot}/${folder}/.gitkeep`});
    targets.push({path:'playwright.config.ts',canonical:true,...(otherConfig ? {skip:`Preserve existing ${otherConfig}; do not create a competing config`} : !playwright && !options.list ? {skip:'Playwright is not selected in the actual project dependencies; preserve its current runner'} : {})});
  }
  targets.push({path:ci,template:`ci_${engine.toLowerCase()}.yml`},{path:'tests/smoke/critical-paths.md',template:'smoke.md'});
  if (options.list) return { exitCode:0, data:{project,engine,engineSelection,mode:'list',qualityAssessed:false as const,paths:targets.map(x=>x.path),files,needs,warnings} };
  for (const target of targets) {
    let handle;
    try {
      // Validate every ancestor, while an already-existing leaf (even a link) remains untouched.
      const parent = dirname(target.path) === '.' ? project : await safePath(project, dirname(target.path));
      const destination = join(parent,basename(target.path));
      const existing = await info(destination);
      if (existing) {
        const reason = existing.isFile() ? undefined : `Preserved existing ${existing.isSymbolicLink() ? 'symbolic link' : existing.isDirectory() ? 'directory' : 'non-regular path'}; required regular file is unresolved`;
        files.push({path:target.path,state:'EXISTS',...(reason ? {reason} : {})});
        if (reason) need('expected_regular_file',target.path,reason);
        continue;
      }
      if (target.skip) { files.push({path:target.path,state:'SKIPPED',reason:target.skip}); continue; }
      let content = '';
      if (target.template || target.canonical) {
        const id = target.canonical ? 'studio/templates/web-growth/playwright.config.ts' : `studio/templates/test-scaffold/${target.template}`;
        try { content = await readFile(await resourcePath(id),'utf8'); }
        catch (error) { if (error instanceof StudioError && error.code==='RESOURCE_MISSING') { files.push({path:target.path,state:'SKIPPED',reason:error.message}); need('template_resource',target.path,`Restore the installed resource ${id}; do not invent its contents`); continue; } throw error; }
        if (target.canonical) { if (testRoot!=='tests') content = content.replace("testDir: 'tests/integration'", `testDir: ${quoted(`${testRoot}/integration`)}`); }
        else content = content.replace(/@([A-Z_]+)@/g,(whole,key:string)=>tokens[key]??whole);
        if (target.template === 'godot-placeholder.txt') {
          const purpose = target.path === `${testRoot}/unit/.gdignore_placeholder`
            ? `Unit tests go here — one subdirectory per system (e.g., ${testRoot}/unit/combat/)`
            : 'Integration tests go here — one subdirectory per system';
          content = `# ${purpose}\n${content}`;
        }
      }
      if (options.dryRun) files.push({path:target.path,state:'WOULD_CREATE',sha256:hash(content)});
      else {
        await mkdir(parent,{recursive:true});
        await safePath(project,target.path); // recheck newly-created ancestors before exclusive open
        handle = await open(destination,'wx',0o644);
        await handle.writeFile(content); await handle.sync(); await handle.close(); handle = undefined;
        files.push({path:target.path,state:'CREATED',sha256:hash(content)});
      }
    } catch (error) { files.push({path:target.path,state:'FAILED',reason:error instanceof Error ? error.message : 'Could not create file'}); }
    finally { if (handle) await handle.close(); }
  }
  const made = (path:string) => files.some(x=>x.path===path && ['CREATED','WOULD_CREATE'].includes(x.state));
  if (made(readme) && !version && engine!=='Web') need('engine_version',readme,'Record the actual shared project engine version; a placeholder is not an installed-version observation');
  if (engine==='Godot') {
    if (made(ci) && tokens.GODOTVER!==version) need('godot_version',ci,'Replace the full-release placeholder using the actual selected Godot release');
    if (!gdunitPresent) need('gdunit4','addons/gdUnit4/bin/GdUnitCmdTool.gd','Install and enable GdUnit4 separately; preserve the capital U. No runner was downloaded.');
  }
  if (engine==='Unity') {
    if (typeof record(unityManifest.dependencies)['com.unity.test-framework']!=='string') need('unity_test_framework','Packages/manifest.json','Add the Test Framework version supported by the actual editor; do not guess or install it here');
    if (made(ci)) need('unity_license',ci,'Repository owner must configure UNITY_LICENSE manually');
    if (files.some(x=>x.path.endsWith('.asmdef') && ['CREATED','WOULD_CREATE'].includes(x.state))) need('game_assembly_references',testRoot,'These are base test asmdefs, not proof of game-code visibility. Resolve actual game/package assembly references with the owner and update only authorized new asmdefs; if no game asmdef exists, ask before adding it and any required Editor asmdefs.');
  }
  if (engine==='Unreal') {
    if (!module) need('module',`${testRoot}/README.md`,'Choose the real game module, independently of project filename and test filter');
    if (made(ci) || made(`${testRoot}/README.md`)) {
      if (!projectName) need('project_name',ci,'Set the actual .uproject basename, not the module or test prefix');
      if (!editorTarget) need('editor_target',ci,'Replace [EditorTarget] using the actual Editor Target.cs class/target');
      if (!prefix) need('test_prefix',ci,'Set the settled Automation RunTests prefix used by the tests and commands.test');
    }
    if (module && !moduleRulesPresent) need('module_build_rules',`${testRoot}/README.md`,'The selected module has no observed Build.cs; confirm actual module compilation before claiming tests can run');
    if (projectName && !projectFilePresent) need('project_file',ci,'The named .uproject file is absent; settle the actual project before running this workflow');
    if (made(ci)) need('ue_root',ci,'Configure UE_ROOT and the actual editor on the self-hosted Windows runner');
  }
  const counts = Object.fromEntries(['CREATED','WOULD_CREATE','EXISTS','SKIPPED','FAILED'].map(state=>[state,files.filter(x=>x.state===state).length]));
  return { exitCode: counts.FAILED!>0 ? 4 : counts.SKIPPED!>0 ? 3 : 0,
    data:{project,engine,engineSelection,mode:options.dryRun?'dry-run':'write',qualityAssessed:false as const,files,needs,warnings,counts,...(web?{web}: {})} };
}
