import { parseArgs } from 'node:util';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { inspectContent } from '../dist/content-tree.js';
import { inspectCatalog } from '../dist/content-catalog.js';

try {
  const { values } = parseArgs({ options: { root: { type: 'string' }, 'bundle-only': { type: 'boolean' }, complete: { type: 'boolean' } }, allowPositionals: false });
  if (values.complete && values['bundle-only']) throw new Error('--complete requires the source catalog; it cannot be combined with --bundle-only');
  const root = values.root ? resolve(values.root) : fileURLToPath(new URL('../../', import.meta.url));
  const result = await inspectContent(root);
  const catalog = values['bundle-only'] ? { status: 'not_assessed', reason: 'Explicit bundle-only inspection' } : await inspectCatalog(root, values.complete);
  const valid = result.status === 'valid' && catalog.status !== 'invalid';
  console.log(JSON.stringify({ root, ...result, status: valid ? 'valid' : 'invalid', catalog }, null, 2));
  process.exitCode = valid ? 0 : 1;
} catch (error) {
  console.error(error.message);
  process.exitCode = 2;
}
