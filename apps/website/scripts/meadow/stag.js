import { TAU, DEG, clamp } from './math.js';
import { PROFILE, BODY_MASK, LIMBS, ribbon } from './profile.js';
export { GALLOP_RATE, RUN_SPEED, pose } from './gait.js';

function polygon(g, points) {
  g.beginPath();
  g.moveTo(...points[0]);
  for (const point of points.slice(1)) g.lineTo(...point);
  g.closePath();
}

function layer(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function masked(source, mask) {
  const canvas = layer(PROFILE.width, PROFILE.height), g = canvas.getContext('2d');
  polygon(g, mask);
  g.clip();
  g.drawImage(source, 0, 0);
  return canvas;
}

// Affine texture mapping of one triangle, with a tiny overlap to prevent
// antialiasing seams where adjacent bones share an edge.
function triangle(g, texture, source, target) {
  const [[sx, sy], s1, s2] = source, [[tx, ty], t1, t2] = target;
  const ux = s1[0] - sx, uy = s1[1] - sy, vx = s2[0] - sx, vy = s2[1] - sy;
  const det = ux * vy - uy * vx;
  if (Math.abs(det) < 1e-6) return;
  const px = t1[0] - tx, py = t1[1] - ty, qx = t2[0] - tx, qy = t2[1] - ty;
  const a = (px * vy - qx * uy) / det, b = (py * vy - qy * uy) / det;
  const c = (qx * ux - px * vx) / det, d = (qy * ux - py * vx) / det;
  const cx = (tx + t1[0] + t2[0]) / 3, cy = (ty + t1[1] + t2[1]) / 3;
  g.save();
  polygon(g, target.map(([x, y]) => {
    const length = Math.hypot(x - cx, y - cy) || 1;
    return [x + (x - cx) * 0.0015 / length, y + (y - cy) * 0.0015 / length];
  }));
  g.clip();
  g.transform(a, b, c, d, tx - a * sx - c * sy, ty - b * sx - d * sy);
  g.drawImage(texture, 0, 0);
  g.restore();
}

export function createStagRenderer(f) {
  const animal = layer(1, 1), outline = layer(1, 1);
  const g = animal.getContext('2d'), edge = outline.getContext('2d');
  let body, head, limbs;
  const reference = new Image();
  const ready = new Promise(resolve => {
    reference.onload = () => {
      const source = layer(PROFILE.width, PROFILE.height), paint = source.getContext('2d', { willReadFrequently: true });
      paint.drawImage(reference, 0, 0, PROFILE.width, PROFILE.height);
      const pixels = paint.getImageData(0, 0, PROFILE.width, PROFILE.height);
      for (let i = 0; i < pixels.data.length; i += 4) {
        const luminance = 0.2126 * pixels.data[i] + 0.7152 * pixels.data[i + 1] + 0.0722 * pixels.data[i + 2];
        // Preserve the face's dark marks and antler grain, with a pale coat
        // that stays readable over both bright meadow and dark forest scenes.
        const value = luminance < 58 ? 30 + luminance * 1.6 : 150 + 105 * clamp((luminance - 58) / 172) ** 0.45;
        pixels.data[i] = pixels.data[i + 1] = pixels.data[i + 2] = value;
      }
      paint.putImageData(pixels, 0, 0);
      const torso = masked(source, BODY_MASK);
      body = masked(torso, [[0, 350], [910, 420], [1070, 720], [1536, 720], [1536, 1024], [0, 1024]]);
      head = masked(torso, [[0, 0], [1536, 0], [1536, 720], [1050, 720], [890, 420], [0, 350]]);
      limbs = Object.fromEntries(Object.entries(LIMBS).map(([name, limb]) => [name, {
        texture: masked(source, limb.mask),
        vertices: ribbon(limb.points, limb.widths),
        widths: limb.widths.map(width => width / PROFILE.scale)
      }]));
      resolve(true);
    };
    reference.onerror = () => { console.warn('The deer illustration could not be loaded.'); resolve(false); };
  });
  reference.src = new URL('../../assets/milu-running.png', import.meta.url).href;

  function resize(width, height) {
    for (const canvas of [animal, outline]) {
      canvas.width = width;
      canvas.height = height;
    }
  }

  function drawLeg(name, points) {
    const limb = limbs[name], target = ribbon(points, limb.widths);
    for (let bone = 0; bone < points.length - 1; bone++) {
      const a = bone * 2, b = a + 2;
      for (const indices of [[a, a + 1, b], [a + 1, b + 1, b]]) {
        triangle(g, limb.texture, indices.map(i => limb.vertices[i]), indices.map(i => target[i]));
      }
    }
  }

  function draw(p, x, y, size, { cell, SS }) {
    if (!body) return;
    g.resetTransform();
    g.clearRect(0, 0, animal.width, animal.height);
    const transform = new DOMMatrix().scale(SS / cell).translate(x, y).scale(size).rotate(p.pitch * DEG);
    g.setTransform(transform);
    for (const name of ['hindFar', 'foreFar']) drawLeg(name, p.legs[name]);
    // Near-side thigh and shoulder overlap the torso so their muscle follows
    // the gesture instead of leaving a rigid cut at the belly.
    g.drawImage(body, -PROFILE.origin[0] / PROFILE.scale, -PROFILE.origin[1] / PROFILE.scale,
      PROFILE.width / PROFILE.scale, PROFILE.height / PROFILE.scale);
    for (const name of ['hindNear', 'foreNear']) drawLeg(name, p.legs[name]);
    // A small counter-rotation at the shoulder keeps the head and antlers
    // settled while the trunk rises and pitches during the stride.
    g.translate(0.42, -0.04);
    g.rotate(p.head);
    g.translate(-0.42, 0.04);
    g.drawImage(head, -PROFILE.origin[0] / PROFILE.scale, -PROFILE.origin[1] / PROFILE.scale,
      PROFILE.width / PROFILE.scale, PROFILE.height / PROFILE.scale);

    edge.resetTransform();
    edge.globalCompositeOperation = 'source-over';
    edge.clearRect(0, 0, outline.width, outline.height);
    edge.drawImage(animal, 0, 0);
    edge.globalCompositeOperation = 'source-in';
    edge.fillStyle = '#111';
    edge.fillRect(0, 0, outline.width, outline.height);
    f.save();
    f.resetTransform();
    const radius = 0.65 * SS / cell;
    for (let i = 0; i < 8; i++) f.drawImage(outline, Math.cos(i * TAU / 8) * radius, Math.sin(i * TAU / 8) * radius);
    f.drawImage(animal, 0, 0);
    f.restore();
  }

  return { resize, draw, ready };
}
