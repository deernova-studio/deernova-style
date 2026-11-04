import { clamp, gray, hash } from './math.js';
import { WALK_SPEED, createGait } from './cycle.js';
import { createStagRenderer } from './stag.js';
import { createScenery } from './scenery.js';
import { createFootsteps } from './footsteps.js';
import { EFFECT_FOR, createEffects } from './effects.js';
import { LOOP, shot } from './timeline.js';
import { createColorReveal } from './color.js';

const MONO = 'ui-monospace, "SF Mono", Menlo, monospace';
const RAMP = ' .:-=+*';
const PHRASE = 'DEERNOVA';
// Light snaps to a few flat tones, like screentone sheets in a manga or cel shading in an anime.
// Each tone prints as one dot size; the darkest prints solid.
const TONES = [[0.07, 0], [0.27, 0.16], [0.5, 0.36], [0.76, 0.6], [Infinity, 1]];

function layer(width = 1, height = 1, options) {
  const c = document.createElement('canvas');
  c.width = width;
  c.height = height;
  return [c, c.getContext('2d', options)];
}

// Compose the scene into an offscreen field, then print it as dots and letters.
export function createRenderer(stage, canvas, { raw = false, still = false } = {}) {
  const ctx = canvas.getContext('2d');
  const [field, f] = layer(1, 1, { willReadFrequently: true });
  const [small, s] = layer(1, 1, { willReadFrequently: true });
  const [dots, d] = layer();
  const [pigments, p] = layer();
  const [colorPrint, cp] = layer();
  const masks = [1, 2, 3, 4].map(() => layer());
  const stag = createStagRenderer(f);
  const scenery = createScenery(f);
  const colorScenery = createScenery(p, { colored: true });
  const color = createColorReveal({ still });
  const effects = createEffects(f);
  const gait = createGait();
  const footsteps = createFootsteps();

  let W = 0, H = 0, dpr = 1, cell = 6, SS = 3, cols = 0, rows = 0, S = 200, groundY = 0, horizon = 0, deerX = 0;
  let level = new Uint8Array(0), value = new Float32Array(0), buffers = [], patterns = [], palette = {}, last = null;

  function readPalette() {
    const style = getComputedStyle(stage);
    palette = { paper: style.getPropertyValue('--print-paper').trim(), ink: style.getPropertyValue('--print-ink').trim(), mode: style.getPropertyValue('--print-mode').trim() };
    makePatterns();
  }

  // One tile per dot size, at device resolution, scaled so the tile period is exactly one cell.
  function makePatterns() {
    if (!cols) return;
    const size = cell * dpr, T = Math.max(2, Math.round(size));
    patterns = TONES.slice(1, -1).map(([, b]) => {
      const [tile, t] = layer(T, T);
      t.fillStyle = palette.ink;
      t.beginPath();
      t.arc(T / 2, T / 2, (T / 2) * Math.sqrt(b) * 1.12, 0, Math.PI * 2);
      t.fill();
      const pattern = d.createPattern(tile, 'repeat');
      pattern.setTransform(new DOMMatrix().scale(size / T));
      return pattern;
    });
  }

  function layout() {
    const box = stage.getBoundingClientRect();
    W = box.width;
    H = box.height;
    if (!W || !H) return;
    const phone = W < 700;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    cell = phone ? 3 : clamp(Math.round(W / 360), 3, 5);
    SS = phone ? 2 : 3;
    cols = Math.ceil(W / cell);
    rows = Math.ceil(H / cell);
    field.width = cols * SS;
    field.height = rows * SS;
    pigments.width = field.width;
    pigments.height = field.height;
    colorPrint.width = canvas.width;
    colorPrint.height = canvas.height;
    small.width = cols;
    small.height = rows;
    dots.width = canvas.width;
    dots.height = canvas.height;
    for (const [mask] of masks) { mask.width = cols; mask.height = rows; }
    level = new Uint8Array(cols * rows);
    value = new Float32Array(cols * rows);
    buffers = masks.map(() => new ImageData(cols, rows));
    S = phone ? Math.min(W * 0.34, H * 0.2) : Math.min(W * 0.18, H * 0.28);
    groundY = H * (phone ? 0.64 : 0.79);
    horizon = H * (phone ? 0.46 : 0.56);
    deerX = W * (phone ? 0.47 : 0.42);
    if (phone) {
      // Reserve room for the hind legs stretched back and the forelegs reaching forward.
      S = Math.min(S, (W - cell * 8) / (stag.leftExtent + stag.rightExtent + 0.2));
      deerX = Math.max(deerX, cell * 4 + stag.leftExtent * S);
    }
    scenery.resize({ W, H, cell, cols, rows });
    colorScenery.resize({ W, H, cell, cols, rows });
    effects.resize({ W, H, cell });
    makePatterns();
  }

  // ---- Paint the scene, then print it ----

  function render(sim) {
    if (!cols) return;
    last = sim;
    const t = sim.t, T = sim.lap * LOOP + t, cut = shot(t);
    const pose = gait.pose(sim.clock), animalX = deerX;
    const v = {
      t, clock: sim.clock, dist: (WALK_SPEED * T + pose.travel) * S,
      speed: WALK_SPEED * pose.pace * S, S, groundY, horizon, deerX: animalX,
      wind: x => effects.wind(x, sim.clock)
    };
    const line = cut.to ? W * (1 - cut.wipe) : W;
    footsteps.update({ clock: sim.clock, phase: gait.phase(sim.clock), distance: v.dist / S,
      pace: stag.hasFrames ? pose.pace : 0, scene: sceneAt(animalX) });
    function paint(target, landscape, drawStag) {
      const side = (x0, x1, draw) => { target.save(); target.beginPath(); target.rect(x0, 0, x1 - x0, H); target.clip(); draw(); target.restore(); };
      const split = draw => {
        if (cut.to) {
          side(0, line, () => draw(cut.from));
          side(line, W, () => draw(cut.to));
        } else draw(cut.from);
      };
      target.setTransform(SS / cell, 0, 0, SS / cell, 0, 0);
      target.globalCompositeOperation = 'source-over';
      target.globalAlpha = 1;
      split(scene => landscape.drawBack(scene, v));
      if (stag.hasFrames) {
        target.fillStyle = gray(0, 0.2);
        target.beginPath();
        target.ellipse(animalX - S * 0.05, groundY + S * 0.03, S * 0.55, S * 0.05, 0, 0, Math.PI * 2);
        target.fill();
        drawStag();
      }
      split(scene => { footsteps.draw(target, v, scene); landscape.drawFront(scene, v); });
      effects.draw(sim.clock, target);
    }
    paint(f, scenery, () => stag.draw(pose.weights, animalX, groundY, S));
    print(cut.to ? line : null, sim.clock);
    const reveal = color.sample(sim.clock);
    if (reveal.amount > 0 && reveal.spread > 0) {
      paint(p, colorScenery, () => stag.paintColor(p));
      printColor(reveal);
    }
  }

  function printColor({ amount, spread, origin }) {
    const width = canvas.width, height = canvas.height;
    cp.setTransform(1, 0, 0, 1, 0, 0);
    cp.globalAlpha = 1;
    cp.globalCompositeOperation = 'source-over';
    cp.clearRect(0, 0, width, height);
    cp.drawImage(pigments, 0, 0, width, height);
    // Keep the exact monochrome dots and letters as printed texture over the
    // pigments. In dark mode light ink uses screen instead of multiply.
    if (!raw) {
      cp.globalCompositeOperation = palette.mode === 'light' ? 'screen' : 'multiply';
      cp.globalAlpha = palette.mode === 'light' ? 0.25 : 0.38;
      cp.drawImage(canvas, 0, 0);
      cp.globalAlpha = 1;
    }
    if (spread < 1) {
      const x = origin[0] * width, y = origin[1] * height;
      const reach = Math.hypot(Math.max(x, width - x), Math.max(y, height - y));
      const feather = Math.min(width, height) * 0.14;
      const radius = (reach + feather) * spread;
      const wave = cp.createRadialGradient(x, y, Math.max(0, radius - feather), x, y, radius);
      wave.addColorStop(0, '#fff');
      wave.addColorStop(1, 'transparent');
      cp.globalCompositeOperation = 'destination-in';
      cp.fillStyle = wave;
      cp.fillRect(0, 0, width, height);
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = amount;
    ctx.drawImage(colorPrint, 0, 0);
    ctx.globalAlpha = 1;
  }

  function print(line, clock) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = palette.paper;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (raw) { ctx.drawImage(field, 0, 0, W * dpr, H * dpr); return; }

    // Average each cell's samples into its light by letting the canvas scale the field down to one pixel per cell.
    s.imageSmoothingEnabled = true;
    s.imageSmoothingQuality = 'high';
    s.drawImage(field, 0, 0, field.width, field.height, 0, 0, cols, rows);
    const data = s.getImageData(0, 0, cols, rows).data;
    const ink = palette.mode !== 'light', band = line === null ? 0 : Math.max(cell * 8, W * 0.07);
    const c0 = band ? Math.floor((line - band) / cell) : cols, c1 = band ? Math.ceil((line + band) / cell) : -1;
    const words = buffers.map(b => new Uint32Array(b.data.buffer));
    for (const w of words) w.fill(0);
    for (let r = 0, i = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++, i++) {
        const light = data[i * 4] / 255, b = ink ? 1 - light : light;
        let k = 0;
        while (b >= TONES[k][0]) k++;
        value[i] = TONES[k][1];
        level[i] = k;
        if (k && (c < c0 || c > c1)) words[k - 1][i] = 0xff000000;
      }
    }

    // Each tone is a mask of its cells, blown up without smoothing and filled with that tone's dot pattern.
    const width = cols * cell * dpr, height = rows * cell * dpr;
    for (let k = 0; k < masks.length; k++) {
      const [mask, m] = masks[k];
      m.putImageData(buffers[k], 0, 0);
      d.setTransform(1, 0, 0, 1, 0, 0);
      d.globalCompositeOperation = 'source-over';
      d.clearRect(0, 0, dots.width, dots.height);
      d.imageSmoothingEnabled = false;
      d.drawImage(mask, 0, 0, width, height);
      d.globalCompositeOperation = 'source-in';
      d.fillStyle = k < patterns.length ? patterns[k] : palette.ink;
      d.fillRect(0, 0, dots.width, dots.height);
      ctx.drawImage(dots, 0, 0);
    }
    if (band) letters(line, band, clock);
  }

  // The wipe's edge prints the picture in letters: light marks for light values, the name for the darkest.
  function letters(line, band, clock) {
    const c0 = Math.max(0, Math.floor((line - band) / cell)), c1 = Math.min(cols - 1, Math.ceil((line + band) / cell) - 1);
    if (c1 < c0) return;
    const seed = Math.floor(clock * 20);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.font = `600 ${cell / 0.6}px ${MONO}`;
    ctx.textBaseline = 'middle';
    ctx.fillStyle = palette.ink;
    for (let r = 0; r < rows; r++) {
      let text = '';
      for (let c = c0; c <= c1; c++) {
        const b = value[r * cols + c], flip = hash(r * 31.7 + c * 7.3 + seed) < 0.2;
        if (b < 0.05 && !flip) text += ' ';
        else if (b < 0.7 && !flip) text += RAMP[Math.min(RAMP.length - 1, Math.floor((b / 0.7) * RAMP.length))];
        else text += PHRASE[(c + r * 3 + seed) % PHRASE.length];
      }
      ctx.fillText(text, c0 * cell, r * cell + cell / 2);
    }
  }

  // ---- Clicks change the painting, never the gait ----

  function sceneAt(x) {
    const cut = shot(last ? last.t : 0);
    return cut.to && x > W * (1 - cut.wipe) ? cut.to : cut.from;
  }
  const overStag = (x, y) => stag.hit(x, y);
  function interact(x, y, clock) {
    if (stag.hit(x, y)) { color.trigger(x / W, y / H, clock); return 'color'; }
    if (still) return null;
    const kind = EFFECT_FOR[sceneAt(x)];
    effects.spawn(kind, x, clamp(y, H * 0.08, groundY - S * 0.35), clock);
    return kind;
  }
  const colorize = clock => color.trigger(deerX / W, (groundY - S * 0.9) / H, clock);

  const afterLoad = status => { layout(); return status; };
  const ready = stag.ready.then(afterLoad);
  const retry = () => stag.retry().then(afterLoad);
  return { resize: layout, readPalette, render, interact, colorize, overStag, ready, retry };
}
