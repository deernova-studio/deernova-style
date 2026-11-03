// The stride is baked offline (art/milu/bake.py) from 32 generated drawings of the
// whole animal. The bake gives every head the same size and a smooth path, and
// draws real in-between poses with optical flow, so a frame is always one deer:
// never two drawings half-faded over each other. At runtime we only pick frames.
// Running at GALLOP_RATE passes exactly one baked frame per 60 Hz refresh.
import { clamp, ease, wrap } from './math.js';
import { STRIDE } from './stride.js';

export const GALLOP_RATE = 1.2;
export const RUN_SPEED = 3.6;
export const FRAME_COUNT = STRIDE.phases.length;
// Every frame shares one size and one torso origin (frame pixels); UNIT is frame pixels per scene unit.
export const FRAME_SIZE = STRIDE.size;
export const ORIGIN = STRIDE.origin;
export const UNIT = STRIDE.unit;
export const ATLASES = STRIDE.atlases.map(atlas => ({
  src: new URL(`../../assets/${atlas.file}`, import.meta.url),
  width: atlas.width,
  height: atlas.height
}));
export const FRAMES = STRIDE.phases.map((phase, index) => {
  const atlas = Math.floor(index / STRIDE.perAtlas), cell = index % STRIDE.perAtlas;
  const [w, h] = FRAME_SIZE;
  return {
    atlas, phase, source: STRIDE.sources[index], bounds: STRIDE.bounds[index],
    rect: [(cell % STRIDE.columns) * w, Math.floor(cell / STRIDE.columns) * h, w, h]
  };
});
export const PHASES = [...STRIDE.phases, 1];
// Where each source drawing sits in the stride, by its generated cell number.
export const KEYS = STRIDE.keys;
// How far the animal reaches behind and ahead of its origin, in scene units, across every frame.
export const EXTENTS = {
  left: Math.max(...FRAMES.map(frame => ORIGIN[0] - frame.bounds[0] + 1)) / UNIT,
  right: Math.max(...FRAMES.map(frame => frame.bounds[2] + 1 - ORIGIN[0])) / UNIT
};

export function frameAt(phase) {
  const p = wrap(phase);
  let i = 0;
  while (i < FRAME_COUNT - 1 && PHASES[i + 1] <= p) i++;
  return i;
}

// The bake makes one frame per 60 Hz refresh at running speed, so a running deer
// shows every frame whole, in turn. When the stride slows (the hang of a leap) a
// frame would hold and then step; fade between neighbours instead, over more of
// each interval the slower the stride moves. `speed` is in strides per second.
export function poseAt(phase, speed = GALLOP_RATE) {
  const i = frameAt(phase), next = (i + 1) % FRAME_COUNT;
  const k = (wrap(phase) - PHASES[i]) / (PHASES[i + 1] - PHASES[i]);
  const fade = 1 - Math.min(1, Math.abs(speed) * FRAME_COUNT / 60);
  const m = fade < 1e-6 ? (k < 0.5 ? 0 : 1) : clamp((k - 0.5) / fade + 0.5);
  return m < 1e-6 ? [[i, 1]] : m > 1 - 1e-6 ? [[next, 1]] : [[i, 1 - m], [next, m]];
}

// Drive from hind support and snap the forelegs forward at takeoff. Hang at full
// stretch over the top, then fold the hind legs and reach down with the forelegs,
// making first contact exactly when lift reaches zero. Carry on through foreleg
// compression before returning to the stride, rather than restarting on touchdown.
// The quick changes (forelegs reaching, hind legs folding) pass at near running speed.
export const JUMP = { duration: 1.05, height: 0.42, distance: 0.9, lead: 0.65, follow: 0.7, takeoff: 0.18, landing: 0.84 };
const JUMP_KEYS = [[0, 37], [JUMP.takeoff, 41], [0.23, 8], [0.42, 9], [0.52, 24], [0.55, 25], [0.58, 10], [0.71, 11], [JUMP.landing, 12], [1, 16]]
  .map(([time, source]) => [time, KEYS[source]]);
const RESUME_PHASE = JUMP_KEYS.at(-1)[1];
const PUSH_OFF_PHASE = JUMP_KEYS[0][1];

// Interpolate stride phase, so running and jumping use the same frames. Monotone
// tangents carry speed through each key; the two endpoints match running speed
// rather than braking/restarting the limbs.
const JUMP_SLOPES = JUMP_KEYS.map(([u, phase], i) => {
  if (i === 0 || i === JUMP_KEYS.length - 1) return GALLOP_RATE * JUMP.duration;
  const [u0, p0] = JUMP_KEYS[i - 1], [u1, p1] = JUMP_KEYS[i + 1];
  const h0 = u - u0, h1 = u1 - u;
  const d0 = (phase - p0) / h0, d1 = (p1 - phase) / h1;
  const w0 = 2 * h1 + h0, w1 = h1 + 2 * h0;
  return (w0 + w1) / (w0 / d0 + w1 / d1);
});

// Build forward speed while pushing off, carry it through the air, then ease
// back to running speed on landing. The integral ends at one without a stop mid-air.
function jumpTravel(u) {
  const t = clamp(u), a = JUMP.takeoff, b = JUMP.landing;
  const distance = (1 + b - a) / 2;
  if (t < a) return t * t / (2 * a * distance);
  if (t < b) return (t - a / 2) / distance;
  return 1 - (1 - t) ** 2 / (2 * (1 - b) * distance);
}

function jumpSegment(u) {
  let j = 0;
  while (j < JUMP_KEYS.length - 2 && JUMP_KEYS[j + 1][0] <= u) j++;
  const [u0, p0] = JUMP_KEYS[j], [u1, p1] = JUMP_KEYS[j + 1], h = u1 - u0;
  return { k: clamp((u - u0) / h), h, p0, p1, m0: h * JUMP_SLOPES[j], m1: h * JUMP_SLOPES[j + 1] };
}

export function jumpPhase(u) {
  const { k, p0, p1, m0, m1 } = jumpSegment(u), k2 = k * k, k3 = k2 * k;
  return (2 * k3 - 3 * k2 + 1) * p0 + (k3 - 2 * k2 + k) * m0 + (-2 * k3 + 3 * k2) * p1 + (k3 - k2) * m1;
}

// Strides per second at leap progress u.
export function jumpSpeed(u) {
  const { k, h, p0, p1, m0, m1 } = jumpSegment(u), k2 = k * k;
  return ((6 * k2 - 6 * k) * p0 + (3 * k2 - 4 * k + 1) * m0 + (6 * k - 6 * k2) * p1 + (3 * k2 - 2 * k) * m1) / h / JUMP.duration;
}

// A click requests the next hind-leg push-off. Never jump from an arbitrary
// running pose into a different part of the stride: that reverses the legs.
// Keep the previous leap's camera recovery running while the next push-off is pending.
export function createGait() {
  let previous = null, requested = null;

  const active = clock => requested && clock >= requested.start ? requested : previous;
  const phase = clock => clock * GALLOP_RATE + (active(clock)?.offset ?? 0);
  const jumping = clock => !!requested && clock >= requested.requestedAt && clock < requested.start + JUMP.duration;

  function pose(clock) {
    const leap = active(clock);
    if (!leap) return { weights: poseAt(phase(clock)), lift: 0, u: null, travel: 0, lead: 0 };
    const u = (clock - leap.start) / JUMP.duration;
    const progress = jumpTravel(u);
    const follow = ease(JUMP.duration, JUMP.duration + JUMP.follow, clock - leap.start);
    // Forward travel survives landing. The camera catches up to the lead only
    // after landing, so returning to the usual framing never resets world position.
    const motion = {
      travel: leap.travel + JUMP.distance * progress,
      lead: (leap.lead + (1 - leap.lead) * progress) * (1 - follow)
    };
    if (u < 0 || u >= 1) return { weights: poseAt(phase(clock)), lift: 0, u: null, ...motion };
    const air = clamp((u - JUMP.takeoff) / (JUMP.landing - JUMP.takeoff));
    // This is extra lift on top of the authored stride. Join it with zero vertical
    // speed at both contacts, avoiding a whole-body kick at takeoff/touchdown.
    const lift = JUMP.height * 16 * air ** 2 * (1 - air) ** 2;
    return { weights: poseAt(jumpPhase(u), jumpSpeed(u)), lift, u, ...motion };
  }

  function jump(clock) {
    if (jumping(clock)) return false;
    const remaining = wrap(PUSH_OFF_PHASE - wrap(phase(clock)));
    const start = clock + (remaining > 1 - 1e-9 ? 0 : remaining / GALLOP_RATE);
    const motion = pose(start);
    previous = requested ?? previous;
    requested = {
      requestedAt: clock, start, travel: motion.travel, lead: motion.lead,
      offset: wrap(RESUME_PHASE - (start + JUMP.duration) * GALLOP_RATE)
    };
    return true;
  }

  return { pose, jump, jumping, phase };
}
