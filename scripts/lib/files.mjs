import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const ROOT = fileURLToPath(new URL('../../', import.meta.url));
export const read = path => readFile(path, 'utf8');
export const write = async (path, content) => {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, content);
};
export const isMain = url => process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === url;
export const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');

// Hash the delivered files, independent of checkout/output path and file timestamps.
export async function hashTree(root) {
  const hash = createHash('sha256');
  async function walk(relative = '') {
    const entries = await readdir(join(root, relative), { withFileTypes: true });
    for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
      const name = relative ? `${relative}/${entry.name}` : entry.name;
      if (name === 'manifest.json') continue;
      if (entry.isDirectory()) await walk(name);
      else {
        const data = await readFile(join(root, name));
        hash.update(`${name}\0${data.length}\0`);
        hash.update(data);
      }
    }
  }
  await walk();
  return hash.digest('hex');
}
