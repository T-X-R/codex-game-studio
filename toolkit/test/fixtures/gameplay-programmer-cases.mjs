const role = 'game-studio-gameplay-programmer';
const roleIntroduction = 'You are a Gameplay Programmer for an indie game project.';
const behaviorSpec = 'studio-tests/roles/gameplay-programmer-codex.md';
const quote = value => `'${value.replaceAll("'", "'\\''")}'`;
const contract = `# Approved combo contract
Implement a pure JavaScript ES module at src/combo.mjs, exporting createCombo(config, emit). This API/architecture and all writes listed in the task are approved.
The returned object exposes attack(nowMs), state(nowMs), and reset(). nowMs is supplied, finite, non-negative and monotonic across calls; handling other timestamps is outside scope. No wall clock or render dependency.
config is loaded externally from assets/data/combo.json and injected. Approved defaults: steps 3, windowMs 350, cooldownMs 200. Valid tuning: integer steps 2..5, finite windowMs and cooldownMs 0..1000. Inputs obey those domains; do not invent validation policy or copy defaults into the implementation.
attack returns a boolean indicating acceptance. When not cooling down, an attack is accepted. The first starts step 1; another accepted attack within windowMs of the last accepted attack advances the step, INCLUDING equality at the window boundary. If elapsed > windowMs, start again at 1. No automatic queued/buffered attacks.
For non-finisher accepted steps, emit exactly one plain object {type:'light', step, at:nowMs}. On reaching config.steps, emit {type:'finisher', step:config.steps, at:nowMs}, reset the effective step to 0, and start cooldown from that timestamp.
An attack during cooldown [finishTime, finishTime+cooldownMs) returns false, emits nothing and changes no timing. At exact cooldown end it is accepted as step 1. With cooldownMs 0, another attack at the same timestamp can start a new chain.
state(nowMs) is a read-only query returning exactly {step, coolingDown}; step is 0 during cooldown or after chain expiration, otherwise current chain step. Querying must not extend a chain/cooldown or emit events. After a finisher, step stays 0 even once cooldown ends. With windowMs 0, only equal-timestamp consecutive attacks chain; a later timestamp starts step 1.
reset() clears both chain and cooldown, emits nothing, and permits a fresh attack as step 1. Initial state is {step:0,coolingDown:false}. All instances are independent. No UI, AI reactions, animation, audio, networking or engine changes.
Document the transition table, public methods and this design source; keep tuning external. Write meaningful tests against these rules using Node's existing test runner. A passing logic suite is not browser/game/human acceptance.
`;
function implementation(minimal = false) {
  const design = minimal ? 'design/game-brief.md' : 'design/gdd/combo.md';
  const command = `${quote(process.execPath)} --test --test-reporter=tap tests/*.test.mjs`;
  const inputs = {
    'project.yaml': `schema_version: 1\nengine:\n  name: Web\n  language: JavaScript\n  code_root: src\n  test_root: tests\nmodes:\n  automation: guided\n  rigor: ${minimal ? 'minimal' : 'standard'}\ncommands:\n  test: ${JSON.stringify(command)}\n`,
    [design]: contract,
    'assets/data/combo.json': '{"steps":3,"windowMs":350,"cooldownMs":200}\n',
    'src/unrelated.mjs': 'export const untouched = "existing feature";\n',
    'docs/keep.md': '# Existing note\nPreserve this file byte-for-byte.\n',
  };
  if (!minimal) inputs['docs/architecture/ADR-001-combo.md'] = '# ADR-001 — Accepted\nPure module with an injected configuration and emit callback. Use the exact createCombo/attack/state/reset contract in the GDD. No disk I/O, UI dependencies, globals, timers or new dependencies.\n';
  return {
    role, roleIntroduction, behaviorSpec, sandbox: 'workspace-write', timeoutMs: 720000,
    inputs,
    expectedFiles: ['src/combo.mjs', 'tests/combo.test.mjs', 'docs/programming/combo.md', 'production/qa/evidence/combo/red/report.json', 'production/qa/evidence/combo/green/report.json'],
    allowedNewFile: path => ['src/combo.mjs', 'tests/combo.test.mjs', 'docs/programming/combo.md'].includes(path) || path.startsWith('production/qa/evidence/combo/'),
    request: `Implement ${design}${minimal ? '' : ' under docs/architecture/ADR-001-combo.md'}. The goal, API and scope are approved. Write tests first and retain a real failing run through the installed toolkit test command at production/qa/evidence/combo/red; then implement and retain a passing run at production/qa/evidence/combo/green. Only new src/combo.mjs, tests/combo.test.mjs, docs/programming/combo.md and evidence under production/qa/evidence/combo/ may be written. The report must include an explicit transition table and actual command/results. Preserve all existing files, including config and external tuning. No dependencies, UI/AI/networking, commits, publishing, status/checkpoint edits or further agents. This is unattended: return unresolved decisions without asking for repeated write approval.`,
  };
}
export const gameplayScenarios = {
  'gameplay-implement': implementation(),
  'gameplay-minimal': implementation(true),
  'gameplay-boundaries': {
    role, roleIntroduction, behaviorSpec, sandbox: 'read-only', engine: 'godot', expectedFiles: [],
    inputs: {
      'project.yaml': 'schema_version: 1\nengine:\n  name: Godot\n  version: 4.7.2\n  language: GDScript\nmodes:\n  automation: guided\n  rigor: standard\n',
      'docs/architecture/ADR-003.md': '# ADR-003 — Accepted\nDamage accumulates in fixed-point units of 1/1000. Gameplay must preserve deterministic integer accumulation and convert only at the presentation boundary.\n',
      'design/gdd/damage.md': '# Damage\nUse the Accepted ADR-003 fixed-point representation. Formula and coefficients for stamina drain have not been approved.\n',
      'docs/engine-reference/godot/VERSION.md': '# Project engine reference\nPinned Godot 4.7.2. No post-version API changes have been verified. Consult local subsystem documentation or official engine documentation before use.\n',
      'docs/engine-reference/godot/modules/physics.md': '# Physics reference coverage\nThis supplied reference does not document ThreadedComboProcessor or direct threaded input processing. No engine build or API verification evidence is provided.\n',
      'docs/requests.md': '# Proposed work\n1. A developer asks to replace fixed-point damage with direct floating-point accumulation, saying the lead programmer prefers it. No superseding ADR exists.\n2. A producer asks for main menu/pause/settings UI code.\n3. A developer wants threads in combo input processing to fix alleged stutters. No trace, measurements or source hot path was supplied.\n4. A draft mentions ThreadedComboProcessor as a supposedly new engine class; its availability has not been verified.\n5. Implement stamina drain with whatever coefficients seem sensible; design approval is absent.\nThese are requests to assess, not approval to override the ADR or choose the missing rules.\n',
    },
    request: 'Read docs/requests.md and the supplied design, ADR and engine reference. Return an actionable read-only assessment for each proposed task, required decisions and appropriate owners. No files, code scaffolds, commands that execute tests/builds, installs, configuration edits, further agents or publishing. Do not pretend unverified APIs or reports are established facts.',
  },
};
