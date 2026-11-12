// Deernova loaders: a pen stroke that travels along a mathematical curve on the same 24×24 grid as the icons.
// The stroke is one color (currentColor) and tapers toward its tail; the faint full curve sits behind it.
// When a loader stops it settles into its rest frame, which for `thinking` is exactly the thinking icon.

const TAU = Math.PI * 2;
const SAMPLES = 720;
const STROKE = 1.75;
const TRACK_OPACITY = 0.16;
const TAPER = 0.6; // the tail ends at 40% of the head's width

// Raw curves; each is fitted to the 24 grid by fit() below, so only the shape matters here.
// Open curves (spiral, rows, loops) are run with `there()`, which goes out and comes back, so every curve is a loop.
// `count` is how many points the static track is drawn through; detailed curves need more than the default 48.
const there = t => (1 - Math.cos(t * TAU)) / 2; // 0 → 1 → 0, slowing at both ends
const rose = petals => t => {
  const theta = t * Math.PI;
  const c = Math.cos(petals * theta);
  const r = Math.sign(c) * Math.abs(c) ** 0.6;
  return [r * Math.cos(theta - Math.PI / 2), r * Math.sin(theta - Math.PI / 2)];
};
const SHAPES = {
  // A three-petal rose, r = cos 3θ, with fuller petals (|cos 3θ|^0.6) and one petal pointing up.
  thinking: { extent: 16.5, at: rose(3) },
  // The same rose with five petals: thinking that goes on longer.
  'deep-thinking': { extent: 17, count: 80, at: rose(5) },
  // An Archimedean spiral, two turns out from the centre and back in.
  searching: { extent: 16.5, count: 96, at: t => {
    const s = there(t);
    const a = s * 2 * TAU;
    const r = 0.12 + s;
    return [r * Math.cos(a - Math.PI / 2), r * Math.sin(a - Math.PI / 2)];
  } },
  // Three lines read left to right and back, like eyes going down a page.
  reading: { extent: 16.5, count: 72, at: t => {
    const s = there(t);
    return [Math.cos(s * 3 * Math.PI), 1.2 * (s + Math.sin(6 * Math.PI * s) / (6 * Math.PI))];
  } },
  // Three joined cursive loops (a trochoid), written and then rewound.
  writing: { extent: 17, count: 96, at: t => {
    const u = (there(t) * 2 - 1) * 3 * Math.PI;
    return [0.28 * u - Math.sin(u), -Math.cos(u)];
  } },
  // A 1:2 Lissajous figure, the ∞ of work going back and forth.
  working: { extent: 17, at: t => [Math.sin(t * TAU), Math.sin(2 * t * TAU) / 2] },
  // A circle, for ordinary loading.
  spinner: { extent: 16, at: t => [Math.cos(t * TAU - Math.PI / 2), Math.sin(t * TAU - Math.PI / 2)] }
};

// How each loader moves. duration: one lap in ms. trail: share of the curve the stroke covers.
export const LOADERS = {
  thinking: { shape: 'thinking', duration: 5200, trail: 0.32, taper: true, rest: 'curve' },
  'deep-thinking': { shape: 'deep-thinking', duration: 7600, trail: 0.24, taper: true, rest: 'curve' },
  searching: { shape: 'searching', duration: 3600, trail: 0.22, taper: true, rest: 'curve' },
  reading: { shape: 'reading', duration: 3200, trail: 0.2, taper: true, rest: 'curve' },
  writing: { shape: 'writing', duration: 3600, trail: 0.2, taper: true, rest: 'curve' },
  working: { shape: 'working', duration: 3000, trail: 0.3, taper: true, rest: 'curve' },
  spinner: { shape: 'spinner', duration: 900, trail: 0.26, taper: false, rest: 'none', reducedDuration: 2400 }
};

const fitted = new Map();
function fit(name) {
  if (fitted.has(name)) return fitted.get(name);
  const shape = SHAPES[name];
  if (!shape) throw Error(`Unknown Deernova loader shape: ${name}`);
  const raw = Array.from({ length: SAMPLES }, (_, i) => shape.at(i / SAMPLES));
  const xs = raw.map(p => p[0]);
  const ys = raw.map(p => p[1]);
  const [minX, maxX, minY, maxY] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const scale = shape.extent / Math.max(maxX - minX, maxY - minY);
  const points = raw.map(([x, y]) => [12 + (x - (minX + maxX) / 2) * scale, 12 + (y - (minY + maxY) / 2) * scale]);
  points.push(points[0]);
  // Cumulative length, so the stroke moves at an even speed along the curve.
  const lengths = [0];
  for (let i = 1; i < points.length; i++) lengths.push(lengths[i - 1] + Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]));
  const result = { points, lengths, total: lengths.at(-1) };
  fitted.set(name, result);
  return result;
}

// The point at a share s (0–1, wrapping) of the curve's length.
function pointAt(curve, s) {
  const target = (((s % 1) + 1) % 1) * curve.total;
  let low = 0;
  let high = curve.lengths.length - 1;
  while (high - low > 1) {
    const mid = (low + high) >> 1;
    if (curve.lengths[mid] < target) low = mid; else high = mid;
  }
  const span = curve.lengths[high] - curve.lengths[low] || 1;
  const k = (target - curve.lengths[low]) / span;
  const [a, b] = [curve.points[low], curve.points[high]];
  return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
}

const num = value => Number(value.toFixed(2));
function polyline(curve, from, to) {
  const steps = Math.max(2, Math.ceil((to - from) * SAMPLES / 2));
  let d = '';
  for (let i = 0; i <= steps; i++) {
    const [x, y] = pointAt(curve, from + (to - from) * i / steps);
    d += `${i ? 'L' : 'M'}${num(x)} ${num(y)}`;
  }
  return d;
}

// The whole curve as a smooth closed path (Catmull-Rom through evenly spaced points).
export function curvePath(name, count) {
  const shape = LOADERS[name]?.shape ?? name;
  const curve = fit(shape);
  count ??= SHAPES[shape].count ?? 48;
  const p = Array.from({ length: count }, (_, i) => pointAt(curve, i / count));
  let d = `M${num(p[0][0])} ${num(p[0][1])}`;
  for (let i = 0; i < count; i++) {
    const [p0, p1, p2, p3] = [p[(i - 1 + count) % count], p[i], p[(i + 1) % count], p[(i + 2) % count]];
    d += `C${num(p1[0] + (p2[0] - p0[0]) / 6)} ${num(p1[1] + (p2[1] - p0[1]) / 6)} ${num(p2[0] - (p3[0] - p1[0]) / 6)} ${num(p2[1] - (p3[1] - p1[1]) / 6)} ${num(p2[0])} ${num(p2[1])}`;
  }
  return `${d}Z`;
}

// The moving stroke at one moment, as tapered pieces from head to tail: [{ d, width }].
// `head` counts laps (1.25 = a quarter into the second lap); `trail` is the share of the curve covered;
// `taper` (0–1) scales how much the tail thins, so a settling stroke can even out into the icon.
export function strokeAt(name, head, trail = LOADERS[name].trail, taper = 1) {
  const config = LOADERS[name];
  const curve = fit(config.shape);
  const count = config.taper ? 12 : 1;
  return Array.from({ length: count }, (_, i) => ({
    d: polyline(curve, head - trail * (i + 1) / count, head - trail * i / count + 0.002),
    width: num(config.taper ? STROKE * (1 - TAPER * taper * i / count) : STROKE)
  }));
}

const SVG = 'http://www.w3.org/2000/svg';
const reducedMotion = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

// Draws a loader into `target` and starts it. Returns { svg, stop(), destroy() }.
// stop() lets the stroke close up and settle into the rest frame (the icon); destroy() removes it.
export function createLoader(target, name = 'thinking', { className = 'dn-icon dn-loader', onRest } = {}) {
  const config = LOADERS[name];
  if (!config) throw Error(`Unknown Deernova loader: ${name}`);
  const svg = document.createElementNS(SVG, 'svg');
  for (const [key, value] of Object.entries({ class: className, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true', 'data-loader': name })) svg.setAttribute(key, value);
  const track = document.createElementNS(SVG, 'path');
  track.setAttribute('d', curvePath(config.shape));
  track.setAttribute('stroke-width', STROKE);
  track.setAttribute('stroke-opacity', TRACK_OPACITY);
  svg.append(track);
  const pieces = strokeAt(name, 0).map(({ width }) => {
    const piece = document.createElementNS(SVG, 'path');
    piece.setAttribute('stroke-width', width);
    svg.append(piece);
    return piece;
  });
  target.append(svg);

  let frame = 0;
  let start = 0;
  let settling = null;
  let resting = false;
  const reduce = reducedMotion();

  function rest() {
    resting = true;
    cancelAnimationFrame(frame);
    for (const piece of pieces) piece.removeAttribute('d');
    if (config.rest === 'curve') track.setAttribute('stroke-opacity', 1);
    else svg.style.visibility = 'hidden';
    onRest?.();
  }

  function draw(now) {
    if (!start) start = now;
    const duration = reduce && config.reducedDuration ? config.reducedDuration : config.duration;
    const head = (now - start) / duration;
    let trail = config.trail;
    let taper = 1;
    if (settling) {
      // Grow the stroke to the whole curve and even out its width over 240ms, then hand over to the rest frame.
      const k = Math.min(1, (now - settling.at) / 240);
      const eased = 1 - (1 - k) ** 3;
      trail = settling.from + (1 - settling.from) * eased;
      taper = 1 - eased;
      if (k === 1) return rest();
    }
    strokeAt(name, head, trail, taper).forEach(({ d, width }, i) => {
      pieces[i].setAttribute('d', d);
      pieces[i].setAttribute('stroke-width', width);
    });
    frame = requestAnimationFrame(draw);
  }

  // Under reduced motion the curves hold still in their rest frame; the plain spinner only slows down.
  if (reduce && config.rest === 'curve') rest();
  else frame = requestAnimationFrame(draw);

  return {
    svg,
    stop({ settle = true } = {}) {
      if (resting) return;
      if (!settle || reduce || config.rest !== 'curve') return rest();
      settling = { at: performance.now(), from: config.trail };
    },
    destroy() {
      cancelAnimationFrame(frame);
      svg.remove();
    }
  };
}

// <dn-loader name="thinking"></dn-loader>; add the `done` attribute to settle it.
export function defineLoaderElement(tag = 'dn-loader') {
  if (typeof customElements === 'undefined' || customElements.get(tag)) return;
  customElements.define(tag, class extends HTMLElement {
    static observedAttributes = ['done'];
    connectedCallback() {
      if (!this.loader) this.loader = createLoader(this, this.getAttribute('name') || 'thinking');
      if (this.hasAttribute('done')) this.loader.stop({ settle: false });
    }
    disconnectedCallback() {
      this.loader?.destroy();
      this.loader = null;
    }
    attributeChangedCallback(name, before, after) {
      if (name === 'done' && after !== null) this.loader?.stop();
    }
  });
}
