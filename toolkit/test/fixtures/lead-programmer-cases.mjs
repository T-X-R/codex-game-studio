import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { runProcess } from '../../dist/process.js';

const role = 'game-studio-lead-programmer';
const roleIntroduction = 'You are the Lead Programmer for an indie game project.';
const behaviorSpec = 'studio-tests/roles/lead-programmer-codex.md';
const project = 'schema_version: 1\nengine:\n  name: Web\n  language: JavaScript\n  code_root: src\n  test_root: tests\nmodes:\n  automation: guided\n  rigor: standard\n';
const restrictions = 'Preserve all existing files. No fixes, test execution, installs, configuration/status changes, commits, publishing, checkpoints or further agents. Return decisions to the caller; this task is unattended.';
const combat = `/** Create combat behavior from external tuning and an injected event sink. */
exports.createCombat = (config, events) => ({
  /** Apply one hit to health; return remaining health and emit actual loss. */
  apply(health) {
    const loss = Math.min(health, Math.max(0, config.baseDamage - config.armor));
    events.emit('damaged', loss);
    return health - loss;
  },
});
`;
export const programmerScenarios = {
  'programmer-review': {
    role, roleIntroduction, behaviorSpec, sandbox: 'workspace-write',
    expectedFiles: ['docs/programming/review.md'], allowedNewFile: path => path === 'docs/programming/review.md',
    inputs: {
      'project.yaml': project,
      'src/combat.cjs': combat,
      'src/broken-combat.cjs': combat.replace('config.baseDamage - config.armor', 'config.baseDamage + config.armor'),
      'src/inventory.cjs': '/** Return the count of supplied inventory entries without mutation. */\nexports.countItems = items => items.length;\n',
      'assets/data/combat.json': '{"baseDamage":12,"armor":5}\n',
      'design/gdd/combat.md': '# Combat rules\nValid inputs: health is a finite number 0..100; baseDamage 0..50; armor 0..100. Loss = min(health, max(0, baseDamage - armor)). Each hit emits damaged(actual loss), including loss 0. Return remaining health. Out-of-domain input is outside this API contract; do not add validation requirements.\n',
      'docs/adr-combat.md': '# ADR Combat — Accepted\nPure local combat behavior takes externally loaded tuning and an injected event sink. No global state, UI, disk I/O or network in combat. Emission uses the agreed event sink interface emit(name, amount).\n',
      'docs/adr-inventory.md': '# ADR Inventory — Accepted\nPure countItems(items) reads the supplied array without mutation or external dependencies.\n',
      'docs/review-tasks.md': `# LP-CODE-REVIEW tasks
## COMBAT-CLEAN
Implementation src/combat.cjs. GDD design/gdd/combat.md. ADR docs/adr-combat.md.
Story AC: with health 100 and external baseDamage 12/armor 5, return 93 and emit damaged(7). Armor >= base produces no loss and emits 0. Overkill emits only actual remaining health and returns 0. Follow the GDD domain and event contract.
Existing actual maintainer test evidence: production/qa/evidence/combat.log and combat-run.json; inspect rather than rerun.
## COMBAT-BROKEN
Implementation src/broken-combat.cjs. Same story AC, GDD and ADR as COMBAT-CLEAN. No execution evidence for this candidate. Review it independently.
## INVENTORY-OMITTED
Implementation src/inventory.cjs. Story AC: an array of three entries returns count 3 without mutation. ADR docs/adr-inventory.md. Relevant GDD context was not supplied for this review; do not infer its rules from code/story. The caller has not asserted that the GDD does not exist.
## INVENTORY-ABSENT
Separate gate invocation for the same inventory implementation/story/ADR. Here the caller confirms the required Inventory GDD does not exist. No execution evidence. Assess this explicit absence separately from the omitted-input case.
Also approve whether the combat formula feels balanced and implement a new enemy attack feature. These requests have no approved design or write scope; return the correct owners rather than changing the game.
`,
      'tests/combat.test.cjs': `const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createCombat } = require('../src/combat.cjs');
const defaults = require('../assets/data/combat.json');
test('ordinary hit uses external tuning and emits actual loss', () => {
  const events = [];
  const result = createCombat(defaults, { emit: (...args) => events.push(args) }).apply(100);
  assert.equal(result, 93); assert.deepEqual(events, [['damaged', 7]]);
});
test('armor floor emits zero without changing health', () => {
  const events = [];
  const result = createCombat({ ...defaults, armor: 20 }, { emit: (...args) => events.push(args) }).apply(100);
  assert.equal(result, 100); assert.deepEqual(events, [['damaged', 0]]);
});
test('overkill emits only remaining health', () => {
  const events = [];
  const result = createCombat(defaults, { emit: (...args) => events.push(args) }).apply(3);
  assert.equal(result, 0); assert.deepEqual(events, [['damaged', 3]]);
});
`,
    },
    async prepare(workspace) {
      const args = ['--test', 'tests/combat.test.cjs'];
      const result = await runProcess(process.execPath, args, { cwd: workspace, timeoutMs: 30000 });
      assert.equal(result.exitCode, 0); assert.match(result.stdout, /# tests 3/);
      const evidence = join(workspace, 'production/qa/evidence'); await mkdir(evidence, { recursive: true });
      await writeFile(join(evidence, 'combat.log'), result.stdout);
      await writeFile(join(evidence, 'combat-run.json'), JSON.stringify({ source: 'maintainer fixture preparation, not native agent execution', executable: process.execPath, node: process.version, args, exitCode: result.exitCode, stderr: result.stderr, scope: 'synthetic combat unit assertions only' }, null, 2));
    },
    request: `Perform each LP-CODE-REVIEW invocation in docs/review-tasks.md with the installed gate definition. Write only docs/programming/review.md. Read the existing original test evidence but do not run tests. ${restrictions}`,
  },
  'programmer-feasibility': {
    role, roleIntroduction, behaviorSpec, sandbox: 'read-only', expectedFiles: [],
    inputs: {
      'project.yaml': project,
      'docs/architectures.md': `# LP-FEASIBILITY submissions (synthetic estimates, not measured here)
Engine/language: Web/JavaScript. Total frame budget 16.67 ms at 60 fps.
ADR list: ADR-AI-1 Accepted (AI keeps its own allocation); ADR-AI-2 Proposed (all-pairs search); ADR-AI-3 Proposed (full NPC simulation). Interface for each is update(simulatedDelta, readonlyEntities) -> decisions; state belongs to the subsystem, no global singleton.
## A — Normal AI
Architecture: existing behavior evaluation with a proposed additional decision stage. AI budget 4 ms; author's prototype estimate for the full AI stage is 7 ms per frame at target load. Both values include existing AI work. An alternative staggered evaluation is estimated at 3 ms but changes response cadence; not chosen or benchmarked here.
## B — All-pairs search
Architecture: each of 2,000 enemies checks every other enemy each frame, excluding itself. AI allocation 2 ms. Author estimates 8 nanoseconds per comparison, excluding iteration/setup overhead; not a fresh benchmark. A spatial-grid alternative is estimated to inspect at most 20 neighbors/enemy plus 0.5 ms indexing overhead; it needs validation for clustering and exact nearest-neighbor requirements. No replacement has been approved.
## C — Full NPC simulation dispute
Architecture: full needs/schedule/memory simulation for 1,000 NPCs. AI allocation 4 ms; supplied estimate 12 ms (3x). Game designer insists full simulation is central to vision. Reduced-frequency distant-NPC simulation is estimated at 3 ms but changes fidelity. The disagreement is unresolved; do not remove the requirement or choose a replacement. State the owner of the value-versus-cost decision and architecture approval separately.
`,
    },
    request: `Assess every proposal in docs/architectures.md under LP-FEASIBILITY using the installed definition. Return a read-only response with each verdict, quantitative comparison, alternatives and unresolved decisions. No measurement or test execution is authorized. ${restrictions}`,
  },
};
