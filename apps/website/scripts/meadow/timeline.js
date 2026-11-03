import { ease } from './math.js';

// ---- The run, in seconds of the loop ----
// Five scenes of 8.4 s each: meadow, forest, snow mountains, night, desert, and back to the meadow. Each scene
// hands over in its last 1.6 s with a wipe that brings the next one in from ahead of the stag.
export const SCENES = ['meadow', 'forest', 'snow', 'night', 'desert'];
export const LOOP = 42;
const SEGMENT = LOOP / SCENES.length, WIPE = 1.6;
const CUTS = SCENES.map((_, i) => [(i + 1) * SEGMENT - WIPE, (i + 1) * SEGMENT]);

export function shot(t) {
  for (let i = 0; i < CUTS.length; i++) {
    const [a, b] = CUTS[i];
    if (t >= a && t < b) return { from: SCENES[i], to: SCENES[(i + 1) % SCENES.length], wipe: ease(a, b, t) };
  }
  return { from: SCENES[Math.min(SCENES.length - 1, Math.max(0, Math.floor(t / SEGMENT)))], wipe: 0 };
}

// Only active animation time advances the scene. A single pending frame is
// cancelled on pause so a quick hide/show cannot create a second render loop.
// Frames render at up to 60 a second, also on faster displays.
export function createPlayback({
  start = 0,
  render,
  requestFrame = callback => requestAnimationFrame(callback),
  cancelFrame = id => cancelAnimationFrame(id),
  now = () => performance.now()
}) {
  const state = { t: start % LOOP, lap: 0, clock: start % LOOP };
  const interval = 1 / 60, jitter = 0.004;
  let playing = false, pending = null, last = 0, nextPaint = null;

  function frame(time) {
    if (!playing) return;
    pending = null;
    // A frame's timestamp can be a little older than the moment playback started; never run backwards.
    const dt = Math.min(0.1, Math.max(0, (time - last) / 1000));
    last = Math.max(last, time);
    state.t += dt;
    state.clock += dt;
    if (state.t >= LOOP) {
      state.t -= LOOP;
      state.lap++;
    }
    if (nextPaint === null || state.clock + jitter + 1e-9 >= nextPaint) {
      // Anchor the cadence to the first drawn frame. A callback may arrive up to
      // 4 ms early (alternating ±2 ms timestamps); retain its deadline so the
      // allowance does not accumulate into a higher frame rate. Modulo rounding
      // here would discard every other frame when callbacks alternate early/late.
      // A genuine stall starts a new cadence, with no catch-up render burst.
      nextPaint = nextPaint === null || state.clock - nextPaint >= interval
        ? state.clock + interval : nextPaint + interval;
      render(state);
    }
    if (playing) pending = requestFrame(frame);
  }

  function setPlaying(next) {
    if (next === playing) return;
    playing = next;
    if (playing) {
      last = now();
      pending = requestFrame(frame);
    } else {
      if (pending !== null) cancelFrame(pending);
      pending = null;
    }
  }

  return { state, setPlaying, playing: () => playing };
}
