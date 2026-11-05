import { createRenderer } from './meadow/renderer.js';
import { createPlayback, STILL_TIME } from './meadow/timeline.js';

// Browser lifecycle and input only. Rendering, scenery, effects, the stag and its clock live in separate
// modules. ?t= pins a moment (add &play to keep it running), ?halftone=0 shows the gray painting.
const stage = document.querySelector('[data-meadow]');
const canvas = stage?.querySelector('canvas');

if (canvas) {
  const query = new URLSearchParams(location.search);
  const pinned = Number.parseFloat(query.get('t'));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const still = reduced || (Number.isFinite(pinned) && !query.has('play'));
  const renderer = createRenderer(stage, canvas, { raw: query.get('halftone') === '0', still });
  const playback = createPlayback({
    start: Number.isFinite(pinned) ? pinned : reduced ? STILL_TIME : 0,
    render: renderer.render
  });
  let onScreen = true, assetsSettled = false;

  const render = () => renderer.render(playback.state);
  const sync = () => playback.setPlaying(assetsSettled && onScreen && !document.hidden && !still);
  const repaint = () => {
    renderer.readPalette();
    render();
  };
  const point = event => {
    const box = canvas.getBoundingClientRect();
    return [event.clientX - box.left, event.clientY - box.top];
  };

  const status = stage.querySelector('[data-animation-status]');
  const message = stage.querySelector('[data-animation-message]');
  const retry = stage.querySelector('[data-animation-retry]');
  function settled(result) {
    assetsSettled = true;
    status.hidden = result.complete;
    message.textContent = result.complete ? '' : result.available ? '动画未完整加载' : '动画暂时无法加载';
    retry.disabled = false;
    retry.textContent = '重试';
    render();
    sync();
  }
  retry.addEventListener('click', () => {
    retry.disabled = true;
    retry.textContent = '重试中…';
    renderer.retry().then(settled);
  });

  // The stag reveals colour; the scenery keeps its own effects. Neither changes
  // the gait. Still/reduced-motion scenes switch colour without an expanding wave.
  canvas.addEventListener('click', event => {
    if (event.button !== 0) return;
    if (event.detail === 0) renderer.colorize(playback.state.clock); // Assistive activation has no pointer coordinates.
    else renderer.interact(...point(event), playback.state.clock);
    if (still) render();
  });
  canvas.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse') return;
    canvas.style.cursor = renderer.overStag(...point(event)) ? 'pointer' : '';
  });
  canvas.addEventListener('pointerleave', () => { canvas.style.cursor = ''; });
  canvas.addEventListener('keydown', event => {
    if ((event.code !== 'Space' && event.code !== 'Enter') || event.repeat) return;
    event.preventDefault();
    renderer.colorize(playback.state.clock);
    if (still) render();
  });

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

  // Vite emits this after the replacement stylesheets finish loading. Rebuild
  // the cached dot colours without restarting the clock, including still frames.
  if (import.meta.hot) {
    import.meta.hot.on('vite:afterUpdate', ({ updates }) => {
      if (updates.some(update => update.type === 'css-update')) repaint();
    });
  }

  renderer.readPalette();
  renderer.resize();
  render();
  renderer.ready.then(settled);
  sync();
}
