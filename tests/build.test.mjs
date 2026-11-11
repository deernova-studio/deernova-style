import test from 'node:test';
import assert from 'node:assert/strict';
import { cp, mkdtemp, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { buildSite } from '../scripts/build-site.mjs';
import { buildSkill } from '../scripts/build-skill.mjs';
import { SKILL_DIR } from '../scripts/lib/design.mjs';
import { hashTree } from '../scripts/lib/files.mjs';

async function files(root) {
  const result = [];
  for (const entry of await readdir(root, { withFileTypes: true })) {
    const path = join(root, entry.name);
    result.push(...(entry.isDirectory() ? await files(path) : [path]));
  }
  return result;
}

test('the npm package carries the skill folder byte for byte', async () => {
  const { version } = JSON.parse(await readFile('package.json', 'utf8'));
  const manifest = JSON.parse(await readFile('packages/style/skill/manifest.json', 'utf8'));
  assert.equal(manifest.version, version);
  assert.equal(manifest.sourceHash, await hashTree('packages/style/skill'));
  const source = await files(SKILL_DIR);
  for (const file of source) {
    assert.deepEqual(await readFile(join('packages/style/skill', relative(SKILL_DIR, file))), await readFile(file), file);
  }
  assert.equal((await files('packages/style/skill')).length, source.length + 1, 'only manifest.json is added');
});

test('builds leave sources alone, and website edits do not change the skill', async () => {
  const root = await mkdtemp(join(tmpdir(), 'deernova-build-'));
  try {
    for (const path of ['skills', 'apps', 'packages/icons/src', 'packages/icons/icons.json', 'packages/loaders/src', 'package.json']) await cp(resolve(path), join(root, path), { recursive: true });
    const sources = async () => Promise.all(['skills', 'apps', 'packages/icons/src'].map(path => hashTree(join(root, path))));
    const before = await sources();
    const skill = await buildSkill({ root });
    await buildSite({ root });
    assert.deepEqual(await sources(), before, 'builds must not write into sources');

    const css = join(root, 'apps/website/styles/home.css');
    await writeFile(css, (await readFile(css, 'utf8')) + '\n/* website-only change */\n');
    await buildSite({ root });
    assert.equal((await buildSkill({ root })).sourceHash, skill.sourceHash, 'website changes must not invalidate installed skills');

    const guide = join(root, SKILL_DIR, 'references/review.md');
    await writeFile(guide, (await readFile(guide, 'utf8')) + '\n新增一条审查规则。\n');
    assert.notEqual((await buildSkill({ root })).sourceHash, skill.sourceHash, 'guideline changes must produce a new skill hash');
    await buildSite({ root });
    assert.match(await readFile(join(root, 'dist/guide.html'), 'utf8'), /新增一条审查规则。/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('website pages are fully rendered and only reference files that exist', async () => {
  for (const page of ['index.html', 'guide.html', 'icons.html', 'loaders.html']) {
    const html = await readFile(join('dist', page), 'utf8');
    assert.doesNotMatch(html, /\{\{\w+\}\}/, `${page} has an unfilled placeholder`);
    for (const [, target] of html.matchAll(/(?:src|href)="([^"#]+)/g)) {
      if (/^(https?:|mailto:)/.test(target)) continue;
      await stat(join('dist', target === './' ? 'index.html' : target));
    }
    for (const [, id] of html.matchAll(/href="#([^"]+)"/g)) assert.match(html, new RegExp(`id="${id}"`), `${page} links to missing #${id}`);
  }
  for (const file of await files('dist/scripts')) {
    const source = await readFile(file, 'utf8');
    for (const [, target] of source.matchAll(/\bfrom\s+['"](\.[^'"]+)['"]/g)) {
      await stat(join(dirname(file), target));
    }
  }
});

test('the deploy script accepts exactly the pages the site builds', async () => {
  const { PAGES } = await import('../scripts/build-site.mjs');
  const deploy = await readFile('scripts/deploy-site.py', 'utf8');
  const listed = deploy.match(/^PAGES = \{([^}]*)\}/m)[1].match(/'([^']+)'/g).map(name => name.slice(1, -1)).sort();
  assert.deepEqual(listed, PAGES.map(page => `${page}.html`).sort());
});
