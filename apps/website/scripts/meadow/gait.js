import { TAU, clamp, spline, wrap } from './math.js';

// One unit is the reference drawing's 500 px body scale. Angles run clockwise
// from vertical; the last point of each chain is the hoof's ground contact.
export const GALLOP_RATE = 1.5;
export const STRIDE = 2.9;
export const RUN_SPEED = STRIDE * GALLOP_RATE;

export const HIND = {
  root: [-0.46, -0.015],
  lengths: [0.32, 0.34, 0.33, 0.08, 0.06],
  widths: [0.26, 0.16, 0.066, 0.037, 0.045, 0.022],
  stance: 0.24, reach: 0.43, clearance: 0.48, bend: 1,
  upper: [0.6, 0.45, 0.15, 0.25, 0.7, 1.05, 1, 0.8]
};
export const FORE = {
  root: [0.42, -0.025],
  lengths: [0.27, 0.37, 0.34, 0.075, 0.065],
  widths: [0.17, 0.105, 0.055, 0.032, 0.045, 0.022],
  stance: 0.27, reach: 0.48, clearance: 0.56, bend: -1,
  upper: [-0.3, -0.3, -0.45, -0.65, -0.8, -0.65, -0.4, -0.15]
};
export const LEGS = {
  hindFar: { anatomy: HIND, contact: 0 },
  hindNear: { anatomy: HIND, contact: 0.13 },
  foreFar: { anatomy: FORE, contact: 0.43 },
  foreNear: { anatomy: FORE, contact: 0.57 }
};

function cycle(keys, phase) {
  const x = wrap(phase) * keys.length, i = Math.floor(x);
  const at = j => [keys[(j + keys.length) % keys.length]];
  return spline(at(i - 1), at(i), at(i + 1), at(i + 2), x - i)[0];
}

// Cubic Hermite with equal endpoint velocities. The hoof continues backwards
// as it leaves the ground, folds forwards, then matches ground speed to land.
function swingX(start, end, velocity, t) {
  const t2 = t * t, t3 = t2 * t;
  return (2 * t3 - 3 * t2 + 1) * start + (-2 * t3 + 3 * t2) * end
    + (2 * t3 - 3 * t2 + t) * velocity;
}

function footTarget(leg, phase) {
  const front = leg.root[0] + leg.reach;
  if (phase <= leg.stance) return [front - STRIDE * phase, 0];
  const duration = 1 - leg.stance, t = (phase - leg.stance) / duration;
  return [
    swingX(front - STRIDE * leg.stance, front, -STRIDE * duration, t),
    -leg.clearance * Math.sin(Math.PI * t) ** 2
  ];
}

function step(point, angle, length) {
  return [point[0] + Math.sin(angle) * length, point[1] + Math.cos(angle) * length];
}

function solveLeg(leg, phase, foot, pitch, lift) {
  // Invert the body transform: a planted world-space hoof stays still even
  // while the body rises and pitches above it.
  const c = Math.cos(pitch), s = Math.sin(pitch);
  const toe = [foot[0] * c + (foot[1] + lift) * s, -foot[0] * s + (foot[1] + lift) * c];
  const hoofAngle = cycle([0.45, 0.7, 0.95, 0.3, -1.1, -1.3, -0.35, 0.1], phase) - pitch;
  const coronet = step(toe, hoofAngle, -leg.lengths[4]);
  const fetlock = step(coronet, hoofAngle - 0.12, -leg.lengths[3]);
  const [rootX, rootY] = leg.root;
  const dx = fetlock[0] - rootX, dy = fetlock[1] - rootY;
  const distance = Math.hypot(dx, dy), direction = Math.atan2(dx, dy);
  const [upper, middle, lower] = leg.lengths;

  // Keep the authored upper-leg gesture inside the lower bones' reachable
  // arc. This preserves all bone lengths without moving the ground target.
  const reach = middle + lower - 0.015;
  const limit = Math.acos(clamp((distance ** 2 + upper ** 2 - reach ** 2) / (2 * distance * upper), -1, 1));
  const desired = cycle(leg.upper, phase);
  const difference = Math.atan2(Math.sin(desired - direction), Math.cos(desired - direction));
  const first = step(leg.root, direction + clamp(difference, -limit, limit), upper);
  const ax = fetlock[0] - first[0], ay = fetlock[1] - first[1];
  const span = Math.hypot(ax, ay);
  const along = (middle ** 2 - lower ** 2 + span ** 2) / (2 * span);
  const height = Math.sqrt(Math.max(0, middle ** 2 - along ** 2));
  const second = [
    first[0] + (ax * along - ay * height * leg.bend) / span,
    first[1] + (ay * along + ax * height * leg.bend) / span
  ];
  return [leg.root, first, second, fetlock, coronet, toe];
}

export function pose(phase) {
  phase = wrap(phase);
  const pitch = 0.025 * Math.sin(TAU * (phase - 0.2));
  const lift = 0.91 + 0.035 * Math.sin(TAU * (phase - 0.05));
  const legs = {}, contacts = {};
  let air = Infinity;
  for (const [name, { anatomy, contact }] of Object.entries(LEGS)) {
    const local = wrap(phase - contact);
    const foot = footTarget(anatomy, local);
    legs[name] = solveLeg(anatomy, local, foot, pitch, lift);
    contacts[name] = local <= anatomy.stance;
    air = Math.min(air, -foot[1]);
  }
  const follow = Math.sin(TAU * (phase - 0.12));
  return {
    legs, contacts, pitch, lift, air,
    head: 0.014 * follow - pitch * 0.6
  };
}
