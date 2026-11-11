import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { ICONS_DIR, buildIcons, iconBody, lucideBody, problems, readIcons } from '../scripts/icons.mjs';

test('every icon follows the grid, stroke and naming rules', async () => {
  const set = await readIcons();
  const files = (await readdir(join(ICONS_DIR, 'src'))).filter(file => file.endsWith('.svg'));
  assert.deepEqual(problems(set, files), []);
  assert.equal(set.icons.length, files.length);
});

test('icons marked as Lucide are unchanged Lucide drawings; changed ones are marked redrawn', async () => {
  const { icons } = await readIcons();
  for (const icon of icons.filter(item => item.source === 'lucide')) {
    assert.deepEqual(icon.body, await lucideBody(icon.lucide), `${icon.name} differs from Lucide "${icon.lucide}"; mark it redrawn`);
    assert.match(icon.svg, /ISC, see LICENSE-LUCIDE/, `${icon.name} must credit Lucide`);
  }
  for (const icon of icons.filter(item => item.source === 'redrawn')) {
    assert.notDeepEqual(icon.body, await lucideBody(icon.lucide), `${icon.name} is marked redrawn but matches Lucide`);
  }
});

test('the package ships the Lucide license and a working svg() helper', async () => {
  const pkg = JSON.parse(await readFile(join(ICONS_DIR, 'package.json'), 'utf8'));
  assert.ok(pkg.files.includes('LICENSE-LUCIDE') && pkg.files.includes('LICENSE'));
  assert.equal(pkg.license, 'MIT');
  assert.match(await readFile(join(ICONS_DIR, 'LICENSE'), 'utf8'), /^MIT License/);
  assert.match(await readFile(join(ICONS_DIR, 'LICENSE-LUCIDE'), 'utf8'), /ISC License/);
  const count = await buildIcons();
  const module = await import(`${pathToFileURL(join(process.cwd(), ICONS_DIR, 'dist/index.mjs')).href}?${Date.now()}`);
  assert.equal(module.names.length, count);
  assert.match(module.svg('send'), /^<svg class="dn-icon" viewBox="0 0 24 24"[^>]*aria-hidden="true">/);
  assert.match(module.svg('send', { label: '发送' }), /role="img" aria-label="发送"/);
  assert.throws(() => module.svg('sparkles'), /Unknown Deernova icon/);
  const sprite = await readFile(join(ICONS_DIR, 'dist/sprite.svg'), 'utf8');
  assert.equal(sprite.match(/<symbol /g).length, count);
  assert.deepEqual(iconBody(await readFile(join(ICONS_DIR, 'dist/svg/send.svg'), 'utf8')), module.icons.send.match(/<\w+[^>]*\/>/g));
});

test('the skill draws every icon from the icon set and every loader from the loader set', async () => {
  const { LOADERS } = await import('../packages/icons/loaders.mjs');
  const { icons } = await readIcons();
  const names = new Set(icons.map(icon => icon.name));
  const dir = 'skills/deernova-style';
  const docs = [join(dir, 'SKILL.md'), ...(await readdir(join(dir, 'references'), { recursive: true })).filter(file => file.endsWith('.md')).map(file => join(dir, 'references', file))];
  for (const file of docs) {
    const text = await readFile(file, 'utf8');
    for (const [, name] of text.matchAll(/<use href="#dn-([\w-]+)"/g)) assert.ok(names.has(name), `${file} uses unknown icon ${name}`);
    for (const [, name] of text.matchAll(/<dn-loader name="([\w-]+)"/g)) assert.ok(name in LOADERS, `${file} uses unknown loader ${name}`);
    for (const [svg] of text.matchAll(/<svg\b[^>]*>[\s\S]*?<\/svg>/g)) assert.match(svg, /^<svg[^>]*><use href="#dn-[\w-]+"\/><\/svg>$/, `${file} draws an icon by hand: ${svg.slice(0, 80)}`);
  }
});
