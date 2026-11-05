import test from 'node:test';
import assert from 'node:assert/strict';
import { LOOP, SCENES, SEGMENT, STILL_TIME, shot, createPlayback } from '../apps/website/scripts/meadow/timeline.js';
import { readFile } from 'node:fs/promises';
import {
  WALK_RATE, WALK_SPEED, FRAME_COUNT, FRAMES, FRAME_SIZE, ORIGIN, PHASES, KEYS, EXTENTS, ATLASES,
  frameAt, poseAt, createGait
} from '../apps/website/scripts/meadow/cycle.js';
import { STRIDE } from '../apps/website/scripts/meadow/stride.js';
import { EFFECT_FOR } from '../apps/website/scripts/meadow/effects.js';

function clock(start = 0, offset = 0) {
  let time = 1000 + offset, nextId = 0;
  const pending = new Map();
  const frames = [];
  const playback = createPlayback({
    start,
    render: state => frames.push({ ...state }),
    requestFrame: callback => { pending.set(++nextId, callback); return nextId; },
    cancelFrame: id => pending.delete(id),
    now: () => time
  });
  const advance = milliseconds => {
    time += milliseconds;
    const callbacks = [...pending.values()];
    pending.clear();
    for (const callback of callbacks) callback(time);
  };
  return { ...playback, pending, frames, advance };
}

const near = (actual, expected, eps = 1e-9) => assert.ok(Math.abs(actual - expected) < eps, `${actual} != ${expected}`);
const total = weights => weights.reduce((sum, [, w]) => sum + w, 0);
// Stride phase shown by a pose; a mix across the loop seam counts frame 0 as phase 1.
const phaseOf = weights => {
  const seam = weights.some(([i]) => i === FRAME_COUNT - 1);
  return weights.reduce((sum, [i, w]) => sum + w * (seam && i === 0 ? 1 : FRAMES[i].phase), 0);
};
const wrapped = x => x - Math.floor(x);

test('the walk visits all nine landscapes at the original pace and returns to the meadow', () => {
  assert.deepEqual(SCENES, ['meadow', 'rice', 'city', 'factory', 'coast', 'forest', 'snow', 'night', 'desert']);
  near(SEGMENT, 8.4);
  near(LOOP, 75.6);
  assert.deepEqual(shot(STILL_TIME), { from: 'night', wipe: 0 }, 'reduced motion retains its quiet night scene');
  assert.deepEqual(shot(0), { from: 'meadow', wipe: 0 });
  const segment = LOOP / SCENES.length;
  for (let i = 0; i < SCENES.length; i++) {
    const from = SCENES[i], to = SCENES[(i + 1) % SCENES.length], end = (i + 1) * segment;
    assert.deepEqual(shot(end - 1.6 - 1e-6), { from, wipe: 0 });
    near(shot(end - 0.8).wipe, 0.5, 1e-6);
    assert.equal(shot(end - 0.8).to, to);
    assert.deepEqual(shot(end % LOOP + 1e-6), { from: to, wipe: 0 });
  }
  // Every scene has a sky effect, and a frame timestamp from before playback started never breaks the lookup.
  for (const scene of SCENES) assert.ok(EFFECT_FOR[scene]);
  assert.equal(shot(-0.01).from, 'meadow');
});

test('rapid pause and resume keep one pending frame and exclude time spent hidden', () => {
  const playback = clock();
  playback.setPlaying(true);
  playback.setPlaying(true);
  assert.equal(playback.pending.size, 1);
  playback.advance(50);
  near(playback.state.t, 0.05);

  playback.setPlaying(false);
  assert.equal(playback.pending.size, 0);
  playback.advance(60000);
  near(playback.state.t, 0.05);
  playback.setPlaying(true);
  playback.setPlaying(false);
  playback.setPlaying(true);
  assert.equal(playback.pending.size, 1);
  playback.advance(50);
  near(playback.state.t, 0.1);
  assert.equal(playback.frames.length, 2);
  assert.equal(playback.pending.size, 1);
});

test('playback caps long frames, never runs backwards and preserves travel across the loop boundary', () => {
  const playback = clock(LOOP - 0.05);
  playback.setPlaying(true);
  playback.advance(5000);
  assert.equal(playback.state.lap, 1);
  near(playback.state.t, 0.05);
  near(playback.state.clock, LOOP + 0.05);
  playback.advance(-20);
  near(playback.state.t, 0.05);
  playback.advance(30);
  near(playback.state.t, 0.06); // Do not count the same 20 ms again after an old timestamp.
});

test('pinned frames stay still until played and rendering is limited to 60 fps', () => {
  const playback = clock(28.6);
  playback.advance(10000);
  assert.equal(playback.state.t, 28.6);
  assert.equal(playback.frames.length, 0);
  playback.setPlaying(true);
  for (let i = 0; i < 240; i++) playback.advance(1000 / 240);
  assert.ok(playback.frames.length >= 55 && playback.frames.length <= 62, `${playback.frames.length} frames`);
  near(playback.state.clock, 29.6, 1e-6);
});

test('frame pacing keeps 60 fps across display rates and timestamp jitter', () => {
  for (const rate of [30, 50, 59.94, 60, 75, 90, 120, 144, 165, 240]) {
    for (const jitter of [0, 0.1, 2]) for (const sign of [-1, 1]) for (const offset of [0, 0.1, 4, 8, 16]) {
      const playback = clock(0, offset);
      playback.setPlaying(true);
      let previous = offset;
      const count = Math.floor(rate * 10);
      for (let i = 1; i <= count; i++) {
        const time = i * 1000 / rate + (i % 2 ? jitter : -jitter) * sign;
        playback.advance(time - previous);
        previous = time;
      }
      const expected = Math.min(count, playback.state.clock * 60);
      assert.ok(Math.abs(playback.frames.length - expected) <= 1.5,
        `${rate} Hz / ${sign} × ±${jitter} ms / offset ${offset}: ${playback.frames.length} frames, expected ${expected}`);
      near(playback.state.clock, (previous - offset) / 1000, 1e-6);
      if (rate === 60) {
        assert.equal(playback.frames.length, count, 'signed jitter must not drop 60 Hz callbacks');
        const gaps = playback.frames.slice(1).map((frame, i) => frame.clock - playback.frames[i].clock);
        assert.ok(Math.max(...gaps) < 0.022, 'no alternating 33 ms gaps at 60 Hz');
      }
    }
  }
});

test('changing display refresh rate and resuming after a stall do not cause catch-up bursts', () => {
  const playback = clock();
  playback.setPlaying(true);
  for (const rate of [144, 60, 90, 120]) {
    const before = playback.frames.length;
    for (let i = 0; i < rate * 2; i++) playback.advance(1000 / rate);
    assert.ok(Math.abs(playback.frames.length - before - 120) <= 1);
  }
  const before = playback.frames.length;
  playback.advance(5000);
  assert.equal(playback.frames.length, before + 1, 'a stall renders only the latest state');
  const resumed = playback.frames.length;
  for (let i = 0; i < 240; i++) playback.advance(1000 / 240);
  assert.ok(Math.abs(playback.frames.length - resumed - 60) <= 1);
});


test('the baked gait samples one coordinated stride evenly', async () => {
  const spec = JSON.parse(await readFile(new URL('../art/milu/drawings.json', import.meta.url), 'utf8'));
  assert.equal(FRAME_COUNT, spec.frames);
  near(WALK_RATE, spec.rate);
  assert.deepEqual(KEYS, {}, 'retimed limbs do not reproduce any whole source drawing');
  assert.ok(FRAMES.every(frame => frame.source === null));
  assert.deepEqual(STRIDE.gait.landings, spec.gait.landings);
  assert.equal(PHASES.length, FRAME_COUNT + 1);
  for (let i = 0; i < FRAME_COUNT; i++) {
    near(PHASES[i], i / FRAME_COUNT, 1e-6);
    assert.equal(frameAt((PHASES[i] + PHASES[i + 1]) / 2), i);
    if (FRAMES[i].source !== null) near(KEYS[FRAMES[i].source], PHASES[i], 1e-6);
  }
  for (const lap of [-5, 0, 1, 36]) assert.equal(frameAt(lap + PHASES[5] + 1e-6), 5);
  assert.equal(new Set(FRAMES.map(frame => `${frame.atlas}:${frame.rect}`)).size, FRAME_COUNT);
});

test('gait playback and slowing sample neighbouring frames continuously, including the loop seam', () => {
  for (const speed of [0, 0.1, WALK_RATE / 2, WALK_RATE, WALK_RATE * 1.01]) {
    let previous = null;
    for (let n = 0; n <= 4800; n++) {
      const weights = poseAt(n / 4800 * speed);
      near(total(weights), 1, 1e-9);
      if (weights.length === 2) assert.equal(weights[1][0], (weights[0][0] + 1) % FRAME_COUNT);
      const dense = new Float64Array(FRAME_COUNT);
      for (const [i, w] of weights) dense[i] += w;
      if (previous && speed > 0) {
        const step = dense.reduce((sum, w, i) => sum + Math.abs(w - previous[i]), 0);
        assert.ok(step < 0.2, `pose jumps at phase ${n / 4800} and speed ${speed}`);
      }
      previous = n === 4800 ? null : dense;
    }
  }
});

test('gait playback samples the actual timestamp without rounding or holding poses', () => {
  assert.ok(WALK_RATE * FRAME_COUNT >= 90, 'motion samples oversample the 60 Hz player even at the slower reference pace');
  for (const offset of [0, 0.13, 0.49, 0.77]) {
    for (let n = 0; n < 120; n++) {
      const time = (n + offset) / 60 + (n % 2 ? 0.0001 : -0.0001);
      const phase = ((time * WALK_RATE) % 1 + 1) % 1;
      const weights = poseAt(phase);
      const first = frameAt(phase);
      const sampled = weights.reduce((sum, [i, w]) => sum + (i < first ? i + FRAME_COUNT : i) * w, 0);
      near(sampled / FRAME_COUNT, phase, 1e-8);
    }
  }
});

test('the walk keeps ground contact and matches the planted-hoof speed', () => {
  assert.equal(STRIDE.gait.model, 'reference-walk-v1');
  for (const frame of FRAMES) near(ORIGIN[1] - frame.bounds[3], 0, 2);
  near(WALK_SPEED, STRIDE.groundSpeed);
  near(WALK_SPEED, STRIDE.gait.groundTravel / STRIDE.gait.unit * WALK_RATE, .00005);
  for (let leg = 0; leg < 4; leg++) {
    near(STRIDE.gait.distance[leg] / STRIDE.gait.stance[leg], STRIDE.gait.groundTravel);
    const contact = STRIDE.footfalls.find(event => event.phase === STRIDE.gait.landings[leg]);
    near(contact.x, (STRIDE.gait.centres[leg] + STRIDE.gait.distance[leg] / 2 - STRIDE.gait.origin) / STRIDE.gait.unit, .00005);
  }
  assert.deepEqual(STRIDE.footfalls.map(event => event.phase), [0, .15, .5, .65]);
  assert.ok(WALK_SPEED > 0.2 && WALK_SPEED < 1, 'keep the walking pace');
});

test('every frame fits its grayscale atlas and shares one origin', async () => {
  for (const atlas of ATLASES) {
    const png = await readFile(atlas.src);
    assert.equal(png.subarray(1, 4).toString(), 'PNG');
    assert.equal(png.readUInt32BE(16), atlas.width);
    assert.equal(png.readUInt32BE(20), atlas.height);
    assert.equal(png[25], 4, 'atlas must be gray with an alpha channel');
  }
  for (const frame of FRAMES) {
    const atlas = ATLASES[frame.atlas];
    const [x, y, width, height] = frame.rect;
    assert.deepEqual([width, height], FRAME_SIZE);
    assert.ok(x >= 0 && y >= 0 && x + width <= atlas.width && y + height <= atlas.height);
    const [x0, y0, x1, y1] = frame.bounds;
    assert.ok(x0 >= 0 && y0 >= 0 && x1 < width && y1 < height && x0 < ORIGIN[0] && ORIGIN[0] < x1);
  }
  assert.ok(ORIGIN[0] > 0 && ORIGIN[0] < FRAME_SIZE[0] && ORIGIN[1] > 0 && ORIGIN[1] < FRAME_SIZE[1]);
  assert.ok(EXTENTS.left > 0.8 && EXTENTS.left < 2 && EXTENTS.right > 0.8 && EXTENTS.right < 2);
});

test('stride phase and planted-hoof travel remain tied to elapsed time', () => {
  const gait = createGait(), dt = 1 / 60;
  for (let i = 0; i < 600; i++) {
    const time = i * dt, pose = gait.pose(time);
    assert.equal(pose.pace, 1);
    assert.equal(pose.travel, 0);
    near(gait.phase(time), time * WALK_RATE);
    const ground = WALK_SPEED * dt;
    const legs = (gait.phase(time + dt) - gait.phase(time)) / WALK_RATE * WALK_SPEED;
    near(ground, legs);
    assert.deepEqual(pose.weights, poseAt(time * WALK_RATE));
  }
});
