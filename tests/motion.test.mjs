import test from 'node:test';
import assert from 'node:assert/strict';
import { LOOP, shot, createPlayback } from '../apps/website/scripts/meadow/timeline.js';
import { GALLOP_RATE, RUN_SPEED, pose } from '../apps/website/scripts/meadow/stag.js';
import { LEGS, STRIDE } from '../apps/website/scripts/meadow/gait.js';

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

function groundPoint(sample, name) {
  const [x, y] = sample.legs[name][5];
  return [
    x * Math.cos(sample.pitch) - y * Math.sin(sample.pitch),
    x * Math.sin(sample.pitch) + y * Math.cos(sample.pitch) - sample.lift
  ];
}

test('supporting hooves stay on the ground without sliding as the body moves', () => {
  near(RUN_SPEED / GALLOP_RATE, STRIDE);
  for (const [name, { anatomy, contact }] of Object.entries(LEGS)) {
    const planted = groundPoint(pose(contact), name);
    for (let i = 0; i <= 100; i++) {
      const time = anatomy.stance * i / 100;
      const foot = groundPoint(pose(contact + time), name);
      near(foot[1], 0);
      near(foot[0] + time * STRIDE, planted[0]);
    }
    for (let i = 0; i < 1000; i++) {
      assert.ok(groundPoint(pose(i / 1000), name)[1] <= 1e-9, `${name} must not pass through the ground`);
    }
  }
});

test('every bone keeps its length through support, folding and the loop seam', () => {
  for (let i = 0; i < 1200; i++) {
    const sample = pose(i / 1200), next = pose((i + 1) / 1200);
    for (const [name, { anatomy }] of Object.entries(LEGS)) {
      const points = sample.legs[name];
      for (let bone = 0; bone < anatomy.lengths.length; bone++) {
        near(Math.hypot(points[bone + 1][0] - points[bone][0], points[bone + 1][1] - points[bone][1]), anatomy.lengths[bone]);
      }
      for (let joint = 0; joint < points.length; joint++) {
        assert.ok(Math.hypot(next.legs[name][joint][0] - points[joint][0], next.legs[name][joint][1] - points[joint][1]) < 0.02,
          `${name} joint ${joint} jumps at phase ${i / 1200}`);
      }
    }
  }
});

test('the stride includes both extended and gathered suspension with staggered landings', () => {
  const landings = Object.values(LEGS).map(leg => leg.contact);
  assert.equal(new Set(landings).size, 4);
  for (const phase of [0.4, 0.92]) {
    const sample = pose(phase);
    assert.ok(Object.values(sample.contacts).every(contact => !contact));
    assert.ok(Object.keys(LEGS).every(name => groundPoint(sample, name)[1] < 0));
  }
});
