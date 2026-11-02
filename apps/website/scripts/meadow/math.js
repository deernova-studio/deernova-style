export const TAU = Math.PI * 2;
export const DEG = 180 / Math.PI;
export const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
export const mix = (a, b, t) => a + (b - a) * t;
export const wrap = x => x - Math.floor(x);
export const hash = n => wrap(Math.sin(n * 127.1 + 311.7) * 43758.5453);

export function ease(a, b, x) {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
}

function noise(u) {
  const i = Math.floor(u);
  return mix(hash(i), hash(i + 1), ease(0, 1, u - i));
}

export const fbm = u => noise(u) * 0.6 + noise(u * 2.3 + 7) * 0.28 + noise(u * 5.1 + 3) * 0.12;

// A half-sine bump while phase p is inside [a, b), wrapping around the stride.
export function pulse(p, a, b) {
  const u = wrap(p - a) / (b - a);
  return u < 1 ? Math.sin(Math.PI * u) : 0;
}

export function gray(L, a = 1) {
  const v = Math.round(clamp(L) * 255);
  return `rgb(${v} ${v} ${v} / ${a})`;
}

// Catmull-Rom between p1 and p2, for arrays of numbers.
export const spline = (p0, p1, p2, p3, k) => p1.map((v, j) => 0.5 * (
  2 * v + (p2[j] - p0[j]) * k
  + (2 * p0[j] - 5 * v + 4 * p2[j] - p3[j]) * k * k
  + (3 * v - p0[j] - 3 * p2[j] + p3[j]) * k * k * k
));
