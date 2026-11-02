import { clamp } from './math.js';
import { ATLASES, CELL_SIZE, FRAMES, frameAt } from './cycle.js';

function canvas(width, height) {
  const layer = document.createElement('canvas');
  layer.width = width;
  layer.height = height;
  return layer;
}

function load(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Could not load deer atlas: ${src}`));
    image.src = src;
  });
}

export function createStagRenderer(field) {
  const frames = new Array(FRAMES.length);
  // Prepare once. During playback the only animal operation is drawImage.
  const ready = Promise.allSettled(ATLASES.map(async (atlas, atlasIndex) => {
    const image = await load(atlas.src);
    if (image.naturalWidth !== atlas.width || image.naturalHeight !== atlas.height) {
      throw new Error(`Unexpected deer atlas size: ${atlas.src}`);
    }
    for (const [index, frame] of FRAMES.entries()) {
      if (frame.atlas !== atlasIndex) continue;
      const texture = canvas(CELL_SIZE, CELL_SIZE);
      const paint = texture.getContext('2d', { willReadFrequently: true });
      paint.drawImage(image, ...frame.rect, 0, 0, CELL_SIZE, CELL_SIZE);
      const pixels = paint.getImageData(0, 0, CELL_SIZE, CELL_SIZE);
      for (let i = 0; i < pixels.data.length; i += 4) {
        const luminance = 0.2126 * pixels.data[i] + 0.7152 * pixels.data[i + 1] + 0.0722 * pixels.data[i + 2];
        const value = luminance < 58 ? 30 + luminance * 1.6 : 150 + 105 * clamp((luminance - 58) / 172) ** 0.45;
        pixels.data[i] = pixels.data[i + 1] = pixels.data[i + 2] = value;
        // Discard near-zero matte noise; keep generated fur and antler edges.
        if (pixels.data[i + 3] < 8) pixels.data[i + 3] = 0;
      }
      paint.putImageData(pixels, 0, 0);
      const silhouette = canvas(CELL_SIZE, CELL_SIZE);
      const edge = silhouette.getContext('2d');
      edge.drawImage(texture, 0, 0);
      edge.globalCompositeOperation = 'source-in';
      edge.fillStyle = '#151515';
      edge.fillRect(0, 0, CELL_SIZE, CELL_SIZE);
      const outlined = canvas(CELL_SIZE, CELL_SIZE);
      const ink = outlined.getContext('2d');
      for (let i = 0; i < 8; i++) {
        ink.drawImage(silhouette, Math.cos(i * Math.PI / 4) * 1.25, Math.sin(i * Math.PI / 4) * 1.25);
      }
      ink.drawImage(texture, 0, 0);
      frames[index] = outlined;
    }
  })).then(results => {
    for (const result of results) {
      if (result.status === 'rejected') console.warn(result.reason.message);
    }
    return results.every(result => result.status === 'fulfilled');
  });

  function draw(seconds, x, groundY, size) {
    const index = frameAt(seconds);
    const texture = frames[index] || frames.find(Boolean);
    if (!texture) return;
    const frame = FRAMES[frames[index] ? index : frames.indexOf(texture)];
    const scale = size / frame.unit;
    field.drawImage(texture,
      x - frame.origin[0] * scale, groundY - frame.origin[1] * scale,
      CELL_SIZE * scale, CELL_SIZE * scale);
  }

  return { draw, ready };
}
