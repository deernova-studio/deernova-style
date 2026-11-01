import { cp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { marked } from 'marked';
import { PHASES } from '../apps/website/scripts/motion-model.mjs';
import { ROOT, escape, hashTree, isMain, read, write } from './lib/files.mjs';
import { GROUPS, copyDesignAssets, readDesign, tokenValue } from './lib/design.mjs';

export async function buildSite({ root = ROOT, out = join(root, 'dist') } = {}) {
  const { version, tokens, components, foundations } = await readDesign(root);
  await rm(out, { recursive: true, force: true });
  await copyDesignAssets(root, out, tokens);
  for (const directory of ['styles', 'scripts']) {
    await cp(join(root, 'apps/website', directory), join(out, directory), { recursive: true });
  }
  const article = marked.parse(foundations).replaceAll('href="motion.md"', 'href="#motion-guidelines"')
    + `<section id="motion-guidelines">${marked.parse(await read(join(root, 'design/motion.md')))}</section>`;
const compHTML = components.map(c=>`<section class="component" id="c-${c.name}" data-search="${escape(c.name+' '+c.subtitle+' '+c.doc)}"><div class="component-head"><h3>${c.name}</h3><span>${escape(c.subtitle)}</span><a href="examples/html/${c.name}/preview.html" target="_blank" rel="noopener">独立预览 ↗</a></div><div class="preview"><iframe loading="lazy" title="${c.name} 组件预览" src="examples/html/${c.name}/preview.html" style="height:${c.height+32}px"></iframe></div><details><summary>使用规范与 SwiftUI 示例</summary><div class="prose">${marked.parse(c.doc)}</div></details></section>`).join('\n');
const tokenHTML = GROUPS.map(g=>`<h3>${g}</h3><div class="token-grid">${tokens[g].tokens.map(t=>`<button class="token" data-copy="var(--${t.name})" title="复制 CSS 变量">${g==='color'?`<span class="swatch" style="background:var(--${t.name})"></span>`:''}<strong>${t.name}</strong><code>${escape(String(tokenValue(t.value,'light')))}</code><small>${escape(t.usage)}</small></button>`).join('')}</div>`).join('') + '<h3>Typography</h3>' + tokens.type.groups.map(g=>`<h4>${g.name}</h4>`+g.styles.map(t=>`<div class="type-row"><code>${t.name} · ${t.fontSize}/${t.lineHeight}</code><p style="font-family:var(--font-${t.family||g.family});font-size:${t.fontSize};line-height:${t.lineHeight};font-weight:${t.fontWeight}">${t.sample}</p><small>${t.usage}</small></div>`).join('')).join('');

  const sceneCopy = PHASES.map((phase, i) => `<div data-scene-copy${i ? ' style="opacity:0"' : ''}><p class="scene-title">${escape(phase.title)}</p><p class="hero-description">${escape(phase.description)}</p></div>`).join('\n');
  const sceneSteps = PHASES.map((phase, i) => `<li data-scene-step${i ? '' : ' aria-current="step"'}>0${i+1} ${escape(phase.label)}</li>`).join('');
  const replacements = { version, article, sceneCopy, sceneSteps, components: compHTML, tokens: tokenHTML, count: components.length, links: components.map(component => `<a href="#c-${component.name}">${component.name}</a>`).join('') };
  for (const page of ['index', 'reference']) {
    let html = await read(join(root, `apps/website/pages/${page}.html`));
    for (const [key, value] of Object.entries(replacements)) html = html.replaceAll(`{{${key}}}`, String(value));
    await write(join(out, `${page}.html`), html);
  }
  const manifest = { version, sourceHash: await hashTree(out), components: components.map(component => component.name) };
  await write(join(out, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  return manifest;
}
if (isMain(import.meta.url)) {
  const manifest = await buildSite();
  console.log(`Built website ${manifest.version}: ${manifest.components.length} reference previews.`);
}
