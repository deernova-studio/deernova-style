import { join } from 'node:path';
import { ROOT, isMain } from './lib/files.mjs';
import { parseArgs, run } from './deploy-ssh.mjs';
import { CREDENTIAL_KEYS, runChild } from './deploy-credentials.mjs';

export const CREDENTIAL_ENVIRONMENT = 'prod';
export const CREDENTIAL_PATH = '/deernova-website';

export async function runWithOne(args, { execute = runChild, preview = run, log = console.log } = {}) {
  // Preview is available to all contributors and CI, including without a One login.
  const options = parseArgs(args, { DEERNOVA_SSH_HOST: 'deernova-infisical' });
  if (options.dryRun || options.action === 'help') {
    log(`Credentials: One / Infisical shared-credentials, ${CREDENTIAL_ENVIRONMENT}, ${CREDENTIAL_PATH}`);
    await preview(options);
    return 0;
  }
  log(`Loading deployment credentials from Infisical (${CREDENTIAL_ENVIRONMENT}, ${CREDENTIAL_PATH})…`);
  return execute('one', ['exec', '--global', '--env', CREDENTIAL_ENVIRONMENT, '--path', CREDENTIAL_PATH,
    '--keys', CREDENTIAL_KEYS.join(','), '--', process.execPath, join(ROOT, 'scripts/deploy-credentials.mjs'), ...args]);
}

if (isMain(import.meta.url)) {
  try { process.exitCode = await runWithOne(process.argv.slice(2)); }
  catch (error) { console.error(`deernova deploy: ${error.message}`); process.exitCode = 1; }
}
