import test from 'node:test';
import assert from 'node:assert/strict';
import { assertStoryHistory } from './story-done-host.mjs';
import { storyDoneScenarios, targetStory } from './fixtures/story-done-cases.mjs';
// Exact original input and resulting story from native xsKS6w, retained here as
// regression data. This does not turn the helper into a semantic AC evaluator.
const original = "# Story 002: Static shop panel\n> **Status**: In Progress\n> **Type**: UI\n> **Requirement**: Brief MVP feature 2\n> **Estimate**: S\n> **Dependencies**: None\n\n## Acceptance Criteria\n- [ ] The shop panel shows all six item slots inside the frame.\n- [ ] Each visible item slot shows its authored price in coins.\n\n## Test Evidence\nA retained screenshot of the one touched screen is expected at production/qa/evidence/story-002-shop-panel/screenshot.png.\nNo human play session, motion check or visual sign-off is claimed.\n\n## Files\n- src/shop/index.html\n- src/shop/data.js\n\n## Out of Scope\nPurchasing, submission, gameplay state, input handling, animations and audio.\n\n## Performance\nNo performance impact expected beyond one static render of six small DOM cards;\nthere is no per-frame loop or physics work. This is an expectation, not a benchmark.\n\n## Completion Notes\nHistorical draft attempt only, not a completed assessment.\nKEEP-STORY-HISTORY: owner annotations must remain exactly as written.\n";
const observed = "# Story 002: Static shop panel\n> **Status**: Complete\n> **Last Updated**: 2026-11-13\n> **Type**: UI\n> **Requirement**: Brief MVP feature 2\n> **Estimate**: S\n> **Dependencies**: None\n\n## Acceptance Criteria\n- [x] The shop panel shows all six item slots inside the frame.\n- [x] Each visible item slot shows its authored price in coins.\n\n## Test Evidence\nA retained screenshot of the one touched screen is expected at production/qa/evidence/story-002-shop-panel/screenshot.png.\nNo human play session, motion check or visual sign-off is claimed.\n\n## Files\n- src/shop/index.html\n- src/shop/data.js\n\n## Out of Scope\nPurchasing, submission, gameplay state, input handling, animations and audio.\n\n## Performance\nNo performance impact expected beyond one static render of six small DOM cards;\nthere is no per-frame loop or physics work. This is an expectation, not a benchmark.\n\n## Completion Notes\nHistorical draft attempt only, not a completed assessment.\nKEEP-STORY-HISTORY: owner annotations must remain exactly as written.\n\n### Completion assessment \u2014 2026-11-13\n\n- Completion date: 2026-11-13. Verdict: COMPLETE; 2/2 acceptance criteria passing, 0 deferred, 0 untested and 0 unknown.\n- AC-1: PASS / COVERED \u2014 opened production/qa/evidence/story-002-shop-panel/screenshot.png and observed all six complete cards inside the captured frame in two rows of three; src/shop/index.html renders the six ITEM_ROWS from src/shop/data.js.\n- AC-2: PASS / COVERED \u2014 the same image shows Item 1 through Item 6 with Price: 1 coins through Price: 6 coins, matching src/shop/data.js and data/authored-prices.json.\n- Test Evidence: UI retained screenshot required and present for the one touched screen at the path above. Logic/integration test execution and Config/Data smoke evidence waived under qa.level: minimal. Visual/Feel sign-off is not required for Type: UI. No tests, game launch or new capture performed during this assessment.\n- Freshness: review-receipts check of production/qa/evidence/story-002-shop-panel/stamp.txt reports UNCHANGED for src/shop/index.html and src/shop/data.js.\n- Run result: OBSERVED \u2014 reviewer opened the retained automated browser image. The existing report.json records exitCode 0, replayComplete true and no uncaught exceptions. This verifies the static display at the captured viewport; no human play acceptance, motion check or performance benchmark is claimed.\n- Same-seed run: not applicable; no completed prototype-growth artifacts found. The retained seed-7 capture alone is not a post-growth comparison.\n- Deviations: NONE. No control manifest found. General GDD/ADR prerequisites waived by the minimal workflow. Authored prices are static content; COPY owns the localizable display strings, and the renderer substitutes values without mutating ITEM_ROWS.\n- Scope: the only uncommitted code/test change is the declared src/shop/index.html. Existing non-code owner-note, session and evidence changes were excluded from that comparison and preserved.\n- Calls beyond the design: none beyond the design, after reading src/shop/index.html, src/shop/data.js and design/game-brief.md, Approved shop presentation; all player-visible wording and layout values are specified there.\n- Review: QL and LP gates skipped under modes.review_mode: solo. Reviewed by: self, no independent review.\n- Closure authorized by the user's conditional close request; no risk override or debt logging. Companion synchronization covers only Brief MVP feature 2, this story's exact EPIC.md row and production/sprint-status.yaml entry, plus the session checkpoint.\n";
const passing = storyDoneScenarios['minimal-ui-close'].passingCriteria;
const close = before => before.replace('> **Status**: In Progress', '> **Status**: Complete\n> **Last Updated**: 2026-11-13') + '\n## Completion assessment\nRecorded result.\n';
const mark = (text, index) => { let n = -1; return text.replace(/^- \[ \] .+$/gm, line => ++n === index ? line.replace('[ ]', '[x]') : line); };

test('actual xsKS6w verified AC markings preserve original criteria and history', () => {
  assert.equal(original, storyDoneScenarios['minimal-ui-close'].inputs[targetStory]);
  assert.deepEqual(passing, [0, 1]);
  assert.doesNotThrow(() => assertStoryHistory(original, observed, passing));
});
test('original unmarked closure remains allowed; individual verified marking is optional', () => {
  assert.doesNotThrow(() => assertStoryHistory(original, close(original), passing));
  assert.doesNotThrow(() => assertStoryHistory(original, mark(close(original), 0), passing));
});
test('adverse closure may mark only the independently passing price criterion', () => {
  const fixture = storyDoneScenarios['explicit-adverse-close'], before = fixture.inputs[targetStory];
  assert.deepEqual(fixture.passingCriteria, [1]);
  assert.doesNotThrow(() => assertStoryHistory(before, mark(close(before), 1), fixture.passingCriteria));
  for (const index of [0, 2]) assert.throws(() => assertStoryHistory(before, mark(close(before), index), fixture.passingCriteria));
});
test('criterion wording or ordering changes are rejected', () => {
  assert.throws(() => assertStoryHistory(original, observed.replace('all six item slots', 'all five item slots'), passing));
  const lines = observed.split('\n'), index = lines.indexOf('## Acceptance Criteria');
  [lines[index + 1], lines[index + 2]] = [lines[index + 2], lines[index + 1]];
  assert.throws(() => assertStoryHistory(original, lines.join('\n'), passing));
});
test('history and checkboxes outside the sole AC section remain byte exact', () => {
  assert.throws(() => assertStoryHistory(original, observed.replace('KEEP-STORY-HISTORY', 'REMOVED-STORY-HISTORY'), passing));
  const before = original + '\n## Other checklist\n- [ ] Preserve this unrelated checkbox.\n';
  assert.throws(() => assertStoryHistory(before, close(before).replace('- [ ] Preserve', '- [x] Preserve'), passing));
  assert.throws(() => assertStoryHistory(original, observed, []));
});
test('duplicate AC headings and out-of-range pass indexes cannot broaden normalization', () => {
  const before = original + '\n## Acceptance Criteria\n- [ ] Different section.\n';
  assert.throws(() => assertStoryHistory(before, close(before), passing));
  assert.throws(() => assertStoryHistory(original, close(original), [99]));
});
