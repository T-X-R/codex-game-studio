import { parseArgs } from 'node:util';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { inspectContent } from '../dist/content-tree.js';

try {
  const { values } = parseArgs({ options: { root: { type: 'string' } }, allowPositionals: false });
  const root = values.root ? resolve(values.root) : fileURLToPath(new URL('../../', import.meta.url));
  const result = await inspectContent(root);
  console.log(JSON.stringify({ root, ...result }, null, 2));
  process.exitCode = result.status === 'valid' ? 0 : 1;
} catch (error) {
  console.error(error.message);
  process.exitCode = 2;
}
