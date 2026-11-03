import { TAU, clamp, mix, hash, fbm, gray, ease } from './math.js';

// Scene layers own their cached galaxy and stars; resizing rebuilds these once.
export function createScenery(f) {
  const galaxy = document.createElement('canvas');
  const gx = galaxy.getContext('2d');
  let W = 0, H = 0, cell = 6, cols = 0, rows = 0, stars = [];

  function resize(layout) {
    ({ W, H, cell, cols, rows } = layout);
    stars = [];
    for (let i = 0; i < Math.round((W * H) / 9000); i++) {
      const b = hash(i * 1.91 + 5);
      stars.push({ u: hash(i * 3.17), v: hash(i * 7.31 + 2) * 0.62, size: b > 0.93 ? 1 : b > 0.7 ? 0.6 : 0.35, rate: 0.6 + hash(i * 9.1) * 1.8, phase: hash(i * 2.3) * TAU, cross: b > 0.93 });
    }
    paintGalaxy();
  }

  // ---- Scenery, painted in gray light ----

  // Features of a layer that slides by at `depth` times the stag's speed, one every `spacing` pixels.
  function each(v, depth, spacing, pad, draw) {
    const off = v.dist * depth, first = Math.floor((off - pad) / spacing), last = Math.ceil((off + W + pad) / spacing);
    for (let i = first; i <= last; i++) draw(i, i * spacing - off);
  }
  function fillSky(top, bottom, y1) {
    const g = f.createLinearGradient(0, 0, 0, y1);
    g.addColorStop(0, gray(top));
    g.addColorStop(1, gray(bottom));
    f.fillStyle = g;
    f.fillRect(0, 0, W, H);
  }
  function hills(off, base, amp, scale, seed, L) {
    f.fillStyle = gray(L);
    f.beginPath();
    f.moveTo(0, H);
    for (let sx = 0; sx <= W + 8; sx += 8) f.lineTo(sx, base - amp * fbm((sx + off) / scale + seed));
    f.lineTo(W + 8, H);
    f.closePath();
    f.fill();
  }
  function glow(x, y, r, a) {
    const g = f.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgb(255 255 255 / ${a})`);
    g.addColorStop(1, 'rgb(255 255 255 / 0)');
    f.fillStyle = g;
    f.fillRect(x - r, y - r, r * 2, r * 2);
  }
  // Blades of grass rooted on a line, leaning with the wind.
  function blades(list, L) {
    f.fillStyle = gray(L);
    f.beginPath();
    for (const [x, y, h, lean, w] of list) {
      f.moveTo(x - w, y);
      f.quadraticCurveTo(x + lean * 0.3, y - h * 0.55, x + lean, y - h);
      f.quadraticCurveTo(x + lean * 0.3 + w * 0.4, y - h * 0.55, x + w, y);
    }
    f.fill();
  }

  // Cumulus clouds: puffs on a flat base, lit from the upper left, crisp at the edge.
  const CLOUDS = [[0.74, 0.52, 0.44, 3], [0.2, 0.42, 0.26, 7], [0.47, 0.3, 0.13, 13], [1.18, 0.46, 0.22, 19]].map(([x, y, s, seed]) => {
    const puffs = [];
    for (let i = 0; i < 9; i++) { const r = 0.11 + hash(seed + i) * 0.08; puffs.push([mix(-0.5, 0.5, i / 8) + (hash(seed + i * 3) - 0.5) * 0.06, -r * 0.45, r]); }
    for (let i = 0; i < 8; i++) {
      const px = (hash(seed + i * 7.3) - 0.5) * 0.55;
      puffs.push([px, -0.2 - hash(seed + i * 5.1) * 0.4 * (1 - Math.abs(px) * 1.3), 0.14 + hash(seed + i * 2.9) * 0.12]);
    }
    return { x, y, s, puffs };
  });
  function clouds(v) {
    const unit = Math.min(W * 1.1, H * 1.6);
    for (const c of CLOUDS) {
      const s = c.s * unit, span = W + s * 1.6;
      const x = ((((c.x * W - v.dist * 0.012 - v.clock * 5) % span) + span) % span) - s * 0.8, base = c.y * H;
      f.save();
      f.beginPath(); f.rect(x - s, 0, s * 2, base); f.clip();
      f.fillStyle = gray(0.7);
      f.beginPath();
      for (const [dx, dy, r] of c.puffs) { f.moveTo(x + dx * s + r * s, base + dy * s); f.arc(x + dx * s, base + dy * s, r * s, 0, TAU); }
      f.fill();
      f.fillStyle = gray(1);
      f.beginPath();
      for (const [dx, dy, r] of c.puffs) { const cx = x + (dx - 0.04) * s, cy = base + (dy - 0.06) * s; f.moveTo(cx + r * s * 0.86, cy); f.arc(cx, cy, r * s * 0.86, 0, TAU); }
      f.fill();
      f.restore();
    }
  }

  function meadow(v) {
    const { S, groundY, horizon } = v;
    fillSky(0.42, 0.94, horizon);
    glow(W * 0.8, H * 0.16, Math.min(W, H) * 0.36, 0.6);
    f.fillStyle = gray(1);
    f.beginPath(); f.arc(W * 0.8, H * 0.16, Math.min(W, H) * 0.045, 0, TAU); f.fill();
    clouds(v);
    hills(v.dist * 0.03, horizon - H * 0.01, H * 0.2, 900, 11, 0.8);
    hills(v.dist * 0.09, horizon + H * 0.02, H * 0.1, 520, 23, 0.68);
    hills(v.dist * 0.22, horizon + H * 0.06, H * 0.05, 380, 37, 0.58);
    const top = horizon + H * 0.065;
    const plane = f.createLinearGradient(0, top, 0, H);
    plane.addColorStop(0, gray(0.66));
    plane.addColorStop(clamp((groundY - top) / (H - top)), gray(0.56));
    plane.addColorStop(1, gray(0.44));
    f.fillStyle = plane;
    f.fillRect(0, top, W, H - top);
    // Small white flowers scattered over the plane.
    f.fillStyle = gray(1);
    f.beginPath();
    for (let k = 0; k < 7; k++) {
      const y = mix(top + 8, H, (k / 6) ** 1.4), depth = (y - horizon) / (groundY - horizon);
      each(v, depth, 60 * depth + 10, 20, (i, x) => {
        if (hash(i * 3.3 + k) < 0.5) return;
        const r = 0.8 + depth * 1.6, fy = y + (hash(i + k * 7) - 0.5) * 20 * depth;
        f.moveTo(x + r, fy); f.arc(x, fy, r, 0, TAU);
      });
    }
    f.fill();
    // Tufts in rows; a row's speed and size follow its distance, so the meadow reads as a plane.
    for (let k = 0; k < 11; k++) {
      const y = mix(top + 4, H + 6, (k / 10) ** 1.5), depth = (y - horizon) / (groundY - horizon);
      const list = [];
      each(v, depth, 22 * depth + 4, 40, (i, x) => {
        const seed = i * 1.7 + k * 31, h = (5 + 14 * hash(seed)) * depth + 1;
        const gust = v.wind(x) * h * 1.3;
        for (let b = 0; b < 2; b++) list.push([x + (hash(seed + b) - 0.5) * 14 * depth, y, h * (1 - b * 0.3), Math.sin(v.clock * 1.8 + i * 0.4) * h * 0.25 + (b - 0.5) * h * 0.5 - gust, Math.max(0.6, depth * 1.4)]);
      });
      blades(list, 0.42 - k * 0.015);
    }
    // Wind: long thin streaks, and seeds drifting by.
    f.strokeStyle = gray(1, 0.7);
    f.lineWidth = 1.4;
    f.lineCap = 'round';
    f.beginPath();
    for (let i = 0; i < 4; i++) {
      const span = W * 1.8, x = W * 1.3 - (((v.clock * W * 0.55 + hash(i) * span) % span)), y = H * (0.35 + hash(i + 0.4) * 0.3), len = W * (0.12 + hash(i + 0.8) * 0.1);
      f.moveTo(x, y); f.quadraticCurveTo(x + len * 0.5, y - H * 0.02, x + len, y + H * 0.005);
    }
    f.stroke();
    f.fillStyle = gray(1);
    f.beginPath();
    for (let i = 0; i < 26; i++) {
      const span = W * 1.4, x = W * 1.2 - ((v.dist * 1.3 + hash(i * 2.1) * span) % span), y = H * (0.25 + hash(i * 3.3) * 0.55) + Math.sin(v.clock * 1.4 + i) * 12;
      f.moveTo(x + 2, y); f.arc(x, y, 1.2 + hash(i) * 1.6, 0, TAU);
    }
    f.fill();
  }
  function meadowFront(v) {
    const { S } = v, list = [];
    each(v, 1.7, S * 0.75, S, (i, x) => {
      if (hash(i * 2.3) < 0.35) return;
      for (let b = 0; b < 7; b++) {
        const seed = i * 7 + b, h = S * (0.16 + hash(seed + 0.4) * 0.22), bx = x + (hash(seed) - 0.5) * S * 0.4;
        list.push([bx, H + 4, h, Math.sin(v.clock * 1.5 + seed) * h * 0.12 + (hash(seed + 0.8) - 0.5) * h * 0.7 - v.wind(bx) * h * 0.9, S * 0.014]);
      }
    });
    blades(list, 0.14);
  }

  // Light falling through the canopy: soft beams from the upper right.
  function shafts(v, a) {
    for (let k = 0; k < 5; k++) {
      const span = W * 1.6, x = (((W * (0.15 + k * 0.3) - v.dist * 0.05 + Math.sin(v.clock * 0.3 + k) * 20) % span) + span) % span - W * 0.2;
      const w = W * (0.03 + hash(k + 9) * 0.04), drop = H * 0.55;
      const g = f.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, `rgb(255 255 255 / ${a})`);
      g.addColorStop(1, 'rgb(255 255 255 / 0)');
      f.fillStyle = g;
      f.beginPath();
      f.moveTo(x, 0); f.lineTo(x + w, 0); f.lineTo(x + w * 2.4 - drop, H); f.lineTo(x - drop, H);
      f.closePath();
      f.fill();
    }
  }
  function trunk(x, w, top, bottom, flare) {
    f.beginPath();
    f.moveTo(x + w * 0.08, top);
    f.lineTo(x + w * 0.92, top);
    f.quadraticCurveTo(x + w, bottom - flare * 2, x + w + flare, bottom);
    f.lineTo(x - flare, bottom);
    f.quadraticCurveTo(x, bottom - flare * 2, x + w * 0.08, top);
    f.fill();
  }
  // A clump of leaves: overlapping round blobs around a point.
  function foliage(x, y, r, seed) {
    for (let k = 0; k < 7; k++) {
      const a = hash(seed + k) * TAU, d = r * 0.55 * hash(seed + k * 1.7), rr = r * (0.35 + hash(seed + k * 2.3) * 0.35);
      f.moveTo(x + Math.cos(a) * d + rr, y + Math.sin(a) * d * 0.7);
      f.arc(x + Math.cos(a) * d, y + Math.sin(a) * d * 0.7, rr, 0, TAU);
    }
  }
  function forest(v) {
    const { S, groundY } = v;
    fillSky(0.95, 0.8, groundY);
    // Far trees: pale trunks with pale crowns, lost in the mist.
    f.fillStyle = gray(0.84);
    f.beginPath();
    each(v, 0.12, S * 0.45, S, (i, x) => foliage(x, H * (0.12 + hash(i * 2.2) * 0.1), S * (0.35 + hash(i) * 0.2), i * 13));
    f.fill();
    each(v, 0.12, S * 0.22, S, (i, x) => {
      if (hash(i * 1.3) < 0.35) return;
      f.fillStyle = gray(0.83 - hash(i + 0.5) * 0.05);
      trunk(x, S * (0.025 + hash(i) * 0.035), H * 0.1, groundY - S * 0.12, S * 0.01);
    });
    shafts(v, 0.38);
    // Middle trees.
    f.fillStyle = gray(0.62);
    f.beginPath();
    each(v, 0.4, S * 0.7, S, (i, x) => foliage(x + S * 0.05, H * (0.06 + hash(i * 3.1) * 0.12), S * (0.45 + hash(i + 2) * 0.25), i * 17));
    f.fill();
    each(v, 0.4, S * 0.55, S, (i, x) => {
      if (hash(i * 2.1) < 0.3) return;
      f.fillStyle = gray(0.64 - hash(i + 0.7) * 0.06);
      trunk(x, S * (0.07 + hash(i + 1) * 0.06), 0, groundY - S * 0.05, S * 0.03);
    });
    const floor = f.createLinearGradient(0, groundY - S * 0.08, 0, H);
    floor.addColorStop(0, gray(0.6));
    floor.addColorStop(1, gray(0.34));
    f.fillStyle = floor;
    f.fillRect(0, groundY - S * 0.08, W, H);
    // Bushes behind the stag.
    f.fillStyle = gray(0.48);
    f.beginPath();
    each(v, 0.7, S * 0.9, S, (i, x) => { if (hash(i * 7.7) > 0.45) foliage(x, groundY - S * 0.05, S * (0.25 + hash(i) * 0.2), i * 23); });
    f.fill();
    // Near trees, just behind the stag.
    each(v, 0.85, S * 1.3, S, (i, x) => {
      if (hash(i * 3.7) < 0.35) return;
      f.fillStyle = gray(0.36);
      trunk(x, S * (0.18 + hash(i + 2) * 0.12), 0, groundY + S * 0.03, S * 0.08);
    });
    // The canopy overhead, close enough to pass quickly.
    f.fillStyle = gray(0.26);
    f.beginPath();
    each(v, 0.9, S * 0.5, S, (i, x) => foliage(x, H * (0.02 + hash(i) * 0.06), S * (0.45 + hash(i + 0.3) * 0.3), i * 29));
    f.fill();
    // Ferns along the stag's line.
    const fronds = [];
    each(v, 1, S * 0.32, S, (i, x) => {
      if (hash(i * 4.1) < 0.4) return;
      for (let b = 0; b < 6; b++) {
        const seed = i * 6 + b, h = S * (0.08 + hash(seed) * 0.14);
        fronds.push([x + (hash(seed + 0.2) - 0.5) * S * 0.2, groundY + S * 0.04, h, (b - 2.5) * h * 0.32, S * 0.02]);
      }
    });
    blades(fronds, 0.3);
    // Motes drifting in the light.
    f.fillStyle = gray(1, 0.9);
    f.beginPath();
    for (let i = 0; i < 40; i++) {
      const span = W * 1.3, x = W * 1.15 - ((v.dist * 0.6 + hash(i * 1.9) * span) % span), y = H * (0.15 + hash(i * 2.7) * 0.6) + Math.sin(v.clock * 0.9 + i) * 14;
      const r = 1 + hash(i * 3.1) * 2;
      f.moveTo(x + r, y); f.arc(x, y, r, 0, TAU);
    }
    f.fill();
  }
  function forestFront(v) {
    const { S } = v;
    // Now and then a trunk passes right in front of the lens.
    each(v, 1.9, W * 1.25, S, (i, x) => {
      if (hash(i * 5.1) < 0.45) return;
      f.fillStyle = gray(0.06);
      trunk(x, S * 0.55, 0, H + 2, 0);
    });
    const fronds = [];
    each(v, 1.6, S * 0.6, S, (i, x) => {
      if (hash(i * 6.7) < 0.4) return;
      for (let b = 0; b < 7; b++) {
        const seed = i * 7 + b, h = S * (0.14 + hash(seed) * 0.16);
        fronds.push([x + (hash(seed + 0.3) - 0.5) * S * 0.3, H + 4, h, (b - 3) * h * 0.35, S * 0.025]);
      }
    });
    blades(fronds, 0.12);
  }

  // The Milky Way, painted once per size: an arch of soft light, dark lanes through it and a dust of stars.
  function paintGalaxy() {
    galaxy.width = Math.ceil(W);
    galaxy.height = Math.ceil(H);
    gx.clearRect(0, 0, W, H);
    const m = Math.min(W, H);
    const arch = t => [mix(-0.08, 1.08, t) * W, ((1 - t) * (1 - t) * 0.62 + 2 * (1 - t) * t * -0.18 + t * t * 0.5) * H];
    for (let i = 0; i < 700; i++) {
      const [x, y] = arch(i / 700), r = m * (0.03 + hash(i * 2.7) * 0.05);
      const g = gx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `rgb(255 255 255 / ${0.03 + 0.03 * hash(i * 1.3)})`);
      g.addColorStop(1, 'rgb(255 255 255 / 0)');
      gx.fillStyle = g;
      gx.fillRect(x - r, y - r, r * 2, r * 2);
    }
    for (let i = 0; i < 70; i++) {
      const [x, y] = arch(hash(i * 4.1 + 2)), r = m * (0.02 + hash(i * 3.3) * 0.04), off = (hash(i * 5.7) - 0.5) * m * 0.04;
      const g = gx.createRadialGradient(x, y + off, 0, x, y + off, r);
      g.addColorStop(0, 'rgb(0 0 0 / 0.22)');
      g.addColorStop(1, 'rgb(0 0 0 / 0)');
      gx.fillStyle = g;
      gx.fillRect(x - r, y + off - r, r * 2, r * 2);
    }
    gx.fillStyle = '#fff';
    for (let i = 0; i < 5000; i++) {
      const [x, y] = arch(hash(i * 0.913 + 5)), spread = (hash(i * 1.71) + hash(i * 2.37) + hash(i * 3.13) - 1.5) * m * 0.08;
      gx.globalAlpha = 0.3 + hash(i * 6.1) * 0.7;
      gx.fillRect(x + spread * 0.3, y + spread, 1.4, 1.4);
    }
    for (let i = 0; i < 700; i++) {
      gx.globalAlpha = 0.2 + hash(i * 7.7) * 0.6;
      gx.fillRect(hash(i * 8.3 + 1) * W, hash(i * 9.1 + 4) * H * 0.75, 1, 1);
    }
    gx.globalAlpha = 1;
  }
  function night(v) {
    const { S, groundY, horizon } = v;
    fillSky(0.03, 0.22, groundY);
    f.drawImage(galaxy, 0, 0, W, H);
    // Bright stars, one cell each, twinkling; the brightest get a small cross.
    for (const star of stars) {
      const a = star.size * (0.65 + 0.35 * Math.sin(v.clock * star.rate + star.phase));
      const x = Math.floor(star.u * cols) * cell, y = Math.floor(star.v * rows) * cell;
      f.fillStyle = gray(1, a);
      f.fillRect(x, y, cell, cell);
      if (star.cross) {
        f.fillStyle = gray(1, a * 0.35);
        f.fillRect(x - cell, y, cell * 3, cell);
        f.fillRect(x, y - cell, cell, cell * 3);
      }
    }
    // Shooting stars.
    for (const [at, x0, y0] of [[27.4, 0.7, 0.08], [30.4, 0.45, 0.05]]) {
      const k = (v.t - at) / 0.8;
      if (k < 0 || k > 1) continue;
      const x = mix(x0, x0 - 0.3, k) * W, y = mix(y0, y0 + 0.22, k) * H, tail = W * 0.12;
      const g = f.createLinearGradient(x + tail, y - tail * 0.7, x, y);
      g.addColorStop(0, 'rgb(255 255 255 / 0)');
      g.addColorStop(1, `rgb(255 255 255 / ${Math.sin(Math.PI * k)})`);
      f.strokeStyle = g;
      f.lineWidth = cell * 0.7;
      f.beginPath(); f.moveTo(x + tail, y - tail * 0.7); f.lineTo(x, y); f.stroke();
    }
    hills(v.dist * 0.05, horizon + H * 0.1, H * 0.08, 600, 51, 0.12);
    // A faint glow around the stag, as if it gave off light.
    glow(v.deerX, groundY - S * 0.7, S * 1.5, 0.12);
    // Keep the full hoof span level, then blend back into the rolling ridge.
    // Anchoring only the body's centre lets the front and rear feet sink into it.
    const ridge = sx => groundY + (fbm((sx + v.dist) / (S * 4)) - fbm((v.deerX + v.dist) / (S * 4)))
      * S * 0.5 * ease(1.2, 2, Math.abs(sx - v.deerX) / S);
    f.fillStyle = gray(0.03);
    f.beginPath();
    f.moveTo(0, H);
    for (let sx = 0; sx <= W + 8; sx += 8) f.lineTo(sx, ridge(sx) + S * 0.02);
    f.lineTo(W + 8, H);
    f.closePath();
    f.fill();
    const list = [];
    each(v, 1, S * 0.05, S, (i, x) => {
      if (hash(i * 1.1) < 0.45) return;
      const h = S * (0.03 + hash(i + 0.3) * (hash(i + 0.7) > 0.85 ? 0.14 : 0.06));
      list.push([x, ridge(x) + S * 0.03, h, Math.sin(v.clock * 1.2 + i * 0.3) * h * 0.2, S * 0.008]);
    });
    blades(list, 0.03);
    // Fireflies over the grass.
    for (let i = 0; i < 16; i++) {
      const span = W * 1.3, x = W * 1.15 - ((v.dist * 0.9 + hash(i * 4.3) * span) % span), y = groundY - S * (0.05 + hash(i * 5.9) * 0.6) + Math.sin(v.clock * 1.1 + i * 2) * S * 0.05;
      const a = 0.5 + 0.5 * Math.sin(v.clock * (1.5 + hash(i) * 2) + i);
      glow(x, y, cell * 3, 0.8 * a);
    }
  }
  function nightFront(v) {
    // Stardust left behind by the hooves, rising and fading.
    const { S, groundY } = v;
    f.fillStyle = gray(1);
    for (let k = 1; k < 48; k++) {
      const age = k * 0.035, x = v.deerX - S * 0.35 - v.speed * age + (hash(k * 3.1 + Math.floor(v.t * 30 - k)) - 0.5) * S * 0.2;
      const y = groundY - S * 0.03 - age * S * (0.3 + hash(k * 1.7) * 0.6);
      const a = (1 - k / 48) * (0.5 + 0.5 * hash(k * 2.9 + Math.floor(v.clock * 12)));
      if (a < 0.05) continue;
      f.globalAlpha = a;
      const r = cell * (0.6 + 0.8 * (1 - k / 48));
      f.fillRect(x - r * 1.6, y - r * 0.3, r * 3.2, r * 0.6);
      f.fillRect(x - r * 0.3, y - r * 1.6, r * 0.6, r * 3.2);
    }
    f.globalAlpha = 1;
  }

  // ---- Snow mountains: an overcast afternoon, peaks lit from the right, pines in snow ----

  // A range of peaks, each a jagged triangle: the shaded left face, the lit right face, rock below the snow line.
  function peaks(off, base, height, spacing, seed, lit, shade, rock) {
    const first = Math.floor((off - spacing) / spacing), last = Math.ceil((off + W + spacing) / spacing);
    for (let i = first; i <= last; i++) {
      const s = seed + i * 7.1, cx = i * spacing - off + (hash(s) - 0.5) * spacing * 0.5;
      const h = height * (0.55 + 0.45 * hash(s + 1)), w = spacing * (0.75 + 0.5 * hash(s + 2)), top = base - h;
      const ridge = (k, side) => {
        const t = k / 6, x = cx + side * w * t, y = top + h * t;
        return [x, y + (k && k < 6 ? (hash(s + k * 3 + side) - 0.5) * h * 0.1 : 0)];
      };
      const left = [0, 1, 2, 3, 4, 5, 6].map(k => ridge(k, -1)), right = [0, 1, 2, 3, 4, 5, 6].map(k => ridge(k, 1));
      f.fillStyle = gray(shade);
      f.beginPath();
      f.moveTo(...left[6]);
      for (let k = 5; k >= 0; k--) f.lineTo(...left[k]);
      for (let k = 1; k <= 6; k++) f.lineTo(...right[k]);
      f.closePath();
      f.fill();
      // The lit face: from the summit, a crease drops down the middle of the peak to the right foot.
      f.fillStyle = gray(lit);
      f.beginPath();
      f.moveTo(...right[0]);
      for (let k = 1; k <= 6; k++) f.lineTo(...right[k]);
      f.lineTo(cx + w * 0.15, base);
      for (let k = 5; k >= 1; k--) f.lineTo(cx + w * 0.15 * (k / 6) + (hash(s + k * 5) - 0.5) * w * 0.06, top + h * (k / 6));
      f.closePath();
      f.fill();
      // Rock shows below a ragged snow line.
      f.fillStyle = gray(rock);
      f.beginPath();
      f.moveTo(cx - w, base);
      for (let k = 0; k <= 10; k++) {
        const x = cx - w + (2 * w * k) / 10;
        f.lineTo(x, base - h * (0.18 + 0.14 * hash(s + k * 9)) * (1 - Math.abs(x - cx) / w));
      }
      f.lineTo(cx + w, base);
      f.closePath();
      f.fill();
    }
  }
  // A snow-laden pine: tiers of dark needles, each capped with snow.
  function pine(x, base, h, tone, cap) {
    const tiers = 4;
    for (let k = 0; k < tiers; k++) {
      const y0 = base - h * (0.12 + 0.24 * k), y1 = y0 - h * 0.42, w = h * 0.34 * (1 - k * 0.2);
      f.fillStyle = gray(tone);
      f.beginPath(); f.moveTo(x - w, y0); f.lineTo(x, y1); f.lineTo(x + w, y0); f.closePath(); f.fill();
      f.fillStyle = gray(cap);
      f.beginPath(); f.moveTo(x - w * 0.55, y1 + (y0 - y1) * 0.55); f.lineTo(x, y1); f.lineTo(x + w * 0.7, y1 + (y0 - y1) * 0.5);
      f.quadraticCurveTo(x, y1 + (y0 - y1) * 0.35, x - w * 0.55, y1 + (y0 - y1) * 0.55); f.fill();
    }
    f.fillStyle = gray(tone);
    f.fillRect(x - h * 0.03, base - h * 0.14, h * 0.06, h * 0.14);
  }
  function snow(v) {
    const { S, groundY, horizon } = v;
    fillSky(0.56, 0.86, horizon);
    glow(W * 0.78, H * 0.2, Math.min(W, H) * 0.3, 0.3);
    peaks(v.dist * 0.012, horizon + H * 0.03, H * 0.44, W * 0.3, 101, 0.97, 0.74, 0.6);
    peaks(v.dist * 0.04, horizon + H * 0.06, H * 0.24, W * 0.17, 211, 0.95, 0.78, 0.66);
    const top = horizon + H * 0.05;
    const plane = f.createLinearGradient(0, top, 0, H);
    plane.addColorStop(0, gray(0.95));
    plane.addColorStop(1, gray(0.82));
    f.fillStyle = plane;
    f.fillRect(0, top, W, H - top);
    // Wind-carved drifts: soft gray grooves across the snowfield, at three depths.
    f.strokeStyle = gray(0.78);
    f.lineCap = 'round';
    for (const [lane, depth] of [[0.15, 0.3], [0.45, 0.6], [0.85, 1.2]]) {
      const y = mix(top, H, lane);
      f.lineWidth = Math.max(1.2, cell * 0.5 * depth);
      f.beginPath();
      each(v, depth, S * 1.4, S, (i, x) => {
        if (hash(i * 2.9 + lane) < 0.3) return;
        const len = S * (0.6 + hash(i) * 0.8) * depth, yy = y + (hash(i * 1.3) - 0.5) * S * 0.12;
        f.moveTo(x, yy); f.quadraticCurveTo(x + len * 0.5, yy - S * 0.03 * depth, x + len, yy);
      });
      f.stroke();
    }
    each(v, 0.25, S * 0.45, S, (i, x) => { if (hash(i * 3.1) > 0.35) pine(x, top + S * 0.05, S * (0.45 + hash(i) * 0.3), 0.5, 0.9); });
    each(v, 0.6, S * 0.9, S, (i, x) => { if (hash(i * 4.7) > 0.45) pine(x, groundY - S * 0.08, S * (0.9 + hash(i) * 0.5), 0.32, 0.95); });
    // Snow falling across everything, drifting back with the run.
    f.fillStyle = gray(1);
    f.beginPath();
    for (let i = 0; i < 110; i++) {
      const span = W * 1.2, size = cell * (0.35 + hash(i * 1.7) * 0.7);
      const x = ((((hash(i * 2.3) * span - v.dist * 0.2 * (0.5 + hash(i)) - v.clock * 25) % span) + span) % span) - W * 0.1;
      const y = (hash(i * 4.1) * H + v.clock * H * (0.06 + 0.06 * hash(i * 5.3))) % H;
      f.moveTo(x + size, y); f.arc(x, y, size, 0, TAU);
    }
    f.fill();
  }
  function snowFront(v) {
    const { S, groundY } = v;
    each(v, 1.8, W * 1.1, S, (i, x) => { if (hash(i * 5.3) > 0.5) pine(x, H + S * 0.2, S * 2.6, 0.12, 0.92); });
    // Powder kicked up behind the hooves.
    f.fillStyle = gray(0.84);
    f.beginPath();
    for (let k = 1; k < 26; k++) {
      const age = k * 0.04, x = v.deerX - S * 0.4 - v.speed * age * 0.6 + (hash(k * 3.7) - 0.5) * S * 0.2;
      const y = groundY - age * S * (0.4 + hash(k * 1.9) * 0.5), r = S * 0.04 * (1 + age * 3) * (1 - k / 26);
      f.moveTo(x + r, y); f.arc(x, y, r, 0, TAU);
    }
    f.fill();
  }

  // ---- Desert: dawn over dunes, the sun low on the left, slip faces in shadow ----

  // A row of dunes: each rises gently from the left to a sharp crest and drops steeply on the right, in shadow.
  function dunes(off, base, height, spacing, seed, lit, shade) {
    const first = Math.floor((off - spacing * 2) / spacing), last = Math.ceil((off + W + spacing) / spacing);
    for (let i = first; i <= last; i++) {
      const s = seed + i * 5.3, x0 = i * spacing - off + (hash(s) - 0.5) * spacing * 0.4;
      const w = spacing * (1.3 + 0.6 * hash(s + 1)), h = height * (0.5 + 0.5 * hash(s + 2));
      const crest = [x0 + w * 0.68, base - h], x1 = x0 + w;
      f.fillStyle = gray(lit);
      f.beginPath();
      f.moveTo(x0, base);
      f.quadraticCurveTo(x0 + w * 0.4, base - h * 0.35, ...crest);
      f.quadraticCurveTo(crest[0] + w * 0.12, base - h * 0.3, x1, base);
      f.closePath();
      f.fill();
      f.fillStyle = gray(shade);
      f.beginPath();
      f.moveTo(...crest);
      f.quadraticCurveTo(crest[0] + w * 0.12, base - h * 0.3, x1, base);
      f.lineTo(crest[0] + w * 0.08, base);
      f.quadraticCurveTo(crest[0] + w * 0.02, base - h * 0.5, ...crest);
      f.fill();
    }
  }
  function desert(v) {
    const { S, groundY, horizon } = v;
    fillSky(0.6, 0.97, horizon);
    const sun = [W * 0.2, H * 0.24], r = Math.min(W, H) * 0.08;
    glow(...sun, r * 5, 0.6);
    f.fillStyle = gray(1);
    f.beginPath(); f.arc(...sun, r, 0, TAU); f.fill();
    // Flat-topped buttes far off, lit on their left.
    each(v, 0.02, W * 0.45, W * 0.3, (i, x) => {
      if (hash(i * 1.9) < 0.4) return;
      const w = W * (0.08 + 0.1 * hash(i)), h = H * (0.06 + 0.07 * hash(i + 3)), base = horizon + H * 0.02;
      f.fillStyle = gray(0.74);
      f.beginPath(); f.moveTo(x - w * 0.6, base); f.lineTo(x - w * 0.42, base - h); f.lineTo(x + w * 0.42, base - h); f.lineTo(x + w * 0.6, base); f.fill();
      f.fillStyle = gray(0.84);
      f.beginPath(); f.moveTo(x - w * 0.6, base); f.lineTo(x - w * 0.42, base - h); f.lineTo(x - w * 0.15, base - h); f.lineTo(x - w * 0.25, base); f.fill();
    });
    // Heat shimmer over the horizon.
    f.strokeStyle = gray(1, 0.45);
    f.lineWidth = Math.max(1, cell * 0.4);
    for (let k = 0; k < 4; k++) {
      const y = horizon + H * (0.01 + k * 0.012);
      f.beginPath();
      for (let x = 0; x <= W; x += 12) f[x ? 'lineTo' : 'moveTo'](x, y + Math.sin(x / 40 + v.clock * 3 + k) * 2);
      f.stroke();
    }
    dunes(v.dist * 0.06, horizon + H * 0.06, H * 0.12, W * 0.32, 303, 0.88, 0.66);
    dunes(v.dist * 0.18, horizon + H * 0.13, H * 0.1, W * 0.26, 404, 0.84, 0.6);
    const top = horizon + H * 0.12;
    const plane = f.createLinearGradient(0, top, 0, H);
    plane.addColorStop(0, gray(0.82));
    plane.addColorStop(1, gray(0.7));
    f.fillStyle = plane;
    f.fillRect(0, top, W, H - top);
    // Wind ripples in the sand, finer and slower toward the horizon.
    f.strokeStyle = gray(0.6);
    f.lineCap = 'round';
    for (let k = 0; k < 9; k++) {
      const y = mix(top + 6, H, (k / 8) ** 1.4), depth = (y - horizon) / (groundY - horizon);
      f.lineWidth = Math.max(0.8, depth * cell * 0.35);
      f.beginPath();
      each(v, depth, 34 * depth + 8, 30, (i, x) => {
        if (hash(i * 1.3 + k * 17) < 0.25) return;
        const len = (20 + 30 * hash(i + k)) * depth, yy = y + (hash(i * 2.1 + k) - 0.5) * 10 * depth;
        f.moveTo(x, yy); f.quadraticCurveTo(x + len * 0.5, yy - 3 * depth, x + len, yy);
      });
      f.stroke();
    }
    // Dry shrubs and stones along the stag's line, bending in a gust.
    each(v, 1, S * 0.9, S, (i, x) => {
      if (hash(i * 6.1) < 0.5) return;
      const h = S * (0.12 + hash(i) * 0.12), lean = -v.wind(x) * h * 0.8;
      f.strokeStyle = gray(0.3);
      f.lineWidth = Math.max(1.2, S * 0.01);
      f.beginPath();
      for (let b = 0; b < 7; b++) {
        const a = -Math.PI / 2 + (b - 3) * 0.32;
        f.moveTo(x, groundY + S * 0.03);
        f.quadraticCurveTo(x + Math.cos(a) * h * 0.4 + lean * 0.4, groundY - h * 0.4, x + Math.cos(a) * h * 0.7 + lean, groundY + S * 0.03 + Math.sin(a) * h);
      }
      f.stroke();
    });
  }
  function desertFront(v) {
    const { S, groundY } = v;
    each(v, 1.7, W * 0.8, S, (i, x) => {
      if (hash(i * 7.3) < 0.5) return;
      f.fillStyle = gray(0.42);
      f.beginPath(); f.ellipse(x, H + S * 0.05, S * (0.5 + hash(i) * 0.4), S * 0.22, 0, Math.PI, TAU); f.fill();
      f.fillStyle = gray(0.58);
      f.beginPath(); f.ellipse(x - S * 0.12, H + S * 0.05, S * (0.3 + hash(i) * 0.2), S * 0.18, 0, Math.PI, TAU); f.fill();
    });
    // Sand kicked up behind the hooves.
    f.fillStyle = gray(0.62);
    f.beginPath();
    for (let k = 1; k < 26; k++) {
      const age = k * 0.04, x = v.deerX - S * 0.4 - v.speed * age * 0.6 + (hash(k * 2.7) - 0.5) * S * 0.2;
      const y = groundY - age * S * (0.25 + hash(k * 1.3) * 0.35), r = S * 0.035 * (1 + age * 3) * (1 - k / 26);
      f.moveTo(x + r, y); f.arc(x, y, r, 0, TAU);
    }
    f.fill();
  }

  const SCENE = {
    meadow: [meadow, meadowFront], forest: [forest, forestFront], snow: [snow, snowFront],
    night: [night, nightFront], desert: [desert, desertFront]
  };

  return {
    resize,
    drawBack: (name, frame) => SCENE[name][0](frame),
    drawFront: (name, frame) => SCENE[name][1](frame)
  };
}
