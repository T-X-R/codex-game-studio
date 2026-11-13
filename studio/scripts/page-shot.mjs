#!/usr/bin/env node
import { pageShot, formatPageShot } from '../../../dist/page-shot.js';
import { findBrowser } from '../../../dist/capture.js';

const usage = `Capture an existing local page without injecting a game hook or starting a server.
Usage: node <resolved-page-shot.mjs> --project ROOT PAGE OUTPUT_DIRECTORY [options]
       node <resolved-page-shot.mjs> --which [--browser EXECUTABLE]
Options: --browser EXECUTABLE --query TEXT --size WxH --wait MS --timeout MS
         --profile PROJECT_DIRECTORY --software --file-access --full --once --dry-run --text
Default: 1280x720, 2000 ms page time, 60000 ms process timeout, render=cheap,
fresh temporary profile. --full omits render=cheap; --profile retains project-local browser state.
--file-access enables local modules/data for the existing build; it cannot repair /assets URLs.
JSON records all attempts, console and PNG artifacts; quality/replay are never assessed.
--which prints only the selected installed executable. No downloads or configuration changes.
Exit: 0 planned/recorded; 1 missing page; 2 usage; 3 unavailable capture;
4 path/output conflict; 124 timeout; 130 interrupted.`;
let which = false, text = false;
try {
  const args = process.argv.slice(2), positional = [], options = {}, seen = new Set();
  let project;
  if (args.length === 1 && ['--help', '-h'].includes(args[0])) { console.log(usage); process.exit(0); }
  const values = { '--browser': 'browser', '--query': 'query', '--size': 'size', '--wait': 'waitMs', '--timeout': 'timeoutMs', '--profile': 'profile' };
  const flags = { '--software': 'software', '--file-access': 'fileAccess', '--full': 'full', '--once': 'once', '--dry-run': 'dryRun' };
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (!arg.startsWith('-')) { positional.push(arg); continue; }
    if (seen.has(arg)) throw new Error(`Duplicate ${arg}\n${usage}`);
    seen.add(arg);
    if (arg === '--which') which = true;
    else if (arg === '--text') text = true;
    else if (Object.hasOwn(flags, arg)) options[flags[arg]] = true;
    else if (arg === '--project' || Object.hasOwn(values, arg)) {
      const value = args[++i];
      if (value === undefined || (value === '' && arg !== '--query') || value.startsWith('--')) throw new Error(`Missing ${arg} value\n${usage}`);
      if (arg === '--project') project = value;
      else options[values[arg]] = ['--wait', '--timeout'].includes(arg) ? Number(value) : value;
    } else throw new Error(`Unknown ${arg}\n${usage}`);
  }
  if (which) {
    if (project || positional.length || [...seen].some(flag => !['--which', '--browser'].includes(flag))) throw new Error(usage);
    console.log(await findBrowser(options.browser));
  } else {
    if (!project || positional.length !== 2) throw new Error(usage);
    const result = await pageShot(project, positional[0], positional[1], options);
    if (text) process.stdout.write(formatPageShot(result)); else console.log(JSON.stringify(result, null, 2));
    process.exitCode = result.exitCode;
  }
} catch (error) {
  if (which || text) console.error(error.message);
  else console.log(JSON.stringify({ status: 'not_assessed', qualityAssessed: false, replayAssessed: false,
    error: { code: error.code ?? 'INVALID_ARGUMENT', message: error.message } }, null, 2));
  process.exitCode = error.exitCode ?? (error.code ? 1 : 2);
}
