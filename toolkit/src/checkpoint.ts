import { StudioError } from './contract.js';
import { canonicalRoot, hash, readText, safePath } from './files.js';
import type { InstallPlan } from './install.js';
import { metadata } from './metadata.js';
import { runProcess } from './process.js';

const checkpointPath = 'production/session-state/active.md';
const open = '<!-- CHECKPOINT -->';
const close = '<!-- /CHECKPOINT -->';
const knownFields = new Set(['Updated', 'Branch', 'Stage', 'Current task', 'Next step', 'Blocked on',
  'Files in progress', 'Run result', 'Open questions', 'Constraints', 'Decisions', 'Evidence']);

function locate(content: string) {
  const markers = [...content.matchAll(/^[\t ]*<!-- (\/?CHECKPOINT) -->[\t ]*\r?$/gm)];
  if (!markers.length) return null;
  if (markers.length !== 2 || markers[0]![1] !== 'CHECKPOINT' || markers[1]![1] !== '/CHECKPOINT') {
    throw new StudioError('INVALID_CHECKPOINT', 'Checkpoint markers are incomplete, duplicated or out of order; preserve the file and repair its boundaries', 4);
  }
  const start = markers[0]!.index! + markers[0]![0].length;
  const bodyStart = content[start] === '\n' ? start + 1 : start;
  return { start: markers[0]!.index!, bodyStart, bodyEnd: markers[1]!.index!,
    end: markers[1]!.index! + markers[1]![0].length };
}

function bounded(content: string) {
  const lines = content.replaceAll('\r\n', '\n').trimEnd().split('\n');
  const kept: string[] = [];
  for (const line of lines) {
    if (kept.length === 25 || kept.join('\n').length + line.length + (kept.length ? 1 : 0) > 3000) break;
    kept.push(line);
  }
  return { preview: kept.join('\n'), truncated: kept.length < lines.length };
}

async function inspectGit(project: string) {
  try {
    const [branch, head, status] = await Promise.all([
      runProcess('git', ['symbolic-ref', '--quiet', '--short', 'HEAD'], { cwd: project, timeoutMs: 5000 }),
      runProcess('git', ['rev-parse', '--verify', 'HEAD'], { cwd: project, timeoutMs: 5000 }),
      runProcess('git', ['status', '--porcelain=1'], { cwd: project, timeoutMs: 5000 }),
    ]);
    if (status.exitCode !== 0) return { state: 'not_assessed' as const, reason: 'Git status could not be read; this may not be a repository.' };
    return { state: 'observed' as const, branch: branch.exitCode === 0 ? branch.stdout.trim() : null,
      head: head.exitCode === 0 ? head.stdout.trim() : null, dirty: status.stdout.length > 0 };
  } catch { return { state: 'not_assessed' as const, reason: 'Git is unavailable in this environment.' }; }
}

export async function showCheckpoint(root: string) {
  const project = await canonicalRoot(root);
  const content = await readText(await safePath(project, checkpointPath));
  const git = await inspectGit(project);
  const warnings: string[] = [];
  const fields: Record<string, string> = {};
  if (content === null) return { project, path: checkpointPath, state: 'absent', sha256: 'missing',
    preview: '', truncated: false, fields, git, warnings };
  const region = locate(content);
  if (region) {
    for (const match of content.slice(region.bodyStart, region.bodyEnd).matchAll(/^\*\*([^*]+):\*\*[\t ]*(.*)\r?$/gm)) {
      if (knownFields.has(match[1]!)) fields[match[1]!] = match[2]!.trim();
    }
  } else warnings.push('Legacy record has no CHECKPOINT region; migrate it with checkpoint save before using it as a recovery summary.');
  const recordedBranch = fields.Branch?.replace(/^`|`$/g, '');
  if (recordedBranch && git.state === 'observed' && recordedBranch !== git.branch) {
    warnings.push(`Checkpoint records branch ${recordedBranch}; current Git branch is ${git.branch ?? 'detached HEAD'}. Verify that the recorded work still applies.`);
  }
  warnings.push('Recorded tasks, evidence and processes are historical claims; recheck files and test results, and do not assume any server or agent process survived.');
  const display = region ? content.slice(region.start, region.end) : '';
  return { project, path: checkpointPath, state: region ? 'recorded' : 'legacy', sha256: hash(content),
    ...bounded(display), fields, git, warnings };
}

export async function planCheckpointSave(root: string, input: string, expectedHash?: string, eventId?: string) {
  if (!expectedHash || !/^(missing|[a-f0-9]{64})$/.test(expectedHash)) {
    throw new StudioError('INVALID_ARGUMENT', 'Supply the sha256 from checkpoint show, or missing for a new checkpoint');
  }
  let body = input.replaceAll('\r\n', '\n').trim();
  if (body.startsWith(open + '\n') && body.endsWith('\n' + close)) body = body.slice(open.length, -close.length).trim();
  if (!body || /^[\t ]*<!-- \/?(CHECKPOINT|STATUS) -->[\t ]*$/m.test(body)) {
    throw new StudioError('INVALID_ARGUMENT', 'Provide a nonempty checkpoint body without nested or incomplete region markers');
  }
  body += '\n';
  const operationHash = hash(JSON.stringify({ body, expectedHash }));
  const id = eventId ?? operationHash;
  if (!/^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/.test(id)) throw new StudioError('INVALID_ARGUMENT', 'Event ID must be a bounded alphanumeric identifier with optional hyphens or underscores');
  const project = await canonicalRoot(root);
  const plan: InstallPlan = { project, version: metadata.version, changes: [] };
  const warnings: string[] = [];
  if (bounded(body).truncated) warnings.push('Checkpoint exceeds the recovery preview limit of 25 lines or 3000 characters; keep essential next actions at the top.');
  const eventPath = `production/session-logs/events/${id}.json`;
  const existingEvent = await readText(await safePath(project, eventPath));
  if (existingEvent !== null) {
    let previous;
    try { previous = JSON.parse(existingEvent); } catch { throw new StudioError('FILE_CONFLICT', `Malformed checkpoint event: ${eventPath}`, 4); }
    if (previous?.schemaVersion !== 1 || previous.type !== 'checkpoint.saved' || previous.operationHash !== operationHash) {
      throw new StudioError('FILE_CONFLICT', `Event ID is already used by a different operation: ${id}`, 4);
    }
    return { plan, warnings, duplicate: true, eventId: id };
  }
  const before = await readText(await safePath(project, checkpointPath));
  if ((before === null ? 'missing' : hash(before)) !== expectedHash) throw new StudioError('FILE_CONFLICT', 'Checkpoint changed since it was read; inspect the current record before saving', 4);
  const region = before === null ? null : locate(before);
  const newline = before?.includes('\r\n') ? '\r\n' : '\n';
  const encoded = body.replaceAll('\n', newline);
  const block = `${open}${newline}${encoded}${close}${newline}`;
  let after: string;
  if (region && before !== null) after = before.slice(0, region.bodyStart) + encoded + before.slice(region.bodyEnd);
  else if (before === null) after = `# Active Session State${newline}${newline}${block}${newline}## Notes${newline}`;
  else {
    const statusEnd = /^[\t ]*<!-- \/STATUS -->[\t ]*\r?\n/m.exec(before);
    const insertion = statusEnd ? statusEnd.index + statusEnd[0].length : 0;
    after = before.slice(0, insertion) + newline + block + newline + before.slice(insertion);
  }
  if (after !== before) {
    plan.changes.push({ path: checkpointPath, before, after });
    plan.changes.push({ path: eventPath, before: null, after: JSON.stringify({ schemaVersion: 1, type: 'checkpoint.saved',
      eventId: id, operationHash, previousHash: expectedHash, checkpointHash: hash(after), recordedAt: new Date().toISOString() }, null, 2) + '\n' });
  }
  return { plan, warnings, duplicate: false, eventId: id };
}
