"""The head must move with the torso, while planted feet stay on the floor."""
import unittest
import hashlib
import json

import cv2
import numpy as np

import bake
from body import ConnectedBody
from motion import atlas_frames


class ConnectedBodyTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.pins = np.array([[455, 235], [400, 270], [290, 295], [337, 460]], dtype=float)
        cls.reference = np.zeros((bake.H, bake.W, 2), np.float32)
        for x, y in cls.pins.astype(int):
            cv2.circle(cls.reference, (x, y), 5, (150, 255), -1)
        cls.body = ConnectedBody(cls.reference, bake.xx, bake.yy, bake.smooth,
                                 bake.remap, bake.feature, (bake.CX, bake.CG))

    def positions(self, frame):
        centres = []
        for x, y in self.pins.astype(int):
            alpha = frame[y - 12:y + 13, x - 12:x + 13, 1]
            yy, xx = np.mgrid[y - 12:y + 13, x - 12:x + 13]
            centres.append([(xx * alpha).sum() / alpha.sum(), (yy * alpha).sum() / alpha.sum()])
        return np.array(centres)

    def test_actual_head_neck_and_torso_pixels_move_together_without_stretching(self):
        low = self.positions(self.body.draw(self.reference, .25))
        high = self.positions(self.body.draw(self.reference, .75))
        self.assertTrue(((low - high)[:3, 1] > 3).all(), 'head, neck AND torso must visibly rise and fall')
        for result in (low, high):
            for a, b in ((0, 1), (1, 2), (0, 2)):
                self.assertAlmostEqual(np.linalg.norm(result[a] - result[b]),
                                       np.linalg.norm(self.pins[a] - self.pins[b]), delta=.2)
            np.testing.assert_allclose(result[-1], self.pins[-1], atol=.001)

    def test_planting_zone_is_unchanged_and_the_loop_has_no_reset(self):
        for phase in (0, .125, .25, .5, .75, 1):
            drawn = self.body.draw(self.reference, phase)
            np.testing.assert_array_equal(drawn[450:], self.reference[450:])
        np.testing.assert_array_equal(self.body.draw(self.reference, 0), self.body.draw(self.reference, 1))
        epsilon = .001
        left = (self.body.matrix(1) - self.body.matrix(1 - epsilon)) / epsilon
        right = (self.body.matrix(epsilon) - self.body.matrix(0)) / epsilon
        np.testing.assert_allclose(left, right, atol=.015)

    def test_shipped_head_neck_and_torso_core_preserve_the_accepted_motion_at_every_frame(self):
        module = (bake.SITE / 'scripts/meadow/stride.js').read_text()
        meta = json.loads(module.split('export const STRIDE = ')[1].rstrip(';\n'))
        baseline = 'motion-core-lock.json' if meta.get('skin') else 'upper-body-lock.json'
        lock = json.loads((bake.HERE / baseline).read_text())
        self.assertEqual(meta['bodyMotion'], lock['bodyMotion'])
        self.assertEqual(meta['unit'], lock['unit'])
        self.assertEqual(meta['rate'] * meta['halves'], lock['halfStrideRate'])
        self.assertEqual(len(meta['phases']), len(lock['sha256']) * meta['halves'])
        origin = np.floor(meta['origin']).astype(int)
        for i, frame in enumerate(atlas_frames(meta, bake.SITE / 'assets')):
            patches = []
            for left, top, right, bottom in lock.get('regions', [lock.get('roi')]):
                x0, y0 = origin + [left, top]
                x1, y1 = origin + [right, bottom]
                registered = np.zeros((bottom - top, right - left, 2), np.uint8)
                a, b = max(0, x0), max(0, y0)
                c, d = min(frame.shape[1], x1), min(frame.shape[0], y1)
                registered[b - y0:d - y0, a - x0:c - x0] = frame[b:d, a:c]
                patches.append(registered.tobytes())
            digest = hashlib.sha256(b''.join(patches)).hexdigest()
            self.assertEqual(digest, lock['sha256'][i % len(lock['sha256'])], f'upper body changed in frame {i}')


if __name__ == '__main__':
    unittest.main()
