import { join } from 'node:path';
import { homedir } from 'node:os';
import { metadata } from './metadata.js';
import { resourceFiles } from './resources.js';
import { applyInstall, describePlan, planDetach, planInstall } from './install.js';

export async function setupSkill(home = process.env.CODEX_HOME || join(homedir(), '.codex'), remove = false, dryRun = false) {
  const root = join(home, 'skills/game-studio');
  const plan = remove ? await planDetach(root)
    : await planInstall(root, await resourceFiles('studio/onboarding/game-studio'), metadata.version);
  if (!dryRun) await applyInstall(plan);
  return { ...describePlan(plan), discovery: 'Start a new Codex session if the Skill is not listed yet.' };
}
