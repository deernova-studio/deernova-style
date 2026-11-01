import test from 'node:test';
import assert from 'node:assert/strict';
import { cp, mkdtemp, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { buildSkill } from '../scripts/build-skill.mjs';
import { buildSite } from '../scripts/build-site.mjs';
import { hashTree } from '../scripts/lib/files.mjs';

async function files(root) {
  const result = [];
  for (const entry of await readdir(root, { withFileTypes: true })) {
    const path = join(root, entry.name);
    result.push(...(entry.isDirectory() ? await files(path) : [path]));
  }
  return result;
}

test('site and skill builds are independent; shared guidelines and HTML examples update both', async () => {
  const root = await mkdtemp(join(tmpdir(), 'deernova-architecture-'));
  try {
    for (const path of ['design', 'examples', 'skill', 'apps', 'package.json']) {
      await cp(resolve(path), join(root, path), { recursive: true });
    }
    const sourceHashes = await Promise.all(['design','examples','skill','apps'].map(path => hashTree(join(root,path))));
    const initialSkill = await buildSkill({ root });
    const initialSite = await buildSite({ root });
    assert.deepEqual(await Promise.all(['design','examples','skill','apps'].map(path => hashTree(join(root,path)))), sourceHashes, 'build must not modify sources');
    const installedSkill = await hashTree(join(root, 'packages/style/skill'));
    const css = join(root, 'apps/website/styles/home.css');
    await writeFile(css, (await readFile(css, 'utf8')) + '\n/* Website-only revision */\n');
    const revisedSite = await buildSite({ root });
    assert.notEqual(revisedSite.sourceHash, initialSite.sourceHash);
    assert.equal(await hashTree(join(root, 'packages/style/skill')), installedSkill, 'site build must not touch skill output');
    const revisedSkill = await buildSkill({ root });
    assert.equal(revisedSkill.sourceHash, initialSkill.sourceHash, 'site-only revision must not invalidate skill');
    assert.equal(await hashTree(join(root, 'dist')), revisedSite.sourceHash, 'skill build must not touch site output');
    const motion = join(root, 'design/motion.md');
    await writeFile(motion, (await readFile(motion,'utf8')) + '\nShared guideline revision.\n');
    const guidelineSkill = await buildSkill({ root });
    const guidelineSite = await buildSite({ root });
    assert.notEqual(guidelineSkill.sourceHash, revisedSkill.sourceHash);
    assert.notEqual(guidelineSite.sourceHash, revisedSite.sourceHash);
    assert.match(await readFile(join(root,'packages/style/skill/references/motion.md'),'utf8'), /Shared guideline revision/);
    assert.match(await readFile(join(root,'dist/reference.html'),'utf8'), /Shared guideline revision/);
    const example = join(root,'examples/html/Button/preview.html');
    await writeFile(example, (await readFile(example,'utf8')) + '\n<!-- Updated example -->');
    assert.notEqual((await buildSkill({root})).sourceHash, guidelineSkill.sourceHash);
    assert.notEqual((await buildSite({root})).sourceHash, guidelineSite.sourceHash);
  } finally { await rm(root, { recursive:true, force:true }); }
});

test('every HTML, CSS and module dependency resolves in the website and installed skill assets', async () => {
  for (const root of ['dist', 'packages/style/skill/assets']) {
    for (const file of await files(root)) {
      if (!/\.(html|css|m?js)$/.test(file)) continue;
      const text = await readFile(file,'utf8');
      const expressions = file.endsWith('.html') ? [/(?:src|href)="([^"<>]+)"/g]
        : file.endsWith('.css') ? [/url\(['"]?([^)'"\s]+)['"]?\)/g]
        : [/(?:from\s+|import\s*)['"]([^'"]+)['"]/g];
      for (const expression of expressions) for (const match of text.matchAll(expression)) {
        const url = match[1];
        if (/^(?:[a-z]+:|\/\/|#)/i.test(url)) continue;
        const path = url.split(/[?#]/)[0];
        if (path) assert.ok((await stat(resolve(dirname(file), path))).isFile(), `${file}: ${url}`);
      }
    }
  }
  const skillFiles = await files('packages/style/skill');
  assert.ok(!skillFiles.some(path => /\/apps\/|\/website\//.test(path)));
});
