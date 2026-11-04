import { execFile } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { promisify } from 'node:util';
import { ROOT, isMain, read, write } from './lib/files.mjs';
import { SKILL_DIR } from './lib/design.mjs';
import { referenceCss } from './lib/guide.mjs';

// Renders the illustration sources in art/screens/ to the skill's reference screenshots, light and dark, at 2x.
// The pages use the skill's own tokens.css and component reference CSS, so the pictures follow the spec.
// Needs Google Chrome; run by hand with `npm run screens` after changing a source or the components it uses.
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const SCREENS = [
  { source: 'art/screens/mac-window.html', name: 'mac-window', width: 960, height: 590 },
  { source: 'art/screens/iphone-screens.html', name: 'iphone-screens', width: 980, height: 980 },
  { source: 'art/screens/iphone-button-sizes.html', name: 'iphone-button-sizes', width: 980, height: 1070 }
];

export async function renderScreens({ root = ROOT } = {}) {
  const tokens = await read(join(root, SKILL_DIR, 'assets/tokens.css'));
  const reference = await referenceCss(root);
  const work = await mkdtemp(join(tmpdir(), 'deernova-screens-'));
  const run = promisify(execFile);
  try {
    for (const screen of SCREENS) {
      let html = (await read(join(root, screen.source))).replace('{{tokens}}', () => tokens).replace('{{reference}}', () => reference);
      // Shared pieces next to the source, e.g. {{file:phone.css}}.
      for (const [token, file] of [...html.matchAll(/\{\{file:([\w.-]+)\}\}/g)]) {
        const content = await read(join(root, 'art/screens', file));
        html = html.replace(token, () => content);
      }
      const page = join(work, `${screen.name}.html`);
      await write(page, html);
      for (const theme of ['light', 'dark']) {
        const out = join(root, SKILL_DIR, 'assets/screens', `${screen.name}-${theme}.png`);
        await run(CHROME, [
          '--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run', '--no-default-browser-check',
          `--user-data-dir=${join(work, 'profile')}`, '--force-device-scale-factor=2',
          `--window-size=${screen.width},${screen.height}`, `--screenshot=${out}`,
          `${pathToFileURL(page).href}#${theme}`
        ]);
        console.log(`Rendered ${out}`);
      }
    }
  } finally {
    await rm(work, { recursive: true, force: true });
  }
}

if (isMain(import.meta.url)) await renderScreens();
