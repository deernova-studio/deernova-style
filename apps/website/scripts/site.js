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
  for (const button of document.querySelectorAll('[data-theme-toggle]')) button.setAttribute('aria-label', `外观：${LABELS[theme]}。点按切换`);
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

// Typed line: the text is in the HTML; it is retyped once unless motion is reduced.
for (const line of document.querySelectorAll('[data-typewriter]')) {
  const target = line.querySelector('[data-typed]');
  const text = line.dataset.typewriter;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) continue;
  line.setAttribute('aria-label', text);
  target.setAttribute('aria-hidden', 'true');
  target.textContent = '';
  [...text].forEach((char, i) => setTimeout(() => { target.textContent += char; }, 400 + i * 90));
}

// Guide: mark the section being read in the table of contents.
const tocLinks = [...document.querySelectorAll('.toc a[href^="#"]')];
const targets = tocLinks.map(link => document.getElementById(link.hash.slice(1))).filter(Boolean);
if (targets.length) {
  let current = null;
  const update = () => {
    const line = innerHeight * 0.25;
    let active = targets[0];
    for (const target of targets) if (target.getBoundingClientRect().top <= line) active = target;
    if (active === current) return;
    current = active;
    for (const link of tocLinks) {
      if (link.hash === `#${active.id}`) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    }
  };
  addEventListener('scroll', update, { passive: true });
  addEventListener('hashchange', update);
  update();
}
