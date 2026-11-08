import { join, posix } from 'node:path';
import { Marked } from 'marked';
import { escape, read } from './files.mjs';
import {
  SKILL_DIR, aliasOf, colorIn, contrast, densityIds, isDensity, readTokens, renderTokensMarkdown, showDensity, summaryRows
} from './design.mjs';

// The style guide page: specimens first, then the skill's own words. Everything comes from the skill folder,
// so the page cannot drift from what agents read.
export const SECTIONS = [
  { id: 'foundations', title: '基础', dir: 'references/foundations',
    docs: ['color', 'states', 'typography', 'spacing', 'layout', 'radius', 'stroke', 'elevation', 'glass', 'motion', 'iconography', 'writing', 'accessibility'] },
  { id: 'components', title: '组件', dir: 'references/components',
    docs: ['button', 'toolbar', 'sidebar', 'composer', 'message', 'step-row', 'task-list', 'glass-controls', 'segmented', 'text-field', 'menu', 'list', 'card', 'tag', 'code-block', 'empty-state', 'banner', 'sheet', 'tooltip'] },
  { id: 'scenes', title: '场景', dir: 'references/scenes',
    docs: ['web', 'web-marketing', 'macos', 'ios', 'ipados', 'swiftui'] }
];

const SCREENS = {
  macos: [['mac-window', 'Mac 窗口：玻璃侧边栏、工具栏和 Composer']],
  ios: [['iphone-screens', 'iPhone 列表页和对话页'], ['iphone-button-sizes', 'iOS 按钮的三种尺寸']]
};

const DOWNLOADS = [
  ['tokens.css', 'CSS 变量：两套主题、四种密度。Web 项目引入一次即可。'],
  ['tailwind.css', 'Tailwind v4 主题：在 tokens.css 之后引入，得到 bg-surface、h-control-md 这类工具类。'],
  ['DeernovaTokens.swift', 'SwiftUI：颜色、尺寸和字体。加进 App target，不需要 Asset Catalog。'],
  ['tokens.json', '原始数据。生成以上三个文件，也可以导入设计工具。']
];

const LANGUAGE = { html: 'HTML', css: 'CSS', swift: 'SwiftUI', js: 'JavaScript' };

const docPath = (section, name) => `${section.dir}/${name}.md`;
export function docId(path) {
  if (path === 'SKILL.md') return 'overview';
  const match = path.match(/^references\/(?:(\w+)\/)?([\w-]+)\.md$/);
  if (!match) return null;
  return match[1] ? `${match[1]}-${match[2]}` : match[2];
}

const titleOf = markdown => markdown.match(/^# (.+)$/m)?.[1] ?? '';
const withoutTitle = markdown => markdown.replace(/^---\n[\s\S]*?\n---\n/, '').replace(/^# .*\n/m, '');
const section = (markdown, heading) => markdown.match(new RegExp(`^## ${heading}\\n([\\s\\S]*?)(?=^## |(?![\\s\\S]))`, 'm'))?.[1] ?? '';

// ---------- tables and specimens generated from tokens.json ----------

// Specimens are app UI: they show the desktop density (the page script switches them to touch on touch
// screens), while the page around them reads in the comfortable density of a documentation site.
const APP = 'data-density="desktop"';

function densityHead(tokens) {
  return tokens.densities.map(density => `<th data-col="${density.id}">${density.name}<span>${escape(density.scenes)}</span></th>`).join('');
}

function tokenTable(tokens, list, { usage = true } = {}) {
  const density = list.filter(isDensity);
  const fixed = list.filter(token => !isDensity(token));
  const out = [];
  if (density.length) {
    out.push(`<div class="table-wrap"><table class="token-table"><thead><tr><th>Token</th>${densityHead(tokens)}${usage ? '<th>用途</th>' : ''}</tr></thead><tbody>`);
    for (const token of density) {
      const cells = densityIds(tokens).map(id => `<td data-col="${id}">${showDensity(token, token.values[id])}</td>`).join('');
      out.push(`<tr><td><code>${token.name}</code></td>${cells}${usage ? `<td>${escape(token.usage)}</td>` : ''}</tr>`);
    }
    out.push('</tbody></table></div>');
  }
  if (fixed.length) {
    out.push('<div class="table-wrap"><table class="token-table"><thead><tr><th>Token</th><th>值</th><th>用途</th></tr></thead><tbody>');
    for (const token of fixed) out.push(`<tr><td><code>${token.name}</code></td><td><code>${escape(token.value)}</code></td><td>${escape(token.usage)}</td></tr>`);
    out.push('</tbody></table></div>');
  }
  return out.join('');
}

function summaryTable(tokens) {
  const rows = summaryRows(tokens).map(([label, values]) =>
    `<tr><th scope="row">${label}</th>${densityIds(tokens).map(id => `<td data-col="${id}">${values[id]}</td>`).join('')}</tr>`);
  return `<div class="table-wrap"><table class="token-table summary-table"><thead><tr><th></th>${densityHead(tokens)}</tr></thead><tbody>${rows.join('')}</tbody></table></div>`;
}

function scenesTable(tokens) {
  const name = id => tokens.densities.find(density => density.id === id).name;
  const rows = tokens.scenes.map(scene => `<tr><th scope="row"><a href="#${docId(scene.reference)}">${scene.name}</a></th><td data-col="${scene.density}">${name(scene.density)}</td><td>${scene.input}</td><td>${inline(scene.apply)}</td></tr>`);
  return `<div class="table-wrap"><table class="token-table scenes-table"><thead><tr><th>场景</th><th>密度</th><th>输入</th><th>怎么启用</th></tr></thead><tbody>${rows.join('')}</tbody></table></div>`;
}

const inline = text => escape(text).replace(/`([^`]+)`/g, '<code>$1</code>');

const COLOR_GROUPS = [
  ['纸面', ['canvas', 'surface', 'surface-raised', 'surface-sunken']],
  ['文字', ['ink', 'ink-secondary', 'ink-tertiary']],
  ['线条', ['line', 'line-control']],
  ['强调', ['accent', 'accent-soft', 'on-accent', 'focus-ring']],
  ['状态', ['success', 'success-soft', 'warning', 'warning-soft', 'danger', 'danger-soft', 'info', 'info-soft']],
  ['交互', ['fill-hover', 'fill-selected', 'knob', 'scrim']],
  ['仅网页', ['glass-fill', 'glass-stroke']]
];
const TEXT_COLORS = new Set(['ink', 'ink-secondary', 'ink-tertiary', 'line-control', 'success', 'warning', 'danger', 'info']);

function colorSpecimen(tokens) {
  const byName = Object.fromEntries(tokens.color.tokens.map(token => [token.name, token]));
  const known = new Set(COLOR_GROUPS.flatMap(([, names]) => names));
  const groups = [...COLOR_GROUPS, ['其他', tokens.color.tokens.map(token => token.name).filter(name => !known.has(name))]];
  const out = [`<div class="specimen-panel" ${APP}>`];
  for (const [title, names] of groups) {
    const present = names.filter(name => byName[name]);
    if (!present.length) continue;
    out.push(`<h4 class="swatch-group">${title}</h4><div class="swatches">`);
    for (const name of present) {
      const token = byName[name];
      const alias = typeof token.value === 'string' ? aliasOf(token.value) : null;
      const values = ['light', 'dark'].map(theme => colorIn(tokens, name, theme));
      const ratio = TEXT_COLORS.has(name)
        ? ['light', 'dark'].map(theme => contrast(colorIn(tokens, name, theme), colorIn(tokens, 'surface', theme)).toFixed(1)).join(' / ')
        : null;
      out.push(`<figure class="swatch" data-token="${name}">
<div class="swatch-chips"><span data-theme="light" style="--chip: var(--${name})"></span><span data-theme="dark" style="--chip: var(--${name})"></span></div>
<figcaption><code class="swatch-name">${name}</code>${alias ? `<span class="swatch-alias">= ${alias}</span>` : ''}
<span class="swatch-values"><code>${values[0]}</code><code>${values[1]}</code></span>${ratio ? `<span class="swatch-ratio">在 surface 上 ${ratio}:1</span>` : ''}
<span class="swatch-usage">${escape(token.usage)}</span></figcaption></figure>`);
    }
    out.push('</div>');
  }
  out.push('<details class="sample"><summary>原始色板</summary><div class="palette">');
  for (const token of tokens.palette.tokens) out.push(`<span class="palette-chip" style="--chip:${token.value}" title="${token.name} ${token.value}"><span></span><code>${token.name}</code></span>`);
  out.push('</div></details></div>');
  return out.join('');
}

function typeSpecimen(tokens) {
  const rows = tokens.type.roles.map(role => {
    const values = densityIds(tokens).map(id => `<span data-col="${id}">${role.values[id].join('/')}</span>`).join('');
    const tracking = role.tracking ? `; letter-spacing: var(--type-${role.name}-tracking)` : '';
    return `<div class="type-row"><div class="type-meta"><code>${role.name}</code><span>${role.family} ${role.weight}</span></div>
<div class="type-sample" style="font: var(--type-${role.name})${tracking}">${escape(role.sample)}</div><div class="type-values">${values}</div></div>`;
  });
  return `<div class="specimen-panel type-ramp" ${APP}><div class="type-row type-head"><span>角色</span><span>样例</span><div class="type-values">${tokens.densities.map(d => `<span data-col="${d.id}">${d.name}</span>`).join('')}</div></div>${rows.join('')}</div>`;
}

function spacingSpecimen(tokens) {
  const scale = tokens.space.tokens.filter(token => !isDensity(token)).map(token =>
    `<div class="scale-row"><code>${token.name}</code><span class="space-bar" style="width: var(--${token.name})"></span><span>${token.value}</span></div>`);
  return `<div class="specimen-panel" ${APP}><div class="scale">${scale.join('')}</div></div>${tokenTable(tokens, tokens.space.tokens.filter(isDensity))}`;
}

function layoutSpecimen(tokens) {
  return tokenTable(tokens, tokens.layout.tokens);
}

function radiusSpecimen(tokens) {
  const boxes = tokens.radius.tokens.map(token => `<figure class="radius-box"><span style="border-radius: var(--${token.name})"></span><figcaption><code>${token.name}</code> ${token.value}</figcaption></figure>`);
  return `<div class="specimen-panel" ${APP}><div class="radius-row">${boxes.join('')}</div></div>`;
}

function strokeSpecimen() {
  return `<div class="specimen-panel" ${APP}><div class="stroke-row">
<figure><span class="stroke-sample is-line"></span><figcaption><code>stroke-line</code> 分隔线</figcaption></figure>
<figure><span class="stroke-sample is-control"></span><figcaption><code>stroke-control</code> 必要的控件边界</figcaption></figure>
<figure><span class="stroke-sample is-focus">输入内容</span><figcaption>输入框 · 聚焦不改变外观</figcaption></figure>
<figure><span class="stroke-sample is-dropzone">拖入文件</span><figcaption><code>line-style-dropzone</code> 拖放区</figcaption></figure>
</div></div>`;
}

function elevationSpecimen() {
  return `<div class="specimen-panel elevation-panel" ${APP}><div class="elevation-row">
<figure><span class="elevation-card">纸面</span><figcaption>0 · 细线，无阴影</figcaption></figure>
<figure><span class="elevation-card is-control">控件</span><figcaption>1 · <code>shadow-control</code></figcaption></figure>
<figure><span class="elevation-card is-float">浮层</span><figcaption>2 · <code>shadow-float</code></figcaption></figure>
<figure><span class="elevation-card dn-glass is-glass">玻璃</span><figcaption>玻璃 · <code>shadow-glass</code></figcaption></figure>
</div></div>`;
}

const FOUNDATION_SPECIMENS = {
  color: colorSpecimen, typography: typeSpecimen, spacing: spacingSpecimen, layout: layoutSpecimen, radius: radiusSpecimen,
  stroke: strokeSpecimen, elevation: elevationSpecimen
};

const specimen = html => `<div class="specimen" ${APP}>${html}</div>`;
const sample = (label, text) => `<details class="sample"><summary>${label}</summary><pre><code>${escape(text).replaceAll('>', '&gt;')}</code></pre></details>`;

// ---------- Markdown ----------

function renderMarkdown(path, markdown, tokens, { hoistSpecimen = false } = {}) {
  const id = docId(path);
  let headings = 0;
  let firstHtml = null;
  const marked = new Marked({
    renderer: {
      heading({ tokens: text, depth }) {
        const inner = this.parser.parseInline(text);
        if (depth === 2) return `<h3 id="${id}-${++headings}">${inner}</h3>`;
        return `<h${Math.min(depth + 1, 6)}>${inner}</h${Math.min(depth + 1, 6)}>`;
      },
      code({ text, lang }) {
        const language = (lang || '').split(/\s/)[0];
        if (language === 'html') {
          if (hoistSpecimen && firstHtml === null) { firstHtml = text; return sample('HTML', text); }
          return specimen(text) + sample('HTML', text);
        }
        return sample(LANGUAGE[language] || '代码', text);
      },
      link({ href, tokens: text }) {
        const inner = this.parser.parseInline(text);
        if (/^https?:/.test(href)) return `<a href="${escape(href)}">${inner}</a>`;
        const [file, hash] = href.split('#');
        const target = file ? docId(posix.normalize(posix.join(posix.dirname(path), file))) : null;
        if (target) return `<a href="#${target}">${inner}</a>`;
        return hash ? inner : `<a href="${escape(href)}">${inner}</a>`;
      }
    }
  });
  const source = withoutTitle(markdown).replace(/<!-- tokens:([\w-]+) -->\n[\s\S]*?<!-- \/tokens -->/g,
    (_, name) => `\n<div data-generated="${name}"></div>\n`);
  // Wrap Markdown tables first; the generated tables below bring their own wrapper.
  let html = marked.parse(source)
    .replace(/<table>([\s\S]*?)<\/table>/g, '<div class="table-wrap"><table>$1</table></div>')
    .replace(/<code>(#[0-9a-f]{6}(?:[0-9a-f]{2})?)<\/code>/gi, '<span class="hex" style="--chip:$1"></span><code>$1</code>')
    .replace(/<div data-generated="([\w-]+)"><\/div>/g, (_, name) => {
      const component = tokens.components.find(item => item.id === name);
      if (component) return tokenTable(tokens, component.tokens);
      if (name === 'summary') return summaryTable(tokens);
      if (name === 'scenes') return scenesTable(tokens);
      return '';
    });
  if (firstHtml !== null) html = html.replace('</p>', `</p>${specimen(firstHtml)}`);
  return html;
}

function docSection(path, markdown, tokens, { extra = '', hoistSpecimen = false } = {}) {
  const id = docId(path);
  let body = renderMarkdown(path, markdown, tokens, { hoistSpecimen });
  if (extra) body = body.replace('</p>', `</p>${extra}`);
  return `<section class="doc" id="${id}" aria-labelledby="${id}-title">
<header class="doc-head"><h2 id="${id}-title">${escape(titleOf(markdown))}</h2><code class="doc-path">${escape(path)}</code></header>
<div class="doc-body">${body}</div>
</section>`;
}

const screens = name => (SCREENS[name] || []).map(([file, alt]) => `<figure class="shot">
<img class="shot-light" src="assets/screens/${file}-light.png" alt="${alt}（浅色）" loading="lazy">
<img class="shot-dark" src="assets/screens/${file}-dark.png" alt="${alt}（深色）" loading="lazy">
<figcaption>${alt}</figcaption></figure>`).join('');

// Reference CSS from the component docs, applied to the live specimens on the page.
export async function referenceCss(root) {
  const files = [...SECTIONS[1].docs.map(name => docPath(SECTIONS[1], name)), 'references/foundations/states.md', 'references/foundations/layout.md', 'references/foundations/motion.md', 'references/foundations/iconography.md'];
  const out = [];
  for (const file of files) {
    const markdown = await read(join(root, SKILL_DIR, file));
    for (const [, css] of markdown.matchAll(/```css\n([\s\S]*?)```/g)) if (css.includes('.dn-')) out.push(`/* ${file} */\n${css}`);
  }
  return out.join('\n');
}

export async function renderGuide(root) {
  const tokens = await readTokens(root);
  const skill = await read(join(root, SKILL_DIR, 'SKILL.md'));
  const nav = ['<a class="toc-top" href="#overview">总览</a>'];
  const docs = [];

  const lede = withoutTitle(skill).trim().split('\n\n')[0];
  // Rendered through the same renderer as the docs, so links between skill files become page anchors.
  const rules = renderMarkdown('SKILL.md', section(skill, '核心规则'), tokens);
  const avoid = renderMarkdown('SKILL.md', section(skill, '不要做'), tokens);
  docs.push(`<section class="doc doc-overview" id="overview" aria-labelledby="overview-title">
<header class="overview-head"><h1 id="overview-title">Deernova Style</h1><p class="lede">${inline(lede)}</p></header>
<div class="overview-grid">
<div class="overview-rules"><h3 id="overview-1">核心规则</h3>${rules}<h3 id="overview-2">不要做</h3>${avoid}</div>
<div class="overview-quick"><h3 id="overview-3">场景速查</h3>${summaryTable(tokens)}${scenesTable(tokens)}</div>
</div>
</section>`);

  for (const group of SECTIONS) {
    nav.push(`<p class="toc-group">${group.title}</p><ol>`);
    for (const name of group.docs) {
      const path = docPath(group, name);
      const markdown = await read(join(root, SKILL_DIR, path));
      nav.push(`<li><a href="#${docId(path)}">${escape(titleOf(markdown))}</a></li>`);
      const extra = group.id === 'foundations' ? FOUNDATION_SPECIMENS[name]?.(tokens) ?? ''
        : group.id === 'scenes' ? screens(name) : '';
      docs.push(docSection(path, markdown, tokens, { extra, hoistSpecimen: group.id === 'components' }));
    }
    nav.push('</ol>');
  }

  nav.push('<p class="toc-group">资源</p><ol><li><a href="#resources">文件与安装</a></li><li><a href="#review">审查清单</a></li><li><a href="#tokens">全部变量</a></li></ol>');
  const downloads = DOWNLOADS.map(([file, text]) => `<li><a class="download" href="assets/${file}" download><code>${file}</code><span>${text}</span></a></li>`).join('');
  const commandList = rows => rows.map(([command, text]) =>
    `<li><code>${command}</code><span>${text}</span><button class="dn-button is-sm" type="button" data-copy="${command}"><span data-copy-label>复制</span></button></li>`).join('');
  const projectCommands = commandList([
    ['npx @deernova/style@latest install', '写入项目的 .agents/skills/deernova-style/'],
    ['npx @deernova/style@latest install --agent claude', 'Claude Code：写入项目的 .claude/skills/deernova-style/'],
    ['npx @deernova/style@latest update', '更新到最新版本；安装时加了 --agent 的，这里也加上'],
    ['npx @deernova/style@latest doctor', '检查是否安装、是否被改过、是否最新']
  ]);
  const globalCommands = commandList([
    ['npx @deernova/style@latest install --global --agent claude', 'Claude Code：写入 ~/.claude/skills/deernova-style/'],
    ['npx @deernova/style@latest install --global', 'Codex：写入 $CODEX_HOME/skills/deernova-style/（默认 ~/.codex）'],
    ['npx @deernova/style@latest update --global --agent claude', '更新全局安装，参数和安装时一致'],
    ['npx @deernova/style@latest doctor --global --agent claude', '检查全局安装']
  ]);
  docs.push(`<section class="doc" id="resources" aria-labelledby="resources-title">
<header class="doc-head"><h2 id="resources-title">文件与安装</h2></header>
<div class="doc-body"><p>这一页的内容都来自 <code>skills/deernova-style/</code>：agent 读的是同一份 Markdown 和 <code>tokens.json</code>，所以页面和规范不会对不上。</p>
<h3 id="resources-1">设计变量文件</h3><ul class="downloads">${downloads}</ul>
<h3 id="resources-2">装进项目</h3><p>在项目根目录运行。skill 跟着仓库走：团队里谁拉代码都能读到同一份，每个项目可以停在自己的版本上。</p><ul class="commands">${projectCommands}</ul>
<h3 id="resources-3">装到全局</h3><p>装到用户目录，在你所有的项目里都能用，不用每个项目装一遍。</p><ul class="commands">${globalCommands}</ul>
<p>装好后直接告诉 agent：「参考 deernova-style，给这个应用做一个设置页。」不想用 npm 时，也可以把 <code>skills/deernova-style/</code> 整个文件夹复制到项目或用户目录的 skill 文件夹里。</p></div>
</section>`);
  const review = await read(join(root, SKILL_DIR, 'references/review.md'));
  docs.push(docSection('references/review.md', review, tokens));
  const tokensMarkdown = renderTokensMarkdown(tokens);
  docs.push(`<section class="doc" id="tokens" aria-labelledby="tokens-title">
<header class="doc-head"><h2 id="tokens-title">全部变量</h2><code class="doc-path">references/tokens.md</code></header>
<div class="doc-body"><p>由 <code>tokens.json</code> 生成的完整变量表，和 agent 读到的一致。</p><details class="sample is-long"><summary>展开全部变量表</summary><div class="sample-body">${renderMarkdown('references/tokens.md', tokensMarkdown, tokens)}</div></details></div>
</section>`);

  return { nav: nav.join('\n'), docs: docs.join('\n'), referenceCss: await referenceCss(root) };
}
