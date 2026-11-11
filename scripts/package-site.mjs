import { execFileSync } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ROOT, isMain } from './lib/files.mjs';
import { PAGES, buildSite } from './build-site.mjs';

// Keep the smoke sample in sync with scripts/deploy-site.py.
export const SMOKE_FILES = [...PAGES.map(page => `${page}.html`), 'styles/base.css', 'scripts/site.js', 'assets/tokens.json'];

export async function packageSite() {
  const { version } = await buildSite();
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
  const archive = join(ROOT, 'releases', `deernova-site-${version}-${stamp}-${randomUUID().slice(0, 8)}.tgz`);
  await mkdir(join(ROOT, 'releases'), { recursive: true });
  // Only built public assets; never include repository metadata or credentials.
  execFileSync('tar', ['-czf', archive, '-C', join(ROOT, 'dist'), ...PAGES.map(page => `${page}.html`), 'styles', 'scripts', 'assets'], {
    env: { ...process.env, COPYFILE_DISABLE: '1' },
  });
  const sha256 = createHash('sha256').update(await readFile(archive)).digest('hex');
  await writeFile(`${archive}.sha256`, `${sha256}  ${archive.split('/').at(-1)}\n`);
  const checks = {};
  for (const file of SMOKE_FILES) checks[file] = createHash('sha256').update(await readFile(join(ROOT, 'dist', file))).digest('hex');
  return { archive, sha256, checks };
}

if (isMain(import.meta.url)) {
  const { archive, sha256 } = await packageSite();
  console.log(`Archive: ${archive}\nSHA256: ${sha256}`);
}
