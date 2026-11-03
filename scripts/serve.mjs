import { createServer } from 'node:http';
import { readFile, realpath } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';

// Serves the built site for local preview. When the port is taken, usually by an earlier preview that is still
// running, it moves to the next free one and says so, then prints the addresses to open.
const root = await realpath(resolve(process.argv[2] || 'dist'));
const first = Number(process.env.PORT || 4173);
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.webp': 'image/webp'
};

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    const path = await realpath(resolve(root, '.' + decodeURIComponent(url.pathname) + (url.pathname.endsWith('/') ? 'index.html' : '')));
    if (!path.startsWith(root + sep)) throw Error('Outside the site');
    const data = await readFile(path);
    res.writeHead(200, { 'Content-Type': TYPES[extname(path)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
});

// Each attempt registers its own pair of listeners and removes the other one, so a failed attempt never
// reports itself later as the address that started.
function listen(port) {
  const started = () => {
    server.off('error', failed);
    const url = `http://localhost:${port}/`;
    const moved = port === first ? '' : `\n  端口 ${first} 已被占用（多半是之前启动的预览还没关），这次用 ${port}。\n`;
    console.log(`\n  Deernova 网站已启动\n\n  首页      ${url}\n  完整规范  ${url}guide.html\n${moved}\n  按 Ctrl+C 停止\n`);
  };
  const failed = error => {
    server.off('listening', started);
    if (error.code === 'EADDRINUSE' && port < first + 20) return listen(port + 1);
    console.error(`\n  预览没有启动：${error.message}\n`);
    process.exit(1);
  };
  server.once('listening', started);
  server.once('error', failed);
  server.listen(port, '127.0.0.1');
}

listen(first);
