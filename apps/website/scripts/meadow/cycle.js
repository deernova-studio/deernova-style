// Each cell is one complete imagegen pose, in chronological order.
// Registration translates/scales the whole animal; it never deforms a limb.
export const GALLOP_RATE = 1.2;
export const FRAME_COUNT = 24;
export const RUN_SPEED = 3.6;
export const CELL_SIZE = 512;
export const ATLASES = ['gather', 'flight', 'support', 'recover'].map(name => ({
  src: new URL(`../../assets/milu-cycle-${name}.png`, import.meta.url),
  width: 1536,
  height: 1024
}));

// Nose x, ground y, and source pixels per scene unit. Ground registration
// preserves planted feet while the flight poses rise above that same line.
const REGISTRATION = [
  [458, 458, 180], [432, 461, 180], [435, 470, 180],
  [467, 438, 180], [439, 439, 180], [443, 439, 180],
  [461, 470, 180], [446, 480, 180], [460, 490, 180],
  [475, 470, 180], [461, 460, 180], [462, 440, 180],
  [461, 465, 188], [461, 465, 188], [461, 465, 188],
  [461, 434, 188], [461, 434, 188], [461, 434, 188],
  [460, 468, 188], [460, 472, 188], [460, 477, 188],
  [460, 448, 188], [460, 444, 188], [460, 437, 188]
];

export const FRAMES = REGISTRATION.map(([nose, ground, unit], index) => ({
  atlas: Math.floor(index / 6),
  rect: [(index % 3) * CELL_SIZE, (Math.floor(index / 3) % 2) * CELL_SIZE, CELL_SIZE, CELL_SIZE],
  origin: [nose - 1.16 * unit, ground],
  unit
}));

export function frameAt(seconds) {
  const step = Math.floor(seconds * GALLOP_RATE * FRAME_COUNT + 1e-8);
  return ((step % FRAME_COUNT) + FRAME_COUNT) % FRAME_COUNT;
}
