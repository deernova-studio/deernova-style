import test from 'node:test';
import assert from 'node:assert/strict';
import { LOOP, shot, createPlayback } from '../apps/website/scripts/meadow/timeline.js';
import { readFile } from 'node:fs/promises';
import { GALLOP_RATE, FRAME_COUNT, FRAMES, ATLASES, frameAt } from '../apps/website/scripts/meadow/cycle.js';

function clock(start = 0) {
  let time = 1000, nextId = 0;
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

const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} != ${expected}`);

test('scene wipes hand over to the next scene and return to the meadow', () => {
  assert.deepEqual(shot(0), { from: 'meadow', wipe: 0 });
  for (const [a, b, from, to] of [
    [9.2, 10.8, 'meadow', 'forest'],
    [19.2, 20.8, 'forest', 'night'],
    [28.4, LOOP, 'night', 'meadow']
  ]) {
    assert.deepEqual(shot(a), { from, to, wipe: 0 });
    near(shot((a + b) / 2).wipe, 0.5);
    assert.ok(shot(b - 1e-6).wipe > 0.999);
    assert.deepEqual(shot(b % LOOP), { from: to, wipe: 0 });
  }
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

test('playback caps long frames and preserves travel across the loop boundary', () => {
  const playback = clock(LOOP - 0.05);
  playback.setPlaying(true);
  playback.advance(5000);
  assert.equal(playback.state.lap, 1);
  near(playback.state.t, 0.05);
  near(playback.state.clock, LOOP + 0.05);
  near(playback.state.lap * LOOP + playback.state.t, playback.state.clock);
});

test('pinned frames stay still until played and rendering is limited to 30 fps', () => {
  const playback = clock(24.5);
  playback.advance(10000);
  assert.equal(playback.state.t, 24.5);
  assert.equal(playback.frames.length, 0);
  playback.setPlaying(true);
  for (let i = 0; i < 120; i++) playback.advance(1000 / 120);
  assert.ok(playback.frames.length >= 24 && playback.frames.length <= 30);
  near(playback.state.clock, 25.5);
});

test('the cycle visits all 24 distinct generated poses in order at any loop', () => {
  const duration = 1 / (GALLOP_RATE * FRAME_COUNT);
  for (const cycle of [-5, 0, 1, 36, 1000]) {
    for (let frame = 0; frame < FRAME_COUNT; frame++) {
      const time = cycle / GALLOP_RATE + (frame + 0.5) * duration;
      assert.equal(frameAt(time), frame);
    }
  }
  assert.equal(new Set(FRAMES.map(frame => `${frame.atlas}:${frame.rect}`)).size, FRAME_COUNT);
});

test('the final pose hands directly to the first without repeating an endpoint', () => {
  const period = 1 / GALLOP_RATE;
  assert.equal(frameAt(0), 0);
  assert.equal(frameAt(period - 1e-6), FRAME_COUNT - 1);
  assert.equal(frameAt(period), 0);
  assert.equal(frameAt(-1e-6), FRAME_COUNT - 1);
  assert.equal(frameAt(period + 1e-6), 0);
});

test('scene rollover and paused playback preserve the generated pose sequence', () => {
  const playback = clock(LOOP - 0.04);
  const before = frameAt(playback.state.clock);
  playback.setPlaying(true);
  playback.advance(50);
  assert.equal(playback.state.lap, 1);
  assert.equal(before, FRAME_COUNT - 2);
  assert.equal(frameAt(playback.state.clock), 0);
  assert.equal(frameAt(playback.state.lap * LOOP + playback.state.t), frameAt(playback.state.clock));
  playback.setPlaying(false);
  playback.advance(60000);
  assert.equal(frameAt(playback.state.clock), 0);
});

test('all pose crops and registrations fit the shipped transparent atlases', async () => {
  for (const atlas of ATLASES) {
    const png = await readFile(atlas.src);
    assert.equal(png.subarray(1, 4).toString(), 'PNG');
    assert.equal(png.readUInt32BE(16), atlas.width);
    assert.equal(png.readUInt32BE(20), atlas.height);
    assert.equal(png[25], 6, 'atlas must carry an alpha channel');
  }
  for (const frame of FRAMES) {
    const atlas = ATLASES[frame.atlas];
    const [x, y, width, height] = frame.rect;
    assert.ok(x >= 0 && y >= 0 && width > 0 && height > 0);
    assert.ok(x + width <= atlas.width && y + height <= atlas.height);
    assert.ok(frame.origin.every(Number.isFinite) && frame.unit > 0);
    assert.ok(frame.origin[0] > 0 && frame.origin[0] < width);
    assert.ok(frame.origin[1] > 0 && frame.origin[1] < height);
  }
});
