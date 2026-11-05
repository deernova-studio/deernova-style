import test from 'node:test';
import assert from 'node:assert/strict';
import { createFootsteps } from '../apps/website/scripts/meadow/footsteps.js';

const sample = (clock, phase = clock, extra = {}) => ({ clock, phase, distance: clock * 0.4,
  pace: 1, scene: 'desert', ...extra });
const contacts = [{ phase: 0.2, x: 0.7 }];

test('one measured landing creates one disturbance, including across the loop seam', () => {
  const steps = createFootsteps(contacts);
  steps.update(sample(0));
  steps.update(sample(0.21));
  const now = sample(0.21);
  assert.equal(steps.particles(now).length, 3);
  const original = steps.particles(now);
  steps.update(now);
  assert.deepEqual(steps.particles(now), original, 'repainting cannot emit or reseed particles');
  steps.update(sample(0.5));
  assert.equal(steps.particles(sample(0.5)).length, 0);
  steps.update(sample(0.95));
  steps.update(sample(1.21));
  assert.equal(steps.particles(sample(1.21)).length, 3);
});

test('standing still stops emissions and lets existing grains settle', () => {
  const steps = createFootsteps(contacts);
  steps.update(sample(0));
  steps.update(sample(0.21));
  steps.update(sample(0.4, 0.21, { pace: 0 }));
  steps.update(sample(0.6, 0.21, { pace: 0 }));
  assert.equal(steps.particles(sample(0.6)).length, 0);
});

test('a landing stays attached to the ground, stays low, and never expands into a cloud', () => {
  const steps = createFootsteps(contacts);
  steps.update(sample(0));
  steps.update(sample(0.21));
  const a = steps.particles(sample(0.3));
  const b = steps.particles(sample(0.3, 0.3, { distance: 0.62 }));
  a.forEach((p, i) => {
    assert.ok(Math.abs(b[i].x - p.x + 0.5) < 1e-12);
    assert.ok(p.y <= 0 && p.y >= -0.02);
    assert.ok(p.radius < 0.006 && p.alpha < 0.3);
  });
});

test('landscapes without snow or dunes, seeks and first paint produce no artificial trail', () => {
  for (const scene of ['meadow', 'forest', 'night', 'city', 'factory', 'coast', 'rice']) {
    const steps = createFootsteps(contacts);
    steps.update(sample(0, 0, { scene }));
    steps.update(sample(0.21, 0.21, { scene }));
    assert.equal(steps.particles(sample(0.21)).length, 0);
  }
  const steps = createFootsteps(contacts);
  steps.update(sample(8.21));
  assert.equal(steps.particles(sample(8.21)).length, 0);
  steps.update(sample(12.21));
  assert.equal(steps.particles(sample(12.21)).length, 0);
  steps.update(sample(0.21));
  assert.equal(steps.particles(sample(0.21)).length, 0);
});
