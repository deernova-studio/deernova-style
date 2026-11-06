// The glass masthead is the trigger for a disclosure of product links, built to
// references/components/menu.md. Its three shortcuts are sibling controls,
// so using them never toggles the product list.
const coarse = matchMedia('(pointer: coarse)');

for (const header of document.querySelectorAll('[data-product-menu]')) {
  const trigger = header.querySelector('[data-product-trigger]');
  const panel = header.querySelector('.product-panel');
  const actions = header.querySelector('.masthead-actions');
  const links = [...panel.querySelectorAll('a[href]')];

  // The marketing scene reads in the comfortable density; a finger gets touch-sized rows.
  const setDensity = () => { panel.dataset.density = coarse.matches ? 'touch' : 'comfortable'; };
  setDensity();
  coarse.addEventListener('change', setDensity);

  function setOpen(open) {
    panel.hidden = !open;
    trigger.setAttribute('aria-expanded', String(open));
  }

  trigger.addEventListener('click', () => setOpen(panel.hidden));
  trigger.addEventListener('keydown', event => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    event.preventDefault();
    setOpen(true);
    links[event.key === 'ArrowDown' ? 0 : links.length - 1]?.focus();
  });
  panel.addEventListener('keydown', event => {
    const index = links.indexOf(document.activeElement);
    if (index < 0) return;
    let next;
    if (event.key === 'ArrowDown') next = (index + 1) % links.length;
    else if (event.key === 'ArrowUp') next = (index - 1 + links.length) % links.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = links.length - 1;
    else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey && event.key.trim()) {
      // Type-ahead: the next product whose name starts with the typed letter.
      const letter = event.key.toLocaleLowerCase();
      const match = [...links.slice(index + 1), ...links.slice(0, index + 1)]
        .find(link => link.textContent.trim().toLocaleLowerCase().startsWith(letter));
      if (!match) return;
      next = links.indexOf(match);
    } else return;
    event.preventDefault();
    links[next].focus();
  });
  // One highlight at a time: focus follows the pointer.
  panel.addEventListener('pointermove', event => {
    const link = event.target.closest('a[href]');
    if (link && document.activeElement !== link) link.focus({ preventScroll: true });
  });
  header.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || panel.hidden) return;
    event.preventDefault();
    event.stopPropagation();
    setOpen(false);
    trigger.focus();
  });
  for (const link of links) link.addEventListener('click', () => setOpen(false));
  actions.addEventListener('click', () => setOpen(false));
  header.addEventListener('focusout', event => {
    if (event.relatedTarget !== trigger && !panel.contains(event.relatedTarget)) setOpen(false);
  });
  document.addEventListener('pointerdown', event => {
    if (!header.contains(event.target) || actions.contains(event.target)) setOpen(false);
  });
}
