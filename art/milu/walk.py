"""Retarget the reference walk's overlapping recovery to our existing deer.

All legs share a stride clock and ground velocity, but fore/hind support and
recovery are different. The swing joins stance with C2 continuity. Measurements
and the deliberate adaptations to our proportions are in reference-walk.json.
"""
import numpy as np


class WalkCycle:
    def __init__(self, config, floor):
        self.stance = np.array(config['stance'], dtype=float)
        self.ground_travel = float(config['groundTravel'])
        self.distance = self.ground_travel * self.stance
        self.landings = np.array(config['landings'], dtype=float)
        self.centres = np.array(config['centres'], dtype=float)
        self.lift = np.array(config['lift'], dtype=float)
        self.recovery = np.array(config['recovery'], dtype=float)
        self.floor = floor
        if not np.isfinite(self.ground_travel) or self.ground_travel <= 0:
            raise ValueError('Walking requires overlapping support and a positive stride')
        if any(a.shape != (4,) or not np.isfinite(a).all()
               for a in (self.stance, self.landings, self.centres, self.lift, self.recovery)):
            raise ValueError('Each physical leg needs a contact phase, centre and lift')
        if (self.stance <= .5).any() or (self.stance >= 1).any():
            raise ValueError('Walking support must overlap between opposite legs')
        if (self.lift <= 0).any() or (self.landings < 0).any() or (self.landings >= 1).any():
            raise ValueError('Lift must be positive and contacts must be in one stride')
        if (self.recovery < 0).any() or (self.recovery > .3).any():
            raise ValueError('Recovery delay must keep one forward swing')

    def progress(self, phase):
        return (phase - self.landings) % 1

    def feet(self, phase):
        progress = self.progress(phase)
        speed = self.ground_travel
        x = self.centres + self.distance / 2 - progress * speed
        y = np.full(4, self.floor, dtype=float)
        swing = progress > self.stance
        u = (progress[swing] - self.stance[swing]) / (1 - self.stance[swing])
        ease = u**3 * (10 - 15 * u + 6 * u*u)
        # Touchdown and toe-off have the same backward velocity as the ground.
        distance = self.distance[swing]
        travel = speed * (1 - self.stance[swing])
        # Lift and fold first, then deliver the hoof forwards. A compact bump
        # delays recovery without changing either end's velocity/acceleration.
        delay = self.recovery[swing] * distance * 64 * u**3 * (1 - u)**3
        x[swing] = self.centres[swing] - distance / 2 - travel * u + (distance + travel) * ease - delay
        y[swing] -= self.lift[swing] * self.clearance(u)
        return np.c_[x, y]

    @staticmethod
    def clearance(u):
        # Peak clearance precedes mid-swing; extension occupies the remaining
        # forward delivery. Both derivatives vanish at toe-off and touchdown.
        return u**3 * (1 - u)**4 / ((3 / 7)**3 * (4 / 7)**4)

    def swing(self, phase):
        return np.clip((self.progress(phase) - self.stance) / (1 - self.stance), 0, 1)

    def thigh_angles(self, phase):
        # Drive each thigh from its hoof's sweep rather than a second clock.
        # Foreleg angles are solved from ankle reach in the anatomical rig.
        sweep = (self.centres + self.distance / 2 - self.feet(phase)[:, 0]) / self.distance
        return np.deg2rad(70 + 35 * sweep[:2])

    def description(self):
        return dict(model='reference-walk-v1', stance=self.stance.tolist(),
                    groundTravel=self.ground_travel, distance=self.distance.tolist(),
                    landings=self.landings.tolist(), centres=self.centres.tolist(),
                    lift=self.lift.tolist(), recovery=self.recovery.tolist())
