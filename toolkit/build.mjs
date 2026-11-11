import { copyFile, chmod, cp, mkdir, rm, access } from 'node:fs/promises';
const resources = new URL('./resources/', import.meta.url);
await rm(resources, { recursive: true, force: true });
await mkdir(resources, { recursive: true });
for (const path of ['studio', '.agents/skills', '.codex/agents']) {
  const source = new URL(`../${path}`, import.meta.url);
  try { await access(source); }
  catch (error) { if (error.code === 'ENOENT') continue; throw error; }
  await cp(source, new URL(path, resources), { recursive: true });
}
await copyFile(new URL('../LICENSE', import.meta.url), new URL('./LICENSE', import.meta.url));
await chmod(new URL('./dist/cli.js', import.meta.url), 0o755);
