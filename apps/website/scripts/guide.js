// The table of contents is a disclosure on narrow screens and always open on wide ones.
const toc = document.querySelector('.toc-details');
const wide = matchMedia('(min-width: 961px)');
function syncToc() {
  if (toc) toc.open = wide.matches;
}
syncToc();
wide.addEventListener('change', syncToc);
// Specimens show app sizes: desktop with a pointer, touch on a touch screen.
const coarse = matchMedia('(pointer: coarse)');
function syncSpecimens() {
  for (const specimen of document.querySelectorAll('.specimen, .specimen-panel')) specimen.dataset.density = coarse.matches ? 'touch' : 'desktop';
}
syncSpecimens();
coarse.addEventListener('change', syncSpecimens);
for (const link of document.querySelectorAll('.toc a')) {
  link.addEventListener('click', () => { if (!wide.matches && toc) toc.open = false; });
}

// One document at a time. Every section stays in the HTML (and readable without
// scripts); the hash picks which one is shown, so links and the back button work.
const main = document.querySelector('.guide-main');
const docs = [...main.querySelectorAll(':scope > .doc')];
const groupHeads = [...main.querySelectorAll(':scope > .doc-group')];
const tocLinks = [...document.querySelectorAll('.toc a[href^="#"]')];
const order = tocLinks.map(link => document.getElementById(link.hash.slice(1))).filter(el => el?.classList.contains('doc'));
const pager = document.createElement('nav');
pager.className = 'doc-pager';
pager.setAttribute('aria-label', '上一篇和下一篇');
const siteTitle = document.title;
const titleOf = doc => doc.querySelector('h1, h2')?.textContent.trim() ?? '';
let current = null;

main.classList.add('is-single');
for (const head of groupHeads) head.hidden = true;

function find(id) {
  const el = id && document.getElementById(id);
  if (!el) return null;
  if (el.classList.contains('doc-group')) {
    let next = el.nextElementSibling;
    while (next && !next.classList.contains('doc')) next = next.nextElementSibling;
    return next ? { doc: next, target: null } : null;
  }
  const doc = el.closest('.guide-main > .doc');
  return doc ? { doc, target: el === doc ? null : el } : null;
}

function pageLink(doc, label, className) {
  const link = document.createElement('a');
  link.className = className;
  link.href = `#${doc.id}`;
  const small = document.createElement('span');
  small.textContent = label;
  link.append(small, titleOf(doc));
  return link;
}

function show({ doc, target }, { focus }) {
  if (doc !== current) {
    for (const item of docs) item.hidden = item !== doc;
    current = doc;
    document.title = doc.id === 'overview' ? siteTitle : `${titleOf(doc)} · ${siteTitle}`;
    for (const link of tocLinks) {
      if (link.hash === `#${doc.id}`) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    }
    const index = order.indexOf(doc);
    pager.replaceChildren(...[
      index > 0 && pageLink(order[index - 1], '上一篇', 'is-prev'),
      index >= 0 && index < order.length - 1 && pageLink(order[index + 1], '下一篇', 'is-next')
    ].filter(Boolean));
    doc.after(pager);
  }
  if (target) target.scrollIntoView();
  else scrollTo(0, 0);
  if (focus) {
    const heading = target ?? doc.querySelector('h1, h2');
    if (!heading.hasAttribute('tabindex')) heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
  }
}

function route(focus) {
  const id = decodeURIComponent(location.hash.slice(1));
  // No hash (first visit, or Back to it) is the overview; an unknown hash keeps the current page.
  const found = id ? find(id) : { doc: docs[0], target: null };
  if (found) show(found, { focus });
  else if (!current) show({ doc: docs[0], target: null }, { focus: false });
}
route(false);
addEventListener('hashchange', () => route(true));
