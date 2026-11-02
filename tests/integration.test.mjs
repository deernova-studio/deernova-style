import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, readdir, rm, stat, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const cli = resolve('packages/style/bin/cli.mjs');
const run = (...args) => spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8' });

function succeeds(...args) {
  const result = run(...args);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return result.stdout;
}

function fails(...args) {
  const result = run(...args);
  assert.equal(result.status, 1, result.stdout);
  return result;
}

async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'deernova-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const base = join(root, 'skills');
  return { root, base, skill: join(base, 'deernova-style'), args: ['--dir', base] };
}

test('install and clean update keep a verifiable skill without leftover directories', async t => {
  const { base, args } = await fixture(t);
  succeeds('install', ...args);
  const report = JSON.parse(succeeds('doctor', ...args));
  assert.equal(report.sourceMatches, true);
  assert.equal(report.localChanges, false);
  assert.equal(report.installedVersion, succeeds('version').trim());
  fails('install', ...args);
  succeeds('update', ...args);
  succeeds('doctor', ...args);
  assert.deepEqual(await readdir(base), ['deernova-style']);
});

test('modified skills are protected and a forced update keeps the original in a backup', async t => {
  const { base, skill, args } = await fixture(t);
  succeeds('install', ...args);
  const file = join(skill, 'SKILL.md');
  const modified = (await readFile(file, 'utf8')) + '\nLocal note\n';
  await writeFile(file, modified);

  const report = JSON.parse(fails('doctor', ...args).stdout);
  assert.equal(report.localChanges, true);
  fails('update', ...args);
  assert.equal(await readFile(file, 'utf8'), modified);
  succeeds('update', ...args, '--force');
  const entries = await readdir(base);
  const backup = entries.find(name => name.startsWith('deernova-style.backup-'));
  assert.ok(backup);
  assert.equal(entries.length, 2, 'temporary replacement is removed');
  assert.equal(await readFile(join(base, backup, 'SKILL.md'), 'utf8'), modified);
  succeeds('doctor', ...args);
});

test('repository installation and init preserve existing app files for every agent', async t => {
  const { root } = await fixture(t);
  const repo = join(root, 'existing-app');
  await mkdir(repo);
  await writeFile(join(repo, 'package.json'), 'Existing project dependencies');
  await writeFile(join(repo, 'app.ts'), 'Existing application');

  succeeds('init', repo);
  assert.deepEqual((await readdir(repo)).sort(), ['.agents', 'app.ts', 'package.json']);
  succeeds('doctor', '--repo', repo);
  succeeds('update', '--repo', repo);
  for (const agent of ['claude', 'codex']) {
    succeeds('install', '--repo', repo, '--agent', agent);
    await stat(join(repo, `.${agent}`, 'skills/deernova-style/SKILL.md'));
    succeeds('doctor', '--repo', repo, '--agent', agent);
  }
  assert.equal(await readFile(join(repo, 'package.json'), 'utf8'), 'Existing project dependencies');
  assert.equal(await readFile(join(repo, 'app.ts'), 'utf8'), 'Existing application');
});

test('missing and unmanaged installations require an explicit install', async t => {
  const { skill, args } = await fixture(t);
  const missing = JSON.parse(fails('doctor', ...args).stdout);
  assert.equal(missing.installedVersion, null);
  assert.equal(missing.localChanges, null);
  fails('update', ...args);

  await mkdir(skill, { recursive: true });
  await writeFile(join(skill, 'notes.md'), 'Keep these notes');
  fails('update', ...args, '--force');
  fails('install', ...args);
  succeeds('install', ...args, '--force');
  succeeds('doctor', ...args);
});

test('invalid CLI arguments report concise errors before writing files', async t => {
  const { root, args } = await fixture(t);
  const cases = [
    ['install', '--repo'],
    ['install', '--unknown'],
    ['install', 'one', 'two'],
    ['install', '--repo', root, '--global'],
    ['install', '--repo', root, ...args],
    ['install', ...args, '--agent', 'unknown'],
    ['install', '--repo', join(root, 'missing')],
    ['init', root, '--repo', root],
    ['unknown']
  ];
  for (const args of cases) {
    const result = fails(...args);
    assert.match(result.stderr, /^deernova-style: .+\n$/);
  }
  assert.deepEqual(await readdir(root), []);
});

test('a symlink destination is rejected even with force', async t => {
  const { root, base, skill, args } = await fixture(t);
  const target = join(root, 'elsewhere');
  await mkdir(target);
  await writeFile(join(target, 'notes.md'), 'Keep these notes');
  await mkdir(base);
  await symlink(target, skill, 'dir');

  assert.match(fails('install', ...args, '--force').stderr, /not a regular directory/);
  assert.equal(await readFile(join(target, 'notes.md'), 'utf8'), 'Keep these notes');
  assert.deepEqual(await readdir(target), ['notes.md']);
});
