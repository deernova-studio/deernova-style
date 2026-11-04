import { clamp, mix } from './math.js';

// Illustration pigments, separate from the monochrome UI tokens. Each material
// has a shadow, a midtone and a highlight; geometry and motion stay unchanged.
const MATERIALS = {
  meadow: ['#193b32', '#70966a', '#fff8de'],
  forest: ['#132d29', '#567960', '#f6f4d8'],
  snow: ['#233a50', '#7596b2', '#fbfcf6'],
  night: ['#101728', '#61769a', '#fff5d6'],
  desert: ['#533b38', '#bd875f', '#fff0ca'],
  sky: ['#234a68', '#72aec0', '#eff3de'],
  dusk: ['#514563', '#bd9b99', '#fff0d4'],
  cloud: ['#516f8b', '#adc9d2', '#fffdf0'],
  bark: ['#282d27', '#82755a', '#e7dec3'],
  pine: ['#173b3b', '#58827a', '#edf4e9'],
  light: ['#82683d', '#e5cc89', '#fff9dc']
};
const RGB = Object.fromEntries(Object.entries(MATERIALS).map(([name, stops]) =>
  [name, stops.map(hex => [1, 3, 5].map(i => Number.parseInt(hex.slice(i, i + 2), 16)))]));

export function pigment(light, material, alpha = 1) {
  const stops = RGB[material], u = clamp(light) * 2, i = Math.min(1, Math.floor(u));
  const rgb = stops[i].map((v, channel) => Math.round(mix(v, stops[i + 1][channel], u - i)));
  return `rgb(${rgb.join(' ')} / ${alpha})`;
}

export const COLOR_TIMING = { spread: 0.95, hold: 3, fade: 1.2 };
const smooth = u => { const t = clamp(u); return t * t * (3 - 2 * t); };

// Only reads the playback clock. Repeated clicks extend the visit to colour,
// without restarting its wave, flashing, or changing the animal's gait.
export function createColorReveal({ still = false } = {}) {
  let start = null, fadeAt = 0, origin = [0.5, 0.5], recovery = null;
  function sample(clock) {
    if (start === null) return { amount: 0, spread: 0, origin };
    if (still) return { amount: 1, spread: 1, origin };
    const fade = 1 - smooth((clock - fadeAt) / COLOR_TIMING.fade);
    const amount = recovery ? mix(recovery.amount, 1, smooth((clock - recovery.clock) / 0.2)) * fade : fade;
    return { amount, spread: smooth((clock - start) / COLOR_TIMING.spread), origin };
  }
  function trigger(x, y, clock) {
    const before = sample(clock);
    if (still && before.amount) { start = null; return; }
    if (!before.amount) { start = clock; origin = [clamp(x), clamp(y)]; recovery = null; }
    else if (before.amount < 1) recovery = { clock, amount: before.amount };
    fadeAt = Math.max(clock, start + COLOR_TIMING.spread) + COLOR_TIMING.hold;
  }
  return { sample, trigger };
}
