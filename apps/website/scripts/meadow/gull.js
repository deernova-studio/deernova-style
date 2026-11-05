import { gray, TAU } from './math.js';

// White wings keep their fill in both painting passes. A fine gray edge and
// darker tips separate them from pale sky without turning the bird into an M.
export function drawGull(f, x, y, span, phase, opacity = 1) {
  const tip = -span * (0.18 + Math.sin(phase) * 0.55);
  f.save();
  f.globalAlpha *= opacity;
  f.fillStyle = gray(1);
  f.strokeStyle = gray(0.42, 0.75);
  f.lineWidth = Math.max(0.75, span * 0.045);
  f.lineJoin = 'round';
  f.beginPath(); f.moveTo(x, y - span * 0.05);
  f.bezierCurveTo(x - span * 0.3, y - span * 0.38, x - span * 0.65, y - span * 0.22, x - span, y + tip);
  f.quadraticCurveTo(x - span * 0.66, y + tip + span * 0.3, x - span * 0.1, y + span * 0.18);
  f.lineTo(x, y + span * 0.32); f.lineTo(x + span * 0.1, y + span * 0.18);
  f.quadraticCurveTo(x + span * 0.66, y + tip + span * 0.3, x + span, y + tip);
  f.bezierCurveTo(x + span * 0.65, y - span * 0.22, x + span * 0.3, y - span * 0.38, x, y - span * 0.05);
  f.closePath(); f.fill(); f.stroke();
  f.fillStyle = gray(0.48);
  for (const side of [-1, 1]) {
    f.beginPath(); f.moveTo(x + side * span, y + tip);
    f.lineTo(x + side * span * 0.74, y + tip + span * 0.035);
    f.lineTo(x + side * span * 0.82, y + tip + span * 0.14);
    f.closePath(); f.fill();
  }
  f.fillStyle = gray(1);
  f.beginPath(); f.ellipse(x, y + span * 0.03, span * 0.09, span * 0.2, 0, 0, TAU); f.fill();
  f.restore();
}
