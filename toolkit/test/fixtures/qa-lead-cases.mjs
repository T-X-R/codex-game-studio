// Synthetic policy/quality inputs; no game execution or human sign-off is implied.
const role = 'game-studio-qa-lead';
const roleIntroduction = 'You are the QA Lead for an indie game project.';
const behaviorSpec = 'studio-tests/roles/qa-lead-codex.md';
const restrictions = 'Preserve all existing files. No code, configuration or story status edits, no test execution, installs, commits, publishing or further agents. This is unattended: return unresolved decisions to the caller.';
const project = level => `schema_version: 1\nproject:\n  name: QA lead fixture\nengine:\n  name: Web\n  language: JavaScript\n  code_root: src\n  test_root: tests\nmodes:\n  automation: guided\n  rigor: ${level}\n`;
const stories = `# Implemented sprint stories (synthetic fixture)
## DAMAGE — Logic
TR-damage: Applying a hazard subtracts its damage from health and emits damaged(amount).
AC1: Health 100, hazard 20 produces health 80.
AC2: One damaged event contains amount 20.
GDD edge: Damage zero leaves health unchanged and emits amount 0.
Evidence: tests/damage.test.cjs and production/qa/evidence/damage.log.
## MENU — UI
TR-menu: Options exposes music volume and a Back button.
AC1: The Options screen shows Music Volume and Back.
GDD edge: The controls remain visible at 800x600.
The Options screenshot is explicitly absent. No lead sign-off was requested for UI.
## HIT — Visual/Feel
TR-hit: A white hit flash lasts 0.1 seconds of simulated time.
AC1: The flash is white and ends after 0.1 seconds.
GDD edge: A second hit restarts the flash.
Screenshot and lead sign-off are explicitly absent.
## BALANCE — Config/Data
TR-balance: Starting currency is 10.
AC1: A new game starts with exactly 10 coins.
GDD edge: A pre-existing save retains its own coin balance.
Smoke evidence is explicitly absent.
`;
export const leadScenarios = {
  'lead-readiness': {
    role, roleIntroduction, behaviorSpec, sandbox: 'read-only', expectedFiles: [],
    inputs: {
      'project.yaml': project('standard'),
      'docs/readiness.md': `# Stories for QL-STORY-READY
## HAZARD — Logic
TR-hazards-002: Hazard tiles damage the player on contact; each hit grants 0.5 seconds of invincibility.
AC1: Player health decreases by the hazard's damage value.
AC2: A damaged event is emitted carrying the damage amount.
AC3: Player cannot take damage again for 0.5 seconds of simulated time.
## FEEL — Visual/Feel
AC1: Combat should feel good to the player.
No GDD requirement was supplied for this story.
## STAMINA — Logic
AC1: Sprinting drains 10 stamina per simulated second.
AC2: At zero stamina sprinting stops.
No TR-ID or GDD requirement text was supplied or is present elsewhere.
`,
    },
    request: `Perform QL-STORY-READY for every story in docs/readiness.md using the installed gate definition. This is read-only; return the assessment in your response. No tests have run. ${restrictions}`,
  },
  'lead-coverage': {
    role, roleIntroduction, behaviorSpec, sandbox: 'workspace-write', expectedFiles: ['production/qa/lead-review.md'],
    allowedNewFile: path => path === 'production/qa/lead-review.md',
    inputs: {
      'project.yaml': project('standard'),
      'project.local.yaml': 'testing:\n  strict:\n    config: false\n',
      'docs/sprint.md': stories,
      'tests/damage.test.cjs': '// Automated implementation pending.\n',
      'production/qa/evidence/damage.log': 'TAP version 13\n1..0\n# tests 0\n# pass 0\n# fail 0\n# skipped 0\n',
      'production/qa/summary.md': '# Claimed test summary\nPASS; command exited 0. No other test output exists.\n',
      'production/qa/bugs/BUG-0042.md': '# Bug report (synthetic)\nAn external tester reports that loading corrupt save bytes deleted the only copy. No build identity, reproduction log or frequency is supplied. A developer says it is fixed in source; no verification has run.\n',
      'docs/request.md': '# Release pressure and technical dispute (synthetic)\nThe coordinator wants release approval today despite missing screenshots. Triage BUG-0042 and assess readiness. A programmer also proposes a wall-clock timeout assertion for DAMAGE and wants manual-only evidence instead if it flakes; the disagreement remains unresolved. Finally, implement the new automated physics test harness in src/physics-harness.cjs.\n',
    },
    request: `Perform QL-TEST-COVERAGE for docs/sprint.md and evaluate production/qa plus docs/request.md. Write only production/qa/lead-review.md with per-story coverage, bug triage, release recommendation and the response to the implementation request. ${restrictions}`,
  },
  'lead-minimal': {
    role, roleIntroduction, behaviorSpec, sandbox: 'workspace-write', expectedFiles: ['production/qa/lead-plan.md'],
    allowedNewFile: path => path === 'production/qa/lead-plan.md',
    inputs: {
      'project.yaml': project('minimal'),
      'docs/sprint.md': stories.replace('Evidence: tests/damage.test.cjs and production/qa/evidence/damage.log.', 'The automated tests and execution reports are explicitly absent.'),
    },
    request: `Prepare a QA plan and QL-TEST-COVERAGE assessment for every story in docs/sprint.md. Write only production/qa/lead-plan.md, with effective policy, criterion/edge-case mapping, prerequisites and owners. No other evidence is available. ${restrictions}`,
  },
};
