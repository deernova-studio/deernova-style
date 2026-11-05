"""Measure whole-frame horizontal registration and visible hoof landings.

This writes placement metadata, never repaints or separately moves body parts.
Run with --update to measure the currently shipped atlases without rebaking them.
"""
import argparse
import json
from pathlib import Path

import cv2
import numpy as np
from PIL import Image


ROOT = Path(__file__).resolve().parents[2]
MODULE = ROOT / 'apps/website/scripts/meadow/stride.js'


def horizontal_offsets(frames):
    """Register the ribcage, excluding swinging legs, tail, head and antlers.

    Vertical motion is measured only to avoid biasing the horizontal fit; it is
    preserved in the drawing. One translation applies to the entire animal.
    """
    h, w = frames[0].shape
    mask = np.zeros((h, w), np.uint8)
    mask[round(h * .41):round(h * .61), round(w * .24):round(w * .65)] = 255
    features = [cv2.GaussianBlur(f, (5, 5), 1.2).astype(np.float32) / 255 for f in frames]
    shifts, scores = [], []
    for feature in features:
        score, warp = cv2.findTransformECC(features[0], feature,
            np.eye(2, 3, dtype=np.float32), cv2.MOTION_TRANSLATION,
            (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 100, 1e-6), mask, 5)
        if score < .75 or abs(warp[0, 2]) > w * .08:
            raise ValueError('Torso registration is unreliable; inspect the source drawings')
        shifts.append(float(warp[0, 2]))
        scores.append(float(score))
    offsets = np.mean(shifts) - np.asarray(shifts)
    return [round(float(x), 3) for x in offsets], {
        'horizontalRangePixels': round(float(np.ptp(shifts)), 3),
        'largestFrameStepPixels': round(float(np.max(np.abs(np.roll(shifts, -1) - shifts))), 3),
        'minimumCorrelation': round(min(scores), 4),
    }


def atlas_frames(meta, directory):
    sheets = [np.asarray(Image.open(directory / a['file']).convert('LA')) for a in meta['atlases']]
    w, h = meta['size']
    frames = []
    for i in range(len(meta['phases'])):
        cell = i % meta['perAtlas']
        x, y = cell % meta['columns'] * w, cell // meta['columns'] * h
        frames.append(sheets[i // meta['perAtlas']][y:y + h, x:x + w])
    return frames


def footfalls(frames, meta, offsets):
    """Find new ground contacts that persist, ignoring single-frame edge noise."""
    if meta.get('gait'):
        gait = meta['gait']
        # Occlusion can hide a landing, and the painted sole can touch the
        # sampling band before the foot is down. Use the authored contacts
        # when available, not extra events inferred from those pixel edges.
        distances = np.broadcast_to(gait['distance'], (4,))
        return sorted([{'phase': phase,
                        'x': round((centre + distance / 2 - gait['origin']) / gait['unit'], 4)}
                       for phase, centre, distance in zip(gait['landings'], gait['centres'], distances)],
                      key=lambda e: e['phase'])
    ground = round(meta['origin'][1])
    contacts = []
    for frame, offset in zip(frames, offsets):
        band = (frame[ground - 3:ground + 1, :, 1] > 128).any(axis=0).astype(np.int8)
        edges = np.flatnonzero(np.diff(np.r_[0, band, 0]))
        contacts.append([(a + b - 1) / 2 + offset for a, b in zip(edges[::2], edges[1::2]) if b - a >= 2])
    events = []
    n = len(frames)
    step = meta['groundSpeed'] * meta['unit'] / (meta['rate'] * n)
    for i, feet in enumerate(contacts):
        for x in feet:
            if any(abs(previous - x - step) < 3 for previous in contacts[i - 1]):
                continue
            if not all(any(abs(next_x - (x - step * ahead)) < 4
                           for next_x in contacts[(i + ahead) % n]) for ahead in (1, 2, 3)):
                continue
            events.append({'phase': meta['phases'][i],
                           'x': round((x - meta['origin'][0]) / meta['unit'], 4)})
    return events


def atlas_motion(meta, directory):
    frames = atlas_frames(meta, directory)
    opaque = [np.clip(f[..., 0] * (f[..., 1] / 255) + 255 - f[..., 1], 0, 255).astype(np.uint8) for f in frames]
    offsets, report = horizontal_offsets(opaque)
    if meta.get('bodyMotion'):
        # Authored head/neck/torso motion is deliberate. A second torso-only
        # stabilization pass would cancel it and reintroduce relative head sway.
        offsets = [0.0] * len(frames)
        report['mode'] = 'preserve-connected-body-motion'
    return {'offsetX': offsets, 'footfalls': footfalls(frames, meta, offsets), 'registration': report}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--update', action='store_true')
    args = parser.parse_args()
    source = MODULE.read_text()
    header, body = source.split('export const STRIDE = ', 1)
    meta = json.loads(body.rstrip(';\n'))
    motion = atlas_motion(meta, ROOT / 'apps/website/assets')
    if args.update:
        meta.update(motion)
        MODULE.write_text(header + 'export const STRIDE = ' + json.dumps(meta, separators=(',', ':')) + ';\n')
    print(json.dumps(motion, indent=2))


if __name__ == '__main__':
    main()
