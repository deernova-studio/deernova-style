// Theme: auto follows the system; light and dark are remembered on this device.
const root = document.documentElement;
const THEMES = ['auto', 'light', 'dark'];
const LABELS = { auto: '自动', light: '浅色', dark: '深色' };

function readTheme() {
  try { return localStorage.getItem('deernova-theme') || 'auto'; } catch { return 'auto'; }
}

function applyTheme(theme) {
  if (theme === 'auto') delete root.dataset.theme;
  else root.dataset.theme = theme;
  for (const label of document.querySelectorAll('[data-theme-label]')) label.textContent = LABELS[theme];
  for (const button of document.querySelectorAll('[data-theme-toggle]')) {
    const label = `外观：${LABELS[theme]}。点按切换`;
    button.setAttribute('aria-label', label);
    button.dataset.tooltip = `外观：${LABELS[theme]}`;
  }
  try {
    if (theme === 'auto') localStorage.removeItem('deernova-theme');
    else localStorage.setItem('deernova-theme', theme);
  } catch {}
  document.dispatchEvent(new Event('deernova:theme'));
}

let theme = readTheme();
applyTheme(theme);
for (const button of document.querySelectorAll('[data-theme-toggle]')) {
  button.addEventListener('click', () => {
    theme = THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length];
    applyTheme(theme);
  });
}

// Copy buttons keep their width; only the label changes to the completed state.
for (const button of document.querySelectorAll('[data-copy]')) {
  const label = button.querySelector('[data-copy-label]');
  const idle = label.textContent;
  let timer = 0;
  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(button.dataset.copy);
      label.textContent = '已复制';
    } catch {
      label.textContent = '无法复制';
    }
    clearTimeout(timer);
    timer = setTimeout(() => { label.textContent = idle; }, 1500);
  });
}

// Tooltips for icon-only controls, built to the skill's references/components/tooltip.md:
// shown after a pause on hover or at once on keyboard focus, one at a time, hoverable,
// and closed by Esc, pressing the control or scrolling. Touch screens get none.
const tipTriggers = document.querySelectorAll('[data-tooltip]');
if (tipTriggers.length) {
  const ms = name => parseFloat(getComputedStyle(root).getPropertyValue(name));
  const DELAY = ms('--tooltip-delay') || 500;
  const SKIP = ms('--tooltip-skip-window') || 300;
  const EDGE = 8; // space-2: keep clear of the window edge
  const hover = matchMedia('(hover: hover) and (pointer: fine)');
  const tip = document.createElement('div');
  tip.className = 'tooltip';
  tip.setAttribute('aria-hidden', 'true'); // it repeats the control's aria-label
  const topLayer = typeof tip.showPopover === 'function';
  if (topLayer) tip.popover = 'manual';
  else tip.hidden = true;
  document.body.append(tip);
  let owner = null, timer = 0, closedAt = -Infinity;

  const place = trigger => {
    const offset = ms('--tooltip-offset') || 8;
    const r = trigger.getBoundingClientRect(), t = tip.getBoundingClientRect();
    let top = r.bottom + offset;
    if (top + t.height > innerHeight - EDGE) top = r.top - offset - t.height;
    const left = Math.min(Math.max(EDGE, r.left + r.width / 2 - t.width / 2), innerWidth - EDGE - t.width);
    tip.style.top = `${top}px`;
    tip.style.left = `${left}px`;
  };
  const open = trigger => {
    clearTimeout(timer);
    owner = trigger;
    tip.textContent = trigger.dataset.tooltip;
    if (!topLayer) tip.hidden = false;
    else if (!tip.matches(':popover-open')) tip.showPopover();
    place(trigger);
  };
  const close = () => {
    clearTimeout(timer);
    if (!owner) return;
    owner = null;
    closedAt = performance.now();
    if (topLayer) tip.hidePopover();
    else tip.hidden = true;
  };
  // Sweeping along a row of controls shows each label at once instead of waiting again.
  const schedule = trigger => {
    clearTimeout(timer);
    if (owner || performance.now() - closedAt < SKIP) open(trigger);
    else timer = setTimeout(() => open(trigger), DELAY);
  };
  // A short grace lets the pointer cross onto the tooltip without closing it.
  const leave = () => { clearTimeout(timer); timer = setTimeout(close, 100); };

  for (const trigger of tipTriggers) {
    trigger.addEventListener('pointerenter', event => {
      if (event.pointerType !== 'touch' && hover.matches) schedule(trigger);
    });
    trigger.addEventListener('pointerleave', leave);
    trigger.addEventListener('focus', () => { if (trigger.matches(':focus-visible')) open(trigger); });
    trigger.addEventListener('blur', close);
    trigger.addEventListener('pointerdown', close);
    trigger.addEventListener('click', close);
  }
  tip.addEventListener('pointerenter', () => clearTimeout(timer));
  tip.addEventListener('pointerleave', leave);
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && owner) close(); });
  addEventListener('scroll', close, { passive: true, capture: true });
  addEventListener('resize', close);
}
