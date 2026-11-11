import { mkdir, open, unlink } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { StudioError } from './contract.js';
import { atomicWrite, canonicalRoot, hash, readText, safePath } from './files.js';

const manifestPath = '.game-studio/install.json';
interface OwnedFile { hash: string; original: string | null }
interface Manifest { schemaVersion: 1; version: string; files: Record<string, OwnedFile> }
export interface Change { path: string; before: string | null; after: string | null }
export interface InstallPlan { project: string; version: string; changes: Change[] }

async function loadManifest(root: string): Promise<{ manifest: Manifest; content: string | null }> {
  const content = await readText(await safePath(root, manifestPath));
  if (content === null) return { manifest: { schemaVersion: 1, version: '', files: {} }, content };
  try {
    const value = JSON.parse(content) as Manifest;
    if (value.schemaVersion !== 1 || typeof value.version !== 'string' || !value.files ||
        typeof value.files !== 'object' || Array.isArray(value.files)) throw new Error('Unsupported installation manifest');
    for (const [path, entry] of Object.entries(value.files)) {
      await safePath(root, path);
      if (path === manifestPath || !entry || !/^[a-f0-9]{64}$/.test(entry.hash) ||
          (entry.original !== null && typeof entry.original !== 'string')) throw new Error('Invalid ownership entry');
    }
    return { manifest: value, content };
  } catch (error) {
    if (error instanceof StudioError) throw error;
    throw new StudioError('INVALID_INSTALLATION', `Invalid ${manifestPath}; preserve it and resolve the conflict before continuing`, 4);
  }
}

export async function planInstall(rootInput: string, files: Record<string, string>, version: string,
  merges: Record<string, string> = {}): Promise<InstallPlan> {
  const project = await canonicalRoot(rootInput);
  const { manifest, content } = await loadManifest(project);
  const next: Manifest = { schemaVersion: 1, version, files: { ...manifest.files } };
  const changes: Change[] = [];
  for (const [path, after] of Object.entries(files)) {
    if (path === manifestPath) throw new StudioError('INVALID_ARGUMENT', 'The ownership manifest is reserved');
    const before = await readText(await safePath(project, path));
    const owned = Object.hasOwn(manifest.files, path) ? manifest.files[path] : undefined;
    if (owned && (before === null || hash(before) !== owned.hash)) throw new StudioError('FILE_CONFLICT', `Managed file changed: ${path}`, 4);
    if (!owned && before !== null && before !== after && merges[path] !== before) {
      throw new StudioError('FILE_CONFLICT', `Unowned file already exists: ${path}`, 4);
    }
    // An identical unowned file remains user-owned, including template source files.
    if (!owned && before === after) continue;
    next.files[path] = { hash: hash(after), original: owned ? owned.original : before };
    if (before !== after) changes.push({ path, before, after });
  }
  const after = `${JSON.stringify(next, null, 2)}\n`;
  if (after !== content) changes.push({ path: manifestPath, before: content, after });
  return { project, version, changes };
}

export async function planDetach(rootInput: string): Promise<InstallPlan> {
  const project = await canonicalRoot(rootInput);
  const { manifest, content } = await loadManifest(project);
  const changes: Change[] = [];
  for (const [path, entry] of Object.entries(manifest.files)) {
    const before = await readText(await safePath(project, path));
    if (before === null || hash(before) !== entry.hash) throw new StudioError('FILE_CONFLICT', `Managed file changed: ${path}`, 4);
    changes.push({ path, before, after: entry.original });
  }
  if (content !== null) changes.push({ path: manifestPath, before: content, after: null });
  return { project, version: manifest.version, changes };
}

async function verify(root: string, changes: Change[]): Promise<void> {
  for (const change of changes) {
    const content = await readText(await safePath(root, change.path));
    if (content !== change.before) throw new StudioError('FILE_CONFLICT', `File changed since planning: ${change.path}`, 4);
  }
}

export function describePlan(plan: InstallPlan) {
  return { project: plan.project, version: plan.version, changes: plan.changes.map(change => ({
    path: change.path, action: change.after === null ? 'restore-or-remove' : change.before === null ? 'create' : 'update',
    beforeHash: change.before === null ? null : hash(change.before),
    afterHash: change.after === null ? null : hash(change.after),
  })) };
}

export async function applyInstall(plan: InstallPlan): Promise<void> {
  if (plan.changes.length === 0) return;
  await verify(plan.project, plan.changes);
  const state = await safePath(plan.project, '.game-studio');
  await mkdir(state, { recursive: true });
  const lockPath = await safePath(plan.project, '.game-studio/install.lock');
  const journalPath = await safePath(plan.project, '.game-studio/transaction.json');
  let lock;
  try { lock = await open(lockPath, 'wx', 0o600); }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'EEXIST') throw new StudioError('INSTALL_LOCKED', 'Another installation or interrupted transaction requires attention', 4);
    throw error;
  }
  const applied: Change[] = [];
  let keepLock = false;
  let journalWritten = false;
  try {
    await lock.writeFile(String(process.pid));
    if (await readText(await safePath(plan.project, '.game-studio/recovery.lock')) !== null) {
      throw new StudioError('INSTALL_LOCKED', 'Installation recovery is running; wait for it to finish', 4);
    }
    if (await readText(journalPath) !== null) throw new StudioError('RECOVERY_REQUIRED', 'An interrupted installation journal must be recovered before applying changes', 4);
    await verify(plan.project, plan.changes);
    await atomicWrite(journalPath, `${JSON.stringify(plan)}\n`);
    journalWritten = true;
    const backup = await safePath(plan.project, `.game-studio/backups/${randomUUID()}.json`);
    await atomicWrite(backup, `${JSON.stringify(plan)}\n`);
    for (const change of plan.changes) {
      await verify(plan.project, [change]);
      await atomicWrite(await safePath(plan.project, change.path), change.after);
      applied.push(change);
    }
    await unlink(journalPath);
  } catch (error) {
    for (const change of applied.reverse()) {
      try {
        const path = await safePath(plan.project, change.path);
        if (await readText(path) !== change.after) throw new Error('Concurrent change during rollback');
        await atomicWrite(path, change.before);
      } catch { keepLock = true; }
    }
    if (!keepLock && journalWritten) await unlink(journalPath).catch(() => {});
    if (keepLock) throw new StudioError('RECOVERY_REQUIRED', 'Installation failed and rollback encountered a conflict; preserve the journal and backups', 4);
    throw error;
  } finally {
    await lock.close();
    if (!keepLock) await unlink(lockPath);
  }
}


export async function recoverInstall(rootInput: string, dryRun = false): Promise<InstallPlan> {
  const project = await canonicalRoot(rootInput);
  const lockPath = await safePath(project, '.game-studio/install.lock');
  const lock = await readText(lockPath);
  if (lock !== null) {
    const pid = Number(lock);
    if (!Number.isSafeInteger(pid) || pid <= 0) throw new StudioError('INSTALL_LOCKED', 'Unidentified installation lock; inspect it before recovery', 4);
    try { process.kill(pid, 0); throw new StudioError('INSTALL_LOCKED', `Installer process ${pid} is still running`, 4); }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ESRCH') throw error; }
  }
  const journalPath = await safePath(project, '.game-studio/transaction.json');
  const content = await readText(journalPath);
  const changes: Change[] = [];
  let version = '';
  if (content !== null) {
    let plan: InstallPlan;
    try { plan = JSON.parse(content) as InstallPlan; }
    catch { throw new StudioError('INVALID_INSTALLATION', 'Malformed transaction journal', 4); }
    if (plan.project !== project || typeof plan.version !== 'string' || !Array.isArray(plan.changes)) {
      throw new StudioError('INVALID_INSTALLATION', 'Transaction journal does not match this project', 4);
    }
    version = plan.version;
    const paths = new Set<string>();
    for (const change of plan.changes) {
      if (!change || typeof change.path !== 'string' || paths.has(change.path) ||
          !(change.before === null || typeof change.before === 'string') ||
          !(change.after === null || typeof change.after === 'string')) {
        throw new StudioError('INVALID_INSTALLATION', 'Invalid transaction change', 4);
      }
      paths.add(change.path);
      const current = await readText(await safePath(project, change.path));
      if (current === change.before) continue;
      if (current !== change.after) throw new StudioError('FILE_CONFLICT', `Recovery would overwrite changes to ${change.path}`, 4);
      changes.unshift({ path: change.path, before: current, after: change.before });
    }
  }
  const recovery = { project, version, changes };
  if (dryRun) return recovery;
  // An exclusive recovery lock also serializes recovery when the old writer has exited.
  const recoveryPath = await safePath(project, '.game-studio/recovery.lock');
  if (content === null && lock === null) return recovery;
  let recoveryLock;
  try { recoveryLock = await open(recoveryPath, 'wx', 0o600); }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'EEXIST') throw new StudioError('INSTALL_LOCKED', 'Recovery already running or interrupted; inspect recovery.lock', 4);
    throw error;
  }
  try {
    if (await readText(lockPath) !== lock || await readText(journalPath) !== content) {
      throw new StudioError('FILE_CONFLICT', 'Installation state changed during recovery', 4);
    }
    await verify(project, changes);
    for (const change of changes) {
      await verify(project, [change]);
      await atomicWrite(await safePath(project, change.path), change.after);
    }
    if (content !== null) await unlink(journalPath);
    if (lock !== null) await unlink(lockPath);
  } finally { await recoveryLock.close(); await unlink(recoveryPath); }
  return recovery;
}
