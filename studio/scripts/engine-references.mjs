#!/usr/bin/env node
import { planEngineReferences } from '../../../dist/engine-references.js';
import { applyInstall, describePlan } from '../../../dist/install.js';
import { StudioError, failure } from '../../../dist/contract.js';
const usage = 'Usage: node <resolved-engine-references.mjs> --project ROOT [--dry-run]\nCopy the selected engine historical reference snapshot only when its project directory is absent. Existing references are preserved. No engine/version verification is performed.';
try {
  const args = process.argv.slice(2); let project, dryRun = false;
  if (args.length === 1 && ['--help', '-h'].includes(args[0])) { console.log(usage); process.exit(0); }
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--project' && project === undefined && args[i + 1] && !args[i + 1].startsWith('--')) project = args[++i];
    else if (args[i] === '--dry-run' && !dryRun) dryRun = true;
    else throw new StudioError('INVALID_ARGUMENT', usage);
  }
  if (!project) throw new StudioError('INVALID_ARGUMENT', usage);
  const { plan, ...data } = await planEngineReferences(project);
  if (!dryRun) await applyInstall(plan);
  if (!dryRun && data.outcome.state === 'planned') data.outcome.state = 'created';
  console.log(JSON.stringify({ ...data, dryRun, applied: !dryRun && plan.changes.some(x => x.before !== x.after), plan: describePlan(plan) }, null, 2));
} catch (error) {
  const result = failure('engine-references', error);
  console.log(JSON.stringify(result.result, null, 2)); process.exitCode = result.exitCode;
}
