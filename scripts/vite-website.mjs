import { join } from 'node:path';
import { normalizePath } from 'vite';
import { renderSiteHtml } from './build-site.mjs';
import { SKILL_DIR, readTokens, renderTokensCss } from './lib/design.mjs';
// Note: tailwind.css, DeernovaTokens.swift and tokens.json are served as committed; only tokens.css is
// regenerated in memory, because it is the one the pages render with.
import { ROOT } from './lib/files.mjs';

// Serve shared design assets from their source, without copying or writing to dist.
export function websitePlugin({ root = ROOT } = {}) {
  const skill = normalizePath(join(root, SKILL_DIR));
  const tokensCss = `${skill}/assets/tokens.css`;
  const tokensJson = `${skill}/assets/tokens.json`;
  const assets = normalizePath(join(root, 'apps/website/assets'));
  const packageFile = normalizePath(join(root, 'package.json'));

  return {
    name: 'deernova-website',
    apply: 'serve',
    configureServer(server) {
      server.watcher.add([skill, packageFile]);
    },
    transformIndexHtml: {
      order: 'pre',
      async handler(html) {
        const rendered = await renderSiteHtml(html, { root });
        // Vite must see the real CSS URL so its link HMR updates the right stylesheet.
        return rendered
          .replaceAll('href="assets/tokens.css"', `href="/@fs/${tokensCss}"`)
          .replace(/href="assets\/(tokens\.json|tailwind\.css|DeernovaTokens\.swift)"/g, `href="/@fs/${skill}/assets/$1"`)
          .replaceAll('src="assets/screens/', `src="/@fs/${skill}/assets/screens/`);
      }
    },
    async load(id) {
      if (normalizePath(id.split('?')[0]) === tokensCss) return renderTokensCss(await readTokens(root));
    },
    handleHotUpdate({ file, server, timestamp }) {
      const path = normalizePath(file);
      if (path === tokensJson) {
        // JSON is the source of truth. Refresh CSS and guide in memory;
        // committed outputs are still generated explicitly with npm run tokens.
        for (const mod of server.moduleGraph.getModulesByFile(tokensCss) || []) {
          server.moduleGraph.invalidateModule(mod, new Set(), timestamp, true);
        }
        server.ws.send({ type: 'full-reload', path: '*' });
        return [];
      }
      if (path.startsWith(`${skill}/`) && path.endsWith('.md')) {
        server.ws.send({ type: 'full-reload', path: '/guide.html' });
        return [];
      }
      if (path === packageFile || path.startsWith(`${assets}/`) || path.startsWith(`${skill}/assets/screens/`)) {
        server.ws.send({ type: 'full-reload', path: '*' });
        return [];
      }
    }
  };
}
