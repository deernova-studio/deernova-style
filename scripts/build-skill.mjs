import { cp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { ROOT, hashTree, isMain, read, write } from './lib/files.mjs';
import { SKILL_DIR } from './lib/design.mjs';
import { staleTokenOutputs } from './tokens.mjs';

// The npm package ships the skill folder unchanged, plus a manifest the installer uses for update checks.
export async function buildSkill({ root = ROOT, out = join(root, 'packages/style/skill') } = {}) {
  const stale = await staleTokenOutputs(root);
  if (stale.length) throw Error(`Out of date, run npm run tokens: ${stale.join(', ')}`);
  const { version } = JSON.parse(await read(join(root, 'package.json')));
  await rm(out, { recursive: true, force: true });
  await cp(join(root, SKILL_DIR), out, { recursive: true, filter: source => !source.endsWith('.DS_Store') });
  const manifest = { version, sourceHash: await hashTree(out) };
  await write(join(out, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  return manifest;
}

if (isMain(import.meta.url)) {
  const manifest = await buildSkill();
  console.log(`Built skill ${manifest.version} into packages/style/skill.`);
}
