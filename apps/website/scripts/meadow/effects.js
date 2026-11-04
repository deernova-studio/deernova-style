import { TAU, ease, gray, hash } from './math.js';

// What a click in the sky sets off, one kind per scene. Effects are painted into the gray field like everything
// else, so they print as dots. They run on the playback clock, so they pause with it.
export const EFFECT_FOR = { meadow: 'gust', forest: 'leaves', snow: 'flurry', night: 'meteors', desert: 'sand' };
const DURATION = { gust: 2, leaves: 2.8, flurry: 2.4, meteors: 1.8, sand: 2.2 };
const LIMIT = 6;

export function createEffects(f) {
  let list = [], W = 0, H = 0, cell = 4;

  function resize(layout) { ({ W, H, cell } = layout); }

  function spawn(kind, x, y, clock) {
    list = list.filter(e => clock - e.t0 < DURATION[e.kind]).slice(-(LIMIT - 1));
    list.push({ kind, x, y, t0: clock, seed: Math.floor(hash(clock * 13.7 + x) * 1000) });
  }

  // How hard a meadow or desert gust leans the grass at x: a front that sweeps away from the click.
  function wind(x, clock) {
    let lean = 0;
    for (const e of list) {
      if (e.kind !== 'gust' && e.kind !== 'sand') continue;
      const age = clock - e.t0;
      if (age < 0 || age > DURATION[e.kind]) continue;
      const front = e.x - age * W * 0.75, fade = ease(0, 0.2, age) * (1 - ease(1.2, DURATION[e.kind], age));
      lean += fade * Math.exp(-(((x - front) / (W * 0.16)) ** 2));
    }
    return lean;
  }

  // Wind: long white strokes sweeping off with the gust, and seeds tumbling after them.
  function gust(f, e, age) {
    const fade = ease(0, 0.15, age) * (1 - ease(1.3, 2, age));
    f.lineCap = 'round';
    for (let k = 0; k < 9; k++) {
      const r = hash(e.seed + k), y = e.y + (r - 0.5) * H * 0.22, len = W * (0.22 + 0.16 * hash(e.seed + k * 3));
      const head = e.x - age * W * (0.5 + 0.2 * r) + hash(e.seed + k * 7) * W * 0.06;
      f.strokeStyle = gray(1, fade * (0.75 + 0.25 * r));
      f.lineWidth = Math.max(3, cell * (0.9 + 0.8 * r));
      f.beginPath();
      f.moveTo(head, y);
      f.bezierCurveTo(head + len * 0.3, y - H * 0.03, head + len * 0.6, y + H * 0.025, head + len, y - H * 0.01);
      f.stroke();
    }
    for (let k = 0; k < 36; k++) {
      const r = hash(e.seed * 1.3 + k), a = age * (0.6 + r * 0.5);
      const x = e.x - a * W * (0.3 + 0.35 * r) + Math.sin(age * 4 + k) * 24;
      const y = e.y + (hash(e.seed + k * 5) - 0.5) * H * 0.24 - Math.sin(Math.min(1, a) * Math.PI) * H * 0.1 * r;
      const size = cell * (1 + 1.1 * hash(e.seed + k * 9));
      f.fillStyle = gray(k % 3 ? 1 : 0.28, fade);
      f.beginPath(); f.ellipse(x, y, size * 1.4, size * 0.8, age * 3 + k, 0, TAU); f.fill();
    }
  }

  // The canopy shakes: leaves flutter down from where it was touched and a few birds take off.
  function leaves(f, e, age) {
    const fade = 1 - ease(2.1, 2.8, age);
    for (let k = 0; k < 26; k++) {
      const r = hash(e.seed + k), burst = 1 - Math.exp(-age * 3);
      const x = e.x + (r - 0.5) * W * 0.2 * burst + Math.sin(age * (2.4 + r) + k) * 30 - age * 30;
      const y = e.y + (hash(e.seed + k * 3) - 0.6) * H * 0.08 * burst + age * H * (0.12 + 0.12 * hash(e.seed + k * 5));
      const tilt = Math.sin(age * (3 + r * 2) + k), rx = cell * 2.8, ry = cell * (0.6 + 0.8 * Math.abs(tilt));
      f.fillStyle = gray(0.22 + 0.2 * hash(e.seed + k * 11), fade);
      f.beginPath(); f.ellipse(x, y, rx, ry, tilt, 0, TAU); f.fill();
    }
    for (let k = 0; k < 6; k++) {
      const r = hash(e.seed * 2.1 + k), dir = k % 2 ? 1 : -1, a = Math.max(0, age - k * 0.06);
      const x = e.x + dir * a * W * (0.12 + 0.12 * r), y = e.y - a * H * (0.22 + 0.12 * r) - a * a * H * 0.05;
      const span = cell * (5 + 2.4 * r) * (1 - 0.2 * a), flap = Math.sin(a * 16 + k * 2) * 0.8;
      f.strokeStyle = gray(0.12, fade);
      f.lineWidth = Math.max(2.4, cell * 0.85);
      f.lineJoin = 'round';
      f.beginPath();
      f.moveTo(x - span, y - span * flap * 0.6);
      f.quadraticCurveTo(x - span * 0.4, y - span * 0.15, x, y);
      f.quadraticCurveTo(x + span * 0.4, y - span * 0.15, x + span, y - span * flap * 0.6);
      f.stroke();
    }
  }

  // A whirl of snow spiralling out of the click, with ice glints flashing in it.
  function flurry(f, e, age) {
    const fade = ease(0, 0.12, age) * (1 - ease(1.7, 2.4, age));
    f.fillStyle = gray(1, fade);
    f.beginPath();
    for (let k = 0; k < 64; k++) {
      const r = hash(e.seed + k), angle = r * TAU + age * (1.6 + r);
      const radius = (1 - Math.exp(-age * 1.6)) * Math.min(W, H) * (0.08 + 0.26 * hash(e.seed + k * 3));
      const x = e.x + Math.cos(angle) * radius - age * 40, y = e.y + Math.sin(angle) * radius * 0.6 + age * H * 0.05;
      const size = cell * (0.8 + 0.9 * hash(e.seed + k * 7));
      f.moveTo(x + size, y); f.arc(x, y, size, 0, TAU);
    }
    f.fill();
    for (let k = 0; k < 10; k++) {
      const r = hash(e.seed * 3.3 + k), flash = Math.max(0, Math.sin((age - r * 1.2) * 6)) * fade;
      if (flash < 0.05) continue;
      const x = e.x + (r - 0.5) * W * 0.22, y = e.y + (hash(e.seed + k * 13) - 0.5) * H * 0.18, ray = cell * (3 + 3 * flash);
      f.fillStyle = gray(1, flash);
      f.fillRect(x - ray, y - cell * 0.5, ray * 2, cell);
      f.fillRect(x - cell * 0.5, y - ray, cell, ray * 2);
    }
  }

  // A small shower: a few meteors set off from the click, one after another, down and away.
  function meteors(f, e, age) {
    for (let k = 0; k < 5; k++) {
      const a = (age - k * 0.14 - hash(e.seed + k) * 0.08) / 0.85;
      if (a < 0 || a > 1) continue;
      // Shallow paths that start a little above and to the right of the click, so they cross the sky over it.
      const dx = -0.92, dy = 0.34 + 0.12 * hash(e.seed + k * 5);
      const x0 = e.x + W * 0.06 + (hash(e.seed + k * 7) - 0.5) * W * 0.3, y0 = e.y - H * 0.08 + (hash(e.seed + k * 11) - 0.5) * H * 0.16;
      const travel = a * W * (0.4 + 0.15 * hash(e.seed + k * 13)), x = x0 + dx * travel, y = y0 + dy * travel;
      const tail = W * (0.16 + 0.1 * hash(e.seed + k * 17)) * Math.min(1, a * 4), light = Math.sin(Math.PI * a);
      const g = f.createLinearGradient(x - dx * tail, y - dy * tail, x, y);
      g.addColorStop(0, 'rgb(255 255 255 / 0)');
      g.addColorStop(1, `rgb(255 255 255 / ${light})`);
      f.strokeStyle = g;
      f.lineWidth = Math.max(3, cell * (k ? 1.1 : 1.6));
      f.lineCap = 'round';
      f.beginPath(); f.moveTo(x - dx * tail, y - dy * tail); f.lineTo(x, y); f.stroke();
      f.fillStyle = gray(1, light);
      f.beginPath(); f.arc(x, y, cell * (k ? 1 : 1.5), 0, TAU); f.fill();
    }
    const flash = Math.max(0, 1 - age / 0.35);
    if (flash > 0) {
      const g = f.createRadialGradient(e.x, e.y, 0, e.x, e.y, cell * 8);
      g.addColorStop(0, `rgb(255 255 255 / ${0.6 * flash})`);
      g.addColorStop(1, 'rgb(255 255 255 / 0)');
      f.fillStyle = g;
      f.fillRect(e.x - cell * 8, e.y - cell * 8, cell * 16, cell * 16);
    }
  }

  // Sand lifts off the dunes: dark ribbons and grains blown across the sky.
  function sand(f, e, age) {
    const fade = ease(0, 0.2, age) * (1 - ease(1.5, 2.2, age));
    f.lineCap = 'round';
    for (let k = 0; k < 7; k++) {
      const r = hash(e.seed + k), y = e.y + (r - 0.5) * H * 0.16, len = W * (0.2 + 0.15 * hash(e.seed + k * 3));
      const head = e.x - age * W * (0.55 + 0.3 * r);
      f.strokeStyle = gray(0.5, fade * (0.5 + 0.4 * r));
      f.lineWidth = Math.max(2, cell * (0.6 + 0.8 * r));
      f.beginPath();
      f.moveTo(head, y);
      for (let s = 1; s <= 6; s++) f.lineTo(head + (len * s) / 6, y + Math.sin(s * 1.3 + age * 5 + k) * H * 0.012);
      f.stroke();
    }
    f.fillStyle = gray(0.42, fade);
    f.beginPath();
    for (let k = 0; k < 46; k++) {
      const r = hash(e.seed * 1.7 + k), x = e.x - age * W * (0.4 + 0.6 * r) + (hash(e.seed + k * 5) - 0.5) * W * 0.08;
      const y = e.y + (hash(e.seed + k * 7) - 0.5) * H * 0.2 - age * H * 0.04 * r, size = cell * (0.35 + 0.5 * hash(e.seed + k * 9));
      f.moveTo(x + size, y); f.arc(x, y, size, 0, TAU);
    }
    f.fill();
  }

  const DRAW = { gust, leaves, flurry, meteors, sand };

  function draw(clock, target = f) {
    for (const e of list) {
      const age = clock - e.t0;
      if (age < 0 || age > DURATION[e.kind]) continue;
      target.save();
      DRAW[e.kind](target, e, age);
      target.restore();
    }
  }

  const active = clock => list.some(e => clock - e.t0 <= DURATION[e.kind]);

  return { resize, spawn, wind, draw };
}
