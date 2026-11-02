import { cp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { marked } from 'marked';
import { ROOT, escape, isMain, read, write } from './lib/files.mjs';
import { SKILL_DIR } from './lib/design.mjs';
import { staleTokenOutputs } from './tokens.mjs';

const SITE = 'apps/website';

// The guide page shows the skill itself, in the order an agent would read it.
export const DOCS = [
  { id: 'overview', title: '总览', file: 'SKILL.md' },
  { id: 'foundations', title: '基础', file: 'references/foundations.md' },
  { id: 'tokens', title: '设计变量', file: 'references/tokens.md' },
  { id: 'patterns', title: '界面模式', file: 'references/patterns.md' },
  { id: 'swiftui', title: 'SwiftUI 落地', file: 'references/swiftui.md' },
  { id: 'web', title: 'Web 落地', file: 'references/web.md' },
  { id: 'review', title: '审查清单', file: 'references/review.md' }
];

function renderDoc(doc, markdown) {
  const body = markdown.replace(/^---\n[\s\S]*?\n---\n/, '').replace(/^# .*\n/m, '');
  const headings = [];
  let html = marked.parse(body)
    .replace(/<h2>(.*?)<\/h2>/g, (_, text) => {
      const id = `${doc.id}-${headings.length + 1}`;
      headings.push({ id, text: text.replace(/<[^>]+>/g, '') });
      return `<h2 id="${id}">${text}</h2>`;
    })
    // Links between skill files become anchors on this page.
    .replace(/href="(?:references\/)?([\w-]+)\.md"/g, (match, name) => {
      const target = DOCS.find(item => item.file.endsWith(`${name}.md`));
      return target ? `href="#${target.id}"` : match;
    })
    .replace(/<code>(#[0-9a-f]{6}(?:[0-9a-f]{2})?)<\/code>/gi, '<span class="swatch" style="--swatch:$1"></span><code>$1</code>')
    .replaceAll('<table>', '<div class="table-wrap"><table>')
    .replaceAll('</table>', '</table></div>');
  return { html, headings };
}

export async function buildSite({ root = ROOT, out = join(root, 'dist') } = {}) {
  const stale = await staleTokenOutputs(root);
  if (stale.length) throw Error(`Out of date, run npm run tokens: ${stale.join(', ')}`);
  const { version } = JSON.parse(await read(join(root, 'package.json')));
  await rm(out, { recursive: true, force: true });
  for (const directory of ['styles', 'scripts', 'assets']) await cp(join(root, SITE, directory), join(out, directory), { recursive: true });
  await cp(join(root, SKILL_DIR, 'assets/tokens.css'), join(out, 'assets/tokens.css'));
  await cp(join(root, SKILL_DIR, 'assets/screens'), join(out, 'assets/screens'), { recursive: true });

  const sections = [];
  const nav = [];
  for (const [index, doc] of DOCS.entries()) {
    const { html, headings } = renderDoc(doc, await read(join(root, SKILL_DIR, doc.file)));
    const number = String(index + 1).padStart(2, '0');
    sections.push(`<section class="doc" id="${doc.id}" aria-labelledby="${doc.id}-title">
<p class="doc-meta"><span>${number}</span><code>${escape(doc.file)}</code></p>
<h1 id="${doc.id}-title">${escape(doc.title)}</h1>
${html}
</section>`);
    nav.push(`<li><a href="#${doc.id}"><span>${number}</span>${escape(doc.title)}</a>${headings.length
      ? `<ol>${headings.map(heading => `<li><a href="#${heading.id}">${heading.text}</a></li>`).join('')}</ol>` : ''}</li>`);
  }

  const values = { version, docs: sections.join('\n'), nav: nav.join('\n') };
  for (const page of ['index', 'guide']) {
    let html = await read(join(root, SITE, `${page}.html`));
    for (const [key, value] of Object.entries(values)) html = html.replaceAll(`{{${key}}}`, value);
    await write(join(out, `${page}.html`), html);
  }
  return { version, pages: ['index.html', 'guide.html'] };
}

if (isMain(import.meta.url)) {
  const site = await buildSite();
  console.log(`Built website ${site.version} into dist/.`);
}
