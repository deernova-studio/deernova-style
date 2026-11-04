import test from 'node:test';
import assert from 'node:assert/strict';
import { createColorReveal, COLOR_TIMING } from '../apps/website/scripts/meadow/color.js';

test('colour expands from the clicked point, stays briefly and returns completely to monochrome', () => {
  const color = createColorReveal(), { spread, hold, fade } = COLOR_TIMING;
  assert.equal(color.sample(10).amount, 0);
  color.trigger(0.3, 0.65, 10);
  assert.equal(color.sample(10).spread, 0);
  assert.deepEqual(color.sample(10).origin, [0.3, 0.65]);
  assert.ok(color.sample(10 + spread / 2).spread > 0 && color.sample(10 + spread / 2).spread < 1);
  assert.equal(color.sample(10 + spread).spread, 1);
  assert.equal(color.sample(10 + spread + hold).amount, 1);
  const middle = color.sample(10 + spread + hold + fade / 2).amount;
  assert.ok(Math.abs(middle - 0.5) < 1e-9);
  assert.equal(color.sample(10 + spread + hold + fade).amount, 0);
});

test('repeated clicks extend colour without restarting the wave or flashing during its fade', () => {
  const color = createColorReveal();
  color.trigger(0.4, 0.6, 0);
  const before = color.sample(0.3);
  color.trigger(0.5, 0.3, 0.3);
  assert.deepEqual(color.sample(0.3), before);
  const duringFade = COLOR_TIMING.spread + COLOR_TIMING.hold + 0.5;
  const faded = color.sample(duringFade);
  assert.ok(faded.amount > 0 && faded.amount < 1);
  color.trigger(0.7, 0.4, duringFade);
  assert.deepEqual(color.sample(duringFade), faded);
  assert.equal(color.sample(duringFade + 0.21).amount, 1);
  assert.equal(color.sample(duringFade + COLOR_TIMING.hold + COLOR_TIMING.fade).amount, 0);
  color.trigger(0.7, 0.4, 20);
  assert.deepEqual(color.sample(20).origin, [0.7, 0.4]);
  assert.equal(color.sample(20).spread, 0);
});

test('still and reduced-motion scenes switch colour immediately without a moving wave', () => {
  const color = createColorReveal({ still: true });
  color.trigger(0.42, 0.5, 0);
  assert.equal(color.sample(0).amount, 1);
  assert.equal(color.sample(0).spread, 1);
  assert.equal(color.sample(100).amount, 1);
  color.trigger(0.42, 0.5, 0);
  assert.equal(color.sample(0).amount, 0);
});
