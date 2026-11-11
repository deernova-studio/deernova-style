import { cp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { ROOT, isMain, read, write } from './lib/files.mjs';
import { SKILL_DIR } from './lib/design.mjs';
import { referenceCss, renderGuide } from './lib/guide.mjs';
import { renderIconCatalog, renderIconSummary } from './lib/icon-catalog.mjs';
import { readIcons, spriteSvg } from './icons.mjs';
import { staleTokenOutputs } from './tokens.mjs';

const SITE = 'apps/website';
// Skill files the website serves as downloads, next to tokens.css.
export const SHARED_ASSETS = ['tokens.css', 'tokens.json', 'tailwind.css', 'DeernovaTokens.swift'];
// Every page the site publishes; package-site.mjs and deploy-site.py accept exactly these.
export const PAGES = ['index', 'guide', 'icons', 'loaders'];

// The dev server and static build share the same renderer. Each {{placeholder}} is filled only when a page uses it.
export async function renderSiteHtml(html, { root = ROOT } = {}) {
  if (!/\{\{\w+\}\}/.test(html)) return html;
  const { version } = JSON.parse(await read(join(root, 'package.json')));
  const has = key => html.includes(`{{${key}}}`);
  const icons = has('iconSprite') || has('thinkingIcon') ? (await readIcons(root)).icons : [];
  const values = has('docs') ? await renderGuide(root) : {};
  if (has('referenceCss') && !values.referenceCss) values.referenceCss = await referenceCss(root);
  if (has('iconCatalog')) values.iconCatalog = await renderIconCatalog(root);
  if (has('iconSummary')) values.iconSummary = await renderIconSummary(root);
  if (has('iconSprite')) values.iconSprite = spriteSvg(icons);
  if (has('thinkingIcon')) values.thinkingIcon = icons.find(icon => icon.name === 'thinking').body.join('');
  if (has('loaderScript')) values.loaderScript = await read(join(root, 'packages/loaders/src/index.mjs'));
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
  for (const page of PAGES) {
    const template = await read(join(root, SITE, `${page}.html`));
    await write(join(out, `${page}.html`), await renderSiteHtml(template, { root }));
  }
  return { version, pages: PAGES.map(page => `${page}.html`) };
}

if (isMain(import.meta.url)) {
  const site = await buildSite();
  console.log(`Built website ${site.version} into dist/.`);
}
