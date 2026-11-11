import { copyFile, chmod } from 'node:fs/promises';
await copyFile(new URL('../LICENSE', import.meta.url), new URL('./LICENSE', import.meta.url));
await chmod(new URL('./dist/cli.js', import.meta.url), 0o755);
