import { ATLASES, EXTENTS, FRAMES, FRAME_SIZE, ORIGIN, UNIT } from './cycle.js';

function canvas(width, height) {
  const layer = document.createElement('canvas');
  layer.width = width;
  layer.height = height;
  return layer;
}

function load(src, timeout) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const finish = error => {
      clearTimeout(timer);
      image.onload = image.onerror = null;
      if (error) {
        image.src = '';
        reject(error);
      } else resolve(image);
    };
    const timer = setTimeout(() => finish(new Error(`Deer atlas timed out: ${src}`)), timeout);
    image.onload = () => finish();
    image.onerror = () => finish(new Error(`Could not load deer atlas: ${src}`));
    image.src = src;
  });
}

export async function loadAtlas(atlas, { attempts = 3, timeout = 15000, retryDelay = 250 } = {}) {
  for (let attempt = 0; attempt < attempts; attempt++) {
    if (attempt) await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
    const src = new URL(atlas.src);
    if (attempt) src.searchParams.set('retry', `${Date.now()}-${attempt}`);
    try {
      const image = await load(src, timeout);
      if (image.naturalWidth !== atlas.width || image.naturalHeight !== atlas.height) {
        throw new Error(`Unexpected deer atlas size: ${src}`);
      }
      return image;
    } catch (error) {
      if (attempt === attempts - 1) throw error;
    }
  }
}

// The baked frames are already gray and outlined; drawing one is a single copy from its atlas.
export function createStagRenderer(field, { loadImage = loadAtlas } = {}) {
  const images = new Array(ATLASES.length);
  const blend = canvas(1, 1);
  const mixer = blend.getContext('2d');
  let loading = null, drawn = null;
  const available = index => !!images[FRAMES[index].atlas];

  function loadMissing() {
    if (loading) return loading;
    loading = Promise.allSettled(ATLASES.map(async (atlas, index) => {
      if (!images[index]) images[index] = await loadImage(atlas);
    }))
      .then(results => {
        for (const result of results) {
          if (result.status === 'rejected') console.warn(result.reason.message);
        }
        return { complete: images.filter(Boolean).length === ATLASES.length, available: FRAMES.filter((_, i) => available(i)).length };
      })
      .finally(() => { loading = null; });
    return loading;
  }
  const ready = loadMissing();

  // Mix the neighbouring frames of the stride. Adding premultiplied pixels ('lighter') makes the mix an exact
  // cross-dissolve, so the body stays solid. Both frames share one origin, so they land on one rectangle.
  function draw(weights, x, groundY, size) {
    const list = weights.filter(([index, w]) => w > 0.004 && available(index));
    if (!list.length) {
      const fallback = FRAMES.findIndex((_, i) => available(i));
      if (fallback < 0) return;
      list.push([fallback, 1]);
    }
    // A missing neighbour must not make the surviving pose translucent.
    const total = list.reduce((sum, [, weight]) => sum + weight, 0);
    const k = field.getTransform().a, scale = size / UNIT;
    const dx = x - ORIGIN[0] * scale, dy = groundY - ORIGIN[1] * scale;
    const x0 = Math.floor(dx * k), y0 = Math.floor(dy * k);
    const width = Math.ceil(FRAME_SIZE[0] * scale * k) + 2, height = Math.ceil(FRAME_SIZE[1] * scale * k) + 2;
    if (blend.width < width || blend.height < height) {
      blend.width = Math.max(blend.width, width);
      blend.height = Math.max(blend.height, height);
    }
    mixer.setTransform(1, 0, 0, 1, 0, 0);
    mixer.globalCompositeOperation = 'source-over';
    mixer.globalAlpha = 1;
    mixer.clearRect(0, 0, width, height);
    mixer.globalCompositeOperation = 'lighter';
    for (const [index, w] of list) {
      const frame = FRAMES[index];
      mixer.globalAlpha = w / total;
      mixer.drawImage(images[frame.atlas], ...frame.rect, dx * k - x0, dy * k - y0, FRAME_SIZE[0] * scale * k, FRAME_SIZE[1] * scale * k);
    }
    field.save();
    field.setTransform(1, 0, 0, 1, 0, 0);
    field.drawImage(blend, 0, 0, width, height, x0, y0, width, height);
    field.restore();

    // Remember the dominant frame's box for clicks, padded so the antlers and legs are easy to hit.
    const [main] = list.reduce((a, b) => (b[1] > a[1] ? b : a));
    const [bx0, by0, bx1, by1] = FRAMES[main].bounds;
    const pad = size * 0.08;
    drawn = [dx + bx0 * scale - pad, dy + by0 * scale - pad, dx + bx1 * scale + pad, dy + by1 * scale + pad];
  }

  const hit = (x, y) => !!drawn && x >= drawn[0] && x <= drawn[2] && y >= drawn[1] && y <= drawn[3];

  return {
    draw, hit, ready, retry: loadMissing,
    get hasFrames() { return images.some(Boolean); },
    leftExtent: EXTENTS.left, rightExtent: EXTENTS.right
  };
}
