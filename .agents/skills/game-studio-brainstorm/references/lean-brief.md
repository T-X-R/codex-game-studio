# Lean brief flow

Keep this to a few exchanges. Do not load the full-concept reference at minimal
workflow, ask its discovery battery, run director gates or write a full GDD.

## Choose or resume

Use the user's hint, or one short open question if absent. For a new direction,
propose 2–3 one-line concepts (verb-first or genre/theme mashup), then let the user
pick or combine. A previously confirmed choice is already an answer; do not
restart ideation. If `design/game-brief.md` exists, read and refine it rather
than replace its history. `In your words` is append-only.

With engine unset/empty or Web, the pick is normally the only creative question
in this workflow: write nothing and offer `$game-studio-prototype` with their
chosen concept and exact hint. Say `Verdict: COMPLETE — concept picked; the
prototype workflow will write the brief.` Formalize a brief here only when the
user explicitly asks to write it down, formalize it first or revise an existing
brief. Do not start a build unless it is already part of the user's request.

## Shape the brief

Resolve and read the template:

```sh
node .game-studio/run.cjs resource path studio/templates/game-brief.md --json
```

Fill several fields per exchange. Keep the result to one page apart from the
user's verbatim text, with the template's English field names:

- In your words: the hint, descriptions, selections and later changes exactly as
  written. Capture statements about the game; tooling paths and task execution
  permissions are not game-design input. Keep execution-only restrictions out of
  the game's Out of scope. Your generated concept text is not a user quote. If they only picked
  an option, preserve their hint and selection, not an invented endorsement.
- Working title and excited one-line pitch; genre, controls and look/audio.
- Prototype question, distinguishing hooks, 2–4 step core loop, goal/fail state.
- Features: at most seven unchecked `[ ]` items. If more are requested, explain
  the scope problem and propose cuts that leave the core loop intact. Cuts are
  consequential decisions: do not silently discard a feature. Put agreed cuts
  in Out of scope and preserve named systems and their slice/thin-stand-in/later
  dispositions when supplied.
- Avoid: every rejected/removal constraint in the user's words. No guess,
  reference or default may undo it. Keep is empty before actual play feedback;
  preserve existing Keep observations on resume.
- Build order: least-proven/core-fun risk first. Intent comes only from the
  user's words or named reference; otherwise leave it empty.
- First minute, challenge, look/references, kill condition, audience/feeling and
  loved/disliked games follow the template. Offer optional details without an
  exhaustive questionnaire. Do not infer a required game-over from a toy or a
  stated no-failure intent.

Mark unspecified suggestions *(guessed)*; mark a delegated "you pick" choice
*(provisional)*. Preserve explicit input unmarked. `docs.density` controls depth:
terse bullets, balanced brief rationale, thorough alternatives within this tier's
one-page constraint. Do not expand minimal work into a full concept document.

## Save and hand off

Show the complete proposed brief. Resolve any still-open creative/scope decisions.
In guided mode, an existing request to write/refine the brief authorizes the
routine save; do not add another per-file permission loop. Without write scope,
ask whether to save or revise. Collaborative mode reviews the draft before saving.
On revision, show the changed field before/after, then apply the authorized change.
Write only `design/game-brief.md`; report if no file was written.

For unset/Web engine, recommend the installed prototype workflow as the next
step. For an existing engine, the domain sequence is stories from Features, then
the first implementation task; do not introduce separate epic or sprint planning
at minimal rigor. If those Skills are unavailable, name the pending capability
and describe the next task instead of inventing a callable command. A browser
sketch is optional and normally duplicates work for the chosen engine; do not
switch engines. End with pitch, feature count, file path and
`Verdict: COMPLETE — game brief written; next stop is code.` only after saving.
