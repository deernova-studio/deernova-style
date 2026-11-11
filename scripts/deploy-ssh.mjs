import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ROOT, isMain } from './lib/files.mjs';
import { packageSite } from './package-site.mjs';

export const DOMAINS = ['deernova.me', 'www.deernova.me'];
const SSH_OPTIONS = ['-o', 'BatchMode=yes', '-o', 'StrictHostKeyChecking=yes', '-o', 'ConnectTimeout=10',
  '-o', 'ServerAliveInterval=15', '-o', 'ServerAliveCountMax=3'];
const quote = value => `'${String(value).replaceAll("'", "'\\''")}'`;

export function parseArgs(args, env = process.env) {
  const [action = 'help', ...rest] = args;
  if (!['help', 'check', 'status', 'deploy', 'rollback'].includes(action)) throw Error(`Unknown action: ${action}`);
  let dryRun = false, release;
  for (let i = 0; i < rest.length; i++) {
    if (rest[i] === '--dry-run') dryRun = true;
    else if (rest[i] === '--release' && action === 'rollback' && !release) release = rest[++i];
    else throw Error(`Unknown argument: ${rest[i]}`);
    if (rest[i - 1] === '--release' && !release) throw Error('--release requires a path');
  }
  const host = env.DEERNOVA_SSH_HOST || 'deernova';
  if (!/^(?:[\w][\w.-]*@)?[a-zA-Z0-9][\w.-]*$/.test(host)) throw Error('DEERNOVA_SSH_HOST must be an SSH alias or user@hostname; configure ports and IPv6 in ~/.ssh/config.');
  if (release && !/^\/var\/www\/(?:releases\/deernova-|deernova-before-)[A-Za-z0-9]+$/.test(release)) throw Error('Release must be a Deernova version directory under /var/www.');
  return { action, host, dryRun, release };
}

function execute(command, args, { input, timeout = 300_000 } = {}) {
  try {
    return execFileSync(command, args, { cwd: ROOT, input, timeout, encoding: 'utf8',
      maxBuffer: 4 * 1024 * 1024, stdio: ['pipe', 'pipe', 'inherit'] }).trim();
  } catch (error) {
    throw Error(`${command} failed (${error.code || error.status || error.signal || 'unknown'}). Check SSH access, known_hosts and server permissions.`, { cause: error });
  }
}

export async function verifyPublic(checks, fetcher = fetch) {
  for (const domain of DOMAINS) {
    for (const [file, expected] of Object.entries(checks)) {
      const path = file === 'index.html' ? '' : file;
      const url = `https://${domain}/${path}`;
      const response = await fetcher(url, { redirect: 'error', signal: AbortSignal.timeout(20_000), headers: { 'Cache-Control': 'no-cache' } });
      if (response.status !== 200) throw Error(`${url} returned ${response.status}`);
      const actual = createHash('sha256').update(Buffer.from(await response.arrayBuffer())).digest('hex');
      if (actual !== expected) throw Error(`${url} does not match the uploaded release`);
    }
    const response = await fetcher(`http://${domain}/`, { redirect: 'manual', signal: AbortSignal.timeout(20_000) });
    const location = new URL(response.headers.get('location') || '/', `http://${domain}/`);
    if (![301, 308].includes(response.status) || location.protocol !== 'https:' || !DOMAINS.includes(location.hostname)) throw Error(`HTTP → HTTPS redirect failed for ${domain}`);
    for (const path of ['.git/config', '__deernova_missing_page__']) {
      const missing = await fetcher(`https://${domain}/${path}`, { redirect: 'manual', signal: AbortSignal.timeout(20_000) });
      if (missing.status !== 404) throw Error(`${domain}/${path} should return 404, got ${missing.status}`);
    }
  }
}

export async function run(options, { exec = execute, pack = packageSite, verify = verifyPublic, log = console.log } = {}) {
  const { action, host, dryRun, release } = options;
  if (action === 'help') {
    log('Usage: node scripts/deploy-ssh.mjs check|status|deploy|rollback [--dry-run] [--release /var/www/releases/deernova-TIMESTAMP]\nSSH alias: DEERNOVA_SSH_HOST (default: deernova). See docs/deployment.md.');
    return;
  }
  if (dryRun) {
    log(JSON.stringify({ action, host, release: release || (action === 'rollback' ? 'previous successful release' : undefined),
      transport: 'OpenSSH + SCP; strict host verification; key/agent authentication',
      steps: action === 'deploy' ? ['check server', 'build and package', 'upload archive', 'verify and switch release', 'verify public HTTPS'] : [action],
      network: false }, null, 2));
    return;
  }
  const source = await readFile(join(ROOT, 'scripts/deploy-site.py'), 'utf8');
  const ssh = (command, input) => exec('ssh', [...SSH_OPTIONS, host, command], { input });
  const remote = (verb, args = []) => {
    const command = ['python3', '-', verb, ...args].map(quote).join(' ');
    return JSON.parse(ssh(`if [ "$(id -u)" -eq 0 ]; then exec ${command}; else exec sudo -n ${command}; fi`, source));
  };
  if (action === 'check' || action === 'status') {
    const result = remote(action);
    log(JSON.stringify(result, null, 2));
    return result;
  }
  if (action === 'rollback') {
    const result = remote('rollback', release ? [release] : []);
    log(JSON.stringify(result, null, 2));
    await publicCheck(result);
    return result;
  }
  log(`Checking SSH and Nginx on ${host}…`);
  remote('check');
  log('Building website and release archive…');
  const bundle = await pack();
  const staging = ssh('umask 077; mktemp -d /tmp/deernova-upload.XXXXXXXX');
  if (!/^\/tmp\/deernova-upload\.[A-Za-z0-9]+$/.test(staging)) throw Error('Unexpected SSH staging directory');
  let result;
  try {
    log(`Uploading ${bundle.archive}…`);
    exec('scp', [...SSH_OPTIONS, bundle.archive, `${host}:${staging}/site.tgz`], { timeout: 600_000 });
    result = remote('deploy', [`${staging}/site.tgz`, bundle.sha256]);
    log(JSON.stringify(result, null, 2));
  } finally {
    try { ssh(`rm -f ${quote(`${staging}/site.tgz`)} && rmdir ${quote(staging)}`); }
    catch { log(`Upload cleanup failed; remove ${staging} on ${host} after checking deployment status.`); }
  }
  await publicCheck(result, bundle.checks);
  return result;

  async function publicCheck(result, checks = result.checks) {
    try { await verify(checks); }
    catch (error) {
      throw Error(`Server switched successfully to ${result.current}, but public verification failed: ${error.message}. Inspect website:status; website:rollback restores the recorded previous version.`);
    }
    log('Verified both domains: HTTPS content, HTTP redirects and 404 boundaries.');
  }
}

if (isMain(import.meta.url)) {
  try { await run(parseArgs(process.argv.slice(2))); }
  catch (error) { console.error(`deernova deploy: ${error.message}`); process.exitCode = 1; }
}
