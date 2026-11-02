import { join } from 'node:path';
import { ROOT, isMain, read, write } from './lib/files.mjs';
import { SKILL_DIR, readTokens, renderTokensCss, renderTokensMarkdown } from './lib/design.mjs';

// tokens.json is edited by hand; these two files are derived from it and committed with the skill.
export async function tokenOutputs(root = ROOT) {
  const tokens = await readTokens(root);
  return {
    [join(SKILL_DIR, 'assets/tokens.css')]: renderTokensCss(tokens),
    [join(SKILL_DIR, 'references/tokens.md')]: renderTokensMarkdown(tokens)
  };
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
    for (const [path, content] of Object.entries(await tokenOutputs())) await write(join(ROOT, path), content);
    console.log('Wrote assets/tokens.css and references/tokens.md.');
  }
}
