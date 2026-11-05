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
