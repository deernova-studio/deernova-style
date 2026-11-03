import test from 'node:test';
import assert from 'node:assert/strict';
import { cp, mkdtemp, readFile, realpath, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createServer } from 'vite';
import { websitePlugin } from '../scripts/vite-website.mjs';
import { ROOT, hashTree } from '../scripts/lib/files.mjs';
import { SKILL_DIR } from '../scripts/lib/design.mjs';

function nextMessage(socket, match) {
  return new Promise((resolve, reject) => {
    const received = [];
    const timer = setTimeout(() => finish(new Error(`Timed out waiting for a Vite update; received ${JSON.stringify(received)}`)), 8000);
    function finish(error, message) {
      clearTimeout(timer);
      socket.removeEventListener('message', onMessage);
      socket.removeEventListener('error', onError);
      if (error) reject(error);
      else resolve(message);
    }
    function onMessage(event) {
      const message = JSON.parse(event.data);
      received.push(message);
      if (message.type === 'error') finish(new Error(message.err.message));
      else if (match(message)) finish(null, message);
    }
    function onError() { finish(new Error('Vite WebSocket connection failed')); }
    socket.addEventListener('message', onMessage);
    socket.addEventListener('error', onError);
  });
}

test('Vite serves source files and sends updates over its live connection', async t => {
  const root = await mkdtemp(join(await realpath(tmpdir()), 'deernova-dev-'));
  let server;
  let socket;
  try {
    for (const path of ['apps', 'skills', 'package.json']) {
      await cp(join(ROOT, path), join(root, path), { recursive: true });
    }
    const sources = () => Promise.all(['apps', 'skills'].map(path => hashTree(join(root, path))));
    const before = await sources();
    server = await createServer({
      configFile: false,
      root: join(root, 'apps/website'),
      appType: 'mpa',
      publicDir: false,
      logLevel: 'silent',
      cacheDir: join(root, 'node_modules/.vite'),
      plugins: [websitePlugin({ root })],
      server: {
        host: '127.0.0.1', port: 0, strictPort: true,
        fs: { allow: [root] },
        watch: { usePolling: true, interval: 50 }
      }
    });
    await server.listen();
    const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
    async function get(path, headers) {
      const response = await fetch(new URL(path, origin), { headers });
      assert.equal(response.status, 200, path);
      return response.text();
    }
    socket = new WebSocket(`${origin.replace('http:', 'ws:')}/?token=${server.config.webSocketToken}`, 'vite-hmr');
    await nextMessage(socket, message => message.type === 'connected');
    async function change(path, content, match) {
      const update = nextMessage(socket, match);
      await Promise.all([writeFile(join(root, path), content), update]);
    }
    async function append(path, content, match) {
      await change(path, await readFile(join(root, path), 'utf8') + content, match);
    }
    const reload = path => message => message.type === 'full-reload' && message.path === path;
    const cssHeaders = { accept: 'text/css' };
    let tokensUrl;

    await t.test('renders both pages, shared assets and modules without writing source or dist', async () => {
      for (const path of ['/', '/guide.html']) {
        const html = await get(path);
        assert.match(html, /\/@vite\/client/);
        assert.doesNotMatch(html, /\{\{\w+\}\}/);
        tokensUrl = html.match(/href="([^"]+\/tokens\.css)"/)[1];
        assert.match(await get(tokensUrl, cssHeaders), /--canvas:\s*#f5f5f5/);
        for (const [, target] of html.matchAll(/(?:src|href)="([^"#]+)/g)) {
          if (/^(https?:|mailto:)/.test(target)) continue;
          await get(target, target.endsWith('.css') ? cssHeaders : undefined);
        }
      }
      assert.deepEqual(await sources(), before);
      await assert.rejects(stat(join(root, 'dist')), { code: 'ENOENT' });
    });

    await t.test('CSS changes send hot updates without a page reload', async () => {
      await append('apps/website/styles/home.css', '\n/* live-css-check */\n', message =>
        message.type === 'update' && message.updates.some(update => update.type === 'css-update' && update.path.split('?')[0] === '/styles/home.css'));
      assert.match(await get('/styles/home.css', cssHeaders), /live-css-check/);
    });

    await t.test('script changes request an automatic page reload', async () => {
      await append('apps/website/scripts/site.js', '\n/* live-script-check */\n', reload('*'));
      assert.match(await get('/scripts/site.js'), /live-script-check/);
    });

    await t.test('HTML changes refresh the affected page', async () => {
      await append('apps/website/index.html', '\n<!-- live-html-check -->\n', reload('/index.html'));
      assert.match(await get('/'), /live-html-check/);
    });

    await t.test('Markdown outside the website root refreshes the rendered guide', async () => {
      await append(`${SKILL_DIR}/references/review.md`, '\nLive documentation check.\n', reload('/guide.html'));
      assert.match(await get('/guide.html'), /Live documentation check/);
    });

    await t.test('token JSON updates CSS and documentation without rewriting generated sources', async () => {
      const generated = ['assets/tokens.css', 'references/tokens.md'].map(path => join(root, SKILL_DIR, path));
      const before = await Promise.all(generated.map(path => readFile(path, 'utf8')));
      const tokenFile = `${SKILL_DIR}/assets/tokens.json`;
      const tokens = JSON.parse(await readFile(join(root, tokenFile), 'utf8'));
      tokens.color.tokens.find(token => token.name === 'canvas').value.light = '#f4f4f4';
      await change(tokenFile, JSON.stringify(tokens), reload('*'));
      assert.match(await get(tokensUrl, cssHeaders), /--canvas:\s*#f4f4f4/);
      assert.match(await get('/guide.html'), /#f4f4f4/);
      assert.deepEqual(await Promise.all(generated.map(path => readFile(path, 'utf8'))), before);
    });

    await t.test('image changes request a page refresh', async () => {
      const path = 'apps/website/assets/deernova-style-icon.png';
      await change(path, await readFile(join(root, path)), reload('*'));
    });
  } finally {
    socket?.close();
    await server?.close();
    await rm(root, { recursive: true, force: true });
  }
});
