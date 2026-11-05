"""Offline correspondence for the four legs of the walking drawings.

Measured hoof paths drive a connected torso/near-leg surface and a far pair
behind it. Anatomical pivots and fixed hind-leg lengths prevent registration
drift, while a single foreground sample avoids transparent attachment seams.
"""
import hashlib
import json

import cv2
import numpy as np
from skin import ConnectedSkin
from walk import WalkCycle


def load_guides(path, drawings, source_dir, size, origin, unit):
    data = json.loads(path.read_text())
    assert data['workingFrame'] == list(size) and data['origin'] == list(origin) and data['unit'] == unit
    assert len(drawings) == len(data['drawings']), 're-measure landmarks after changing the drawings'
    for drawing, measured in zip(drawings, data['drawings']):
        assert all(drawing[k] == measured[k] for k in ('source', 'atlas', 'rect', 'origin', 'unit')), \
            're-measure landmarks after changing registration'
    assert len({d['atlas'] for d in drawings}) == 1
    assert hashlib.sha256((source_dir / drawings[0]['atlas']).read_bytes()).hexdigest() == data['atlasSha256'], \
        're-measure landmarks after replacing the source image'
    points = np.asarray([d['legs'] for d in data['drawings']], dtype=np.float32)
    assert points.shape == (len(drawings), 4, 5, 2) and np.isfinite(points).all()
    roots = np.asarray(data['roots'], dtype=np.float32)
    assert roots.shape == (4, 2) and np.isfinite(roots).all()
    # The old hind "root" was the stifle, and its next marker was merely a
    # point along the shin. Treating that point as a joint shortened the tibia.
    points[:, :2, 1] = points[:, :2, 0]
    points[:, :, 0] = roots
    assert (np.linalg.norm(np.diff(points, axis=2), axis=-1) > 1).all(), 'landmark segments must have length'
    swap = data['swap']
    assert sorted(swap) == list(range(4)) and all(swap[swap[i]] == i for i in range(4))
    return points, swap


def sample_pose(points, starts, swap, index, t):
    """Periodic, monotone cubic paths; both position and velocity join at the seam.

    A half stride swaps the two hind legs and the two forelegs. Treating the last
    drawing as if it returned to the same side sends the feet to the wrong places.
    Flat coordinates (especially the height of a planted hoof) stay flat.
    """
    n = len(points)

    def key(k):
        lap, i = divmod(k, n)
        return points[i][swap] if lap % 2 else points[i]

    def time(k):
        lap, i = divmod(k, n)
        return lap + starts[i]

    p0, p1, p2, p3 = [key(k) for k in range(index - 1, index + 3)]
    h0, h1, h2 = [time(k + 1) - time(k) for k in range(index - 1, index + 2)]

    def tangent(a, b, ha, hb):
        same = a * b > 0
        w1, w2 = 2 * hb + ha, hb + 2 * ha
        result = np.zeros_like(a)
        result[same] = (w1 + w2) / (w1 / a[same] + w2 / b[same])
        return result * h1

    d0, d1, d2 = (p1 - p0) / h0, (p2 - p1) / h1, (p3 - p2) / h2
    m1, m2 = tangent(d0, d1, h0, h1), tangent(d1, d2, h1, h2)
    return ((2 * t**3 - 3 * t*t + 1) * p1 + (t**3 - 2 * t*t + t) * m1
            + (-2 * t**3 + 3 * t*t) * p2 + (t**3 - t*t) * m2)


def ribbon(path):
    """A tapered skin mesh; a uniform wide ribbon folds over at the hock."""
    widths = np.array([25, 16, 12, 9, 14], dtype=float)
    path = np.vstack([path[0] + (path[0] - path[1]) * .6, path,
                      path[-1] + (path[-1] - path[-2]) * .9])
    widths = np.r_[widths[0], widths, widths[-1]]
    directions = np.diff(path, axis=0)
    directions /= np.linalg.norm(directions, axis=1)[:, None]
    normals = np.c_[-directions[:, 1], directions[:, 0]]
    joined = np.vstack([normals[0], normals[:-1] + normals[1:], normals[-1]])
    joined /= np.maximum(np.linalg.norm(joined, axis=1)[:, None], 1e-6)
    miter = np.ones(len(path))
    miter[1:-1] = np.minimum(1.05, 1 / np.maximum(np.sum(joined[1:-1] * normals[:-1], axis=1), .2))
    offset = joined * (widths * miter)[:, None]
    return np.stack([path - offset, path, path + offset], axis=1)


def over(front, back):
    """Premultiplied front-over-back, preserving depth at a leg crossing."""
    return front + back * (1 - front[..., 1:2] / 255)


class LayeredLegs:
    def __init__(self, frames, points, starts, swap, xx, yy, smooth, remap, reference=0, gait=None):
        self.points, self.starts, self.swap = np.asarray(points, dtype=float), starts, swap
        self.xx, self.yy, self.remap = xx, yy, remap
        self.height, self.width = xx.shape
        self.source = self.points[reference]
        # The far hind leg has its own visible shin/hoof. The far foreleg uses
        # the complete near foreleg rather than its partly occluded folded skin.
        self.template_ids = (0, 1, 3, 3)
        distances = np.array([self.distance(path) for path in self.source])
        nearest = distances.argmin(0)
        # Far legs need a complete upper cap hidden under the torso. Cutting
        # them at the old horizontal line exposed a gap as the limb swung away.
        lower = smooth(300, 325, yy)
        masks = [(1 - lower + (nearest == leg) * lower) * smooth(self.source[leg, 0, 1] - 12, self.source[leg, 0, 1], yy)
                 * smooth(34, 26, distances[leg]) for leg in range(4)]
        self.templates = {leg: (frames[reference] * masks[leg][..., None]).astype(np.float32) for leg in (0, 3)}
        for leg, template in self.templates.items():
            # Nearest-path extraction can capture the tip of a neighbouring
            # hoof. Remove those disconnected source fragments once, never by
            # reclassifying components in the moving output frames.
            _, labels, stats, _ = cv2.connectedComponentsWithStats((template[..., 1] > 32).astype(np.uint8))
            largest = 1 + np.argmax(stats[1:, cv2.CC_STAT_AREA])
            keep = cv2.dilate((labels == largest).astype(np.uint8), np.ones((3, 3), np.uint8))
            self.templates[leg] = template * keep[..., None]
        # Torso and near legs remain one source image, with one continuous UV
        # surface. Only the far pair is removed from this foreground surface.
        far = np.maximum.reduce([(nearest == leg) * smooth(310, 338, yy)
                                 * smooth(34, 26, distances[leg]) for leg in (0, 2)])
        foreground = (frames[reference] * (1 - far[..., None])).astype(np.float32)
        self.skin = ConnectedSkin(foreground, [ribbon(path) for path in self.source], xx, yy, remap)
        # Fit a fixed pair of lower-bone lengths from the less foreshortened
        # measurements. The old midpoint marker made the tibia too short.
        self.hind_lengths = np.quantile(np.linalg.norm(np.diff(points[:, :2, 1:4], axis=2), axis=-1), .9, axis=(0, 1))
        self.floor = float(self.points[..., 4, 1].max())
        self.walk = WalkCycle(gait, self.floor) if gait else None
        # The partly hidden far foreleg cannot supply a separate shorter rig.
        # Share its lower bone lengths, with upper lengths adjusted for the
        # higher near shoulder and slight foreshortening of the reference.
        self.fore_lengths = np.linalg.norm(np.diff(self.source[3, 1:4], axis=0), axis=-1)
        self.fore_upper = (np.linalg.norm(self.source[3, 1] - self.source[3, 0]) + 4
                           + self.source[3, 0, 1] - self.source[2:, 0, 1])

    def distance(self, path):
        dist = np.full_like(self.xx, np.inf)
        for a, b in zip(path[:-1], path[1:]):
            v = b - a
            u = np.clip(((self.xx - a[0]) * v[0] + (self.yy - a[1]) * v[1]) / np.dot(v, v), 0, 1)
            dist = np.minimum(dist, (self.xx - a[0] - u * v[0])**2 + (self.yy - a[1] - u * v[1])**2)
        return np.sqrt(dist)

    def pose(self, index, t):
        if self.walk:
            lap, key = divmod(index, len(self.points))
            phase = (lap + self.starts[key] + t * (self.starts[key + 1] - self.starts[key])) / 2
            target = self.source.copy()
            target[:, 4] = self.walk.feet(phase)
            thighs = self.walk.thigh_angles(phase)
        else:
            target = sample_pose(self.points, self.starts, self.swap, index, t).astype(float)
        target[:, 0] = self.source[:, 0]
        if not self.walk:
            for leg in (0, 1):
                upper = target[leg, 1] - target[leg, 0]
                length = np.linalg.norm(self.source[leg, 1] - self.source[leg, 0])
                target[leg, 1] = target[leg, 0] + upper / np.linalg.norm(upper) * length
        for leg, source in enumerate(self.template_ids):
            # Keep the toe track, including ground contacts. Rotate a constant
            # hoof shape instead of shrinking the foot during a swing.
            planted = self.source[source, 4] - self.source[source, 3]
            length = np.linalg.norm(planted)
            if self.walk:
                u = self.walk.swing(phase)[leg]
                angle = np.deg2rad(35 if leg < 2 else 40) * self.walk.clearance(u)
                rotation = np.array([[np.cos(angle), -np.sin(angle)], [np.sin(angle), np.cos(angle)]])
                direction = rotation @ planted / length
            else:
                toe = target[leg, 4] - target[leg, 3]
                landing = np.clip((target[leg, 4, 1] - (self.floor - 12)) / 12, 0, 1)
                landing = landing * landing * (3 - 2 * landing)
                direction = (1 - landing) * toe / np.linalg.norm(toe) + landing * planted / length
            # Set the sole down smoothly. Once planted it translates with the
            # ground instead of rocking on its toe or hovering between contacts.
            target[leg, 3] = target[leg, 4] - direction / np.linalg.norm(direction) * length
            if leg >= 2 and not self.walk:
                continue
            if self.walk:
                upper = (np.linalg.norm(self.source[leg, 1] - self.source[leg, 0])
                         if leg < 2 else self.fore_upper[leg - 2])
                if leg >= 2:
                    # Aim the upper foreleg along its reach. Keeping the old
                    # cubic shoulder sweep here held the elbow behind the
                    # chest, forcing an exaggerated corner at the carpus.
                    reach = target[leg, 3] - target[leg, 0]
                    angle = np.arctan2(reach[1], reach[0]) + np.deg2rad(4 - 7 * self.walk.clearance(u))
                else:
                    angle = thighs[leg]
                direction = np.array([np.cos(angle), np.sin(angle)])
                target[leg, 1] = target[leg, 0] + direction * upper
            a, b = target[leg, 1], target[leg, 3]
            first, second = self.hind_lengths if leg < 2 else self.fore_lengths
            delta = b - a
            distance = np.linalg.norm(delta)
            if not abs(first - second) < distance < first + second:
                raise ValueError(f'Leg {leg} cannot reach its hoof ({distance:.2f} / {first + second:.2f}): revise the walking path')
            direction = delta / distance
            along = (first**2 - second**2 + distance**2) / (2 * distance)
            height = np.sqrt(max(0, first**2 - along**2))
            # Always the same bending side; choosing a new IK branch at a
            # crossing would flip the hock through the other leg.
            side = 1 if leg < 2 else -1
            target[leg, 2] = a + direction * along + np.array([-direction[1], direction[0]]) * height * side
        return target

    def deform(self, layer, source, target):
        source, target = ribbon(source), ribbon(target)
        out = np.zeros_like(layer)
        for row in range(len(source) - 1):
            for col in range(2):
                for triangle in (((row, col), (row + 1, col), (row, col + 1)),
                                 ((row + 1, col), (row + 1, col + 1), (row, col + 1))):
                    p = np.float32([source[r, c] for r, c in triangle])
                    q = np.float32([target[r, c] for r, c in triangle])
                    x0, y0 = np.maximum(0, np.floor(q.min(axis=0)).astype(int))
                    x1, y1 = np.minimum([self.width, self.height], np.ceil(q.max(axis=0)).astype(int) + 1)
                    if x1 <= x0 or y1 <= y0:
                        continue
                    yy, xx = np.mgrid[y0:y1, x0:x1].astype(np.float32)
                    matrix = cv2.getAffineTransform(q, p)
                    sample = self.remap(layer, matrix[0, 0] * xx + matrix[0, 1] * yy + matrix[0, 2],
                                        matrix[1, 0] * xx + matrix[1, 1] * yy + matrix[1, 2])
                    mask = np.zeros((y1 - y0, x1 - x0), np.uint8)
                    cv2.fillConvexPoly(mask, np.round(q - [x0, y0]).astype(np.int32), 1)
                    # An overlapping triangle must not erase visible skin with
                    # its transparent margin when the joint folds sharply.
                    out[y0:y1, x0:x1] = over(sample * mask[..., None], out[y0:y1, x0:x1])
        return out

    def draw(self, index, t):
        target = self.pose(index, t)
        frame = np.zeros_like(self.skin.source)
        for leg in (0, 2):
            source = self.template_ids[leg]
            frame = over(self.deform(self.templates[source], self.source[source], target[leg]), frame)
        return over(self.skin.draw([ribbon(path) for path in target]), frame)
