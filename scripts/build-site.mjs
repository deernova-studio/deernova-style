import { cp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { ROOT, isMain, read, write } from './lib/files.mjs';
import { SKILL_DIR } from './lib/design.mjs';
import { renderGuide } from './lib/guide.mjs';
import { staleTokenOutputs } from './tokens.mjs';

const SITE = 'apps/website';
// Skill files the website serves as downloads, next to tokens.css.
export const SHARED_ASSETS = ['tokens.css', 'tokens.json', 'tailwind.css', 'DeernovaTokens.swift'];

// The dev server and static build share the same renderer.
export async function renderSiteHtml(html, { root = ROOT } = {}) {
  if (!/\{\{\w+\}\}/.test(html)) return html;
  const { version } = JSON.parse(await read(join(root, 'package.json')));
  const values = html.includes('{{docs}}') ? await renderGuide(root) : {};
  for (const [key, value] of Object.entries(values)) html = html.replaceAll(`{{${key}}}`, () => value);
  // The guide's own content can mention the version, so it is filled in last.
  return html.replaceAll('{{version}}', version);
}

export async function buildSite({ root = ROOT, out = join(root, 'dist') } = {}) {
  const stale = await staleTokenOutputs(root);
  if (stale.length) throw Error(`Out of date, run npm run tokens: ${stale.join(', ')}`);
  const { version } = JSON.parse(await read(join(root, 'package.json')));
  await rm(out, { recursive: true, force: true });
  for (const directory of ['styles', 'scripts', 'assets']) await cp(join(root, SITE, directory), join(out, directory), { recursive: true });
  for (const file of SHARED_ASSETS) await cp(join(root, SKILL_DIR, 'assets', file), join(out, 'assets', file));
  await cp(join(root, SKILL_DIR, 'assets/screens'), join(out, 'assets/screens'), { recursive: true });
  for (const page of ['index', 'guide']) {
    const template = await read(join(root, SITE, `${page}.html`));
    await write(join(out, `${page}.html`), await renderSiteHtml(template, { root }));
  }
  return { version, pages: ['index.html', 'guide.html'] };
}

if (isMain(import.meta.url)) {
  const site = await buildSite();
  console.log(`Built website ${site.version} into dist/.`);
}
