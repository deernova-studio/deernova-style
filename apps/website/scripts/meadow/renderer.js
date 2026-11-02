import { TAU, clamp, hash } from './math.js';
import { RUN_SPEED } from './cycle.js';
import { createStagRenderer } from './stag.js';
import { createScenery } from './scenery.js';
import { LOOP, shot } from './timeline.js';

const MONO = 'ui-monospace, "SF Mono", Menlo, monospace';
const RAMP = ' .:-=+*';
const PHRASE = 'DEERNOVA';

// Compose the scene into an offscreen field, then print it as dots and letters.
export function createRenderer(stage, canvas, { raw = false } = {}) {
  const ctx = canvas.getContext('2d');
  const field = document.createElement('canvas');
  const f = field.getContext('2d', { willReadFrequently: true });
  const stag = createStagRenderer(f);
  const scenery = createScenery(f);

  let W = 0, H = 0, dpr = 1, cell = 6, SS = 3, cols = 0, rows = 0, S = 200, groundY = 0, horizon = 0, deerX = 0;
  let bright = new Float32Array(0), grain = new Float32Array(0), cellOf = new Int32Array(0), palette = {};

  function readPalette() {
    const style = getComputedStyle(stage);
    palette = { paper: style.getPropertyValue('--print-paper').trim(), ink: style.getPropertyValue('--print-ink').trim(), mode: style.getPropertyValue('--print-mode').trim() };
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
    bright = new Float32Array(cols * rows);
    grain = Float32Array.from({ length: cols * rows }, (_, i) => hash(i * 0.731 + 17));
    cellOf = Int32Array.from({ length: cols * SS }, (_, x) => Math.floor(x / SS));
    S = phone ? Math.min(W * 0.34, H * 0.2) : Math.min(W * 0.18, H * 0.28);
    groundY = H * (phone ? 0.64 : 0.79);
    horizon = H * (phone ? 0.46 : 0.56);
    deerX = W * (phone ? 0.47 : 0.42);
    scenery.resize({ W, H, cell, cols, rows });
  }

  // ---- Paint the scene, then print it ----

  function render(sim) {
    if (!cols) return;
    const t = sim.t, T = sim.lap * LOOP + t, cut = shot(t);
    const v = { t, clock: sim.clock, dist: RUN_SPEED * S * T, speed: RUN_SPEED * S, S, groundY, horizon, deerX };
    const line = cut.to ? W * (1 - cut.wipe) : W;
    const side = (x0, x1, draw) => { f.save(); f.beginPath(); f.rect(x0, 0, x1 - x0, H); f.clip(); draw(); f.restore(); };

    f.setTransform(SS / cell, 0, 0, SS / cell, 0, 0);
    f.globalCompositeOperation = 'source-over';
    f.globalAlpha = 1;
    if (cut.to) {
      side(0, line, () => scenery.drawBack(cut.from, v));
      side(line, W, () => scenery.drawBack(cut.to, v));
    } else scenery.drawBack(cut.from, v);
    stag.draw(T, deerX, groundY, S);
    if (cut.to) {
      side(0, line, () => scenery.drawFront(cut.from, v));
      side(line, W, () => scenery.drawFront(cut.to, v));
    } else scenery.drawFront(cut.from, v);
    print(cut.to ? line : null, sim.clock);
  }

  function print(line, clock) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalAlpha = 1;
    ctx.fillStyle = palette.paper;
    ctx.fillRect(0, 0, W, H);
    if (raw) { ctx.drawImage(field, 0, 0, W, H); return; }

    // Average each cell's samples into its light, then turn light into ink (or, on black, into light).
    const width = cols * SS, data = f.getImageData(0, 0, width, rows * SS).data;
    bright.fill(0);
    for (let y = 0, i = 0; y < rows * SS; y++) {
      const row = Math.floor(y / SS) * cols;
      for (let px = 0; px < width; px++, i += 4) bright[row + cellOf[px]] += data[i];
    }
    // Values snap to a few flat tones, like screentone sheets in a manga or cel shading in an anime.
    const norm = 1 / (255 * SS * SS), ink = palette.mode !== 'light';
    for (let i = 0; i < bright.length; i++) bright[i] = tone(ink ? 1 - bright[i] * norm : bright[i] * norm);
    const band = line === null ? 0 : Math.max(cell * 8, W * 0.07);

    // Dots: area follows the value; full cells print as squares. Faint values thin out instead of shrinking.
    ctx.fillStyle = palette.ink;
    ctx.beginPath();
    const half = cell / 2, faint = 0.06;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cx = c * cell + half, cy = r * cell + half;
        if (band && Math.abs(cx - line) < band) continue;
        let b = bright[r * cols + c];
        if (b < faint) {
          if (b < 0.003 || grain[r * cols + c] * faint > b) continue;
          b = faint;
        }
        if (b > 0.9) { ctx.rect(cx - half, cy - half, cell, cell); continue; }
        const radius = half * Math.sqrt(b) * 1.12;
        ctx.moveTo(cx + radius, cy);
        ctx.arc(cx, cy, radius, 0, TAU);
      }
    }
    ctx.fill();
    if (band) letters(line, band, clock);
  }

  const TONES = [[0.07, 0], [0.27, 0.16], [0.5, 0.36], [0.76, 0.6], [Infinity, 1]];
  function tone(b) {
    if (raw) return b;
    for (const [below, value] of TONES) if (b < below) return value;
    return 1;
  }

  // The wipe's edge prints the picture in letters: light marks for light values, the name for the darkest.
  function letters(line, band, clock) {
    const c0 = Math.max(0, Math.floor((line - band) / cell)), c1 = Math.min(cols - 1, Math.ceil((line + band) / cell) - 1);
    if (c1 < c0) return;
    const seed = Math.floor(clock * 20);
    ctx.font = `600 ${cell / 0.6}px ${MONO}`;
    ctx.textBaseline = 'middle';
    ctx.fillStyle = palette.ink;
    for (let r = 0; r < rows; r++) {
      let text = '';
      for (let c = c0; c <= c1; c++) {
        const b = bright[r * cols + c], flip = hash(r * 31.7 + c * 7.3 + seed) < 0.2;
        if (b < 0.05 && !flip) text += ' ';
        else if (b < 0.7 && !flip) text += RAMP[Math.min(RAMP.length - 1, Math.floor((b / 0.7) * RAMP.length))];
        else text += PHRASE[(c + r * 3 + seed) % PHRASE.length];
      }
      ctx.fillText(text, c0 * cell, r * cell + cell / 2);
    }
  }

  return { resize: layout, readPalette, render, ready: stag.ready };
}
