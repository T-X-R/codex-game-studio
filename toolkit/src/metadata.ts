import { readFileSync } from 'node:fs';
export const metadata: { name: string; version: string } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
