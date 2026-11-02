import { TAU, DEG, clamp, mix, wrap, pulse, spline } from './math.js';

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
export const RUN_SPEED = (() => {
  const hoofX = p => chain(HIND, cycle(GALLOP.hind, p))[5][0];
  return ((hoofX(0) - hoofX(GALLOP.stance)) * GALLOP.rate) / GALLOP.stance;
})();

export function pose(phase) {
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

export const GALLOP_RATE = GALLOP.rate;

export function createStagRenderer(f) {
  const field = f.canvas;
  const layers = [0, 1, 2].map(() => document.createElement('canvas'));
  const [far, near, mono] = layers.map(layer => layer.getContext('2d'));

  function resize(width, height) {
    for (const layer of layers) {
      layer.width = width;
      layer.height = height;
    }
  }

  // The stag is white with a dark line around it, like a drawn character; the far side is a step darker.
  function drawStag(p, x, y, size, { cell, SS }) {
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

  return { resize, draw: drawStag };
}
