import { ease } from './math.js';

export const LOOP = 30;

// ---- The run, in seconds of the loop ----
// 0–9.2 meadow · 9.2–10.8 into the forest · 10.8–19.2 forest · 19.2–20.8 out under the stars · 20.8–28.4 night ·
// 28.4–30 into the morning meadow, where the loop starts again. Each new scene comes in from ahead of the stag.
const SCENES = ['meadow', 'forest', 'night'];
const CUTS = [[9.2, 10.8], [19.2, 20.8], [28.4, 30]];
export function shot(t) {
  for (let i = 0; i < CUTS.length; i++) {
    const [a, b] = CUTS[i];
    if (t >= a && t < b) return { from: SCENES[i], to: SCENES[(i + 1) % SCENES.length], wipe: ease(a, b, t) };
  }
  return { from: t < CUTS[0][0] ? 'meadow' : t < CUTS[1][0] ? 'forest' : 'night', wipe: 0 };
}

// Only active animation time advances the scene. A single pending frame is
// cancelled on pause so a quick hide/show cannot create a second render loop.
export function createPlayback({
  start = 0,
  render,
  requestFrame = callback => requestAnimationFrame(callback),
  cancelFrame = id => cancelAnimationFrame(id),
  now = () => performance.now()
}) {
  const state = { t: start % LOOP, lap: 0, clock: start % LOOP };
  let playing = false, pending = null, last = 0, wait = 1;

  function frame(time) {
    if (!playing) return;
    pending = null;
    const dt = Math.min(0.1, (time - last) / 1000);
    last = time;
    state.t += dt;
    state.clock += dt;
    if (state.t >= LOOP) {
      state.t -= LOOP;
      state.lap++;
    }
    wait += dt;
    if (wait >= 1 / 30) {
      wait = 0;
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

  return { state, setPlaying };
}
