import { createRenderer } from './meadow/renderer.js';
import { createPlayback } from './meadow/timeline.js';

// Browser lifecycle only. Rendering, scenery, the stag and its clock live in
// separate modules; ?t= pins a frame and ?halftone=0 shows the gray painting.
const stage = document.querySelector('[data-meadow]');
const canvas = stage?.querySelector('canvas');

if (canvas) {
  const query = new URLSearchParams(location.search);
  const pinned = Number.parseFloat(query.get('t'));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const still = reduced || Number.isFinite(pinned);
  const renderer = createRenderer(stage, canvas, { raw: query.get('halftone') === '0' });
  const playback = createPlayback({
    start: Number.isFinite(pinned) ? pinned : reduced ? 24.5 : 0,
    render: renderer.render
  });
  let onScreen = true;

  const render = () => renderer.render(playback.state);
  const sync = () => playback.setPlaying(onScreen && !document.hidden && !still);
  const repaint = () => {
    renderer.readPalette();
    render();
  };

  new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting;
    sync();
  }).observe(stage);
  new ResizeObserver(() => {
    renderer.resize();
    render();
  }).observe(stage);
  document.addEventListener('visibilitychange', sync);
  document.addEventListener('deernova:theme', repaint);
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', repaint);

  renderer.readPalette();
  renderer.resize();
  render();
  renderer.ready.then(render);
  sync();
}
