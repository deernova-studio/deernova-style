"""Offline motion regressions. Run with: python -m unittest discover -s art/milu."""
import json
import unittest

import numpy as np

import bake
from limbs import LayeredLegs, load_guides, over, ribbon


class WalkingMotionTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        spec = json.loads((bake.HERE / 'drawings.json').read_text())
        cls.drawings = spec['drawings']
        cls.points, cls.swap = load_guides(bake.HERE / spec['landmarks'], cls.drawings,
                                          bake.HERE / 'source', (bake.W, bake.H),
                                          (bake.CX, bake.CG), bake.U)
        durations = np.array([d['duration'] for d in cls.drawings], dtype=float)
        cls.starts = np.r_[0, np.cumsum(durations / durations.sum())]
        frames = [bake.gray(f) for f in bake.register(cls.drawings)]
        cls.guide = LayeredLegs(frames, cls.points, cls.starts, cls.swap,
                               bake.xx, bake.yy, bake.smooth, bake.remap)

    def pose(self, index, t):
        return self.guide.pose(index, t)

    def test_limb_positions_and_velocities_join_even_when_sides_swap(self):
        epsilon = 1e-5
        for i in range(len(self.points)):
            np.testing.assert_allclose(self.pose(i, 1), self.pose(i + 1, 0), atol=1e-7)
            left = (self.pose(i, 1) - self.pose(i, 1 - epsilon)) / epsilon
            right = (self.pose(i + 1, epsilon) - self.pose(i + 1, 0)) / epsilon
            np.testing.assert_allclose(left, right, atol=.01)
        # Opposite legs exchange their hoof tracks, not their physical roots.
        np.testing.assert_allclose(self.pose(3, 1)[:, 4], self.pose(0, 0)[self.swap, 4])
        np.testing.assert_allclose(self.pose(7, 1), self.pose(0, 0))

    def test_hooves_do_not_overshoot_the_floor_or_reverse_between_keys(self):
        for i in range(len(self.points)):
            a, b = self.pose(i, 0), self.pose(i, 1)
            for t in np.linspace(0, 1, 101):
                pose = self.pose(i, t)
                self.assertTrue((pose[:, -1] >= np.minimum(a, b)[:, -1] - 1e-6).all())
                self.assertTrue((pose[:, -1] <= np.maximum(a, b)[:, -1] + 1e-6).all())
                self.assertLessEqual(pose[:, -1, 1].max(), 466 + 1e-6)

    def test_mismatched_pixels_never_switch_drawings_at_the_midpoint(self):
        a = np.zeros((bake.H, bake.W, 2), np.float32)
        b = a.copy()
        a[300:470, 120:140] = [180, 255]
        b[300:470, 200:220] = [180, 255]
        flow = np.zeros_like(a)
        left = bake.inbetween(a, b, flow, flow, .4999)
        right = bake.inbetween(a, b, flow, flow, .5001)
        self.assertLess(np.max(np.abs(left - right)), .1)
        # Continuous opacity must not erase a leg merely because it fell below
        # the old 140/255 connected-component cutoff during a transition.
        self.assertGreater(left[400, 130, 1], 120)

    def test_hind_bones_and_hooves_keep_their_length_even_when_legs_cross(self):
        for phase in np.linspace(0, 2, 321, endpoint=False):
            index = int(phase * 4)
            pose = self.pose(index, phase * 4 - index)
            np.testing.assert_array_equal(pose[:, 0], self.guide.source[:, 0])
            np.testing.assert_allclose(np.linalg.norm(pose[:2, 1] - pose[:2, 0], axis=1),
                                      np.linalg.norm(self.guide.source[:2, 1] - self.guide.source[:2, 0], axis=1))
            lengths = np.linalg.norm(np.diff(pose[:2, 1:4], axis=1), axis=-1)
            np.testing.assert_allclose(lengths, np.tile(self.guide.hind_lengths, (2, 1)), atol=1e-6)
            for leg, source in enumerate(self.guide.template_ids):
                expected = np.linalg.norm(self.guide.source[source, 4] - self.guide.source[source, 3])
                self.assertAlmostEqual(np.linalg.norm(pose[leg, 4] - pose[leg, 3]), expected, places=6)
                if abs(pose[leg, 4, 1] - self.guide.floor) < 1e-8:
                    np.testing.assert_allclose(pose[leg, 4] - pose[leg, 3],
                        self.guide.source[source, 4] - self.guide.source[source, 3], atol=1e-6)
            for leg in pose[:2]:
                a, b = leg[3] - leg[1], leg[2] - leg[1]
                self.assertGreater(a[0] * b[1] - a[1] * b[0], 0, 'the hock must not flip its bending side')

    def test_actual_leg_pixels_join_after_both_sides_complete_their_step(self):
        first = self.guide.draw(0, 0)
        end = self.guide.draw(7, 1)
        np.testing.assert_allclose(first, end, atol=.001)

    def test_crossings_are_opaque_and_transparent_skin_margins_cannot_erase_the_far_leg(self):
        back = np.array([[[220., 255.], [220., 255.]]])
        front = np.array([[[40., 255.], [0., 0.]]])
        np.testing.assert_array_equal(over(front, back), [[[40., 255.], [220., 255.]]])

    def test_foreground_surface_never_folds_through_itself_during_a_full_stride(self):
        skin = self.guide.skin
        cross = lambda a, b: a[..., 0] * b[..., 1] - a[..., 1] * b[..., 0]
        source = skin.vertices[skin.triangles]
        areas = cross(source[:, 1] - source[:, 0], source[:, 2] - source[:, 0])
        for phase in np.linspace(0, 2, 640, endpoint=False):
            index = int(phase * 4)
            pose = self.pose(index, phase * 4 - index)
            target = skin.positions([ribbon(path) for path in pose])[skin.triangles]
            posed = cross(target[:, 1] - target[:, 0], target[:, 2] - target[:, 0])
            self.assertTrue((posed * areas > 0).all(), f'folded skin at phase {phase}')

    def test_shared_attachments_have_no_alpha_holes_or_double_composited_seams(self):
        skin = self.guide.skin
        reference = skin.source
        skin.source = np.full_like(reference, [180, 255])
        try:
            for phase in np.linspace(0, 2, 32, endpoint=False):
                index = int(phase * 4)
                pose = self.pose(index, phase * 4 - index)
                frame = skin.draw([ribbon(path) for path in pose])
                for leg in (1, 3):
                    x, y = np.round(pose[leg, 1]).astype(int)
                    np.testing.assert_allclose(frame[y - 2:y + 3, x - 2:x + 3],
                                               np.broadcast_to([180, 255], (5, 5, 2)), atol=.001,
                                               err_msg=f'attachment seam, leg {leg}, phase {phase}')
        finally:
            skin.source = reference


if __name__ == '__main__':
    unittest.main()
