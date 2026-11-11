import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ROOT, isMain } from './lib/files.mjs';
import { curvePath } from '../packages/icons/loaders.mjs';

// The icon set lives in packages/icons: icons.json lists every icon, src/ holds one 24×24 stroke SVG each.
// `node scripts/icons.mjs import` copies the Lucide-based ones from lucide-static; `build` writes dist/.
export const ICONS_DIR = 'packages/icons';
const ELEMENTS = ['path', 'circle', 'rect', 'line', 'polyline', 'ellipse'];
const OPEN = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">';

export async function readManifest(root = ROOT) {
  return JSON.parse(await readFile(join(root, ICONS_DIR, 'icons.json'), 'utf8'));
}

export const iconList = manifest => manifest.groups.flatMap(group => group.icons.map(icon => ({ ...icon, group: group.id })));

// The drawing inside <svg>, one element per line, without comments or whitespace noise.
export function iconBody(svg) {
  const inner = svg.replace(/<!--[\s\S]*?-->/g, '').match(/<svg[^>]*>([\s\S]*)<\/svg>/)?.[1];
  if (inner == null) throw Error('Not an SVG');
  return inner.match(/<(\w+)\b[^>]*\/>/g)?.map(element => element.replace(/\s+/g, ' ').replace(/\s*\/>$/, '/>')) ?? [];
}

export function sourceSvg(icon, body) {
  const note = icon.source === 'lucide' ? `<!-- From Lucide "${icon.lucide}" (ISC, see LICENSE-LUCIDE) -->\n`
    : icon.source === 'redrawn' ? `<!-- Redrawn for Deernova; replaces Lucide "${icon.lucide}" -->\n` : '';
  return `${note}${OPEN}\n${body.map(element => `  ${element}`).join('\n')}\n</svg>\n`;
}

export async function readIcons(root = ROOT) {
  const manifest = await readManifest(root);
  const icons = [];
  for (const icon of iconList(manifest)) {
    const svg = await readFile(join(root, ICONS_DIR, 'src', `${icon.name}.svg`), 'utf8');
    icons.push({ ...icon, svg, body: iconBody(svg) });
  }
  return { manifest, icons };
}

// Icons that are a loader's rest frame are drawn from the loader's curve, so the two can never drift apart.
export const curveBody = name => [`<path d="${curvePath(name)}"/>`];

export async function lucideBody(name, root = ROOT) {
  return iconBody(await readFile(join(root, 'node_modules/lucide-static/icons', `${name}.svg`), 'utf8'));
}

async function importLucide(root = ROOT) {
  const icons = iconList(await readManifest(root));
  const lucide = icons.filter(icon => icon.source === 'lucide');
  for (const icon of lucide) await writeFile(join(root, ICONS_DIR, 'src', `${icon.name}.svg`), sourceSvg(icon, await lucideBody(icon.lucide, root)));
  for (const icon of icons.filter(item => item.curve)) await writeFile(join(root, ICONS_DIR, 'src', `${icon.name}.svg`), sourceSvg(icon, curveBody(icon.curve)));
  return lucide.length;
}

export function problems({ manifest, icons }, files) {
  const out = [];
  const names = icons.map(icon => icon.name);
  for (const name of names) if (names.indexOf(name) !== names.lastIndexOf(name)) out.push(`${name}: listed twice`);
  for (const file of files) if (!names.includes(file.replace(/\.svg$/, ''))) out.push(`${file}: not in icons.json`);
  for (const icon of icons) {
    if (!/^[a-z]+(-[a-z]+)*$/.test(icon.name)) out.push(`${icon.name}: name must be kebab-case`);
    if (!['lucide', 'redrawn', 'deernova'].includes(icon.source)) out.push(`${icon.name}: unknown source ${icon.source}`);
    if (icon.source !== 'deernova' && !icon.lucide) out.push(`${icon.name}: name the Lucide icon it comes from`);
    if (!icon.label) out.push(`${icon.name}: missing label`);
    if (icon.curve && icon.body.join('') !== curveBody(icon.curve).join('')) out.push(`${icon.name}: differs from the ${icon.curve} loader curve; run npm run icons -- import`);
    if (!icon.svg.includes(OPEN)) out.push(`${icon.name}: use the shared <svg> attributes (24 grid, 1.75 stroke, round caps)`);
    if (!icon.body.length) out.push(`${icon.name}: empty drawing`);
    for (const element of icon.body) {
      const tag = element.match(/^<(\w+)/)[1];
      if (!ELEMENTS.includes(tag)) out.push(`${icon.name}: <${tag}> is not allowed`);
      if (/\b(fill|stroke|stroke-width|style|class|transform)=/.test(element)) out.push(`${icon.name}: elements inherit paint and stroke, found ${element}`);
    }
  }
  if (manifest.grid !== 24 || manifest.stroke !== 1.75) out.push('icons.json: grid must be 24 and stroke 1.75');
  return out;
}

// One hidden <svg> of <symbol id="dn-name">, to inline once per page and reference with <use href="#dn-name">.
export const spriteSvg = icons => `<svg xmlns="http://www.w3.org/2000/svg" style="display:none">\n${icons.map(icon =>
  `<symbol id="dn-${icon.name}" viewBox="0 0 24 24">${icon.body.join('')}</symbol>`).join('\n')}\n</svg>\n`;

export async function buildIcons({ root = ROOT } = {}) {
  const set = await readIcons(root);
  const files = (await readdir(join(root, ICONS_DIR, 'src'))).filter(file => file.endsWith('.svg'));
  const found = problems(set, files);
  if (found.length) throw Error(`Icon set has problems:\n${found.join('\n')}`);
  const out = join(root, ICONS_DIR, 'dist');
  await rm(out, { recursive: true, force: true });
  await mkdir(join(out, 'svg'), { recursive: true });
  const body = icon => icon.body.join('');
  for (const icon of set.icons) await writeFile(join(out, 'svg', `${icon.name}.svg`), `${OPEN}${body(icon)}</svg>\n`);
  await writeFile(join(out, 'sprite.svg'), spriteSvg(set.icons));
  const map = Object.fromEntries(set.icons.map(icon => [icon.name, body(icon)]));
  await writeFile(join(out, 'index.mjs'), `// Generated by scripts/icons.mjs. Edit packages/icons/src instead.
export const icons = ${JSON.stringify(map, null, 2)};
export const names = Object.keys(icons);
const escape = text => String(text).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
// An inline <svg>. Color comes from currentColor; size and stroke from the .dn-icon class in tokens.css.
export function svg(name, { className = 'dn-icon', label } = {}) {
  if (!(name in icons)) throw Error(\`Unknown Deernova icon: \${name}\`);
  const a11y = label ? \`role="img" aria-label="\${escape(label)}"\` : 'aria-hidden="true"';
  return \`<svg class="\${escape(className)}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" \${a11y}>\${icons[name]}</svg>\`;
}
`);
  await writeFile(join(out, 'index.d.ts'), `export type IconName = ${set.icons.map(icon => `'${icon.name}'`).join(' | ')};
export declare const icons: Record<IconName, string>;
export declare const names: IconName[];
export declare function svg(name: IconName, options?: { className?: string; label?: string }): string;
`);
  await writeFile(join(out, 'icons.json'), `${JSON.stringify(set.manifest, null, 2)}\n`);
  return set.icons.length;
}

if (isMain(import.meta.url)) {
  const command = process.argv[2] ?? 'build';
  if (command === 'import') console.log(`Imported ${await importLucide()} Lucide icons into ${ICONS_DIR}/src.`);
  else console.log(`Built ${await buildIcons()} icons into ${ICONS_DIR}/dist.`);
}
