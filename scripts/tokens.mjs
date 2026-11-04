import { join } from 'node:path';
import { ROOT, isMain, read, write } from './lib/files.mjs';
import { readTokens, renderTokenOutputs } from './lib/design.mjs';

// tokens.json is edited by hand. Everything below is derived from it and committed with the skill:
// tokens.css, tailwind.css, DeernovaTokens.swift, references/tokens.md, and the generated tables
// inside hand-written Markdown (between <!-- tokens:name --> and <!-- /tokens -->).
export async function tokenOutputs(root = ROOT) {
  return renderTokenOutputs(root, await readTokens(root));
}

export async function staleTokenOutputs(root = ROOT) {
  const stale = [];
  for (const [path, content] of Object.entries(await tokenOutputs(root))) {
    const current = await read(join(root, path)).catch(() => null);
    if (current !== content) stale.push(path);
  }
  return stale;
}

if (isMain(import.meta.url)) {
  if (process.argv.includes('--check')) {
    const stale = await staleTokenOutputs();
    if (stale.length) {
      console.error(`Out of date, run npm run tokens: ${stale.join(', ')}`);
      process.exitCode = 1;
    } else console.log('Token outputs are up to date.');
  } else {
    const outputs = await tokenOutputs();
    for (const [path, content] of Object.entries(outputs)) await write(join(ROOT, path), content);
    console.log(`Wrote ${Object.keys(outputs).length} generated files.`);
  }
}
