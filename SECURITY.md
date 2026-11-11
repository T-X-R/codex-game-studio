# Security policy

This repository currently maintains the development alpha on `main`. It does not
provide security support for the original upstream project or for Codex itself.

Report reproducible toolkit vulnerabilities through
[private vulnerability reporting](https://github.com/T-X-R/codex-game-studio/security/advisories/new).
Include affected versions, reproduction steps and the resulting filesystem,
process or permission impact. Do not include live credentials in a report.

Relevant boundaries include installation ownership, path traversal and symlinks,
runtime dependency restoration, local preview exposure, process arguments,
package contents and undisclosed actions in contributed Skills. Project-local
code and Skills still run with the user's Codex permissions; this toolkit does
not replace the host sandbox or approval system.

Keep dependency lifecycle scripts disabled during toolkit/runtime installation.
Do not report an unavailable browser, role or hook check as successful. Changes
to these boundaries require regression evidence and a clear statement of scope.
