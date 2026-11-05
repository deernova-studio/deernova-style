import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import { ATLASES, FRAMES, FRAME_COUNT, FRAME_SIZE, UNIT, WALK_RATE, poseAt } from '../apps/website/scripts/meadow/cycle.js';
import { loadAtlas, createStagRenderer } from '../apps/website/scripts/meadow/stag.js';
import { createRenderer } from '../apps/website/scripts/meadow/renderer.js';
import { createPlayback, SCENES, SEGMENT, STILL_TIME } from '../apps/website/scripts/meadow/timeline.js';
import { EFFECT_FOR } from '../apps/website/scripts/meadow/effects.js';

function globalFor(t, name, value) {
  const original = Object.getOwnPropertyDescriptor(globalThis, name);
  Object.defineProperty(globalThis, name, { value, configurable: true, writable: true });
  t.after(() => {
    if (original) Object.defineProperty(globalThis, name, original);
    else delete globalThis[name];
  });
}

function images(t, outcome) {
  const requests = [], instances = [];
  globalFor(t, 'Image', class {
    naturalWidth = 0;
    naturalHeight = 0;
    constructor() { instances.push(this); }
    set src(value) {
      this.url = String(value);
      if (!value) return;
      const atlas = ATLASES.find(atlas => this.url.startsWith(atlas.src.href)) ?? ATLASES[0];
      this.naturalWidth = atlas.width;
      this.naturalHeight = atlas.height;
      requests.push(this.url);
      const result = outcome(this.url, requests.length);
      if (result === 'timeout') return;
      queueMicrotask(() => {
        if (result === 'error') this.onerror?.();
        else {
          if (result === 'wrong-size') this.naturalWidth = 1;
          this.onload?.();
        }
      });
    }
  });
  return { requests, instances };
}

// Record canvas operations; these tests check state/colours, not raster appearance.
function canvases(t) {
  const created = [];
  function makeCanvas() {
    const ctx = new Proxy({
      globalAlpha: 1, fills: [], draws: [], patterns: [],
      fillRect() { this.fills.push(this.fillStyle); },
      drawImage(...args) { this.draws.push({ args, alpha: this.globalAlpha }); },
      getTransform() { return { a: 1 }; },
      getImageData(x, y, width, height) {
        const data = new Uint8ClampedArray(width * height * 4);
        // An opaque pixel provides a finite animal bounding box.
        data.set([255, 255, 255, 255], Math.floor(width * height / 2) * 4);
        return { data };
      },
      createPattern(tile) {
        const pattern = { colour: tile.ctx.fillStyle, setTransform() {} };
        this.patterns.push(pattern);
        return pattern;
      },
      createLinearGradient() { return { addColorStop() {} }; },
      createRadialGradient() { return { addColorStop() {} }; }
    }, { get: (target, key) => key in target ? target[key] : () => {} });
    const node = Object.assign(new EventTarget(), {
      ctx, width: 1, height: 1, style: {}, getContext: () => ctx,
      getBoundingClientRect: () => ({ left: 0, top: 0, width: 320, height: 640 })
    });
    created.push(node);
    return node;
  }
  globalFor(t, 'document', { createElement: makeCanvas });
  globalFor(t, 'ImageData', class { constructor(w, h) { this.data = new Uint8ClampedArray(w * h * 4); } });
  globalFor(t, 'DOMMatrix', class { scale() { return this; } });
  globalFor(t, 'window', { devicePixelRatio: 1 });
  return { created, makeCanvas };
}

const fast = { retryDelay: 0, timeout: 10 };
const near = (actual, expected, eps) => assert.ok(Math.abs(actual - expected) < eps, `${actual} != ${expected}`);

test('atlas loading retries transient failures and validates the recovered image', async t => {
  const { requests, instances } = images(t, (_, number) => number === 1 ? 'error' : 'ok');
  const image = await loadAtlas(ATLASES[0], fast);
  assert.equal(image.naturalWidth, ATLASES[0].width);
  assert.equal(requests.length, 2);
  assert.notEqual(requests[0], requests[1], 'retry bypasses a cached failure');
  assert.ok(instances.every(image => image.onload === null && image.onerror === null));
});

test('failed, invalid and stalled atlas loads stop after a bounded number of attempts', async t => {
  for (const failure of ['error', 'wrong-size', 'timeout']) {
    await t.test(failure, async t => {
      const { requests, instances } = images(t, () => failure);
      await assert.rejects(loadAtlas(ATLASES[0], fast), /deer atlas|Deer atlas/);
      assert.equal(requests.length, 3);
      assert.ok(instances.every(image => image.onload === null && image.onerror === null));
      if (failure === 'timeout') assert.ok(instances.every(image => image.url === ''), 'timed-out requests are cancelled');
    });
  }
});

test('partial atlas failure keeps visible frames opaque and retries only missing atlases', async t => {
  const { created, makeCanvas } = canvases(t);
  t.mock.method(console, 'warn', () => {});
  const calls = new Map();
  let recover = false;
  const field = makeCanvas().ctx;
  const stag = createStagRenderer(field, { loadImage: async atlas => {
    calls.set(atlas.src.href, (calls.get(atlas.src.href) || 0) + 1);
    if (atlas === ATLASES[1] && !recover) throw Error('offline');
    return {};
  } });
  assert.deepEqual(await stag.ready, { complete: false, available: FRAMES.filter(frame => frame.atlas !== 1).length });
  assert.equal(stag.hasFrames, true);
  const mixer = created[1].ctx;
  const missing = FRAMES.findIndex(frame => frame.atlas === 1);
  const present = FRAMES.findIndex(frame => frame.atlas !== 1);
  stag.draw([[present, 0.1, 0], [missing, 0.9, 0]], 100, 300, 100);
  assert.equal(mixer.draws.at(-1).alpha, 1, 'a missing crossfade neighbour cannot fade the deer');
  const before = mixer.draws.length;
  stag.draw([[missing, 1, 0]], 100, 300, 100);
  assert.equal(mixer.draws.length, before + 1, 'a missing pose uses an available frame');
  recover = true;
  const retry = stag.retry();
  assert.equal(stag.retry(), retry, 'concurrent retry clicks share the same work');
  assert.deepEqual(await retry, { complete: true, available: FRAME_COUNT });
  for (const atlas of ATLASES) assert.equal(calls.get(atlas.src.href), atlas === ATLASES[1] ? 2 : 1);
});

test('complete atlas failure settles explicitly and drawing without a deer is safe', async t => {
  const { makeCanvas } = canvases(t);
  t.mock.method(console, 'warn', () => {});
  const field = makeCanvas().ctx;
  const stag = createStagRenderer(field, { loadImage: async () => { throw Error('offline'); } });
  assert.deepEqual(await stag.ready, { complete: false, available: 0 });
  assert.equal(stag.hasFrames, false);
  stag.draw([[0, 1, 0]], 100, 300, 100);
  assert.equal(field.draws.length, 0);
  assert.equal(stag.hit(100, 300), false);
});

test('the homepage preloads every deer atlas', async () => {
  const html = await readFile('apps/website/index.html', 'utf8');
  const preloaded = [...html.matchAll(/<link rel="preload" href="assets\/(milu-[^"]+)" as="image">/g)].map(match => match[1]);
  assert.deepEqual(preloaded, ATLASES.map(atlas => atlas.src.pathname.split('/').pop()));
});

test('neighbouring drawings keep their scale and height while their whole-frame horizontal drift is corrected', async t => {
  const { created, makeCanvas } = canvases(t);
  const stag = createStagRenderer(makeCanvas().ctx, { loadImage: async atlas => ({ atlas }) });
  await stag.ready;
  const mixer = created[1].ctx;
  const a = FRAMES.findIndex(frame => frame.atlas === 0 && FRAMES[FRAMES.indexOf(frame) + 1]?.atlas === 1);
  stag.draw([[a, 0.4], [a + 1, 0.6]], 300.3, 400.7, 180);
  const [first, second] = mixer.draws.slice(-2);
  for (const [{ args, alpha }, index, weight] of [[first, a, 0.4], [second, a + 1, 0.6]]) {
    assert.equal(args[0].atlas, ATLASES[FRAMES[index].atlas], 'each frame comes from its own atlas');
    assert.deepEqual(args.slice(1, 5), FRAMES[index].rect);
    near(alpha, weight, 1e-12);
    near(args[7] / args[8], FRAME_SIZE[0] / FRAME_SIZE[1], 1e-9);
  }
  assert.deepEqual(first.args.slice(6), second.args.slice(6), 'vertical position and both dimensions stay unchanged');
  near(second.args[5] - first.args[5], (FRAMES[a + 1].offsetX - FRAMES[a].offsetX) * 180 / UNIT, 1e-9);
});

async function mount(t, { reduced = false, search = '', rendererFactory = createRenderer } = {}) {
  const { created, makeCanvas } = canvases(t);
  images(t, () => 'ok');
  const screen = makeCanvas();
  const status = { hidden: true }, message = { textContent: '' };
  const retry = Object.assign(new EventTarget(), { disabled: false, textContent: '重试' });
  const stage = {
    getBoundingClientRect: screen.getBoundingClientRect,
    querySelector: selector => ({ canvas: screen, '[data-animation-status]': status,
      '[data-animation-message]': message, '[data-animation-retry]': retry })[selector]
  };
  const doc = Object.assign(new EventTarget(), {
    createElement: makeCanvas, querySelector: () => stage, hidden: false, body: {}
  });
  doc.activeElement = doc.body;
  globalFor(t, 'document', doc);
  const palette = { '--print-paper': '#f5f5f5', '--print-ink': '#171717', '--print-mode': 'ink' };
  globalFor(t, 'getComputedStyle', () => ({ getPropertyValue: key => palette[key] }));
  let renderer, playback, time = 0, nextId = 0;
  const pending = new Map(), hooks = new Map();
  const source = (await readFile('apps/website/scripts/meadow.js', 'utf8'))
    .replace(/^import .*;\n/gm, '').replaceAll('import.meta.hot', 'hot');
  runInNewContext(source, {
    document: doc, location: { search }, URLSearchParams, STILL_TIME,
    matchMedia: query => ({ matches: query.includes('reduced-motion') && reduced, addEventListener() {} }),
    IntersectionObserver: class { observe() {} }, ResizeObserver: class { observe() {} },
    hot: { on: (name, listener) => hooks.set(name, listener) },
    createRenderer: (...args) => (renderer = rendererFactory(...args)),
    createPlayback: options => (playback = createPlayback({ ...options,
      now: () => time,
      requestFrame: callback => { pending.set(++nextId, callback); return nextId; },
      cancelFrame: id => pending.delete(id)
    }))
  });
  await renderer.ready;
  return {
    screen, created, palette, status, message, retry, playback, pending, hooks, renderer,
    advance(ms) {
      time += ms;
      const callbacks = [...pending.values()];
      pending.clear();
      for (const callback of callbacks) callback(time);
    }
  };
}

test('CSS hot updates repaint canvas colours and patterns without resetting playback', async t => {
  const view = await mount(t);
  view.advance(100);
  const before = { ...view.playback.state };
  assert.equal(view.screen.ctx.fills.at(-1), '#f5f5f5');
  view.palette['--print-paper'] = '#eeeeee';
  view.palette['--print-ink'] = '#333333';
  view.hooks.get('vite:afterUpdate')({ updates: [{ type: 'css-update', path: '/styles/home.css' }] });
  assert.equal(view.screen.ctx.fills.at(-1), '#eeeeee');
  assert.equal(view.created.flatMap(canvas => canvas.ctx.patterns).at(-1).colour, '#333333');
  assert.deepEqual(view.playback.state, before);
  assert.equal(view.pending.size, 1, 'HMR does not start another animation loop');
});

test('CSS hot updates repaint pinned and reduced-motion scenes while keeping them paused', async t => {
  for (const options of [{ search: '?t=24.5' }, { reduced: true }]) {
    await t.test(JSON.stringify(options), async t => {
      const view = await mount(t, options);
      const before = { ...view.playback.state };
      view.palette['--print-paper'] = '#eeeeee';
      view.hooks.get('vite:afterUpdate')({ updates: [{ type: 'css-update', path: '/styles/home.css' }] });
      assert.equal(view.screen.ctx.fills.at(-1), '#eeeeee');
      assert.equal(view.playback.playing(), false);
      assert.equal(view.pending.size, 0);
      assert.deepEqual(view.playback.state, before);
    });
  }
});

test('failed loading starts the scene, exposes a retry and recovers without resetting its clock', async t => {
  for (const available of [0, FRAMES.filter(frame => frame.atlas !== 1).length]) {
    await t.test(`${available} frames available`, async t => {
      let finishRetry;
      const view = await mount(t, { rendererFactory: () => ({
        ready: Promise.resolve({ complete: false, available }),
        retry: () => new Promise(resolve => { finishRetry = resolve; }),
        render() {}, readPalette() {}, resize() {}
      }) });
      assert.equal(view.playback.playing(), true);
      assert.equal(view.status.hidden, false);
      assert.equal(view.message.textContent, available ? '动画未完整加载' : '动画暂时无法加载');
      view.advance(100);
      const before = { ...view.playback.state };
      view.retry.dispatchEvent(new Event('click'));
      assert.equal(view.retry.disabled, true);
      assert.equal(view.playback.playing(), true);
      finishRetry({ complete: true, available: FRAME_COUNT });
      await Promise.resolve();
      assert.equal(view.status.hidden, true);
      assert.equal(view.retry.disabled, false);
      assert.equal(view.message.textContent, '');
      assert.deepEqual(view.playback.state, before);
      assert.equal(view.pending.size, 1);
    });
  }
});


function dispatch(node, type, properties) {
  const event = Object.assign(new Event(type, { cancelable: true }), properties);
  node.dispatchEvent(event);
  return event;
}

test('deer hit testing follows the blended alpha, including gaps and scaled coordinates', async t => {
  const { created, makeCanvas } = canvases(t);
  const field = makeCanvas().ctx;
  field.getTransform = () => ({ a: 0.75 });
  const stag = createStagRenderer(field, { loadImage: async () => ({}) });
  await stag.ready;
  stag.draw([[0, 1]], 100, 300, 100);
  const mixer = created[1].ctx;
  let read;
  mixer.getImageData = (...args) => { read = args; return { data: [0, 0, 0, 255] }; };
  assert.equal(stag.hit(100, 200), true);
  assert.deepEqual(read.slice(2), [1, 1], 'input reads only one silhouette pixel');
  const placement = field.draws.at(-1).args;
  assert.equal(read[0], Math.floor(100 * 0.75 - placement[5]));
  assert.equal(read[1], Math.floor(200 * 0.75 - placement[6]));
  mixer.getImageData = () => ({ data: [0, 0, 0, 0] });
  assert.equal(stag.hit(100, 200), false, 'air within the image rectangle belongs to the scenery');
  assert.equal(stag.hit(-100, -100), false);
});

test('deer clicks reveal colour while surrounding clicks keep every scene effect', async t => {
  const view = await mount(t), renderer = view.renderer;
  assert.equal(EFFECT_FOR.city, 'lights');
  assert.equal(EFFECT_FOR.coast, 'gulls', 'the coast has its own white gull effect, not city lighting');
  const effects = SCENES.map(scene => EFFECT_FOR[scene]);
  for (let i = 0; i < effects.length; i++) {
    const clock = i * SEGMENT + 1;
    renderer.render({ clock, t: clock, lap: 0 });
    assert.equal(renderer.interact(150, 300, clock), 'color');
    assert.equal(renderer.interact(1, 1, clock), effects[i]);
    // Advancing within the colour interval still uses the normal gait samples.
    const before = view.created.flatMap(c => c.ctx.draws)
      .filter(draw => draw.args[0]?.url?.includes('milu-run'));
    renderer.render({ clock: clock + 0.1, t: clock + 0.1, lap: 0 });
    const after = view.created.flatMap(c => c.ctx.draws)
      .filter(draw => draw.args[0]?.url?.includes('milu-run'));
    const rendered = after.slice(before.length);
    const expected = poseAt((clock + 0.1) * WALK_RATE);
    assert.equal(rendered.length, expected.length);
    expected.forEach(([index, weight], n) => {
      assert.deepEqual(rendered[n].args.slice(1, 5), FRAMES[index].rect);
      near(rendered[n].alpha, weight, 1e-9);
    });
  }
  const transition = 3 * SEGMENT - 0.8;
  renderer.render({ clock: transition, t: transition, lap: 0 });
  assert.equal(renderer.interact(1, 1, transition), 'lights');
  assert.equal(renderer.interact(319, 1, transition), 'steam', 'scene wipes keep separate effects on each side');
});

test('mouse, keyboard and assistive activation colour the scene without changing the playback clock', async t => {
  let interactions = [], activations = [], renders = 0;
  const view = await mount(t, { reduced: true, rendererFactory: (_stage, _canvas, options) => {
    assert.equal(options.still, true);
    return {
      ready: Promise.resolve({ complete: true }), render() { renders++; }, resize() {}, readPalette() {},
      interact: (...args) => interactions.push(args), colorize: clock => activations.push(clock)
    };
  } });
  const initial = renders, before = { ...view.playback.state };
  dispatch(view.screen, 'click', { button: 0, detail: 1, clientX: 100, clientY: 200 });
  dispatch(view.screen, 'click', { button: 2, detail: 1, clientX: 100, clientY: 200 });
  assert.deepEqual(interactions, [[100, 200, before.clock]]);
  for (const code of ['Space', 'Enter']) {
    assert.ok(dispatch(view.screen, 'keydown', { code, repeat: false }).defaultPrevented);
    dispatch(view.screen, 'keydown', { code, repeat: true });
  }
  dispatch(view.screen, 'click', { button: 0, detail: 0 });
  assert.deepEqual(activations, [before.clock, before.clock, before.clock]);
  assert.equal(renders, initial + 4, 'still scenes repaint immediately without starting a loop');
  assert.equal(view.pending.size, 0);
  assert.deepEqual(view.playback.state, before);
});
