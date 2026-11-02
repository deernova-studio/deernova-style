// The home page: a white stag gallops without stopping through three anime-style scenes — a meadow under towering
// clouds, a misty forest with light falling through it, a ridge under the Milky Way — and back to the morning meadow.
// Each scene is painted in gray light, then printed as halftone dots: ink on paper in the light theme, like manga
// screentone, and light on black in the dark one. Scenes hand over with a wipe whose edge turns the picture into
// letters. One clock drives everything, so any second can be drawn on its own: ?t= pins a second, ?halftone=0 shows
// the painting before it is printed.
(() => {
  const stage = document.querySelector('[data-meadow]');
  const canvas = stage && stage.querySelector('canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const field = document.createElement('canvas');
  const f = field.getContext('2d', { willReadFrequently: true });
  const layers = [0, 1, 2].map(() => document.createElement('canvas'));
  const [far, near, mono] = layers.map(layer => layer.getContext('2d'));
  const galaxy = document.createElement('canvas');
  const gx = galaxy.getContext('2d');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const LOOP = 30;
  const TAU = Math.PI * 2;
  const DEG = 180 / Math.PI;
  const MONO = 'ui-monospace, "SF Mono", Menlo, monospace';
  const RAMP = ' .:-=+*';
  const PHRASE = 'DEERNOVA';

  const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
  const ease = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
  const mix = (a, b, t) => a + (b - a) * t;
  const wrap = x => x - Math.floor(x);
  const hash = n => wrap(Math.sin(n * 127.1 + 311.7) * 43758.5453);
  const noise = u => { const i = Math.floor(u); return mix(hash(i), hash(i + 1), ease(0, 1, u - i)); };
  const fbm = u => noise(u) * 0.6 + noise(u * 2.3 + 7) * 0.28 + noise(u * 5.1 + 3) * 0.12;
  // A half-sine bump while phase p is inside [a, b), wrapping around the stride.
  const pulse = (p, a, b) => { const u = wrap(p - a) / (b - a); return u < 1 ? Math.sin(Math.PI * u) : 0; };
  const gray = (L, a = 1) => { const v = Math.round(clamp(L) * 255); return `rgb(${v} ${v} ${v} / ${a})`; };
  // Catmull-Rom between p1 and p2, for arrays of numbers.
  const spline = (p0, p1, p2, p3, k) => p1.map((v, j) => 0.5 * (2 * v + (p2[j] - p0[j]) * k + (2 * p0[j] - 5 * v + 4 * p2[j] - p3[j]) * k * k + (3 * v - p0[j] - 3 * p2[j] + p3[j]) * k * k * k));

  // ---- The run, in seconds of the loop ----
  // 0–9.2 meadow · 9.2–10.8 into the forest · 10.8–19.2 forest · 19.2–20.8 out under the stars · 20.8–28.4 night ·
  // 28.4–30 into the morning meadow, where the loop starts again. Each new scene comes in from ahead of the stag.
  const SCENES = ['meadow', 'forest', 'night'];
  const CUTS = [[9.2, 10.8], [19.2, 20.8], [28.4, 30]];
  function shot(t) {
    for (let i = 0; i < CUTS.length; i++) {
      const [a, b] = CUTS[i];
      if (t >= a && t < b) return { from: SCENES[i], to: SCENES[(i + 1) % SCENES.length], wipe: ease(a, b, t) };
    }
    return { from: t < CUTS[0][0] ? 'meadow' : t < CUTS[1][0] ? 'forest' : 'night', wipe: 0 };
  }

  // ---- The stag, in body lengths: x forward, y down, origin in the middle of the trunk ----
  // Proportions follow red deer; the stride follows Muybridge's 1887 plates of a galloping Virginia deer.

  const TRUNK = [
    [0.3, -0.27],
    [0.15, -0.25, -0.1, -0.21, -0.28, -0.22],
    [-0.4, -0.23, -0.5, -0.21, -0.55, -0.13],
    [-0.6, -0.05, -0.58, 0.05, -0.52, 0.11],
    [-0.48, 0.15, -0.4, 0.17, -0.33, 0.15],
    [-0.2, 0.13, -0.05, 0.2, 0.12, 0.21],
    [0.28, 0.22, 0.4, 0.22, 0.47, 0.14],
    [0.53, 0.08, 0.54, -0.02, 0.5, -0.08],
    [0.45, -0.18, 0.4, -0.25, 0.3, -0.27]
  ];
  // The head, with the poll at the origin and x pointing down the muzzle.
  const HEAD = [
    [-0.07, -0.05],
    [-0.02, -0.09, 0.06, -0.095, 0.12, -0.075],
    [0.2, -0.055, 0.28, -0.04, 0.33, -0.022],
    [0.36, -0.012, 0.375, 0.02, 0.355, 0.04],
    [0.33, 0.06, 0.26, 0.06, 0.18, 0.075],
    [0.1, 0.09, 0.02, 0.1, -0.04, 0.07],
    [-0.08, 0.04, -0.09, -0.02, -0.07, -0.05]
  ];
  // Antlers as drawn when the head is at rest (muzzle 0.5 rad below level): a beam sweeping up and back,
  // brow, bez and trez tines forward, and a crown. Each entry: points, base width, tip width.
  const ANTLER_REST = -0.5;
  const ANTLER = [
    [[[0, 0], [-0.05, -0.2], [-0.16, -0.38], [-0.15, -0.56], [-0.1, -0.7], [-0.02, -0.79]], 0.052, 0.022],
    [[[-0.01, -0.05], [0.07, -0.08], [0.15, -0.14]], 0.032, 0.012],
    [[[-0.04, -0.14], [0.04, -0.18], [0.1, -0.26]], 0.028, 0.012],
    [[[-0.15, -0.37], [-0.08, -0.43], [-0.03, -0.51]], 0.026, 0.01],
    [[[-0.15, -0.56], [-0.22, -0.66], [-0.25, -0.76]], 0.024, 0.01],
    [[[-0.1, -0.7], [-0.12, -0.79], [-0.1, -0.87]], 0.022, 0.01]
  ].map(([points, base, tip]) => {
    const curve = smooth(points);
    return [curve, curve.map((_, i) => mix(base, tip, i / (curve.length - 1)))];
  });

  // Legs are chains: hind = thigh, gaskin, cannon, pastern, hoof; fore = upper arm, forearm, cannon, pastern, hoof.
  // A pose gives the first four segments' angles from straight down, positive reaching forward; the hoof follows the pastern.
  const HIND = { root: [-0.36, -0.07], lengths: [0.3, 0.33, 0.3, 0.075, 0.05], widths: [0.24, 0.13, 0.07, 0.05, 0.046, 0.034] };
  const FORE = { root: [0.4, -0.06], lengths: [0.24, 0.3, 0.3, 0.075, 0.05], widths: [0.17, 0.11, 0.064, 0.05, 0.046, 0.034] };
  // One key every eighth of a stride: touch down, load, push off, toe off, stretch out behind, fold, swing, reach.
  const GALLOP = {
    hind: [[0.75, -0.25, 0.45, 0.7], [0.55, -0.55, 0.2, 1], [0.25, -0.85, -0.25, 0.5], [-0.05, -1.1, -0.75, -0.3], [-0.2, -1.3, -1.1, -1], [0.2, -1.35, -0.35, -0.4], [0.65, -0.85, 0.35, 0.3], [0.85, -0.4, 0.6, 0.6]],
    fore: [[-0.2, 0.45, 0.45, 0.55], [-0.45, 0.15, 0.1, 1], [-0.7, -0.25, -0.25, 0.6], [-0.8, -0.5, -0.55, -0.1], [-0.65, -0.2, -1.5, -1.6], [-0.25, 0.75, -1, -1.2], [-0.05, 1.1, 0.3, 0], [-0.1, 0.75, 0.7, 0.6]],
    stance: 0.375, rate: 1.7, rest: 0.55,
    offsets: { hindFar: 0, hindNear: 0.1, foreFar: 0.42, foreNear: 0.52 }
  };
  const LEGS = ['hindFar', 'foreFar', 'hindNear', 'foreNear'];
  const NECK = { root: [0.36, -0.14], length: 0.36 };

  function smooth(points, steps = 4) {
    const out = [], n = points.length, at = i => points[clamp(i, 0, n - 1)];
    for (let i = 0; i < n - 1; i++) for (let s = 0; s < steps; s++) out.push(spline(at(i - 1), at(i), at(i + 1), at(i + 2), s / steps));
    out.push(points[n - 1]);
    return out;
  }
  // Looping Catmull-Rom through evenly spaced keys, so a stride has no corners.
  function cycle(keys, phase) {
    const n = keys.length, x = wrap(phase) * n, i = Math.floor(x), at = j => keys[((j % n) + n) % n];
    return spline(at(i - 1), at(i), at(i + 1), at(i + 2), x - i);
  }
  function chain(leg, angles) {
    const all = [...angles, angles[3] + 0.35];
    let [x, y] = leg.root;
    const points = [[x, y]];
    all.forEach((a, i) => { x += Math.sin(a) * leg.lengths[i]; y += Math.cos(a) * leg.lengths[i]; points.push([x, y]); });
    return points;
  }
  // How fast the ground passes so a planted hoof stays planted, in body lengths per second.
  const RUN = (() => {
    const hoofX = p => chain(HIND, cycle(GALLOP.hind, p))[5][0];
    return ((hoofX(0) - hoofX(GALLOP.stance)) * GALLOP.rate) / GALLOP.stance;
  })();

  function pose(phase) {
    const legs = {};
    for (const key of LEGS) {
      const hind = key.startsWith('hind');
      legs[key] = chain(hind ? HIND : FORE, cycle(GALLOP[hind ? 'hind' : 'fore'], phase + GALLOP.offsets[key]));
    }
    const pitch = 0.07 * Math.sin(TAU * (phase - 0.45));
    // The lowest hoof stands on the ground; in the gathered leap the whole body lifts clear.
    let depth = 0;
    for (const key of LEGS) { const [x, y] = legs[key][5]; depth = Math.max(depth, x * Math.sin(pitch) + y * Math.cos(pitch)); }
    const air = 0.07 * pulse(phase, 0.86, 1.04);
    const swing = Math.sin(TAU * (phase - 0.2));
    return { legs, pitch, air, lift: depth + 0.012 + air, neck: 0.52 + 0.06 * swing - pitch * 0.5, head: -0.12 - 0.05 * swing, ear: -2.7, tail: 3.2 + 0.15 * Math.sin(TAU * phase * 2) };
  }

  function outline(g, points) {
    g.beginPath();
    g.moveTo(...points[0]);
    for (const p of points.slice(1)) g.bezierCurveTo(...p);
    g.closePath();
    g.fill();
  }
  // A tapered tube through points: a disc at every joint and a quad between, each filled solid.
  function tube(g, points, widths) {
    for (let i = 0; i < points.length; i++) {
      const [x, y] = points[i], r = widths[i] / 2;
      g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
      if (i === points.length - 1) break;
      const [x1, y1] = points[i + 1], r1 = widths[i + 1] / 2;
      const len = Math.hypot(x1 - x, y1 - y) || 1, nx = -(y1 - y) / len, ny = (x1 - x) / len;
      g.beginPath();
      g.moveTo(x + nx * r, y + ny * r); g.lineTo(x1 + nx * r1, y1 + ny * r1);
      g.lineTo(x1 - nx * r1, y1 - ny * r1); g.lineTo(x - nx * r, y - ny * r);
      g.fill();
    }
  }
  function drawLeg(g, points, leg, hind) {
    if (hind) {
      // The ham fills the back of the leg, from behind the thigh down to the point of the hock, with the
      // hamstring a little hollow. It hangs off the thigh, so it swings with the leg.
      const [hip, stifle, hock] = points;
      const thigh = Math.atan2(stifle[0] - hip[0], stifle[1] - hip[1]), gaskin = Math.atan2(hock[0] - stifle[0], hock[1] - stifle[1]);
      const top = [mix(hip[0], stifle[0], 0.35) - Math.cos(thigh) * 0.2, mix(hip[1], stifle[1], 0.35) + Math.sin(thigh) * 0.2];
      const heel = [hock[0] - Math.cos(gaskin) * 0.035, hock[1] + Math.sin(gaskin) * 0.035];
      const mid = [mix(top[0], heel[0], 0.5), mix(top[1], heel[1], 0.5)];
      g.beginPath();
      g.moveTo(...hip);
      g.lineTo(...top);
      g.quadraticCurveTo(mix(mid[0], stifle[0], 0.2), mix(mid[1], stifle[1], 0.2), ...heel);
      g.lineTo(...hock);
      g.lineTo(...stifle);
      g.closePath();
      g.fill();
    }
    tube(g, points, leg.widths);
  }
  function drawNeck(g, angle) {
    const [bx, by] = NECK.root, d = [Math.cos(angle), -Math.sin(angle)], n = [Math.sin(angle), Math.cos(angle)];
    const ex = bx + d[0] * NECK.length, ey = by + d[1] * NECK.length;
    g.beginPath();
    g.moveTo(0.18, -0.25);
    g.quadraticCurveTo(bx + d[0] * 0.19 - n[0] * 0.13, by + d[1] * 0.19 - n[1] * 0.13, ex - n[0] * 0.065, ey - n[1] * 0.065);
    g.lineTo(ex + n[0] * 0.075, ey + n[1] * 0.075);
    g.quadraticCurveTo(bx + d[0] * 0.15 + n[0] * 0.14, by + d[1] * 0.15 + n[1] * 0.14, 0.5, -0.04);
    g.lineTo(0.3, -0.05);
    g.closePath();
    g.fill();
  }
  function drawEar(g, angle, dx) {
    const bx = -0.02 + dx, by = -0.07;
    g.beginPath();
    g.ellipse(bx + Math.cos(angle) * 0.085, by + Math.sin(angle) * 0.085, 0.09, 0.034, angle, 0, TAU);
    g.fill();
  }
  function drawAntler(g) { for (const [points, widths] of ANTLER) tube(g, points, widths); }

  // The stag is white with a dark line around it, like a drawn character; the far side is a step darker.
  function drawStag(p, x, y, size) {
    const body = new DOMMatrix().scale(SS / cell).translate(x, y).scale(size).rotate(p.pitch * DEG);
    const head = body.translate(NECK.root[0] + Math.cos(p.neck) * NECK.length, NECK.root[1] - Math.sin(p.neck) * NECK.length).rotate(-p.head * DEG);
    const antler = head.translate(0, -0.08).rotate(ANTLER_REST * DEG);
    for (const g of [far, near, mono]) {
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.globalCompositeOperation = 'source-over';
      g.globalAlpha = 1;
      g.clearRect(0, 0, field.width, field.height);
      g.fillStyle = '#fff';
    }

    far.setTransform(body);
    drawLeg(far, p.legs.hindFar, HIND, true);
    drawLeg(far, p.legs.foreFar, FORE, false);
    far.setTransform(antler.translate(-0.06, 0.01));
    drawAntler(far);
    far.setTransform(head);
    drawEar(far, p.ear + 0.2, -0.04);

    near.setTransform(body);
    outline(near, TRUNK);
    drawNeck(near, p.neck);
    near.beginPath();
    near.ellipse(-0.54 + Math.cos(p.tail) * 0.05, -0.13 + Math.sin(p.tail) * 0.05, 0.06, 0.028, p.tail, 0, TAU);
    near.fill();
    drawLeg(near, p.legs.hindNear, HIND, true);
    drawLeg(near, p.legs.foreNear, FORE, false);
    near.setTransform(head);
    outline(near, HEAD);
    drawEar(near, p.ear, 0);
    near.setTransform(antler);
    drawAntler(near);

    // The far side only shows where the near side does not cover it; together they make the black silhouette.
    far.setTransform(1, 0, 0, 1, 0, 0);
    far.globalCompositeOperation = 'destination-out';
    far.drawImage(layers[1], 0, 0);
    mono.drawImage(layers[0], 0, 0);
    mono.drawImage(layers[1], 0, 0);
    mono.globalCompositeOperation = 'source-in';
    mono.fillStyle = '#000';
    mono.fillRect(0, 0, field.width, field.height);

    // Shade the belly and legs a step down, and leave out the eye and the nostril.
    near.globalCompositeOperation = 'destination-out';
    near.setTransform(body);
    const shade = near.createLinearGradient(0, -0.05, 0, 0.32);
    shade.addColorStop(0, 'rgb(0 0 0 / 0)');
    shade.addColorStop(1, 'rgb(0 0 0 / 0.14)');
    near.fillStyle = shade;
    near.fillRect(-1.5, -0.05, 3, 1.3);
    near.setTransform(head);
    near.fillStyle = '#000';
    near.beginPath(); near.ellipse(0.1, -0.028, 0.03, 0.024, -0.3, 0, TAU); near.fill();
    near.globalAlpha = 0.5;
    near.beginPath(); near.arc(0.345, 0.005, 0.016, 0, TAU); near.fill();
    near.globalAlpha = 1;

    f.save();
    f.setTransform(1, 0, 0, 1, 0, 0);
    const r = Math.max(1.2, cell * 0.55) * SS / cell;
    for (let k = 0; k < 8; k++) f.drawImage(layers[2], Math.cos((k * TAU) / 8) * r, Math.sin((k * TAU) / 8) * r);
    f.drawImage(layers[2], 0, 0);
    f.globalAlpha = 0.7;
    f.drawImage(layers[0], 0, 0);
    f.globalAlpha = 1;
    f.drawImage(layers[1], 0, 0);
    f.restore();
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
        for (let b = 0; b < 2; b++) list.push([x + (hash(seed + b) - 0.5) * 14 * depth, y, h * (1 - b * 0.3), Math.sin(v.clock * 1.8 + i * 0.4) * h * 0.25 + (b - 0.5) * h * 0.5, Math.max(0.6, depth * 1.4)]);
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
        const seed = i * 7 + b, h = S * (0.16 + hash(seed + 0.4) * 0.22);
        list.push([x + (hash(seed) - 0.5) * S * 0.4, H + 4, h, Math.sin(v.clock * 1.5 + seed) * h * 0.12 + (hash(seed + 0.8) - 0.5) * h * 0.7, S * 0.014]);
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
    for (const [at, x0, y0] of [[22.4, 0.7, 0.08], [26, 0.45, 0.05]]) {
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
    // The ridge it runs along: always at its feet, rolling away on either side.
    const ridge = sx => groundY + (fbm((sx + v.dist) / (S * 4)) - fbm((v.deerX + v.dist) / (S * 4))) * S * 0.5;
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

  const SCENE = { meadow: [meadow, meadowFront], forest: [forest, forestFront], night: [night, nightFront] };

  // ---- Layout ----
  const query = new URLSearchParams(location.search);
  const pinned = Number.parseFloat(query.get('t'));
  const raw = query.get('halftone') === '0';
  const sim = { t: Number.isFinite(pinned) ? pinned % LOOP : reduced ? 24.5 : 0, lap: 0, clock: 0 };
  sim.clock = sim.t;

  let W = 0, H = 0, dpr = 1, cell = 6, SS = 3, cols = 0, rows = 0, S = 200, groundY = 0, horizon = 0, deerX = 0;
  let bright = new Float32Array(0), grain = new Float32Array(0), cellOf = new Int32Array(0), stars = [], palette = {};

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
    cell = phone ? 4 : clamp(Math.round(W / 300), 4, 6);
    SS = phone ? 2 : 3;
    cols = Math.ceil(W / cell);
    rows = Math.ceil(H / cell);
    for (const c of [field, ...layers]) { c.width = cols * SS; c.height = rows * SS; }
    bright = new Float32Array(cols * rows);
    grain = Float32Array.from({ length: cols * rows }, (_, i) => hash(i * 0.731 + 17));
    cellOf = Int32Array.from({ length: cols * SS }, (_, x) => Math.floor(x / SS));
    S = phone ? Math.min(W * 0.36, H * 0.2) : Math.min(W * 0.15, H * 0.25);
    groundY = H * (phone ? 0.64 : 0.79);
    horizon = H * (phone ? 0.46 : 0.56);
    deerX = W * (phone ? 0.47 : 0.42);
    stars = [];
    for (let i = 0; i < Math.round((W * H) / 9000); i++) {
      const b = hash(i * 1.91 + 5);
      stars.push({ u: hash(i * 3.17), v: hash(i * 7.31 + 2) * 0.62, size: b > 0.93 ? 1 : b > 0.7 ? 0.6 : 0.35, rate: 0.6 + hash(i * 9.1) * 1.8, phase: hash(i * 2.3) * TAU, cross: b > 0.93 });
    }
    paintGalaxy();
  }

  // ---- Paint the scene, then print it ----

  function render() {
    if (!cols) return;
    const t = sim.t, T = sim.lap * LOOP + t, cut = shot(t);
    const v = { t, clock: sim.clock, dist: RUN * S * T, speed: RUN * S, S, groundY, horizon, deerX };
    const line = cut.to ? W * (1 - cut.wipe) : W;
    const [back, front] = SCENE[cut.from], next = cut.to && SCENE[cut.to];
    const side = (x0, x1, draw) => { f.save(); f.beginPath(); f.rect(x0, 0, x1 - x0, H); f.clip(); draw(v); f.restore(); };

    f.setTransform(SS / cell, 0, 0, SS / cell, 0, 0);
    f.globalCompositeOperation = 'source-over';
    f.globalAlpha = 1;
    if (next) { side(0, line, back); side(line, W, next[0]); } else back(v);
    const p = pose(wrap(GALLOP.rate * T));
    drawStag(p, deerX, groundY - p.lift * S, S);
    if (next) { side(0, line, front); side(line, W, next[1]); } else front(v);
    print(next ? line : null);
  }

  function print(line) {
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
    if (band) letters(line, band);
  }

  const TONES = [[0.07, 0], [0.27, 0.16], [0.5, 0.36], [0.76, 0.6], [Infinity, 1]];
  function tone(b) {
    if (raw) return b;
    for (const [below, value] of TONES) if (b < below) return value;
    return 1;
  }

  // The wipe's edge prints the picture in letters: light marks for light values, the name for the darkest.
  function letters(line, band) {
    const c0 = Math.max(0, Math.floor((line - band) / cell)), c1 = Math.min(cols - 1, Math.ceil((line + band) / cell) - 1);
    if (c1 < c0) return;
    const seed = Math.floor(sim.clock * 20);
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

  // ---- Loop: 30 frames a second, frozen when hidden or off screen ----

  let running = false, onScreen = true, last = 0, wait = 1;
  const still = reduced || Number.isFinite(pinned);
  function step(dt) {
    sim.t += dt;
    sim.clock += dt;
    if (sim.t >= LOOP) { sim.t -= LOOP; sim.lap++; }
  }
  function frame(now) {
    if (!running) return;
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    step(dt);
    wait += dt;
    if (wait >= 1 / 30) { wait = 0; render(); }
    requestAnimationFrame(frame);
  }
  function sync() {
    const go = onScreen && !document.hidden && !still;
    if (go && !running) { running = true; last = performance.now(); requestAnimationFrame(frame); }
    if (!go) running = false;
  }
  function repaint() { readPalette(); render(); }

  new IntersectionObserver(([entry]) => { onScreen = entry.isIntersecting; sync(); }).observe(stage);
  new ResizeObserver(() => { layout(); render(); }).observe(stage);
  document.addEventListener('visibilitychange', sync);
  document.addEventListener('deernova:theme', repaint);
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', repaint);

  readPalette();
  layout();
  render();
  sync();
})();
