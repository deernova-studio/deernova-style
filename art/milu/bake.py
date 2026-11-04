"""Bake the homepage walk from the generated deer drawings.

The drawings were generated separately, so their heads, antlers and coat tones
differ slightly. Cross-fading them at 60 Hz showed two heads and two sets of legs
at every handover. This script

1. registers every drawing on one torso origin and ground line,
2. chooses one connected upper-body drawing: head, antlers, neck and torso,
3. matches the gray tones,
4. binds the torso and near legs to one surface, poses the far legs behind it,
   and constrains anatomical joints along measured hoof paths,
5. moves that connected upper body with the walking phase, carrying its movement
   into the leg roots while keeping the grounded hooves on the floor,
6. prints the site's gray tone curve and outline, and packs the frames into
   grayscale atlases with a small generated module that describes them.

Usage: pip install -r art/milu/requirements.txt
       python art/milu/bake.py                      (writes the atlases and stride.js into apps/website)
       python art/milu/bake.py --preview sheet.png  (also writes a contact sheet of every frame)
"""
import argparse, json, math, pathlib
import numpy as np
import cv2
from PIL import Image
from limbs import LayeredLegs, load_guides
from motion import atlas_motion
from body import ConnectedBody

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent.parent
SITE = ROOT / 'apps/website'

U, CX, CG, W, H = 180.0, 290.0, 470.0, 680, 540  # working frame: source pixels per scene unit, torso origin, ground
OUT_UNIT = 120.0                                   # shipped pixels per scene unit; the halftone samples at most ~80
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)


def smooth(e0, e1, v):
    t = np.clip((v - e0) / (e1 - e0), 0, 1)
    return t * t * (3 - 2 * t)


# ---- 1. Registration -------------------------------------------------------

def register(drawings):
    atlases, out = {}, []
    for d in drawings:
        if d['atlas'] not in atlases:
            atlases[d['atlas']] = cv2.imread(str(HERE / 'source' / d['atlas']), cv2.IMREAD_UNCHANGED)
        x, y, w, h = d['rect']
        cell = atlases[d['atlas']][y:y + h, x:x + w].astype(np.float32)
        cell[cell[..., 3] < 8] = 0             # near-zero matte noise from the generator, never fur
        cell[..., :3] *= cell[..., 3:4] / 255  # premultiply so the matte stays clean when resampled
        s = U / d['unit']
        M = np.float32([[s, 0, CX - d['origin'][0] * s], [0, s, CG - d['origin'][1] * s]])
        out.append(cv2.warpAffine(cell, M, (W, H), flags=cv2.INTER_LINEAR, borderValue=0))
    return out


def gray(img):
    """The site's tone curve: generated colour to gray value, plus alpha (both 0..255)."""
    a = img[..., 3]
    col = img[..., :3] / np.maximum(a[..., None], 1e-3) * 255
    l = 0.0722 * col[..., 0] + 0.7152 * col[..., 1] + 0.2126 * col[..., 2]
    v = np.where(l < 58, 30 + l * 1.6, 150 + 105 * np.clip((l - 58) / 172, 0, 1) ** 0.45)
    return np.dstack([v * a / 255, a]).astype(np.float32)  # premultiplied gray, alpha


# ---- 2. Shared image operations ----------------------------------------------


def feature(img):
    return np.clip(0.5 * img[..., 0] + 0.5 * img[..., 1], 0, 255).astype(np.uint8)


def remap(img, field_x, field_y):
    return cv2.remap(img, field_x.astype(np.float32), field_y.astype(np.float32), cv2.INTER_LINEAR, borderValue=0)


# ---- 3. Tones ----------------------------------------------------------------

def match_tones(frames):
    """Shift each drawing's body gray to the common level, so the halftone threshold does not flicker."""
    stats = []
    for f in frames:
        solid = f[..., 1] > 250
        v = f[..., 0][solid] / f[..., 1][solid] * 255
        stats.append((v.mean(), v.std()))
    mean, std = np.mean([s[0] for s in stats]), np.mean([s[1] for s in stats])
    out = []
    for f, (m, s) in zip(frames, stats):
        k = float(np.clip(std / s, 0.9, 1.1))
        v = f[..., 0] / np.maximum(f[..., 1], 1e-3) * 255
        v = np.clip((v - m) * k + mean, 0, 255)
        out.append(np.dstack([v * f[..., 1] / 255, f[..., 1]]).astype(np.float32))
    return out


# ---- 4. In-betweens ----------------------------------------------------------

def flow(a, b):
    # A wide window keeps a swinging leg moving as one piece; a narrower one tore the
    # legs apart wherever they rotate quickly (push-off, folding the hind legs).
    return cv2.calcOpticalFlowFarneback(a, b, None, 0.5, 8, 51, 10, 7, 1.5, cv2.OPTFLOW_FARNEBACK_GAUSSIAN)


def advect(img, field, amount):
    """Invert source-space flow instead of looking it up at destination pixels.

    Rotating feet travel far enough that simply negating their forward flow
    samples the wrong part of the leg. Damped iteration follows the source point.
    """
    sx, sy = xx - amount * field[..., 0], yy - amount * field[..., 1]
    for _ in range(5):
        sampled = remap(field, sx, sy)
        sx = .5 * sx + .5 * (xx - amount * sampled[..., 0])
        sy = .5 * sy + .5 * (yy - amount * sampled[..., 1])
    return remap(img, sx, sy)


def ground_lock(f, src, dst):
    """Where a hoof stands on the ground in both drawings, it slides along the ground in
    between instead of lifting with the swinging leg above it."""
    on = lambda img: (img[..., 1] > 128) & (yy >= CG - 10)
    reach = cv2.dilate(on(dst).astype(np.uint8), np.ones((9, 9), np.uint8)).astype(np.float32)
    lands = cv2.remap(reach, xx + f[..., 0], yy + f[..., 1], cv2.INTER_LINEAR) > 0.5
    hold = cv2.dilate((on(src) & lands).astype(np.uint8), np.ones((15, 15), np.uint8)).astype(np.float32)
    out = f.copy()
    out[..., 1] *= 1 - cv2.GaussianBlur(hold, (0, 0), 3) * smooth(CG - 24, CG - 10, yy)
    return out


def inbetween(A, B, fab, fba, t):
    At, Bt = advect(A, fab, t), advect(B, fba, 1 - t)
    # Continuous at every time, including 0.5. A confidence-based hard switch
    # hid double legs by teleporting the hoof; fix correspondence before mixing.
    return clean_matte((1 - t) * At + t * Bt)


def clean_matte(frame):
    # Continuous alpha cleanup. Reclassifying connected components in every
    # intermediate frame can make a thin hoof disappear at an arbitrary threshold.
    # The ground is a shared plane: warping a slanted hoof must not stretch its
    # sole below it. A subpixel edge keeps the outline antialiased after packing.
    coverage = smooth(2, 12, frame[..., 1]) * smooth(CG + .75, CG - .75, yy)
    return frame * coverage[..., None]


def tidy(frame):
    """Drop specks the warp tore off a leg, and faint smears it stretched away from the
    solid animal; a real edge is never more than a couple of pixels from solid fur.
    Apply once to source drawings, before motion; never threshold moving fragments."""
    out = frame.copy()
    count, labels, sizes, _ = cv2.connectedComponentsWithStats((out[..., 1] > 24).astype(np.uint8), connectivity=8)
    small = np.isin(labels, [k for k in range(1, count) if sizes[k, cv2.CC_STAT_AREA] < 120])
    out[small] = 0
    # A stray tuft of hair can hang on by a faint film; judge fragments by their solid part.
    solid = (out[..., 1] > 140).astype(np.uint8)
    count, labels, sizes, _ = cv2.connectedComponentsWithStats(solid, connectivity=8)
    solid[np.isin(labels, [k for k in range(1, count) if sizes[k, cv2.CC_STAT_AREA] < 120])] = 0
    near = cv2.dilate(solid, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5)))
    return out * cv2.GaussianBlur(near.astype(np.float32), (0, 0), 0.7)[..., None]


def bake_stride(frames, starts, drawings, count, guide=None, halves=1):
    """Evenly sample motion; the player interpolates these samples at 60 Hz."""
    n = len(frames)
    if halves != 1 and guide is None:
        raise ValueError('A full stride needs persistent leg identities')
    flows = {}
    baked, sources = [], []
    for k in range(count):
        p = k / count * halves
        lap, phase = divmod(p, 1)
        i = max(j for j in range(n) if starts[j] <= phase + 1e-12)
        t = (phase - starts[i]) / (starts[i + 1] - starts[i])
        if guide is not None:
            # Clean the complete surface once, after the shared body transform.
            # Repeated matte cleanup erodes fine edges such as antlers.
            baked.append(guide.draw(i + int(lap) * n, t))
            sources.append(drawings[i]['source'] if t < 1e-9 and lap == 0 else None)
            continue
        if t < 1e-9:
            baked.append(clean_matte(frames[i])); sources.append(drawings[i]['source']); continue
        if i not in flows:
            A, B = frames[i], frames[(i + 1) % n]
            a, b = feature(A), feature(B)
            flows[i] = (ground_lock(flow(a, b), A, B), ground_lock(flow(b, a), B, A))
        baked.append(inbetween(frames[i], frames[(i + 1) % n], *flows[i], t))
        sources.append(None)
    return baked, [k / count for k in range(count)], sources


def ground_speed(frames, rate):
    """How fast the planted hooves move back under the body, in scene units per second.
    The page uses this estimate to reduce sliding. A walk moves a hoof
    only a few pixels per frame, so follow each planted hoof for as long as it stays down and
    fit a straight line to its path."""
    def feet(f):
        touch = np.concatenate([[0], (f[int(CG) - 3:int(CG) + 1, :, 1] > 128).any(axis=0).astype(np.int8), [0]])
        edges = np.flatnonzero(np.diff(touch))
        return [(a + b) / 2 for a, b in zip(edges[::2], edges[1::2])]
    n = len(frames)
    contacts = [feet(f) for f in frames]
    # A rough step first: the typical shift of a hoof that stays down between neighbouring frames.
    shifts = [min((y - x for y in contacts[(k + 1) % n] if -40 <= y - x <= 8), key=abs, default=None)
              for k in range(n) for x in contacts[k]]
    shifts = [d for d in shifts if d is not None]
    assert shifts, 'no hoof stands on the ground line'
    step = float(np.median(shifts))
    # Then the tracks: chain each hoof to the one that many pixels behind it in the next frame.
    slopes, weights = [], []
    for k in range(n):
        for x in contacts[k]:
            if any(abs(y - (x - step)) < 2.5 for y in contacts[k - 1]): continue   # not a track start
            path = [x]
            while len(path) < n:
                ahead = [y for y in contacts[(k + len(path)) % n] if abs(y - (path[-1] + step)) < 2.5]
                if not ahead: break
                path.append(min(ahead, key=lambda y: abs(y - (path[-1] + step))))
            if len(path) >= 6:
                slopes.append(np.polyfit(np.arange(len(path)), path, 1)[0]); weights.append(len(path))
    per_frame = float(np.average(slopes, weights=weights)) if slopes else step
    return -per_frame / U * rate * n


# ---- 5. Print and pack -------------------------------------------------------

def outline(frame):
    """A thin dark rim, as the site drew it at load time: the silhouette nudged 1.25 px eight ways."""
    v, a = frame[..., 0], frame[..., 1] / 255
    rim = np.zeros_like(a)
    for k in range(8):
        M = np.float32([[1, 0, math.cos(k * math.pi / 4) * 1.25], [0, 1, math.sin(k * math.pi / 4) * 1.25]])
        rim = np.maximum(rim, cv2.warpAffine(a, M, (W, H)))
    alpha = a + rim * (1 - a)
    return np.dstack([v + 21 * rim * (1 - a), alpha * 255]).astype(np.float32)  # premultiplied


def pack(frames, phases, sources, keys, per_atlas, columns, prefix):
    scale = OUT_UNIT / U
    small = [cv2.resize(f, None, fx=scale, fy=scale, interpolation=cv2.INTER_AREA) for f in frames]
    alpha = np.max([f[..., 1] for f in small], axis=0)
    ys, xs = np.nonzero(alpha > 2)
    x0, y0 = max(0, xs.min() - 2), max(0, ys.min() - 2)
    x1, y1 = min(alpha.shape[1], xs.max() + 3), min(alpha.shape[0], ys.max() + 3)
    assert x0 > 0 and y0 > 0 and x1 < alpha.shape[1] and y1 < alpha.shape[0], 'a pose touches the working frame'
    x0, y0, x1, y1 = int(x0), int(y0), int(x1), int(y1)
    fw, fh = x1 - x0, y1 - y0
    atlases, bounds = [], []
    for start in range(0, len(small), per_atlas):
        chunk = small[start:start + per_atlas]
        rows = math.ceil(len(chunk) / columns)
        sheet = np.zeros((rows * fh, columns * fw, 2), np.uint8)
        for k, f in enumerate(chunk):
            f = f[y0:y1, x0:x1]
            a = np.clip(f[..., 1], 0, 255).round()
            # Fully transparent pixels carry no gray, so the PNG compresses well.
            v = np.where(a > 0, f[..., 0] / np.maximum(f[..., 1], 1e-3) * 255, 0)
            r, c = divmod(k, columns)
            sheet[r * fh:(r + 1) * fh, c * fw:(c + 1) * fw] = np.dstack([np.clip(v, 0, 255).round(), a]).astype(np.uint8)
            ys, xs = np.nonzero(a > 128)
            bounds.append([int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())])
        name = f'{prefix}-{len(atlases) + 1}.png'
        Image.fromarray(sheet, 'LA').save(SITE / 'assets' / name, optimize=True)
        atlases.append(dict(file=name, width=columns * fw, height=rows * fh))
    return dict(size=[fw, fh], origin=[round(CX * scale - x0, 2), round(CG * scale - y0, 2)], unit=OUT_UNIT,
                columns=columns, perAtlas=per_atlas, atlases=atlases,
                phases=[round(p, 6) for p in phases], sources=sources, keys=keys, bounds=bounds)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--preview', metavar='PNG', help='also write a contact sheet of every baked frame')
    args = parser.parse_args()
    spec = json.loads((HERE / 'drawings.json').read_text())
    drawings = spec['drawings']
    durations = np.array([d['duration'] for d in drawings], float)
    starts = np.concatenate([[0], np.cumsum(durations / durations.sum())]).tolist()
    reference = next(i for i, d in enumerate(drawings) if d['source'] == spec['bodyReference'])

    frames = [gray(f) for f in register(drawings)]
    frames = [tidy(f) for f in match_tones(frames)]
    guide = None
    if spec.get('landmarks'):
        points, swap = load_guides(HERE / spec['landmarks'], drawings, HERE / 'source', (W, H), (CX, CG), U)
        guide = LayeredLegs(frames, points, starts, swap, xx, yy, smooth, remap, reference)
    halves = spec.get('halves', 1)
    baked, phases, sources = bake_stride(frames, starts, drawings, spec['frames'], guide, halves)
    body = ConnectedBody(frames[reference], xx, yy, smooth, remap, feature, (CX, CG))
    baked = [clean_matte(body.draw(frame, phase * halves, aligned_roots=guide is not None)) for frame, phase in zip(baked, phases)]
    keys = {str(d['source']): round(starts[i] / halves, 6) for i, d in enumerate(drawings)}
    meta = pack([outline(f) for f in baked], phases, sources, keys, spec['perAtlas'], spec['columns'], spec['prefix'])
    meta.update(rate=spec['rate'], groundSpeed=round(ground_speed(baked, spec['rate']), 4), alert=spec['alert'], halves=halves)
    meta['bodyMotion'] = body.description(spec['bodyReference'])
    if guide is not None:
        meta['skin'] = dict(model='connected-surface-v1', roots=guide.source[:, 0].tolist(),
                            hindLengths=np.round(guide.hind_lengths, 4).tolist())
    meta.update(atlas_motion(meta, SITE / 'assets'))
    module = ('// Generated by art/milu/bake.py from the drawings in art/milu. Do not edit by hand.\n'
              '// Baked stride frames: size and origin in frame pixels, unit = frame pixels per scene unit,\n'
              '// phases = where each frame sits in the stride; sources = the leg-pose drawing at this phase, or null for an in-between;\n'
              '// keys = where each source drawing sits in the stride; rate = strides per second;\n'
              '// groundSpeed = how fast the planted hooves move back (scene units per second), which the ground matches;\n'
              '// alert = the leg pose the stag stops on; bodyMotion = the connected upper-body motion.\n'
              f'export const STRIDE = {json.dumps(meta, separators=(",", ":"))};\n')
    (SITE / 'scripts/meadow/stride.js').write_text(module)
    print(f'{len(baked)} frames, {meta["size"][0]}x{meta["size"][1]} px, {len(meta["atlases"])} atlases, '
          f'planted hooves move back at {meta["groundSpeed"]:.3f} scene units/s')
    if args.preview:
        tiles = []
        for k, f in enumerate(baked):
            o = outline(f); a = o[..., 1:2] / 255
            img = np.clip(o[..., 0:1] + 246 * (1 - a), 0, 255).astype(np.uint8)[..., 0]
            img = cv2.resize(img, None, fx=0.4, fy=0.4, interpolation=cv2.INTER_AREA)
            cv2.putText(img, str(k), (4, 14), 0, 0.4, 0, 1)
            tiles.append(img)
        cols = 10
        while len(tiles) % cols: tiles.append(np.full_like(tiles[0], 246))
        cv2.imwrite(args.preview, np.vstack([np.hstack(tiles[r:r + cols]) for r in range(0, len(tiles), cols)]))


if __name__ == '__main__':
    main()
