import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const cli = fileURLToPath(new URL('../dist/cli.js', import.meta.url));
function run(...args) {
  const result = spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8' });
  return { ...result, body: () => JSON.parse(result.stdout) };
}

test('version returns one structured result without diagnostics on stdout', () => {
  const result = run('version', '--json');
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stderr, '');
  assert.equal(result.body().schemaVersion, 1);
  assert.equal(result.body().data.version, '0.1.0-alpha.0');
});

test('unknown commands and flags fail with a machine-readable error', () => {
  for (const args of [['invented'], ['version', '--invented'], ['version', 'extra']]) {
    const result = run(...args, '--json');
    assert.equal(result.status, 2);
    assert.equal(result.body().status, 'failed');
    assert.equal(result.body().error.code, 'INVALID_ARGUMENT');
  }
});

test('schema and command help describe the same accepted options', () => {
  const schema = run('schema', 'version', '--json');
  const help = run('version', '--help');
  assert.equal(schema.status, 0);
  assert.equal(help.status, 0);
  for (const option of Object.keys(schema.body().data.options)) {
    assert.ok(help.stdout.includes(`--${option}`));
  }
});

test('global help lists only implemented operations', () => {
  const result = run('--help');
  assert.equal(result.status, 0);
  assert.match(result.stdout, /version/);
  assert.doesNotMatch(result.stdout, /publish/);
});
