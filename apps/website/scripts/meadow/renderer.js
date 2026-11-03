import { clamp, gray, hash } from './math.js';
import { JUMP, RUN_SPEED, createGait } from './cycle.js';
import { createStagRenderer } from './stag.js';
import { createScenery } from './scenery.js';
import { EFFECT_FOR, createEffects } from './effects.js';
import { LOOP, shot } from './timeline.js';

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
export function createRenderer(stage, canvas, { raw = false } = {}) {
  const ctx = canvas.getContext('2d');
  const [field, f] = layer(1, 1, { willReadFrequently: true });
  const [small, s] = layer(1, 1, { willReadFrequently: true });
  const [dots, d] = layer();
  const masks = [1, 2, 3, 4].map(() => layer());
  const stag = createStagRenderer(f);
  const scenery = createScenery(f);
  const effects = createEffects(f);
  const gait = createGait();

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
      // Reserve room for both stretched hind legs and a small forward leap.
      S = Math.min(S, (W - cell * 8) / (stag.leftExtent + stag.rightExtent + 0.2));
      deerX = Math.max(deerX, cell * 4 + stag.leftExtent * S);
    }
    scenery.resize({ W, H, cell, cols, rows });
    effects.resize({ W, H, cell });
    makePatterns();
  }

  // ---- Paint the scene, then print it ----

  function render(sim) {
    if (!cols) return;
    last = sim;
    const t = sim.t, T = sim.lap * LOOP + t, cut = shot(t);
    const pose = gait.pose(sim.clock), up = pose.lift / JUMP.height;
    const leadLimit = clamp((W - deerX - cell * 4) / S - stag.rightExtent, 0, JUMP.lead);
    const lead = pose.lead * leadLimit, animalX = deerX + lead * S;
    const v = {
      t, clock: sim.clock, dist: (RUN_SPEED * T + pose.travel - lead) * S,
      speed: RUN_SPEED * S, S, groundY, horizon, deerX: animalX,
      wind: x => effects.wind(x, sim.clock)
    };
    const line = cut.to ? W * (1 - cut.wipe) : W;
    const side = (x0, x1, draw) => { f.save(); f.beginPath(); f.rect(x0, 0, x1 - x0, H); f.clip(); draw(); f.restore(); };

    f.setTransform(SS / cell, 0, 0, SS / cell, 0, 0);
    f.globalCompositeOperation = 'source-over';
    f.globalAlpha = 1;
    if (cut.to) {
      side(0, line, () => scenery.drawBack(cut.from, v));
      side(line, W, () => scenery.drawBack(cut.to, v));
    } else scenery.drawBack(cut.from, v);

    // The stag and its shadow, which shrinks and fades as it leaves the ground.
    if (stag.hasFrames) {
      f.fillStyle = gray(0, 0.2 * (1 - 0.6 * up));
      f.beginPath();
      f.ellipse(animalX - S * 0.05, groundY + S * 0.03, S * 0.55 * (1 - 0.35 * up), S * 0.05 * (1 - 0.3 * up), 0, 0, Math.PI * 2);
      f.fill();
      stag.draw(pose.weights, animalX, groundY - pose.lift * S, S);
    }

    if (cut.to) {
      side(0, line, () => scenery.drawFront(cut.from, v));
      side(line, W, () => scenery.drawFront(cut.to, v));
    } else scenery.drawFront(cut.from, v);
    effects.draw(sim.clock);
    print(cut.to ? line : null, sim.clock);
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

  // ---- Clicks: the stag jumps; anywhere else, the sky of the scene under the pointer answers ----

  function sceneAt(x) {
    const cut = shot(last ? last.t : 0);
    return cut.to && x > W * (1 - cut.wipe) ? cut.to : cut.from;
  }
  const overStag = (x, y) => stag.hit(x, y);
  function interact(x, y, clock) {
    if (stag.hit(x, y)) return gait.jump(clock) ? 'jump' : null;
    const kind = EFFECT_FOR[sceneAt(x)];
    effects.spawn(kind, x, clamp(y, H * 0.08, groundY - S * 0.35), clock);
    return kind;
  }
  const jump = clock => gait.jump(clock);

  const afterLoad = status => { layout(); return status; };
  const ready = stag.ready.then(afterLoad);
  const retry = () => stag.retry().then(afterLoad);
  return { resize: layout, readPalette, render, interact, jump, overStag, ready, retry };
}
