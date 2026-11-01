import { cp, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { read, write } from './files.mjs';

export const GROUPS = ['color', 'shadow', 'spacing', 'radius', 'stroke', 'size'];
export const tokenValue = (value, theme) => typeof value === 'object'
  ? value[theme]
  : value.replace?.(/\{([^}]+)\}/g, 'var(--$1)') ?? value;

export async function readDesign(root) {
  const version = JSON.parse(await read(join(root, 'package.json'))).version;
  const tokens = JSON.parse(await read(join(root, 'design/tokens.json')));
  const components = [];
  const entries = await readdir(join(root, 'examples/html'), { withFileTypes: true });
  for (const { name } of entries.filter(entry => entry.isDirectory()).sort((a,b) => a.name.localeCompare(b.name))) {
    const preview = await read(join(root, `examples/html/${name}/preview.html`));
    const doc = await read(join(root, `design/components/${name}/README.md`));
    components.push({ name, doc, height: Number(preview.match(/height=(\d+)/)?.[1] || 360), subtitle: preview.match(/subtitle="([^"]+)"/)?.[1] || '' });
  }
  return { version, tokens, components, foundations: await read(join(root, 'design/README.md')) };
}

export function renderTokens(tokens) {
  const declarations = theme => GROUPS.flatMap(group => tokens[group].tokens.map(token => `  --${token.name}: ${tokenValue(token.value, theme)};`))
    .concat(Object.entries(tokens.type.families).map(([key,value]) => `  --font-${key}: ${value};`)).join('\n');
  return `/* Generated from design/tokens.json. Do not edit. */\n:root {\n${declarations('light')}\n}\n@media(prefers-color-scheme:dark){:root:not([data-theme="light"]){\n${declarations('dark')}\n}}\n:root[data-theme="dark"]{\n${declarations('dark')}\n}\n`;
}

// Both consumers receive the same relative layout, so examples stay self-contained.
export async function copyDesignAssets(root, destination, tokens) {
  await cp(join(root, 'design'), join(destination, 'design'), { recursive: true });
  await cp(join(root, 'examples/html'), join(destination, 'examples/html'), { recursive: true });
  await write(join(destination, 'design/tokens.css'), renderTokens(tokens));
}
