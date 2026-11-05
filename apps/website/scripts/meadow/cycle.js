// The walk is baked offline (art/milu/bake.py). One gait drives all four limbs;
// runtime samples the resulting complete-animal frames continuously.
// The loop contains both halves of a stride so near/far leg identities and their
// occlusion order stay consistent through crossings and the loop seam.
// Baking above the playback rate keeps adjacent samples close, including when
// display callbacks arrive between frame boundaries.
import { clamp, wrap } from './math.js';
import { STRIDE } from './stride.js';

export const WALK_RATE = STRIDE.rate;   // full strides per second
// Ground speed matches the common planted-hoof velocity used by the bake.
export const WALK_SPEED = STRIDE.groundSpeed;
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
    offsetX: STRIDE.offsetX[index],
    rect: [(cell % STRIDE.columns) * w, Math.floor(cell / STRIDE.columns) * h, w, h]
  };
});
export const PHASES = [...STRIDE.phases, 1];
// Where each source drawing sits in the stride, by its generated cell number.
export const KEYS = STRIDE.keys;
// How far the animal reaches behind and ahead of its origin, in scene units, across every frame.
export const EXTENTS = {
  left: Math.max(...FRAMES.map(frame => ORIGIN[0] - frame.bounds[0] - frame.offsetX + 1)) / UNIT,
  right: Math.max(...FRAMES.map(frame => frame.bounds[2] + frame.offsetX + 1 - ORIGIN[0])) / UNIT
};

export function frameAt(phase) {
  const p = wrap(phase);
  let i = 0;
  while (i < FRAME_COUNT - 1 && PHASES[i + 1] <= p) i++;
  return i;
}

// Interpolate at the actual clock phase. Rounding to a whole frame turns small
// timestamp variations into alternating held and skipped poses, even at 60 Hz.
export function poseAt(phase) {
  const i = frameAt(phase), next = (i + 1) % FRAME_COUNT;
  const k = (wrap(phase) - PHASES[i]) / (PHASES[i + 1] - PHASES[i]);
  const m = clamp(k);
  return m < 1e-6 ? [[i, 1]] : m > 1 - 1e-6 ? [[next, 1]] : [[i, 1 - m], [next, m]];
}

// Input changes the painting only. Gait phase and ground travel stay tied to
// the single playback clock, with no stop/restart offsets.
export function createGait() {
  const phase = clock => clock * WALK_RATE;
  return { phase, pose: clock => ({ weights: poseAt(phase(clock)), pace: 1, travel: 0 }) };
}
