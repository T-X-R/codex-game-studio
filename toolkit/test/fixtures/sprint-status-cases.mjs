// Raw project fixtures only. Expected observations live in the acceptance spec.
const asOf = new Date().toISOString().slice(0, 10);
const day = offset => new Date(Date.parse(`${asOf}T00:00:00Z`) + offset * 86400000).toISOString().slice(0, 10);
const path = number => `production/epics/core/story-${String(number).padStart(3, '0')}.md`;
const config = 'engine:\n  name: Web\n';
const request = `Use $game-studio-sprint-status to tell me how the sprint is going as of ${asOf}. Keep this read-only and offline.`;
const plan = (number, rows, start = day(-13), end = day(7)) => `# Sprint ${number}\nGoal: Complete the parcel round\nStart: ${start}\nEnd: ${end}\n\n| Story / Task | Priority | Owner | Estimate |\n|---|---|---|---|\n${rows.map(row => `| ${row.file ? `[${row.name}](${row.file})` : row.name} | ${row.priority ?? ''} | ${row.owner ?? ''} | 1 day |`).join('\n')}\n`;
function sprint(rows, { start = day(-13), end = day(7), number = 4, yaml = true } = {}) {
  const inputs = { 'project.yaml': config, [`production/sprints/sprint-${String(number).padStart(3, '0')}.md`]: plan(number, rows, start, end) };
  if (yaml) inputs['production/sprint-status.yaml'] = `sprint: ${number}\ngoal: Complete the parcel round\n${start ? `start: '${start}'\n` : ''}${end ? `end: '${end}'\n` : ''}stories:\n${rows.map(row => `  - id: '${row.id}'\n    name: ${JSON.stringify(row.name)}\n${row.file ? `    file: ${JSON.stringify(row.file)}\n` : ''}    priority: ${row.priority ?? 'should-have'}\n    status: ${row.status}\n    owner: ${JSON.stringify(row.owner ?? 'Tess')}\n    blocker: ${JSON.stringify(row.blocker ?? '')}\n    estimate_days: 1`).join('\n')}\n`;
  const statuses = { done: 'Complete', 'in-progress': 'In Progress', blocked: 'Blocked', backlog: 'Not Started', 'ready-for-dev': 'Ready', review: 'In Review' };
  for (const row of rows) if (row.file && !row.missing) inputs[row.file] = `# ${row.name}\nStatus: ${row.markdownStatus ?? statuses[row.status] ?? row.status}\n${row.updated === null ? '' : `> **${row.dateLabel ?? 'Last Updated'}**: ${row.updated ?? day(-1)}\n`}${row.blocker ? `BLOCKED: ${row.blocker}\n` : ''}`;
  return { asOf, request, inputs };
}
const row = (id, status, extra = {}) => ({ id: `1-${id}`, name: `Parcel step ${id}`, file: path(id), status, priority: id <= 3 ? 'must-have' : 'should-have', ...extra });
function minimal(states) {
  const inputs = { 'project.yaml': config, 'design/game-brief.md': '# Parcel Round\n## Features\n- [ ] Complete a round\n' };
  states.forEach((status, index) => { inputs[path(index + 1)] = `# Parcel step ${index + 1}\n${status === null ? '' : `Status: ${status}\n`}${status === 'Blocked' ? 'BLOCKED: waiting on the dash animation\n' : ''}`; });
  return { asOf, request, inputs };
}
const mixed = sprint([row(1, 'done'), row(2, 'done'), row(3, 'blocked', { blocker: 'Waiting on physics ADR acceptance' }), row(4, 'done'), row(5, 'in-progress'), row(6, 'in-progress')]);
const stale = sprint([row(1, 'done'), row(2, 'done'), row(3, 'in-progress', { updated: day(-6) }), row(4, 'in-progress', { updated: day(-3) })], { start: day(-5), end: day(5) });
const complete = sprint(Array.from({ length: 5 }, (_, index) => row(index + 1, 'done')), { start: day(-5), end: day(5) });
const noGate = sprint([row(1, 'done'), row(2, 'done'), row(3, 'in-progress'), row(4, 'in-progress')], { start: day(-5), end: day(5) });
noGate.inputs['project.yaml'] += 'modes:\n  review_mode: full\n';
const noDates = sprint([row(1, 'done'), row(2, 'in-progress', { updated: day(-8) })], { start: '', end: '' });
const markdown = sprint([row(1, 'done'), row(2, 'in-progress'), row(3, 'backlog', { missing: true }), row(4, 'backlog', { file: null, name: 'Inline task — NOT STARTED' })], { yaml: false });
const explicit = sprint([row(1, 'done'), row(2, 'in-progress')], { number: 3, start: day(-5), end: day(5) });
explicit.inputs['production/sprints/sprint-3.md'] = explicit.inputs['production/sprints/sprint-003.md'];
delete explicit.inputs['production/sprints/sprint-003.md'];
explicit.inputs['production/sprints/sprint-009.md'] = '# Sprint 9\nGoal: A different sprint\n';
explicit.request = `Use $game-studio-sprint-status for sprint 3 as of ${asOf}. Read-only, offline.`;
const current = structuredClone(mixed);
current.inputs['production/sprints/sprint-099.md'] = '# Sprint 99\nGoal: Old archived plan\n';
current.mtimes = { 'production/sprints/sprint-004.md': `${day(-1)}T12:00:00Z`, 'production/sprints/sprint-099.md': `${day(-10)}T12:00:00Z` };
const dateVariants = sprint([row(1, 'done'), row(2, 'in-progress', { updated: day(-4) }),
  row(3, 'in-progress', { updated: day(-5), dateLabel: 'Updated' }), row(4, 'in-progress', { updated: day(-9), dateLabel: 'last-updated' }),
  row(5, 'in-progress', { updated: null }), row(6, 'in-progress', { file: null }),
  row(7, 'in-progress', { updated: day(1), dateLabel: 'updated_at' })], { start: day(-1), end: day(9) });
const yamlConflict = sprint([row(1, 'in-progress', { markdownStatus: 'Complete' }), row(2, 'done', { markdownStatus: 'Not Started' }), row(3, 'review'), row(4, 'parked')]);
const malformed = structuredClone(mixed); malformed.inputs['production/sprint-status.yaml'] = 'stories: [broken\n';
const mismatch = structuredClone(explicit); mismatch.inputs['production/sprint-status.yaml'] = mixed.inputs['production/sprint-status.yaml'];
const noHelper = minimal(['Ready']); noHelper.removeResources = ['studio/scripts/story-status.mjs'];
const missing = sprint([row(1, 'done'), row(2, 'in-progress', { missing: true }), row(3, 'blocked', { missing: true, blocker: 'Waiting for source files' })]);
const gapRows = [row(1, 'done'), row(2, 'done'), row(3, 'backlog'), row(4, 'backlog')];
export const sprintStatusScenarios = {
  'source-01-mixed': mixed,
  'source-02-complete': complete,
  'must-haves-complete': sprint([row(1, 'done'), row(2, 'done'), row(3, 'done'), row(4, 'backlog'), row(5, 'backlog')], { start: day(-5), end: day(5) }),
  'source-03-no-sprint': { asOf, request, inputs: { 'project.yaml': `${config}modes:\n  workflow: standard\n` } },
  'source-04-stale': stale,
  'source-05-no-gates': noGate,
  'source-06-minimal': minimal(['Complete', 'In Progress', 'In Review', 'Ready']),
  'source-07-blocked': minimal(['Complete', 'Done', 'Blocked', 'Draft']),
  'minimal-complete': minimal(['Complete', 'Done']),
  'minimal-empty': minimal([]),
  'minimal-unknown': minimal(['Draft', null]),
  'markdown-fallback': markdown,
  'no-dates': noDates,
  'explicit-number': explicit,
  'mtime-current': current,
  'timestamp-boundaries': dateVariants,
  'gap-ten-and-forty-percent': sprint(gapRows, { start: day(-6), end: day(4) }),
  'gap-twenty-five': sprint(gapRows, { start: day(-15), end: day(5) }),
  'behind-stale': sprint([row(1, 'done'), row(2, 'in-progress', { updated: day(-7) }), row(3, 'backlog'), row(4, 'backlog')], { start: day(-8), end: day(2) }),
  'yaml-conflict-and-unknown': yamlConflict,
  'malformed-yaml': malformed,
  'mismatched-yaml': mismatch,
  'missing-files': missing,
  'full-table': sprint(Array.from({ length: 52 }, (_, index) => row(index + 1, 'done'))),
  'helper-unavailable': noHelper,
  'zero-interval': sprint([row(1, 'done')], { start: asOf, end: asOf }),
};
