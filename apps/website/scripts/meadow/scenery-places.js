import { TAU, mix, hash } from './math.js';
import { drawGull } from './gull.js';

// Additional places use the same drawing primitives, ground plane and pigment
// pass as the original landscapes. All moving detail reads the playback clock.
export function createPlaces(f, { gray, each, fillSky, hills, blades, glow }) {
  let W = 0, H = 0, cell = 4;

  function resize(layout) { ({ W, H, cell } = layout); }

  function plane(top, light, dark) {
    const g = f.createLinearGradient(0, top, 0, H);
    g.addColorStop(0, gray(light));
    g.addColorStop(1, gray(dark));
    f.fillStyle = g;
    f.fillRect(0, top, W, H - top);
  }

  function paving(v, light) {
    const { S, groundY, horizon } = v;
    f.strokeStyle = gray(light);
    f.lineWidth = Math.max(1, cell * 0.45);
    for (let row = 0; row < 4; row++) {
      const y = groundY + (row - 1) * S * 0.27;
      const depth = (y - horizon) / (groundY - horizon);
      f.beginPath(); f.moveTo(0, y); f.lineTo(W, y); f.stroke();
      f.beginPath();
      each(v, depth, S * (1.1 + row * 0.15), S, (i, x) => {
        const start = x + (row % 2) * S * 0.5;
        f.moveTo(start, y); f.lineTo(start - S * 0.15, y + S * 0.27);
      });
      f.stroke();
    }
  }

  function neonLine(x0, y0, x1, y1, width, surface, strength = 1) {
    f.lineCap = 'butt';
    for (const [scale, alpha, light] of [[4.5, 0.08, 0.6], [2.2, 0.18, 0.75], [1, 0.95, 0.96]]) {
      f.strokeStyle = gray(light, alpha * strength, surface); f.lineWidth = width * scale;
      f.beginPath(); f.moveTo(x0, y0); f.lineTo(x1, y1); f.stroke();
    }
  }

  // A dark skyline, punctuated by lit rooms and thin neon sign edges.
  function tower(x, base, w, h, seed, light, detail) {
    const roof = base - h, stepped = hash(seed + 4) > 0.45;
    f.fillStyle = gray(light);
    f.beginPath(); f.moveTo(x, base); f.lineTo(x, roof + h * 0.15);
    if (stepped) {
      f.lineTo(x + w * 0.16, roof + h * 0.15); f.lineTo(x + w * 0.16, roof + h * 0.06);
      f.lineTo(x + w * 0.3, roof + h * 0.06); f.lineTo(x + w * 0.3, roof);
      f.lineTo(x + w * 0.7, roof); f.lineTo(x + w * 0.7, roof + h * 0.06);
      f.lineTo(x + w * 0.84, roof + h * 0.06); f.lineTo(x + w * 0.84, roof + h * 0.15);
    } else {
      f.lineTo(x, roof); f.lineTo(x + w, roof + h * 0.05);
    }
    f.lineTo(x + w, roof + h * 0.15); f.lineTo(x + w, base); f.closePath(); f.fill();
    f.fillStyle = gray(light - 0.09);
    f.fillRect(x + w * 0.73, roof + h * 0.16, w * 0.27, h * 0.84);
    if (stepped) {
      f.fillRect(x + w * 0.48, roof - h * 0.13, Math.max(1.5, w * 0.025), h * 0.14);
    }
    if (!detail) return;
    const columns = Math.max(2, Math.min(6, Math.floor(w / (cell * 3))));
    const rows = Math.max(4, Math.min(22, Math.floor(h / (cell * 4))));
    const dx = w * 0.67 / columns, dy = h * 0.75 / rows;
    const neon = hash(seed + 19) > 0.5 ? 'neonCyan' : 'neonRose';
    f.fillStyle = gray(0.7, 0.85, neon);
    f.beginPath();
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        if (hash(seed + row * 7 + col * 31) < 0.48) continue;
        f.rect(x + w * 0.06 + col * dx, roof + h * 0.2 + row * dy, dx * 0.48, dy * 0.42);
      }
    }
    f.fill();
    f.fillStyle = gray(0.5, 0.1, 'neonCyan');
    f.beginPath(); f.moveTo(x + w * 0.12, roof + h * 0.17); f.lineTo(x + w * 0.42, roof + h * 0.17);
    f.lineTo(x + w * 0.66, base); f.lineTo(x + w * 0.5, base); f.closePath(); f.fill();
    const rail = Math.max(1.5, cell * 0.65);
    neonLine(x + w * 0.74, roof + h * 0.17, x + w * 0.74, base, rail, neon, 0.65);
    if (hash(seed + 43) > 0.4) {
      const sx = x + w * 0.83, sy = roof + h * 0.32, sw = Math.max(cell * 4, w * 0.2), sh = h * 0.26;
      f.fillStyle = gray(0.035); f.fillRect(sx, sy, sw, sh);
      neonLine(sx, sy, sx, sy + sh, rail, neon);
      neonLine(sx + sw, sy, sx + sw, sy + sh, rail, neon);
      f.fillStyle = gray(0.94, 1, neon);
      // Abstract illuminated marks, rather than tiny unreadable sign lettering.
      for (let n = 0; n < 4; n++) {
        const yy = sy + sh * (0.12 + n * 0.21);
        f.fillRect(sx + sw * 0.25, yy, sw * 0.5, Math.max(2, sh * 0.035));
        if (n % 2) f.fillRect(sx + sw * 0.5, yy, Math.max(2, sw * 0.1), sh * 0.09);
      }
    }
  }

  function city(v) {
    const { S, groundY, horizon } = v;
    fillSky(0.045, 0.27, horizon);
    // Low luminous haze separates the silhouettes while the sky stays dark.
    for (const [x, surface] of [[W * 0.18, 'neonRose'], [W * 0.78, 'neonCyan']]) {
      const halo = f.createRadialGradient(x, horizon, 0, x, horizon, H * 0.65);
      halo.addColorStop(0, gray(0.48, 0.22, surface)); halo.addColorStop(1, gray(0.2, 0, surface));
      f.fillStyle = halo; f.fillRect(0, 0, W, H);
    }
    for (const [depth, spacing, light, height, seed] of [
      [0.035, S * 0.48, 0.22, H * 0.35, 211],
      [0.09, S * 0.72, 0.13, H * 0.62, 401],
      [0.2, S * 0.95, 0.065, H * 0.45, 617]
    ]) {
      each(v, depth, spacing, S, (i, x) => {
        const key = i * 13.7 + seed, w = spacing * (0.65 + 0.25 * hash(key));
        const h = height * (0.55 + 0.45 * hash(key + 9));
        tower(x, horizon + H * 0.13, w, h, key, light, depth > 0.05);
      });
    }
    const top = horizon + H * 0.13;
    plane(top, 0.18, 0.055);
    // Broken reflections follow the same near buildings; the paving beneath
    // them continues at the planted-hoof speed, without changing the gait.
    each(v, 0.2, S * 0.95, S, (i, x) => {
      const seed = i * 13.7 + 617, w = S * 0.95 * (0.65 + 0.25 * hash(seed));
      const surface = hash(seed + 19) > 0.5 ? 'neonCyan' : 'neonRose';
      for (let row = 0; row < 15; row++) {
        const u = row / 14, y = mix(top + S * 0.045, H, u);
        const width = w * (0.18 + u * 0.75) * (0.65 + hash(seed + row) * 0.5);
        f.fillStyle = gray(0.8, (1 - u) * 0.3, surface);
        f.fillRect(x + w * 0.74 - width / 2 + Math.sin(v.clock * 0.5 + row) * S * 0.006, y, width, cell * (0.5 + u));
      }
    });
    f.fillStyle = gray(0.08); f.fillRect(0, top, W, S * 0.035);
    neonLine(0, top, W, top, Math.max(1.5, cell * 0.6), 'neonCyan', 0.6);
    each(v, 0.85, S * 2.8, S, (_i, x) => {
      const base = groundY - S * 0.15, roof = base - S * 0.75;
      f.strokeStyle = gray(0.27); f.lineWidth = Math.max(2, S * 0.013);
      f.beginPath(); f.moveTo(x, base); f.lineTo(x, roof);
      f.quadraticCurveTo(x, roof - S * 0.06, x + S * 0.18, roof - S * 0.06); f.stroke();
      neonLine(x + S * 0.1, roof - S * 0.06, x + S * 0.26, roof - S * 0.06, S * 0.02, 'neonRose');
    });
    paving(v, 0.23);
  }

  function steam(x, y, scale, clock, seed) {
    for (let k = 0; k < 6; k++) {
      const age = ((clock * 0.2 + k / 6 + hash(seed)) % 1 + 1) % 1;
      const size = scale * (0.12 + age * 0.4);
      const cx = x - age * scale * 0.8, cy = y - age * scale * 1.3;
      f.fillStyle = gray(0.55, Math.sin(age * Math.PI) * 0.4, 'cloud');
      f.beginPath(); f.ellipse(cx, cy, size * 1.4, size, -0.3, 0, TAU); f.fill();
    }
  }

  function factory(v) {
    const { S, groundY, horizon } = v;
    fillSky(0.72, 0.94, horizon);
    // Distant industrial sheds sit below the chimney silhouettes.
    each(v, 0.05, S * 1.15, S, (i, x) => {
      const h = S * (0.45 + hash(i + 891) * 0.6), base = horizon + H * 0.13;
      f.fillStyle = gray(0.76); f.fillRect(x, base - h, S * 0.9, h);
      f.fillRect(x + S * 0.2, base - h - S * 0.6, S * 0.08, S * 0.6);
    });
    each(v, 0.22, S * 3.1, S * 3, (i, x) => {
      const base = horizon + H * 0.14, w = S * 2.85, roof = base - S * 0.62;
      // Two differently sized flues, with pale steam carried away by the wind.
      for (let k = 0; k < 2; k++) {
        const cx = x + S * (0.45 + k * 1.05), h = S * (1.5 + hash(i * 9 + k) * 0.55);
        f.fillStyle = gray(0.42); f.fillRect(cx, base - h, S * 0.16, h);
        f.fillStyle = gray(0.63); f.fillRect(cx + S * 0.025, base - h, S * 0.045, h);
        f.fillStyle = gray(0.28); f.fillRect(cx - S * 0.025, base - h, S * 0.21, S * 0.055);
        steam(cx + S * 0.08, base - h, S * 0.75, v.clock, i * 5 + k);
      }
      f.fillStyle = gray(0.6);
      f.beginPath(); f.moveTo(x, base); f.lineTo(x, roof);
      for (let bay = 0; bay < 4; bay++) {
        f.lineTo(x + w * (bay + 0.78) / 4, roof - S * 0.22);
        f.lineTo(x + w * (bay + 0.78) / 4, roof);
        f.lineTo(x + w * (bay + 1) / 4, roof);
      }
      f.lineTo(x + w, base); f.closePath(); f.fill();
      f.fillStyle = gray(0.86);
      for (let bay = 0; bay < 4; bay++) f.fillRect(x + w * (bay + 0.65) / 4, roof - S * 0.16, w * 0.035, S * 0.15);
      f.fillStyle = gray(0.27);
      for (let bay = 0; bay < 9; bay++) f.fillRect(x + S * 0.12 + bay * S * 0.29, roof + S * 0.18, S * 0.2, S * 0.18);
      // Exposed pipe with elbows and supports reads clearly through the dots.
      f.lineWidth = S * 0.055; f.strokeStyle = gray(0.3); f.lineJoin = 'round';
      f.beginPath(); f.moveTo(x + S * 0.12, base); f.lineTo(x + S * 0.12, roof + S * 0.48);
      f.lineTo(x + w - S * 0.1, roof + S * 0.48); f.lineTo(x + w - S * 0.1, base); f.stroke();
    });
    plane(horizon + H * 0.14, 0.76, 0.58);
    paving(v, 0.49);
    each(v, 1, S * 2.2, S, (_i, x) => {
      f.fillStyle = gray(0.35); f.fillRect(x, groundY + S * 0.25, S * 0.45, S * 0.08);
      f.fillStyle = gray(0.69);
      for (let k = 0; k < 6; k++) f.fillRect(x + k * S * 0.075, groundY + S * 0.25, S * 0.025, S * 0.08);
    });
  }

  function gull(x, y, span, phase) {
    drawGull(f, x, y, span, phase);
  }

  function coast(v) {
    const { S, groundY, horizon } = v, sea = horizon - H * 0.08;
    fillSky(0.59, 0.95, sea);
    glow(W * 0.75, H * 0.18, H * 0.27, 0.42);
    const shore = groundY - S * 0.18;
    const ocean = f.createLinearGradient(0, sea, 0, shore);
    ocean.addColorStop(0, gray(0.42, 1, 'water'));
    ocean.addColorStop(1, gray(0.72, 1, 'water'));
    f.fillStyle = ocean; f.fillRect(0, sea, W, H - sea);
    f.fillStyle = gray(0.93, 0.8, 'cloud'); f.fillRect(0, sea, W, Math.max(1, cell * 0.5));
    each(v, 0.018, S * 8, S * 2, (i, x) => {
      const w = S * 1.65, h = S * (0.22 + hash(i + 251) * 0.12);
      f.fillStyle = gray(0.65, 1, 'bark');
      f.beginPath(); f.moveTo(x - w * 0.2, sea + S * 0.025);
      f.lineTo(x, sea - h); f.lineTo(x + w * 0.3, sea - h * 0.9);
      f.quadraticCurveTo(x + w * 0.7, sea - h * 0.1, x + w, sea + S * 0.025);
      f.closePath(); f.fill();
    });
    // A small sail at the horizon establishes the scale of the open water.
    each(v, 0.035, S * 5, S, (i, x) => {
      const y = sea + S * (0.08 + hash(i) * 0.08), mast = S * 0.22;
      f.fillStyle = gray(0.91, 1, 'cloud');
      f.beginPath(); f.moveTo(x, y - mast); f.lineTo(x - mast * 0.65, y - mast * 0.1);
      f.lineTo(x, y - mast * 0.1); f.closePath(); f.fill();
      f.fillStyle = gray(0.26); f.fillRect(x - mast * 0.75, y, mast * 1.3, S * 0.018);
    });
    for (let row = 0; row < 8; row++) {
      const depth = (row + 1) / 8, y = mix(sea, shore, depth ** 1.65);
      f.strokeStyle = gray(0.93, 0.35 + depth * 0.35, 'cloud');
      f.lineWidth = Math.max(1, cell * depth * 0.85); f.beginPath();
      each(v, depth * 0.25, S * (0.35 + depth * 0.3), S, (i, x) => {
        const drift = Math.sin(v.clock * 0.7 + i + row) * S * 0.025;
        f.moveTo(x, y + drift); f.quadraticCurveTo(x + S * 0.16, y + drift - S * 0.015, x + S * 0.31, y + drift);
      });
      f.stroke();
    }
    plane(shore, 0.88, 0.7);
    // Foam stops above the walking line, so the hooves stay on dry sand.
    for (let k = 0; k < 2; k++) {
      f.strokeStyle = gray(k ? 0.72 : 1, 0.9, 'cloud'); f.lineWidth = cell * (k ? 0.6 : 1.3);
      f.beginPath();
      for (let x = 0; x <= W + 12; x += 12) {
        const y = shore + Math.sin(x / (S * 0.8) + v.clock * 0.75) * S * 0.018 + k * S * 0.045;
        f[x ? 'lineTo' : 'moveTo'](x, y);
      }
      f.stroke();
    }
    each(v, 1, S * 0.8, S, (i, x) => {
      if (hash(i + 413) < 0.5) return;
      f.fillStyle = gray(0.55);
      f.beginPath(); f.ellipse(x, groundY + S * (0.18 + hash(i) * 0.45), S * 0.025, S * 0.012, hash(i) * 2, 0, TAU); f.fill();
    });
    for (let i = 0; i < 4; i++) {
      const span = W + S, x = ((hash(i + 62) * span - v.clock * S * 0.07) % span + span) % span - S * 0.5;
      gull(x, sea * (0.35 + hash(i + 91) * 0.4), S * (0.04 + hash(i) * 0.025), v.clock * 2.4 + i);
    }
  }

  function riceRow(v, y, depth, seed, foreground = false) {
    const { S } = v, list = [], ears = [];
    each(v, depth, S * (0.085 + depth * 0.06), S * 0.2, (i, x) => {
      const h = S * (0.06 + hash(i * 3 + seed) * 0.045) * depth * (foreground ? 1.65 : 1);
      const lean = (Math.sin(v.clock * 1.4 + i * 0.6 + seed) * 0.25 - v.wind(x) * 0.8) * h;
      for (let b = 0; b < 3; b++) list.push([x, y, h * (1 - b * 0.15), lean + (b - 1) * h * 0.45, Math.max(0.6, depth * 0.9)]);
      ears.push([x + lean, y - h, h]);
    });
    blades(list, foreground ? 0.25 : 0.37);
    f.strokeStyle = gray(foreground ? 0.58 : 0.7, 1, 'grain');
    f.lineWidth = Math.max(1.5, depth * cell * 0.8); f.lineCap = 'round';
    f.beginPath();
    for (const [x, y, h] of ears) {
      f.moveTo(x, y + h * 0.25); f.quadraticCurveTo(x + h * 0.15, y - h * 0.15, x + h * 0.4, y + h * 0.13);
    }
    f.stroke();
    if (foreground) {
      f.fillStyle = gray(0.7, 1, 'grain'); f.beginPath();
      for (const [x, y, h] of ears) {
        for (let k = 0; k < 5; k++) {
          const u = k / 4, cx = x + h * (0.1 + 0.3 * u), cy = y + h * (0.03 + 0.12 * u * u);
          const r = Math.max(1, depth * 1.3);
          f.moveTo(cx + r * 1.5, cy); f.ellipse(cx, cy, r * 1.5, r * 0.7, u * 0.8, 0, TAU);
        }
      }
      f.fill();
    }
  }

  function rice(v) {
    const { S, groundY, horizon } = v;
    fillSky(0.66, 0.95, horizon);
    hills(v.dist * 0.035, horizon, H * 0.15, 700, 171, 0.76);
    hills(v.dist * 0.1, horizon + H * 0.045, H * 0.07, 430, 193, 0.57);
    const top = horizon + H * 0.035, path = groundY - S * 0.08;
    plane(top, 0.73, 0.51);
    // Alternating flooded strips and raised earth, wider toward the viewer.
    for (let row = 0; row < 5; row++) {
      const y = mix(top, path, ((row + 1) / 5) ** 1.35), depth = (y - horizon) / (groundY - horizon);
      f.fillStyle = gray(0.84, 1, 'water'); f.fillRect(0, y - S * 0.035 * depth, W, S * 0.025 * depth);
      f.strokeStyle = gray(0.38); f.lineWidth = Math.max(1, S * 0.012 * depth);
      f.beginPath(); f.moveTo(0, y); f.lineTo(W, y); f.stroke();
      // Field divisions slide at the same depth as their planted rows.
      each(v, depth, S * (1.2 + row * 0.18), S, (_i, x) => {
        f.beginPath(); f.moveTo(x, y); f.lineTo(x + S * 0.18 * depth, y - S * 0.12 * depth); f.stroke();
      });
      riceRow(v, y, depth, row * 71);
    }
    f.fillStyle = gray(0.63, 1, 'bark'); f.fillRect(0, path, W, S * 0.24);
    f.fillStyle = gray(0.81, 1, 'bark'); f.fillRect(0, path, W, S * 0.018);
    f.strokeStyle = gray(0.48, 0.6, 'bark'); f.lineWidth = cell * 0.4; f.beginPath();
    each(v, 1, S * 0.5, S, (i, x) => {
      const y = groundY + S * 0.09;
      f.moveTo(x, y); f.lineTo(x + S * (0.08 + hash(i) * 0.08), y - S * 0.01);
    });
    f.stroke();
  }

  function riceFront(v) {
    for (let k = 0; k < 3; k++) {
      const y = mix(v.groundY + v.S * 0.3, H + v.S * 0.06, k / 2);
      const depth = (y - v.horizon) / (v.groundY - v.horizon);
      riceRow(v, y, depth, 701 + k * 37, true);
    }
  }

  return { resize, scenes: { city: [city], factory: [factory], coast: [coast], rice: [rice, riceFront] } };
}
