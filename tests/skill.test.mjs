import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { SKILL_DIR } from '../scripts/lib/design.mjs';
import { staleTokenOutputs } from '../scripts/tokens.mjs';

const markdownFiles = async () => [
  join(SKILL_DIR, 'SKILL.md'),
  ...(await readdir(join(SKILL_DIR, 'references'))).filter(name => name.endsWith('.md')).map(name => join(SKILL_DIR, 'references', name))
];

test('SKILL.md has the frontmatter agents use to find it', async () => {
  const text = await readFile(join(SKILL_DIR, 'SKILL.md'), 'utf8');
  const frontmatter = text.match(/^---\n([\s\S]*?)\n---\n/)?.[1];
  assert.ok(frontmatter, 'missing frontmatter');
  assert.match(frontmatter, /^name: deernova-style$/m);
  const description = frontmatter.match(/^description: (.+)$/m)?.[1] ?? '';
  assert.ok(description.length > 40 && description.length <= 1024, 'description must say when to use the skill and stay under 1024 characters');
});

test('links and asset paths in the skill resolve inside the skill', async () => {
  for (const file of await markdownFiles()) {
    const text = await readFile(file, 'utf8');
    for (const [, target] of text.matchAll(/\]\(([^)#\s]+)(?:#[^)]*)?\)/g)) {
      if (/^https?:/.test(target)) continue;
      await stat(join(dirname(file), target));
    }
    for (const [, path] of text.matchAll(/`(assets\/[^`*]+)`/g)) await stat(join(SKILL_DIR, path));
  }
});

test('the skill is guidance plus data, not a component library', async () => {
  assert.deepEqual((await readdir(SKILL_DIR)).sort(), ['SKILL.md', 'assets', 'references']);
  assert.deepEqual((await readdir(join(SKILL_DIR, 'assets'))).sort(), ['screens', 'tokens.css', 'tokens.json']);
  for (const name of await readdir(join(SKILL_DIR, 'assets/screens'))) assert.match(name, /^[a-z-]+-(light|dark)\.png$/);
  for (const name of await readdir(join(SKILL_DIR, 'references'))) assert.match(name, /\.md$/);
});

test('tokens.css and tokens.md are regenerated from tokens.json', async () => {
  assert.deepEqual(await staleTokenOutputs(), [], 'run npm run tokens');
});

test('text and control colors keep their contrast in both themes', async () => {
  const data = JSON.parse(await readFile(join(SKILL_DIR, 'assets/tokens.json'), 'utf8'));
  const colors = Object.fromEntries(data.color.tokens.map(token => [token.name, token.value]));
  const channel = value => { const c = parseInt(value, 16) / 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  const luminance = hex => hex.slice(1, 7).match(/../g).map(channel).reduce((sum, c, i) => sum + c * [0.2126, 0.7152, 0.0722][i], 0);
  const ratio = (a, b) => (Math.max(luminance(a), luminance(b)) + 0.05) / (Math.min(luminance(a), luminance(b)) + 0.05);
  for (const theme of ['light', 'dark']) {
    for (const text of ['ink', 'ink-secondary', 'ink-tertiary']) {
      for (const paper of ['canvas', 'surface', 'surface-raised', 'surface-sunken']) {
        assert.ok(ratio(colors[text][theme], colors[paper][theme]) >= 4.5, `${theme} ${text} on ${paper}`);
      }
    }
    for (const paper of ['canvas', 'surface', 'surface-raised']) {
      assert.ok(ratio(colors['line-control'][theme], colors[paper][theme]) >= 3, `${theme} line-control on ${paper}`);
    }
    assert.ok(ratio(colors['on-accent'][theme], colors.ink[theme]) >= 4.5, `${theme} on-accent on accent`);
  }
});
