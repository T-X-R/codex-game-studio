# LP-CODE-REVIEW — Lead Programmer Code Review

Role: `game-studio-lead-programmer`; inherits the session model and permissions.
Adapted from the upstream gate with attribution retained in the repository.

Run after implementation and before advancing the story or merging changes.
Required context: implementation paths; story path and acceptance criteria;
relevant GDD section; governing ADR. Supply the applicable project standards and
available test/evidence paths rather than claiming that file presence is a pass.

Check implementation against the criteria, design rules and ADR's boundaries.
Examine correctness, forbidden patterns, dependencies, public API documentation,
testability and data-driven configuration. Cite concrete source locations and
effects for findings. Review actual evidence separately from static code claims.

**Verdicts**: APPROVE / CONCERNS / REJECT.

- APPROVE: reviewed implementation meets the applicable contract; state limits
  of execution evidence rather than inventing runs or human acceptance.
- CONCERNS: specific issues or evidence gaps need attention.
- REJECT: must be revised before merge, with concrete blocking findings.

If a named input was not supplied or could not be read and no problem was found,
return NOT ASSESSED and name it. Do not derive a missing GDD from code/story text.
Under this gate's source contract, a required artifact explicitly confirmed
nonexistent is a finding (CONCERNS/REJECT), not simply unprovided context. An
observed defect still takes an adverse verdict despite other missing input;
separately state what could not be assessed. The verdict does not merge code,
mark a story complete or authorize release.
