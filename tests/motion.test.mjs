import test from 'node:test';
import assert from 'node:assert/strict';
import { LOOP, shot, createPlayback } from '../apps/website/scripts/meadow/timeline.js';
import { GALLOP_RATE, RUN_SPEED, pose } from '../apps/website/scripts/meadow/stag.js';

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

test('the stag has a finite, continuous gait and repeats after a complete scene loop', () => {
  assert.ok(RUN_SPEED > 0);
  const values = value => typeof value === 'number'
    ? [value]
    : Object.values(value).flatMap(values);
  for (let i = 0; i <= 100; i++) {
    const sample = pose(i / 100);
    assert.ok(values(sample).every(Number.isFinite));
    assert.ok(sample.lift > 0);
    for (const leg of Object.values(sample.legs)) assert.equal(leg.length, 6);
  }
  const first = values(pose(0));
  const last = values(pose(GALLOP_RATE * LOOP));
  first.forEach((value, i) => near(value, last[i]));
});
