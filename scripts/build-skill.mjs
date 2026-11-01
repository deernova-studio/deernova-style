import { cp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { ROOT, hashTree, isMain, read, write } from './lib/files.mjs';
import { GROUPS, copyDesignAssets, readDesign, tokenValue } from './lib/design.mjs';

export async function buildSkill({ root = ROOT, out = join(root, 'packages/style/skill') } = {}) {
  const { version, tokens, components, foundations } = await readDesign(root);
  await rm(out, { recursive: true, force: true });
  await cp(join(root, 'skill'), out, { recursive: true });
  await copyDesignAssets(root, join(out, 'assets'), tokens);
  await write(join(out, 'references/foundations.md'), foundations);
  await write(join(out, 'references/components.md'), components.map(component => `## ${component.name}\n\n${component.doc}`).join('\n\n'));
  await write(join(out, 'references/tokens.md'), GROUPS.map(group => `## ${group}\n\n` + tokens[group].tokens.map(token => `- \`${token.name}\`: light \`${tokenValue(token.value,'light')}\`; dark \`${tokenValue(token.value,'dark')}\`. ${token.usage}`).join('\n')).join('\n\n'));
  await write(join(out, 'references/motion.md'), await read(join(root, 'design/motion.md')));
  const manifest = { version, sourceHash: await hashTree(out), components: components.map(component => component.name) };
  await write(join(out, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  return manifest;
}
if (isMain(import.meta.url)) {
  const manifest = await buildSkill();
  console.log(`Built skill ${manifest.version}: ${manifest.components.length} HTML references.`);
}
