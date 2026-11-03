import test from 'node:test';
import assert from 'node:assert/strict';
import { LOOP, SCENES, shot, createPlayback } from '../apps/website/scripts/meadow/timeline.js';
import { readFile } from 'node:fs/promises';
import {
  GALLOP_RATE, FRAME_COUNT, FRAMES, FRAME_SIZE, ORIGIN, PHASES, KEYS, EXTENTS, ATLASES, JUMP,
  frameAt, poseAt, jumpPhase, jumpSpeed, createGait
} from '../apps/website/scripts/meadow/cycle.js';
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
const pushOff = (gait, time) => {
  const phase = gait.phase(time) % 1;
  const remaining = (1 - phase) % 1;
  return time + (remaining > 1 - 1e-9 ? 0 : remaining / GALLOP_RATE);
};
const strideStart = () => 2 / GALLOP_RATE;
// Stride phase shown by a pose; a mix across the loop seam counts frame 0 as phase 1.
const phaseOf = weights => {
  const seam = weights.some(([i]) => i === FRAME_COUNT - 1);
  return weights.reduce((sum, [i, w]) => sum + w * (seam && i === 0 ? 1 : FRAMES[i].phase), 0);
};
const between = (phase, a, b) => phase >= KEYS[a] - 1e-9 && phase <= KEYS[b] + 1e-9;

test('the run passes meadow, forest, snow, night and desert, then returns to the meadow', () => {
  assert.deepEqual(SCENES, ['meadow', 'forest', 'snow', 'night', 'desert']);
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


test('the baked stride steps evenly through the drawings, one frame per 60 Hz refresh at running speed', async () => {
  const spec = JSON.parse(await readFile(new URL('../art/milu/drawings.json', import.meta.url), 'utf8'));
  assert.equal(FRAME_COUNT, spec.frames);
  near(GALLOP_RATE * 1 / 60 * FRAME_COUNT, 1, 1e-9);
  const sum = spec.drawings.reduce((total, d) => total + d.duration, 0);
  let start = 0;
  for (const d of spec.drawings) {
    near(KEYS[d.source], start, 1e-5);
    start += d.duration / sum;
  }
  assert.equal(PHASES.length, FRAME_COUNT + 1);
  for (let i = 0; i < FRAME_COUNT; i++) {
    near(PHASES[i], i / FRAME_COUNT, 1e-6);
    assert.equal(frameAt((PHASES[i] + PHASES[i + 1]) / 2), i);
    if (FRAMES[i].source !== null) near(KEYS[FRAMES[i].source], PHASES[i], 1e-6);
  }
  for (const lap of [-5, 0, 1, 36]) assert.equal(frameAt(lap + PHASES[5] + 1e-6), 5);
  assert.equal(new Set(FRAMES.map(frame => `${frame.atlas}:${frame.rect}`)).size, FRAME_COUNT);
});

test('running shows one whole frame per refresh, advancing exactly one frame each time', () => {
  for (const offset of [0, 0.13, 0.49, 0.77]) {
    let previous = null;
    for (let n = 0; n < 120; n++) {
      const weights = poseAt((n / 60 + offset / 60) * GALLOP_RATE);
      assert.equal(weights.length, 1);
      assert.equal(weights[0][1], 1);
      if (previous !== null) assert.equal(weights[0][0], (previous + 1) % FRAME_COUNT);
      previous = weights[0][0];
    }
  }
});

test('a slower stride fades only between neighbouring frames, continuously', () => {
  for (const speed of [0.1, 0.3, 0.6, 1]) {
    let previous = null;
    for (let n = 0; n <= 4800; n++) {
      const weights = poseAt(n / 4800, speed);
      near(total(weights), 1, 1e-9);
      if (weights.length === 2) assert.equal(weights[1][0], (weights[0][0] + 1) % FRAME_COUNT);
      const dense = new Float64Array(FRAME_COUNT);
      for (const [i, w] of weights) dense[i] += w;
      if (previous) {
        const step = dense.reduce((sum, w, i) => sum + Math.abs(w - previous[i]), 0);
        assert.ok(step < 0.2, `pose jumps at phase ${n / 4800} and speed ${speed}`);
      }
      previous = n === 4800 ? null : dense;
    }
  }
});

test('planted frames stand on the ground line and airborne ones clear it', () => {
  for (const frame of FRAMES) {
    const p = frame.phase, clearance = ORIGIN[1] - frame.bounds[3];
    if ((p >= KEYS[37] && p <= KEYS[40]) || (p >= KEYS[12] && p <= KEYS[17])) near(clearance, 0, 1.5);
    if ((p >= KEYS[41] && p <= KEYS[11]) || (p >= KEYS[18] && p <= KEYS[22])) assert.ok(clearance > 10, `frame at ${p} floats too low`);
  }
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
  assert.ok(EXTENTS.left > 1 && EXTENTS.left < 2 && EXTENTS.right > 1 && EXTENTS.right < 2);
});

test('a jump lifts the stag through the flight drawings, lands, and hands the stride back on the landing pose', () => {
  const gait = createGait(), start = strideStart();
  assert.equal(gait.pose(start).lift, 0);
  assert.ok(gait.jump(start));
  assert.ok(!gait.jump(start + 0.2), 'a second click mid-air does nothing');
  near(total(gait.pose(start + 0.001).weights), 1, 1e-9);
  const top = gait.pose(start + JUMP.duration * (JUMP.takeoff + JUMP.landing) / 2);
  near(top.lift, JUMP.height, 1e-6);
  assert.ok(between(phaseOf(top.weights), 41, 12), 'flight drawings at the top of the jump');
  assert.equal(gait.pose(start + JUMP.duration * 0.05).lift, 0, 'hind legs still drive off the ground');
  assert.ok(between(phaseOf(gait.pose(start + JUMP.duration * 0.09).weights), 37, 41), 'the jump starts in hind support');
  near(gait.pose(start + JUMP.duration * 0.95).lift, 0, 1e-9);
  const after = gait.pose(start + JUMP.duration + 1e-4);
  assert.equal(after.lift, 0);
  near(phaseOf(after.weights), KEYS[16], 0.5 / FRAME_COUNT + 1e-9);
  assert.ok(gait.jump(start + JUMP.duration + 0.01));
});

test('the leap reaches foreleg contact at touchdown and continues through compression before resuming', () => {
  const gait = createGait(), start = strideStart();
  gait.jump(start);
  const at = u => gait.pose(start + u * JUMP.duration);
  const contact = at(JUMP.landing);
  near(contact.lift, 0);
  near(phaseOf(contact.weights), KEYS[12], 1 / FRAME_COUNT);
  assert.ok(between(jumpPhase(JUMP.landing), 12, 12), 'first foreleg support exactly at touchdown');
  let previous = 0;
  for (let n = 0; n <= 100; n++) {
    const u = n / 100, pose = at(u), phase = phaseOf(pose.weights);
    assert.ok(phase >= previous - 1e-9, 'the leap never reverses the pose sequence');
    if (u >= JUMP.landing) {
      near(pose.lift, 0);
      // Frames sit 1/50 of a stride apart, so allow one frame either side of the drawings.
      assert.ok(phase >= KEYS[12] - 1 / FRAME_COUNT && phase <= KEYS[16] + 1 / FRAME_COUNT, 'stay in foreleg support during compression');
    }
    previous = phase;
  }
  const before = at(1 - 1e-6), after = at(1 + 1e-6);
  for (let i = 0; i < FRAME_COUNT; i++) {
    const weight = pose => pose.weights.filter(([index]) => index === i).reduce((sum, [, w]) => sum + w, 0);
    near(weight(before), weight(after), 1e-4);
  }
});

test('in the air the stride hangs at full stretch and passes the quick limb changes at speed', () => {
  // Time the leap spends between two drawings, in seconds.
  const spent = (a, b) => {
    let seconds = 0;
    for (let n = 0; n < 4000; n++) {
      const phase = jumpPhase((n + 0.5) / 4000);
      if (phase >= KEYS[a] && phase < KEYS[b]) seconds += JUMP.duration / 4000;
    }
    return seconds;
  };
  for (let n = 1; n <= 4000; n++) assert.ok(jumpPhase(n / 4000) > jumpPhase((n - 1) / 4000), 'the legs never stop or reverse');
  assert.ok(spent(8, 9) > 0.15, 'hang at full stretch over the top');
  for (const [a, b] of [[41, 8], [24, 25], [25, 10]]) assert.ok(spent(a, b) < 0.06, `forelegs reaching / hind legs folding (${a}->${b}) pass quickly`);
});

test('extra jump lift joins both contacts without a vertical velocity kick', () => {
  const gait = createGait(), start = strideStart(), dt = 1e-4;
  gait.jump(start);
  for (const u of [JUMP.takeoff, JUMP.landing]) {
    const t = start + u * JUMP.duration;
    const before = gait.pose(t - dt).lift, at = gait.pose(t).lift, after = gait.pose(t + dt).lift;
    near(at, 0);
    assert.ok(Math.abs((at - before) / dt) < 0.01, 'no sudden stop in vertical speed');
    assert.ok(Math.abs((after - at) / dt) < 0.01, 'no sudden start in vertical speed');
  }
  // At display cadence, contact must not move the entire deer several pixels in one tick.
  for (const u of [JUMP.takeoff, JUMP.landing]) {
    const t = start + u * JUMP.duration;
    assert.ok(gait.pose(t + (u === JUMP.takeoff ? 1 : -1) / 60).lift * 200 < 1);
  }
});

test('jump pose progression carries speed through its keys and matches running at both ends', () => {
  for (const u of [0, JUMP.takeoff, 0.23, 0.42, 0.52, 0.55, 0.58, 0.71, JUMP.landing, 1]) {
    near(jumpSpeed(u - 1e-7), jumpSpeed(u + 1e-7), 1e-4);
    if (u === 0 || u === 1) near(jumpSpeed(u), GALLOP_RATE, 1e-9);
  }
  for (let n = 1; n < 1000; n++) {
    const u = n / 1000, h = 1e-6;
    near(jumpSpeed(u), (jumpPhase(u + h) - jumpPhase(u - h)) / (2 * h) / JUMP.duration, 1e-4);
  }
});

test('a leap carries forward speed through the air and keeps its distance when the camera catches up', () => {
  const gait = createGait(), start = strideStart();
  near(gait.pose(start).travel, 0);
  near(gait.pose(start).lead, 0);
  gait.jump(start);
  const at = u => gait.pose(start + u * JUMP.duration);
  const takeoff = at(JUMP.takeoff), landing = at(JUMP.landing);
  assert.ok(landing.lead > takeoff.lead, 'the stag lands further ahead in the frame');
  assert.ok(landing.travel > takeoff.travel, 'the leap adds forward travel');
  // Horizontal velocity stays constant in flight; extra height eases into and out of contact.
  const steps = [0.25, 0.4, 0.55, 0.7].map(at);
  for (let i = 2; i < steps.length; i++) {
    near(steps[i].travel - steps[i - 1].travel, steps[1].travel - steps[0].travel);
  }
  const quarter = at(JUMP.takeoff + (JUMP.landing - JUMP.takeoff) / 4);
  assert.ok(quarter.lift > 0 && quarter.lift < JUMP.height);

  let previousTravel = 0, previousCamera = 0;
  for (let i = 0; i <= 1000; i++) {
    const pose = gait.pose(start + (JUMP.duration + JUMP.follow) * i / 1000);
    const camera = pose.travel - pose.lead * JUMP.lead;
    assert.ok(pose.travel >= previousTravel - 1e-9, 'world travel never reverses');
    assert.ok(camera >= previousCamera - 1e-9, 'the camera follows without snapping back');
    assert.ok(pose.lead >= 0 && pose.lead <= 1);
    previousTravel = pose.travel;
    previousCamera = camera;
  }
  const settled = gait.pose(start + JUMP.duration + JUMP.follow + 1e-6);
  near(settled.lead, 0);
  near(settled.travel, JUMP.distance, 1e-9);
  near(settled.lift, 0);
  for (const age of [JUMP.duration, JUMP.duration + JUMP.follow]) {
    const before = gait.pose(start + age - 1e-6), after = gait.pose(start + age + 1e-6);
    near(before.travel, after.travel, 1e-5);
    near(before.lead, after.lead, 1e-5);
  }
});

test('another leap during camera recovery preserves position and accumulates forward distance', () => {
  const gait = createGait(), start = strideStart();
  gait.jump(start);
  const next = start + JUMP.duration + JUMP.follow / 2;
  const before = gait.pose(next);
  assert.ok(before.lead > 0 && before.lead < 1);
  const nextStart = pushOff(gait, next);
  assert.ok(gait.jump(next));
  const after = gait.pose(next);
  near(after.lead, before.lead);
  near(after.travel, before.travel);
  near(after.lift, 0);
  assert.ok(!gait.jump(next + JUMP.duration / 2));
  const frozen = gait.pose(next + JUMP.duration / 2);
  assert.deepEqual(gait.pose(next + JUMP.duration / 2), frozen, 'the active clock controls all leap motion');
  const settled = gait.pose(nextStart + JUMP.duration + JUMP.follow + 1e-6);
  near(settled.travel, JUMP.distance * 2);
  near(settled.lead, 0);
});

test('jump requests preserve the current limb sequence until the next hind-leg push-off', () => {
  for (let n = 0; n < 100; n++) {
    const gait = createGait(), running = createGait(), click = (2 + n / 100) / GALLOP_RATE;
    const start = pushOff(gait, click), before = gait.pose(click);
    assert.ok(gait.jump(click));
    assert.deepEqual(gait.pose(click).weights, before.weights, 'requesting a jump cannot teleport the legs');
    assert.ok(!gait.jump(click + 1e-6), 'pending and airborne jumps reject repeated clicks');
    assert.ok(start - click < 1 / GALLOP_RATE + 1e-9);
    for (let i = 0; i < 20 && start - click > 1e-8; i++) {
      const time = click + (start - click) * i / 20;
      assert.deepEqual(gait.pose(time), running.pose(time), 'finish the same stride while waiting');
    }
    const a = gait.pose(start - 1e-7), b = gait.pose(start + 1e-7);
    near(a.lift, b.lift);
    for (let i = 0; i < FRAME_COUNT; i++) {
      const weight = pose => pose.weights.filter(([index]) => index === i).reduce((sum, [, w]) => sum + w, 0);
      near(weight(a), weight(b), 1e-4);
    }
    assert.ok(gait.pose(start + JUMP.duration * 0.5).lift > 0);
  }
});
