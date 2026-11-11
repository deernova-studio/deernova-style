import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawn } from 'node:child_process';
import { mkdtemp, readFile, stat, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { once } from 'node:events';
import { CREDENTIAL_KEYS, withSshCredentials } from '../scripts/deploy-credentials.mjs';
import { runWithOne } from '../scripts/deploy-one.mjs';

async function credentials(t) {
  const directory = await mkdtemp(join(tmpdir(), 'deernova-test-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const key = join(directory, 'testkey');
  execFileSync('ssh-keygen', ['-q', '-t', 'ed25519', '-N', '', '-f', key], { stdio: 'pipe' });
  return { ...process.env, DEERNOVA_SSH_HOST: 'website.example', DEERNOVA_SSH_USER: 'deploy', DEERNOVA_SSH_PORT: '2222',
    DEERNOVA_SSH_PRIVATE_KEY: await readFile(key, 'utf8'),
    DEERNOVA_SSH_KNOWN_HOSTS: '[website.example]:2222 ' + await readFile(`${key}.pub`, 'utf8') };
}

test('One previews never load credentials and live actions select only the deployment secrets', async () => {
  let called = false;
  await runWithOne(['deploy', '--dry-run'], {
    execute: () => { throw Error('unexpected authentication'); }, log: () => {},
    preview: options => { called = true; assert.equal(options.dryRun, true); },
  });
  assert.ok(called);
  const result = await runWithOne(['status'], { log: () => {}, execute: (command, args) => {
    assert.equal(command, 'one');
    assert.deepEqual(args.slice(0, 9), ['exec', '--global', '--env', 'prod', '--path', '/deernova-website', '--keys', CREDENTIAL_KEYS.join(','), '--']);
    assert.equal(args.at(-1), 'status');
    return 7;
  } });
  assert.equal(result, 7);
});

test('injected credentials use owner-only files and strict host checks without inheriting the private key', async t => {
  const env = await credentials(t);
  let directory;
  const result = await withSshCredentials(env, async childEnv => {
    directory = dirname(childEnv.DEERNOVA_SSH_CONFIG);
    assert.equal((await stat(directory)).mode & 0o777, 0o700);
    for (const name of ['identity', 'known_hosts', 'config']) {
      assert.equal((await stat(join(directory, name))).mode & 0o777, 0o600);
    }
    for (const name of CREDENTIAL_KEYS.filter(name => name !== 'DEERNOVA_SSH_HOST')) assert.equal(childEnv[name], undefined);
    assert.equal(childEnv.DEERNOVA_SSH_HOST, 'deernova-infisical');
    const config = execFileSync('ssh', ['-G', '-F', childEnv.DEERNOVA_SSH_CONFIG, 'deernova-infisical'], { encoding: 'utf8', env: childEnv, stdio: 'pipe' });
    assert.match(config, /hostname website\.example/);
    assert.match(config, /port 2222/);
    assert.match(config, /stricthostkeychecking (true|yes)/);
    assert.match(config, /identityagent none/);
    return 42;
  });
  assert.equal(result, 42);
  await assert.rejects(stat(directory), { code: 'ENOENT' });
});

test('failure removes the credential files and missing or mismatched credentials fail closed', async t => {
  const env = await credentials(t);
  let directory;
  await assert.rejects(withSshCredentials(env, childEnv => {
    directory = dirname(childEnv.DEERNOVA_SSH_CONFIG);
    throw Error('deployment failed');
  }), /deployment failed/);
  await assert.rejects(stat(directory), { code: 'ENOENT' });
  const no = () => { throw Error('must not run'); };
  await assert.rejects(withSshCredentials({ ...env, DEERNOVA_SSH_PRIVATE_KEY: '' }, no), /Missing DEERNOVA_SSH_PRIVATE_KEY/);
  await assert.rejects(withSshCredentials({ ...env, DEERNOVA_SSH_HOST: 'host\nProxyCommand evil' }, no), /Invalid DEERNOVA_SSH_HOST/);
  await assert.rejects(withSshCredentials({ ...env, DEERNOVA_SSH_PORT: '70000' }, no), /Invalid DEERNOVA_SSH_PORT/);
  await assert.rejects(withSshCredentials({ ...env, DEERNOVA_SSH_HOST: 'wrong.example' }, no), /Invalid SSH credentials/);
});

test('termination forwards to the deployment child and removes temporary credentials', { timeout: 10000 }, async t => {
  const env = await credentials(t);
  const moduleUrl = new URL('../scripts/deploy-credentials.mjs', import.meta.url).href;
  const childCode = 'console.log(process.env.DEERNOVA_SSH_CONFIG); setInterval(() => {}, 1000)';
  const source = `import {withSshCredentials, runChild} from ${JSON.stringify(moduleUrl)};
    process.exitCode = await withSshCredentials(process.env, env => runChild(process.execPath, ['-e', ${JSON.stringify(childCode)}], env));`;
  const child = spawn(process.execPath, ['--input-type=module', '-e', source], { env, stdio: ['ignore', 'pipe', 'pipe'] });
  t.after(() => { if (child.exitCode === null) child.kill('SIGKILL'); });
  const closed = once(child, 'close');
  const [data] = await once(child.stdout, 'data');
  const config = data.toString().trim();
  assert.ok(config.endsWith('/config'));
  child.kill('SIGTERM');
  const [code] = await closed;
  assert.equal(code, 143);
  await assert.rejects(stat(dirname(config)), { code: 'ENOENT' });
});
