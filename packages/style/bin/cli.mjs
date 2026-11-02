#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { cp, lstat, mkdir, mkdtemp, readFile, readdir, rename, rm, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const bundledSkill = fileURLToPath(new URL('../skill/', import.meta.url));
const HELP = `deernova-style install|update|doctor [--repo <existing-repository>] [--global] [--agent codex|claude|agents] [--dir <skills-parent>] [--force]
deernova-style init [existing-repository]  (alias for install --repo)
deernova-style version
Installs design reference files only; does not add app code or package dependencies. Default: project .agents/skills/deernova-style. --global defaults to CODEX_HOME/skills.
update installs the version bundled in this CLI; use npx @deernova/style@latest update to fetch latest.
--force keeps a timestamped backup before replacing a locally modified skill.`;

function parseArgs(args) {
  let [command = 'help', ...flags] = args;
  const options = {};
  let positional;

  for (let i = 0; i < flags.length; i++) {
    const flag = flags[i];
    if (['--global', '--force'].includes(flag)) {
      options[flag.slice(2)] = true;
    } else if (['--dir', '--agent', '--repo'].includes(flag)) {
      if (!flags[i + 1] || flags[i + 1].startsWith('--')) {
        throw Error(`${flag} needs a value`);
      }
      options[flag.slice(2)] = flags[++i];
    } else if (flag.startsWith('-')) {
      throw Error(`Unknown option: ${flag}`);
    } else if (positional !== undefined) {
      throw Error('Too many arguments');
    } else {
      positional = flag;
    }
  }

  if (command === 'init') {
    if (options.repo && positional) throw Error('Specify the repository once');
    options.repo = positional || options.repo || process.cwd();
    positional = undefined;
    command = 'install';
  }

  return { command, options, positional };
}

async function statIfExists(path) {
  try {
    return await lstat(path);
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

async function resolveDestination(options) {
  if ([options.repo, options.global, options.dir].filter(Boolean).length > 1) {
    throw Error('--repo, --global and --dir are mutually exclusive');
  }

  const repo = resolve(options.repo || process.cwd());
  if (!options.global && !options.dir && !(await statIfExists(repo))?.isDirectory()) {
    throw Error('Repository must be an existing directory');
  }

  const agent = options.agent || (options.global ? 'codex' : 'agents');
  if (!['codex', 'claude', 'agents'].includes(agent)) {
    throw Error('Agent must be codex, claude or agents');
  }

  let base;
  if (options.dir) {
    base = resolve(options.dir);
  } else if (options.global) {
    base = agent === 'codex'
      ? join(process.env.CODEX_HOME || join(homedir(), '.codex'), 'skills')
      : join(homedir(), `.${agent}`, 'skills');
  } else {
    base = join(repo, `.${agent}`, 'skills');
  }

  return { base, dest: join(base, 'deernova-style') };
}

// Keep this digest compatible with existing installations. The manifest is not
// hashed as a file: only its source hash and version participate in the digest.
async function installedDigest(dir, manifest) {
  const hash = createHash('sha256');

  async function walk(path, relative = '') {
    const entries = await readdir(path, { withFileTypes: true });
    for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
      const name = relative + entry.name;
      if (name === 'manifest.json') continue;
      if (entry.isSymbolicLink()) throw Error('Symlink in installed skill');

      hash.update(name);
      if (entry.isDirectory()) await walk(join(path, entry.name), `${name}/`);
      else hash.update(await readFile(join(path, entry.name)));
    }
  }

  await walk(dir);
  hash.update(manifest.sourceHash);
  hash.update(manifest.version);
  return hash.digest('hex');
}

async function inspectInstallation(dest) {
  const state = await statIfExists(dest);
  if (state?.isSymbolicLink() || (state && !state.isDirectory())) {
    throw Error('Destination is not a regular directory');
  }

  let manifest = null;
  try {
    manifest = JSON.parse(await readFile(join(dest, 'manifest.json'), 'utf8'));
  } catch {
    // A folder without a readable manifest is an unmanaged installation.
  }

  const clean = Boolean(state && manifest?.installedHash)
    && await installedDigest(dest, manifest) === manifest.installedHash;
  return { exists: Boolean(state), manifest, clean };
}

function reportInstallation(dest, installed, bundled) {
  const sourceMatches = installed.manifest?.sourceHash === bundled.sourceHash;
  console.log(JSON.stringify({
    path: dest,
    installedVersion: installed.manifest?.version || null,
    bundledVersion: bundled.version,
    sourceMatches,
    localChanges: installed.exists ? !installed.clean : null
  }, null, 2));

  if (!installed.manifest || !installed.clean || !sourceMatches) process.exitCode = 1;
}

async function replaceInstallation({ base, dest }, installed, manifest, force) {
  await mkdir(base, { recursive: true });
  const temp = await mkdtemp(join(base, '.deernova-style-'));
  let backup;

  try {
    // Prepare the complete replacement before touching the installed directory.
    await cp(bundledSkill, temp, { recursive: true });
    const installedHash = await installedDigest(temp, manifest);
    await writeFile(join(temp, 'manifest.json'), JSON.stringify({
      ...manifest,
      installedHash
    }, null, 2) + '\n');

    if (installed.exists) {
      backup = `${dest}.backup-${Date.now()}`;
      await rename(dest, backup);
    }

    try {
      await rename(temp, dest);
    } catch (error) {
      if (backup) await rename(backup, dest);
      throw error;
    }

    const keepBackup = backup && (!installed.clean || force);
    if (backup && !keepBackup) await rm(backup, { recursive: true });
    console.log(`Installed Deernova v${manifest.version}: ${dest}`);
    if (keepBackup) console.log(`Backup: ${backup}`);
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
}

async function main() {
  const { command, options, positional } = parseArgs(process.argv.slice(2));
  if (['help', '--help', '-h'].includes(command)) {
    console.log(HELP);
    return;
  }
  if (!['version', 'install', 'update', 'doctor'].includes(command)) {
    throw Error(`Unknown command: ${command}`);
  }

  const manifest = JSON.parse(await readFile(join(bundledSkill, 'manifest.json'), 'utf8'));
  if (command === 'version') {
    console.log(manifest.version);
    return;
  }
  if (positional !== undefined) {
    throw Error('Use --repo to specify a repository or --dir to specify a skills parent');
  }

  const destination = await resolveDestination(options);
  const installed = await inspectInstallation(destination.dest);
  if (command === 'doctor') {
    reportInstallation(destination.dest, installed, manifest);
    return;
  }
  if (command === 'update' && !installed.manifest) {
    throw Error('No managed installation found. Run install first.');
  }
  if (installed.exists && !options.force && (!installed.clean || command === 'install')) {
    throw Error('Skill exists or contains local changes. Use update for clean installs, or --force to back up and replace.');
  }

  await replaceInstallation(destination, installed, manifest, options.force);
}

main().catch(error => {
  console.error(`deernova-style: ${error.message}`);
  process.exitCode = 1;
});
