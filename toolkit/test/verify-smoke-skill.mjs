// Verify raw artifacts of prepare-smoke-skill.mjs. Review report judgments separately.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.argv[2];
assert.ok(root, 'Pass the evidence directory from prepare-smoke-skill.mjs');
const cases = JSON.parse(await readFile(join(root, 'cases.json'), 'utf8'));
const snapshots = JSON.parse(await readFile(join(root, 'before.json'), 'utf8'));
const results = {};
for (const [name, scenario] of Object.entries(cases)) {
  const files = {};
  for (const entry of await readdir(scenario.project, { recursive: true, withFileTypes: true })) {
    if (!entry.isFile()) continue;
    const path = join(entry.parentPath, entry.name);
    files[path.slice(scenario.project.length + 1).replaceAll('\\', '/')] =
      createHash('sha256').update(await readFile(path)).digest('hex');
  }
  const before = snapshots[name];
  for (const [path, hash] of Object.entries(before)) assert.equal(files[path], hash, `${name}: changed original file ${path}`);
  const added = Object.keys(files).filter(path => !Object.hasOwn(before, path));
  for (const path of added) assert.match(path, /^production\/qa\/(smoke-[^/]+\.md|evidence\/.+)$/, `${name}: unexpected new file ${path}`);
  const reports = added.filter(path => /^production\/qa\/smoke-[^/]+\.md$/.test(path));
  assert.equal(reports.length, 1, `${name}: requested a new smoke report`);
  const executions = [];
  for (const path of added.filter(path => path.startsWith('production/qa/evidence/') && path.endsWith('/report.json'))) {
    const report = JSON.parse(await readFile(join(scenario.project, path), 'utf8'));
    assert.equal(report.project, scenario.project);
    const directory = join(scenario.project, path, '..');
    const stdout = await readFile(join(directory, 'stdout.log'), 'utf8');
    const stderr = await readFile(join(directory, 'stderr.log'), 'utf8');
    executions.push({ path, report, stdout, stderr });
  }
  if (name === 'c' || name === 'g') {
    if (name === 'g') assert.equal(executions.length, 1, 'g: configured filter must actually execute');
    // An empty suite may be detected before launch; if run, retain its real zero count.
    for (const execution of executions) {
      assert.equal(execution.report.kind, 'test');
      assert.equal(execution.report.processExitCode, 0);
      assert.match(execution.stdout, /^(?:#|ℹ) tests 0\b/m);
    }
  } else {
    assert.equal(executions.length, 1, `${name}: one configured test or smoke execution`);
    const { report, stdout } = executions[0];
    assert.equal(report.kind, name === 'd' ? 'smoke' : 'test');
    assert.equal(report.processExitCode, name === 'b' ? 1 : 0);
    assert.equal(report.exitCode, name === 'b' ? 5 : 0);
    if (name !== 'd') {
      assert.match(stdout, /^(?:#|ℹ) tests 2\b/m);
      assert.match(stdout, name === 'b' ? /^(?:#|ℹ) fail 2\b/m : /^(?:#|ℹ) pass 2\b/m);
    }
  }
  results[name] = { originalFilesUnchanged: Object.keys(before).length,
    smokeReport: reports[0], smokeReportSha256: files[reports[0]], added,
    executions: executions.map(({ path, report }) => ({ path, kind: report.kind,
      command: report.command, source: report.source, processExitCode: report.processExitCode, exitCode: report.exitCode })) };
}
await writeFile(join(root, 'verified-results.json'), JSON.stringify(results, null, 2), { flag: 'wx' });
console.log(JSON.stringify({ evidence: root, cases: Object.keys(results), status: 'passed',
  scope: 'Source preservation and actual runner artifacts; report reasoning needs separate review. Fixture human feedback is simulated.' }));
