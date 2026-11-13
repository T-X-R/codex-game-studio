#!/usr/bin/env node
import { scaffoldTests } from '../../../dist/test-scaffold.js';
import { StudioError, failure } from '../../../dist/contract.js';
const usage = 'Usage: node <resolved-test-scaffold.mjs> --project ROOT ENGINE [--dry-run|--list] [--module NAME] [--project-name NAME] [--test-prefix PREFIX] [--date YYYY-MM-DD]\nFill missing test infrastructure only. No dependencies, engine, browser or CI are run. ENGINE: godot|unity|unreal|web. --list prints paths only; other output is JSON.';
try {
  const args = process.argv.slice(2), options = {}, seen = new Set(); let project, engine;
  if (args.length === 1 && ['--help','-h'].includes(args[0])) { console.log(usage); process.exit(0); }
  const values = {'--project':'project','--module':'module','--project-name':'projectName','--test-prefix':'testPrefix','--date':'date'};
  for (let i=0;i<args.length;i++) {
    const arg=args[i];
    if (Object.hasOwn(values,arg)) {
      if (seen.has(arg) || !args[i+1] || args[i+1].startsWith('--')) throw new StudioError('INVALID_ARGUMENT',usage);
      seen.add(arg); const value=args[++i];
      if (arg==='--project') project=value; else options[values[arg]]=value;
    } else if (arg==='--dry-run' || arg==='--list') {
      if (seen.has(arg)) throw new StudioError('INVALID_ARGUMENT',usage); seen.add(arg); options[arg==='--list'?'list':'dryRun']=true;
    } else if (!arg.startsWith('-') && engine===undefined) engine=arg;
    else throw new StudioError('INVALID_ARGUMENT',usage);
  }
  if (!project || !engine) throw new StudioError('INVALID_ARGUMENT',usage);
  const {data,exitCode}=await scaffoldTests(project,engine,options);
  console.log(options.list ? data.paths.join('\n') : JSON.stringify(data,null,2)); process.exitCode=exitCode;
} catch(error) { const result=failure('test-scaffold',error); console.log(JSON.stringify(result.result,null,2)); process.exitCode=result.exitCode; }
