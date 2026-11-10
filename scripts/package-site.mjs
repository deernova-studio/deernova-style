import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ROOT } from './lib/files.mjs';
import { buildSite } from './build-site.mjs';

const { version } = await buildSite();
const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
const archive = join(ROOT, 'releases', `deernova-site-${version}-${stamp}.tgz`);
await mkdir(join(ROOT, 'releases'), { recursive: true });
// Only built public assets; never include repository metadata or credentials.
execFileSync('tar', ['-czf', archive, '-C', join(ROOT, 'dist'), 'index.html', 'guide.html', 'styles', 'scripts', 'assets'], {
  env: { ...process.env, COPYFILE_DISABLE: '1' },
});
const sha256 = createHash('sha256').update(await readFile(archive)).digest('hex');
await writeFile(`${archive}.sha256`, `${sha256}  ${archive.split('/').at(-1)}\n`);
console.log(`Archive: ${archive}\nSHA256: ${sha256}`);
