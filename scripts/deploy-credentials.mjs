import { spawn, execFileSync } from 'node:child_process';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ROOT, isMain } from './lib/files.mjs';

export const CREDENTIAL_KEYS = ['DEERNOVA_SSH_HOST', 'DEERNOVA_SSH_USER', 'DEERNOVA_SSH_PORT',
  'DEERNOVA_SSH_PRIVATE_KEY', 'DEERNOVA_SSH_KNOWN_HOSTS'];

export function runChild(command, args, env = process.env) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd: ROOT, env, stdio: 'inherit' });
    const interrupt = () => child.kill('SIGINT');
    const terminate = () => child.kill('SIGTERM');
    const cleanup = () => {
      process.removeListener('SIGINT', interrupt);
      process.removeListener('SIGTERM', terminate);
    };
    process.on('SIGINT', interrupt);
    process.on('SIGTERM', terminate);
    child.once('error', () => { cleanup(); reject(Error(`Cannot start ${command}; check that it is installed.`)); });
    child.once('close', (code, signal) => { cleanup(); resolve(code ?? (signal === 'SIGINT' ? 130 : 143)); });
  });
}

export async function withSshCredentials(env, execute, { tempRoot = tmpdir() } = {}) {
  for (const name of CREDENTIAL_KEYS) {
    if (!env[name]?.trim()) throw Error(`Missing ${name}; check One login and the Infisical deployment folder.`);
  }
  const host = env.DEERNOVA_SSH_HOST.trim();
  const user = env.DEERNOVA_SSH_USER.trim();
  const port = env.DEERNOVA_SSH_PORT.trim();
  if (!/^[a-zA-Z0-9][a-zA-Z0-9.-]*$/.test(host)) throw Error('Invalid DEERNOVA_SSH_HOST; use an IPv4 address or DNS hostname.');
  if (!/^[a-zA-Z_][a-zA-Z0-9_-]*$/.test(user)) throw Error('Invalid DEERNOVA_SSH_USER.');
  if (!/^\d+$/.test(port) || Number(port) < 1 || Number(port) > 65535) throw Error('Invalid DEERNOVA_SSH_PORT.');
  const key = env.DEERNOVA_SSH_PRIVATE_KEY.trim().replaceAll('\r\n', '\n') + '\n';
  const hosts = env.DEERNOVA_SSH_KNOWN_HOSTS.trim() + '\n';
  if (!key.startsWith('-----BEGIN OPENSSH PRIVATE KEY-----\n') || !key.endsWith('-----END OPENSSH PRIVATE KEY-----\n')) {
    throw Error('DEERNOVA_SSH_PRIVATE_KEY must be a complete OpenSSH private key.');
  }
  const childEnv = { ...env };
  for (const name of CREDENTIAL_KEYS) delete childEnv[name];
  const directory = await mkdtemp(join(tempRoot, 'deernova-ssh-'));
  // Also cover signals during async file preparation, before runChild takes over.
  let interrupted = false;
  const markInterrupted = () => { interrupted = true; };
  process.on('SIGINT', markInterrupted);
  process.on('SIGTERM', markInterrupted);
  try {
    const identity = join(directory, 'identity');
    const knownHosts = join(directory, 'known_hosts');
    const config = join(directory, 'config');
    // mkdtemp creates a private 0700 directory; all files are owner-only.
    await writeFile(identity, key, { mode: 0o600, flag: 'wx' });
    await writeFile(knownHosts, hosts, { mode: 0o600, flag: 'wx' });
    try {
      execFileSync('ssh-keygen', ['-y', '-P', '', '-f', identity], { env: childEnv, stdio: 'pipe', timeout: 5000 });
      execFileSync('ssh-keygen', ['-F', Number(port) === 22 ? host : `[${host}]:${Number(port)}`, '-f', knownHosts],
        { env: childEnv, stdio: 'pipe', timeout: 5000 });
    } catch {
      throw Error('Invalid SSH credentials: provide an unencrypted deployment key and a verified known_hosts entry matching the host and port.');
    }
    const quotePath = value => {
      if (/[\r\n\0]/.test(value)) throw Error('Unsupported temporary directory path.');
      return '"' + value.replaceAll('\\', '\\\\').replaceAll('"', '\\"').replaceAll('%', '%%') + '"';
    };
    await writeFile(config, `Host deernova-infisical
    HostName ${host}
    User ${user}
    Port ${Number(port)}
    IdentityFile ${quotePath(identity)}
    UserKnownHostsFile ${quotePath(knownHosts)}
    GlobalKnownHostsFile /dev/null
    IdentitiesOnly yes
    IdentityAgent none
    ForwardAgent no
    StrictHostKeyChecking yes
    UpdateHostKeys no
    BatchMode yes
    PasswordAuthentication no
    KbdInteractiveAuthentication no
    RequestTTY no
`, { mode: 0o600, flag: 'wx' });
    // Build, tar, SSH and SCP receive paths, never the private key environment value.
    childEnv.DEERNOVA_SSH_HOST = 'deernova-infisical';
    childEnv.DEERNOVA_SSH_CONFIG = config;
    if (interrupted) throw Error('Credential preparation interrupted.');
    return await execute(childEnv);
  } finally {
    try { await rm(directory, { recursive: true, force: true }); }
    finally {
      process.removeListener('SIGINT', markInterrupted);
      process.removeListener('SIGTERM', markInterrupted);
    }
  }
}

if (isMain(import.meta.url)) {
  try {
    process.exitCode = await withSshCredentials(process.env, env =>
      runChild(process.execPath, [join(ROOT, 'scripts/deploy-ssh.mjs'), ...process.argv.slice(2)], env));
  } catch (error) {
    console.error(`deernova credentials: ${error.message}`);
    process.exitCode = 1;
  }
}
