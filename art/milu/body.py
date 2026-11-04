"""One connected head, neck and torso, driven by the same walking phase.

The source drawings disagree about neck length and ribcage placement. A rigid
upper-body drawing preserves those proportions. Its gait-driven rise and pitch
extend into the leg roots and taper to zero before the grounded hooves.
"""
import cv2
import numpy as np


class ConnectedBody:
    def __init__(self, reference, xx, yy, smooth, remap, feature, origin):
        self.reference, self.xx, self.yy = reference, xx, yy
        self.remap, self.feature = remap, feature
        self.pivot = np.array([origin[0], 295.0])
        # This is one upper-body region, with no separate head or neck mask.
        self.upper = 1 - smooth(325, 350, yy)
        self.align_roots = 1 - smooth(335, 390, yy)
        self.carry = 1 - smooth(330, 450, yy)

    def matrix(self, phase):
        # One rise per half stride. Head and shoulders respond together after
        # weight transfer; the small pitch rotates the whole upper body.
        support = np.sin(2 * np.pi * phase)
        angle = np.deg2rad(0.22) * support
        c, s = np.cos(angle), np.sin(angle)
        rotation = np.array([[c, -s], [s, c]])
        shift = np.array([0.35, 2.4]) * support
        return np.c_[rotation, self.pivot - rotation @ self.pivot + shift].astype(np.float32)

    def draw(self, frame, phase, *, aligned_roots=False):
        # Align only the attachment zone; its influence fades down the legs.
        # The planted-hoof trajectories remain untouched.
        if aligned_roots:
            # The bound surface already contains the connected torso and legs.
            # Re-inserting a frozen torso across a horizontal band would cut
            # through the rotating shoulder and thigh a second time.
            connected = frame
        else:
            flow = cv2.calcOpticalFlowFarneback(self.feature(self.reference), self.feature(frame),
                None, .5, 5, 35, 6, 7, 1.5, cv2.OPTFLOW_FARNEBACK_GAUSSIAN)
            lower = self.remap(frame, self.xx + flow[..., 0] * self.align_roots,
                               self.yy + flow[..., 1] * self.align_roots)
            connected = self.reference * self.upper[..., None] + lower * (1 - self.upper[..., None])

        inverse = cv2.invertAffineTransform(self.matrix(phase))
        x = inverse[0, 0] * self.xx + inverse[0, 1] * self.yy + inverse[0, 2]
        y = inverse[1, 0] * self.xx + inverse[1, 1] * self.yy + inverse[1, 2]
        return self.remap(connected, self.xx + self.carry * (x - self.xx),
                          self.yy + self.carry * (y - self.yy))

    def description(self, source):
        return dict(model='connected-upper-v1', reference=source, pivot=self.pivot.tolist(),
                    rise=2.4, sway=0.35, pitchDegrees=0.22,
                    units='working pixels; one cycle per half stride')
