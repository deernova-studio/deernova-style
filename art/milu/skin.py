"""A connected foreground surface: torso, near hind leg and near foreleg.

The shared attachment edges have one UV mapping on both sides. Sampling the
surface once avoids the translucent seams of separately cut/faded leg patches.
Explicit limb strips prevent triangles spanning the empty space between bones.
"""
import cv2
import numpy as np
import triangle


class ConnectedSkin:
    def __init__(self, source, ribbons, xx, yy, remap):
        self.source, self.ribbons = source, ribbons
        self.xx, self.yy, self.remap = xx, yy, remap
        self.height, self.width = xx.shape
        vertices, owners = [], []

        def vertex(point, owner=None):
            vertices.append(point)
            owners.append(owner)
            return len(vertices) - 1

        # The top of the animal remains rigid. These anchors distribute the
        # local shoulder/pelvis deformation instead of stretching the abdomen.
        for y in [*range(64, 306, 20), 315]:
            for x in range(70, 511, 20):
                # Leave the upper thigh/shoulder free to turn below its real
                # joint. Fixed anchors through that skin made it fold over.
                if y > 270 and (130 < x <= 250 or 310 <= x <= 400 or (x <= 130 and y > 295)):
                    continue
                vertex([x, y])
        for x in range(70, 131, 20):
            vertex([x, 295])
        for y in (275, 295, 315):
            for x in (250, 260, 280, 300, 315):
                vertex([x, y])
        self.limbs = {}
        for leg in (1, 3):
            self.limbs[leg] = [[vertex(point, (leg, row, col)) for col, point in enumerate(points)]
                               for row, points in enumerate(ribbons[leg])]
        corners = [vertex(point) for point in ([0, 0], [self.width - 1, 0],
                                               [self.width - 1, 315], [0, 380])]
        belly = [vertex(point) for point in ([300, 356], [265, 352], [245, 346])]
        boundary = [*corners[:3], self.limbs[3][2][0], self.limbs[3][2][2],
                    *belly, self.limbs[1][2][0], self.limbs[1][2][2], corners[3]]
        self.vertices = np.float32(vertices)
        self.owners = owners
        body_ids = [i for i, owner in enumerate(owners) if owner is None or owner[1] <= 2]
        local = {index: i for i, index in enumerate(body_ids)}
        perimeter = [local[index] for index in boundary]
        # Constrained Delaunay preserves the concave attachment edges. Simply
        # dropping unconstrained triangles outside the torso left visible holes.
        mesh = triangle.triangulate({
            'vertices': self.vertices[body_ids],
            'segments': np.c_[perimeter, np.roll(perimeter, -1)]
        }, 'pQ')
        if len(mesh['vertices']) != len(body_ids):
            raise ValueError('Skin boundary intersects itself; revise the bind surface')
        triangles = [[body_ids[i] for i in indices] for indices in mesh['triangles']]
        for rows in self.limbs.values():
            for row in range(2, len(rows) - 1):
                for col in range(2):
                    triangles.extend([[rows[row][col], rows[row + 1][col], rows[row][col + 1]],
                                      [rows[row + 1][col], rows[row + 1][col + 1], rows[row][col + 1]]])
        self.triangles = np.array(triangles)

    def positions(self, posed_ribbons):
        target = self.vertices.copy()
        for i, owner in enumerate(self.owners):
            if owner is not None:
                leg, row, col = owner
                # The upper cap and the root are bound to the torso, rather
                # than following the registration drift of another drawing.
                if row >= 2:
                    target[i] = posed_ribbons[leg][row, col]
        return target

    def draw(self, posed_ribbons):
        target = self.positions(posed_ribbons)
        map_x = np.full_like(self.xx, -1)
        map_y = np.full_like(self.yy, -1)
        for indices in self.triangles:
            source, posed = self.vertices[indices], target[indices]
            x0, y0 = np.maximum(0, np.floor(posed.min(axis=0)).astype(int))
            x1, y1 = np.minimum([self.width, self.height], np.ceil(posed.max(axis=0)).astype(int) + 1)
            if x1 <= x0 or y1 <= y0:
                continue
            yy, xx = np.mgrid[y0:y1, x0:x1].astype(np.float32)
            matrix = cv2.getAffineTransform(posed, source)
            mask = np.zeros(xx.shape, np.uint8)
            cv2.fillConvexPoly(mask, np.round(posed - [x0, y0]).astype(np.int32), 1)
            covered = mask.astype(bool)
            map_x[y0:y1, x0:x1][covered] = (matrix[0, 0] * xx + matrix[0, 1] * yy + matrix[0, 2])[covered]
            map_y[y0:y1, x0:x1][covered] = (matrix[1, 0] * xx + matrix[1, 1] * yy + matrix[1, 2])[covered]
        return self.remap(self.source, map_x, map_y)
