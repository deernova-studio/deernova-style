import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { SKILL_DIR, colorIn, densityIds, groupTokens, isDensity, skillMarkdownFiles } from '../scripts/lib/design.mjs';
import { ROOT } from '../scripts/lib/files.mjs';
import { staleTokenOutputs } from '../scripts/tokens.mjs';

const markdownFiles = async () => (await skillMarkdownFiles(ROOT)).map(file => join(SKILL_DIR, file));
const readJson = async () => JSON.parse(await readFile(join(SKILL_DIR, 'assets/tokens.json'), 'utf8'));
const cssBlocks = text => [...text.matchAll(/```css\n([\s\S]*?)```/g)].map(match => match[1]);

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
  assert.deepEqual((await readdir(join(SKILL_DIR, 'assets'))).sort(),
    ['DeernovaTokens.swift', 'screens', 'tailwind.css', 'tokens.css', 'tokens.json']);
  for (const name of await readdir(join(SKILL_DIR, 'assets/screens'))) assert.match(name, /^[a-z-]+-(light|dark)\.png$/);
  const references = await readdir(join(SKILL_DIR, 'references'), { withFileTypes: true });
  assert.deepEqual(references.filter(entry => entry.isDirectory()).map(entry => entry.name).sort(), ['components', 'foundations', 'scenes']);
  for (const file of await skillMarkdownFiles(ROOT)) assert.match(file, /\.md$/);
});

test('generated token files and tables match tokens.json', async () => {
  assert.deepEqual(await staleTokenOutputs(), [], 'run npm run tokens');
});

test('token names are platform-neutral and every density has a value', async () => {
  const tokens = await readJson();
  const ids = densityIds(tokens);
  assert.deepEqual(ids, ['desktop', 'touch', 'comfortable']);
  for (const scene of tokens.scenes) assert.ok(ids.includes(scene.density), `${scene.id} uses an unknown density`);
  const names = [...tokens.color.tokens, ...groupTokens(tokens).flatMap(group => group.tokens)].map(token => token.name);
  assert.equal(new Set(names).size, names.length, 'token names must be unique');
  for (const name of names) assert.doesNotMatch(name, /(^|-)(mac|macos|ios|ipad|ipados|web|android)(-|$)/, `${name} names a platform; put the difference in its density values`);
  for (const role of tokens.type.roles) assert.deepEqual(Object.keys(role.values), ids, `type ${role.name}`);
  for (const token of groupTokens(tokens).flatMap(group => group.tokens).filter(isDensity)) {
    assert.deepEqual(Object.keys(token.values), ids, `${token.name} must define every density`);
  }
});

test('every component documents its sizes and every reference is reachable', async () => {
  const tokens = await readJson();
  for (const component of tokens.components) {
    const text = await readFile(join(SKILL_DIR, component.reference), 'utf8');
    if (component.reference.includes('/components/')) assert.match(text, new RegExp(`<!-- tokens:${component.id} -->`), `${component.reference} must embed its size table`);
  }
  const skill = await readFile(join(SKILL_DIR, 'SKILL.md'), 'utf8');
  for (const file of await skillMarkdownFiles(ROOT)) {
    if (file === 'SKILL.md' || file === 'references/review.md' || file === 'references/tokens.md') continue;
    assert.match(skill, new RegExp(`\\]\\(${file.replace(/[.]/g, '\\.')}\\)`), `SKILL.md must link to ${file}`);
  }
});

test('component docs share one section order and the name index covers each of them', async () => {
  const skill = await readFile(join(SKILL_DIR, 'SKILL.md'), 'utf8');
  const index = skill.match(/### 按代码里的名字找\n([\s\S]*?)\n### /)?.[1] ?? '';
  const dir = join(SKILL_DIR, 'references/components');
  for (const name of (await readdir(dir)).filter(file => file.endsWith('.md'))) {
    const headings = [...(await readFile(join(dir, name), 'utf8')).matchAll(/^## (.+)$/gm)].map(match => match[1]);
    assert.ok(headings.includes('尺寸'), `${name} needs a 尺寸 section`);
    assert.deepEqual(headings.slice(-3), ['Web', 'SwiftUI', '不要'], `${name} must end with Web, SwiftUI, 不要`);
    assert.match(index, new RegExp(`\\]\\(references/components/${name.replace('.', '\\.')}\\)`), `the name index must route to ${name}`);
  }
});

test('reference CSS sizes controls with tokens, not padding or inherited line height', async () => {
  const button = cssBlocks(await readFile(join(SKILL_DIR, 'references/components/button.md'), 'utf8')).join('\n');
  const rule = button.match(/\.dn-button \{([\s\S]*?)\n\}/)?.[1] ?? '';
  assert.match(rule, /height: var\(--button-height-md\)/);
  assert.match(rule, /padding: 0 var\(--button-padding-x-md\)/);
  assert.match(rule, /\/1 var\(--font-sans\)/, 'button text must not inherit the page line height');
  assert.match(button, /::before[\s\S]*var\(--hit-min\)/, 'hit areas grow with a pseudo-element');

  const css = await readFile(join(SKILL_DIR, 'assets/tokens.css'), 'utf8');
  const defined = new Set([...css.matchAll(/--([\w-]+):/g)].map(match => match[1]));
  for (const file of await skillMarkdownFiles(ROOT)) {
    for (const block of cssBlocks(await readFile(join(SKILL_DIR, file), 'utf8'))) {
      if (!block.includes('.dn-')) continue;
      assert.equal(block.split('{').length, block.split('}').length, `${file}: unbalanced braces`);
      const local = new Set([...block.matchAll(/(--[\w-]+):/g)].map(match => match[1].slice(2)));
      for (const [, name] of block.matchAll(/var\(--([\w-]+)\)/g)) {
        if (local.has(name)) continue;
        assert.ok(defined.has(name), `${file} uses undefined token --${name}`);
      }
    }
  }
});

test('text and control colors keep their contrast in both themes', async () => {
  const tokens = await readJson();
  const color = (name, theme) => colorIn(tokens, name, theme);
  const channel = value => { const c = parseInt(value, 16) / 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  const luminance = hex => hex.slice(1, 7).match(/../g).map(channel).reduce((sum, c, i) => sum + c * [0.2126, 0.7152, 0.0722][i], 0);
  const ratio = (a, b) => (Math.max(luminance(a), luminance(b)) + 0.05) / (Math.min(luminance(a), luminance(b)) + 0.05);
  for (const theme of ['light', 'dark']) {
    for (const text of ['ink', 'ink-secondary', 'ink-tertiary']) {
      for (const paper of ['canvas', 'surface', 'surface-raised', 'surface-sunken']) {
        assert.ok(ratio(color(text, theme), color(paper, theme)) >= 4.5, `${theme} ${text} on ${paper}`);
      }
    }
    for (const paper of ['canvas', 'surface', 'surface-raised']) {
      assert.ok(ratio(color('line-control', theme), color(paper, theme)) >= 3, `${theme} line-control on ${paper}`);
    }
    for (const status of ['success', 'warning', 'danger', 'info']) {
      assert.ok(ratio(color(status, theme), color(`${status}-soft`, theme)) >= 4.5, `${theme} ${status} on ${status}-soft`);
      assert.ok(ratio(color(status, theme), color('surface', theme)) >= 4.5, `${theme} ${status} on surface`);
    }
    assert.ok(ratio(color('on-accent', theme), color('accent', theme)) >= 4.5, `${theme} on-accent on accent`);
    assert.ok(ratio(color('on-accent', theme), color('danger', theme)) >= 4.5, `${theme} on-accent on danger (solid danger button)`);
  }
});
