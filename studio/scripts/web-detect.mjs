#!/usr/bin/env node
import { detectWeb, formatWebDetection } from '../../../dist/web-detect.js';
const usage = `Read-only Web project observations; qualityAssessed is always false.
Usage: node <resolved-web-detect.mjs> --project ROOT [--pm npm|pnpm|yarn|bun] [--text]
JSON is the default; --text emits the source observation TSV rows.
No install, process execution, configuration change or file write is performed.
Declared ranges are not exact versions; installed metadata has separate provenance.
Incomplete scans and skipped links are diagnostics, not clean absence or approval.
Limits: 20,000 entries, depth 32, 1 MiB per file, 16 MiB source reads.
Exit: 0 observed (inspect diagnostics/scan.complete); 1 read/JSON error;
2 usage; 3 absent package.json; 4 unsafe metadata path.`;
let text = false;
try {
  const args = process.argv.slice(2); let project, packageManager;
  if (args.length === 1 && ['--help', '-h'].includes(args[0])) { console.log(usage); process.exit(0); }
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--project' || args[i] === '--pm') {
      const flag = args[i], value = args[++i];
      if (!value || value.startsWith('--') || (flag === '--project' ? project !== undefined : packageManager !== undefined)) throw new Error(usage);
      if (flag === '--project') project = value; else packageManager = value;
    } else if (args[i] === '--text' && !text) text = true;
    else throw new Error(usage);
  }
  if (!project) throw new Error(usage);
  const result = await detectWeb(project, { packageManager });
  if (text) process.stdout.write(formatWebDetection(result.data)); else console.log(JSON.stringify(result.data, null, 2));
  process.exitCode = result.exitCode;
} catch (error) {
  if (text) console.error(`web-detect: ${error.message}`);
  else console.log(JSON.stringify({status: 'not_assessed', qualityAssessed: false, error: {code: error.code ?? 'INVALID_ARGUMENT', message: error.message}}, null, 2));
  process.exitCode = error.exitCode ?? (error.code ? 1 : 2);
}
