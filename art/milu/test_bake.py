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
                               bake.xx, bake.yy, bake.smooth, bake.remap, gait=spec['gait'])

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
        a, b = self.pose(3, 1)[:, 4].copy(), self.pose(0, 0)[:, 4].copy()
        a[:, 0] -= self.guide.walk.centres
        b[:, 0] -= self.guide.walk.centres
        np.testing.assert_allclose(a, b[self.swap])
        np.testing.assert_allclose(self.pose(7, 1), self.pose(0, 0))

    def test_planted_feet_share_one_ground_velocity_and_never_penetrate_the_floor(self):
        walk = self.guide.walk
        epsilon = 1e-5
        for phase in np.linspace(0, 1, 640, endpoint=False):
            feet = self.pose(int(phase * 8), phase * 8 % 1)[:, 4]
            self.assertTrue((feet[:, 1] <= self.guide.floor).all())
            on = (walk.progress(phase) > epsilon) & (walk.progress(phase) < walk.stance - epsilon)
            speed = (walk.feet(phase + epsilon) - walk.feet(phase - epsilon)) / (2 * epsilon)
            np.testing.assert_allclose(speed[on, 0], -walk.ground_travel, atol=1e-6)
            np.testing.assert_array_equal(feet[on, 1], self.guide.floor)

    def test_four_beat_walk_keeps_support_while_the_next_leg_swings(self):
        walk = self.guide.walk
        # Reference: hind then opposite fore, with a short overlap, followed
        # by the other pair. They do not land as a simultaneous two-beat trot.
        np.testing.assert_array_equal(np.argsort(walk.landings), [1, 2, 0, 3])
        intervals = np.diff(np.r_[np.sort(walk.landings), 1])
        self.assertTrue((intervals > .1).all())
        self.assertLess(intervals[0], intervals[1])
        np.testing.assert_allclose(intervals[:2], intervals[2:])
        supports = set()
        for phase in np.linspace(0, 1, 800, endpoint=False):
            on = walk.progress(phase) <= walk.stance
            supports.add(on.sum())
            self.assertGreaterEqual(on.sum(), 2)
            self.assertTrue(on[:2].any() and on[2:].any())
        self.assertEqual(supports, {2, 3})

    def test_whole_legs_complete_one_sweep_per_step_without_extra_joint_reversals(self):
        phases = np.arange(800) / 800
        poses = np.array([self.pose(int(p * 8), p * 8 % 1) for p in phases])
        upper = poses[:, :, 1] - poses[:, :, 0]
        angles = np.arctan2(upper[:, :, 1], upper[:, :, 0])
        speeds = np.roll(angles, -1, axis=0) - angles
        turns = []
        for leg in range(4):
            signs = np.sign(speeds[:, leg][np.abs(speeds[:, leg]) > 1e-8])
            self.assertEqual(np.count_nonzero(signs != np.roll(signs, 1)), 2,
                             f'leg {leg} adds another swing within one step')
            extrema = [np.argmin(angles[:, leg]), np.argmax(angles[:, leg])]
            turns.append((phases[extrema] - self.guide.walk.landings[leg]) % 1)
        # Opposite legs repeat the same motion half a cycle apart. Fore and
        # hind recovery can differ while still making exactly one step each.
        np.testing.assert_allclose(turns[0], turns[1], atol=1 / len(phases))
        np.testing.assert_allclose(turns[2], turns[3], atol=1 / len(phases))

    def test_opposite_hooves_repeat_half_a_stride_apart_and_recovery_is_not_four_identical_tracks(self):
        for phase in np.linspace(0, 1, 160, endpoint=False):
            feet = []
            for leg, landing in enumerate(self.guide.walk.landings):
                p = (phase + landing) % 1
                foot = self.pose(int(p * 8), p * 8 % 1)[leg, 4].copy()
                foot[0] -= self.guide.walk.centres[leg]
                foot[1] = (self.guide.floor - foot[1]) / self.guide.walk.lift[leg]
                feet.append(foot)
            np.testing.assert_allclose(feet[0], feet[1], atol=1e-8)
            np.testing.assert_allclose(feet[2], feet[3], atol=1e-8)
        walk = self.guide.walk
        self.assertTrue((walk.stance[:2] < walk.stance[2:]).all())
        # In world space each leg advances by the same distance per cycle,
        # although its planted interval and relative step length differ.
        np.testing.assert_allclose(walk.distance / walk.stance, walk.ground_travel)
        for leg in range(4):
            u = .4
            p = walk.landings[leg] + walk.stance[leg] + (1 - walk.stance[leg]) * u
            foot = walk.feet(p)[leg]
            self.assertLess(foot[0], walk.centres[leg], 'recover behind the body before reaching forward')
            self.assertGreater(walk.floor - foot[1], walk.lift[leg] * .95)

    def test_toe_off_and_touchdown_match_ground_velocity_without_a_joint_snap(self):
        walk = self.guide.walk
        epsilon = 1e-7
        def pose(phase):
            phase %= 1
            return self.pose(int(phase * 8), phase * 8 % 1)
        for phase in np.r_[walk.landings, (walk.landings + walk.stance) % 1]:
            left = (pose(phase) - pose(phase - epsilon)) / epsilon
            right = (pose(phase + epsilon) - pose(phase)) / epsilon
            np.testing.assert_allclose(left, right, atol=.02)

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

    def test_forelegs_keep_bone_lengths_instead_of_stretching_to_follow_the_hooves(self):
        for phase in np.linspace(0, 1, 321, endpoint=False):
            pose = self.pose(int(phase * 8), phase * 8 % 1)
            lengths = np.linalg.norm(np.diff(pose[2:, :4], axis=1), axis=-1)
            expected = np.c_[self.guide.fore_upper, np.tile(self.guide.fore_lengths, (2, 1))]
            np.testing.assert_allclose(lengths, expected, atol=1e-6)
            for leg in pose[2:]:
                a, b = leg[3] - leg[1], leg[2] - leg[1]
                self.assertLess(a[0] * b[1] - a[1] * b[0], 0, 'the carpus bends opposite the hock')

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
