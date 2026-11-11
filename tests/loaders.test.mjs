import test from 'node:test';
import assert from 'node:assert/strict';
import { LOADERS, curvePath, strokeAt } from '../packages/loaders/src/index.mjs';
import { readFile } from 'node:fs/promises';
import { readIcons } from '../scripts/icons.mjs';

const numbers = d => d.match(/-?\d+(\.\d+)?/g).map(Number);

test('every loader curve sits centered inside the 24 grid, clear of the edge', () => {
  for (const name of Object.keys(LOADERS)) {
    const values = numbers(curvePath(name));
    const xs = values.filter((_, i) => i % 2 === 0);
    const ys = values.filter((_, i) => i % 2 === 1);
    for (const v of values) assert.ok(Number.isFinite(v), `${name} has a non-number`);
    assert.ok(Math.min(...xs) >= 2.5 && Math.max(...xs) <= 21.5, `${name} leaves the live area horizontally`);
    assert.ok(Math.min(...ys) >= 2.5 && Math.max(...ys) <= 21.5, `${name} leaves the live area vertically`);
  }
});

test('the moving stroke tapers from head to tail and evens out when settling', () => {
  for (const [name, config] of Object.entries(LOADERS)) {
    const pieces = strokeAt(name, 0.37);
    assert.equal(pieces.length, config.taper ? 12 : 1);
    for (const piece of pieces) assert.match(piece.d, /^M[\d.]+ [\d.]+(L[\d.]+ [\d.]+)+$/, `${name} piece is not a plain polyline`);
    const widths = pieces.map(piece => piece.width);
    assert.deepEqual([...widths].sort((a, b) => b - a), widths, `${name} must be widest at the head`);
    assert.equal(widths[0], 1.75, `${name} head must match the icon stroke`);
    assert.ok(strokeAt(name, 0.37, 1, 0).every(piece => piece.width === 1.75), `${name} must even out when settling`);
  }
});

test('the thinking icon is the thinking loader at rest', async () => {
  const { icons } = await readIcons();
  const thinking = icons.find(icon => icon.name === 'thinking');
  assert.equal(thinking.curve, 'thinking');
  assert.deepEqual(thinking.body, [`<path d="${curvePath('thinking')}"/>`], 'the loader rest frame and the icon must be the same path');
  assert.equal(LOADERS.thinking.rest, 'curve');
});

test('the loaders package is MIT licensed and ships its license', async () => {
  const pkg = JSON.parse(await readFile('packages/loaders/package.json', 'utf8'));
  assert.equal(pkg.license, 'MIT');
  assert.ok(pkg.files.includes('LICENSE'));
  assert.match(await readFile('packages/loaders/LICENSE', 'utf8'), /^MIT License/);
});
