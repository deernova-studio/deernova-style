// The glass masthead is the trigger. Its three shortcuts are sibling controls,
// so using them never toggles the product list.
for (const header of document.querySelectorAll('[data-product-menu]')) {
  const trigger = header.querySelector('[data-product-trigger]');
  const panel = header.querySelector('.product-panel');
  const actions = header.querySelector('.masthead-actions');
  const links = [...panel.querySelectorAll('a[href]')];

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
    else return;
    event.preventDefault();
    links[next].focus();
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
