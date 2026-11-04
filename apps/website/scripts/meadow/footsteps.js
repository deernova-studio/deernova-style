import { hash, gray } from './math.js';
import { STRIDE } from './stride.js';

const LIFE = { snow: 0.32, desert: 0.26 };

// Contacts are measured from the drawings. Each landing creates one short-lived
// disturbance at a ground position, rather than a plume attached to the animal.
export function createFootsteps(contacts = STRIDE.footfalls) {
  let previous = null, events = [];

  function update(now) {
    const dt = previous ? now.clock - previous.clock : 0;
    if (!previous || dt < 0 || dt > 0.5 || now.phase < previous.phase) events = [];
    else if (now.phase > previous.phase && now.pace > 0.12 && LIFE[now.scene]) {
      for (let loop = Math.floor(previous.phase); loop <= Math.floor(now.phase); loop++) {
        for (const contact of contacts) {
          const phase = loop + contact.phase;
          if (phase <= previous.phase || phase > now.phase) continue;
          const u = (phase - previous.phase) / (now.phase - previous.phase);
          events.push({
            clock: previous.clock + dt * u,
            distance: previous.distance + (now.distance - previous.distance) * u,
            x: contact.x, scene: now.scene, strength: now.pace, seed: phase * 37.1
          });
        }
      }
    }
    previous = { ...now };
    events = events.filter(event => now.clock - event.clock < LIFE[event.scene]);
  }

  function particles(now) {
    return events.flatMap(event => {
      const age = now.clock - event.clock, life = LIFE[event.scene], u = age / life;
      if (age < 0 || u >= 1) return [];
      return Array.from({ length: event.scene === 'snow' ? 4 : 3 }, (_, i) => {
        const seed = event.seed + i * 7.3;
        return {
          scene: event.scene,
          x: event.x - (now.distance - event.distance) - age * (0.035 + hash(seed) * 0.06),
          y: -4 * u * (1 - u) * (0.008 + hash(seed + 1) * 0.012),
          radius: 0.0025 + hash(seed + 2) * 0.003,
          alpha: 0.3 * event.strength * (1 - u) ** 2
        };
      });
    });
  }

  function draw(f, view, scene) {
    f.save();
    for (const p of particles({ clock: view.clock, distance: view.dist / view.S })) {
      if (p.scene !== scene) continue;
      f.globalAlpha = p.alpha;
      f.fillStyle = gray(scene === 'snow' ? 0.98 : 0.3);
      f.beginPath();
      f.ellipse(view.deerX + p.x * view.S, view.groundY + p.y * view.S,
        p.radius * view.S, p.radius * view.S * 0.6, 0, 0, Math.PI * 2);
      f.fill();
    }
    f.restore();
  }

  return { update, particles, draw };
}
