"""Whole-animal registration must remove layout drift without moving body parts."""
import unittest

import cv2
import numpy as np

from motion import horizontal_offsets


class RegistrationTest(unittest.TestCase):
    def test_known_horizontal_drift_with_independent_vertical_motion(self):
        h, w = 270, 285
        y, x = np.mgrid[:h, :w]
        torso = ((x - 125) / 70) ** 2 + ((y - 140) / 27) ** 2 < 1
        drawing = np.full((h, w), 255, np.uint8)
        drawing[torso] = (120 + 30 * np.sin(x[torso] / 9) + 20 * np.cos(y[torso] / 7)).astype(np.uint8)
        shifts = [0, 5, -4, 2, -2]
        frames = [cv2.warpAffine(drawing, np.float32([[1, 0, dx], [0, 1, dy]]),
            (w, h), borderValue=255) for dx, dy in zip(shifts, [0, 1, -1, 2, 0])]
        offsets, report = horizontal_offsets(frames)
        np.testing.assert_allclose(offsets, np.mean(shifts) - np.array(shifts), atol=0.15)
        self.assertAlmostEqual(sum(offsets), 0, places=2)
        self.assertGreater(report['minimumCorrelation'], .98)
        # The API yields one horizontal translation per complete image. No scale,
        # vertical correction, or independent head/limb transform is returned.
        self.assertEqual(len(offsets), len(frames))
        self.assertTrue(all(isinstance(offset, float) for offset in offsets))


if __name__ == '__main__':
    unittest.main()
