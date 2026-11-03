"""Bake the homepage stride from the generated deer drawings.

The drawings were generated separately, so their heads, antlers and coat tones
differ slightly. Cross-fading them at 60 Hz showed two heads and two sets of legs
at every handover. This script

1. registers every drawing on one torso origin and ground line,
2. gives every head the same size and a smooth path through the stride (each
   drawing keeps its own head and neck; only the head is moved, along the neck),
   and aligns the antlers rigidly to the head,
3. matches the gray tones,
4. draws real in-between poses with optical flow at even steps, one per 60 Hz
   refresh at running speed, so that every frame is a single animal rather than
   two half-transparent ones,
5. prints the site's gray tone curve and outline, and packs the frames into
   grayscale atlases with a small generated module that describes them.

Usage: pip install -r art/milu/requirements.txt
       python art/milu/bake.py                      (writes the atlases and stride.js into apps/website)
       python art/milu/bake.py --preview sheet.png  (also writes a contact sheet of every frame)
"""
import argparse, json, math, pathlib
import numpy as np
import cv2
from PIL import Image

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


# ---- 2. Heads ----------------------------------------------------------------

REF_EYE = np.array([CX + 165.0, 235.0])
# Signed distance to a withers -> chest line; negative on the head side.
NECK = (90 * (yy - 250) - 90 * (xx - (CX + 70))) / 127.0
FACE = ((NECK < -30) & (yy > 175) & (xx > CX + 100) & (yy < 330)).astype(np.uint8)
HEAD = (np.maximum(smooth(25, -45, NECK), smooth(225, 185, yy) * smooth(CX - 80, CX - 20, xx)) * smooth(370, 330, yy)).astype(np.float32)
ANTLERS = smooth(215, 190, yy) * smooth(CX - 60, CX - 20, xx)  # in reference-head coordinates
ANTLER_FIT = (ANTLERS > 0.5).astype(np.uint8)


def feature(img):
    return np.clip(0.5 * img[..., 0] + 0.5 * img[..., 1], 0, 255).astype(np.uint8)


def ecc(template, image, mask):
    """Affine map from template coordinates to image coordinates, fitted coarse to fine."""
    T, I, warp = template.astype(np.float32), image.astype(np.float32), np.eye(2, 3, dtype=np.float32)
    for scale in (0.5, 1.0):
        t, im = cv2.resize(T, None, fx=scale, fy=scale), cv2.resize(I, None, fx=scale, fy=scale)
        m = cv2.resize(mask, None, fx=scale, fy=scale, interpolation=cv2.INTER_NEAREST)
        w = warp.copy(); w[:, 2] *= scale
        _, w = cv2.findTransformECC(t, im, w, cv2.MOTION_AFFINE,
                                    (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 200, 1e-6), m, 5)
        warp = w.copy(); warp[:, 2] /= scale
    return np.vstack([warp, [0, 0, 1]]).astype(np.float64)


def fourier(phases, values, k):
    basis = lambda p: np.stack([np.ones_like(p)] + [g(2 * np.pi * j * p) for j in range(1, k + 1) for g in (np.cos, np.sin)], -1)
    coef, *_ = np.linalg.lstsq(basis(np.asarray(phases)), np.asarray(values), rcond=None)
    return basis(np.asarray(phases)) @ coef


def similarity(angle, eye):
    c, s = math.cos(angle), math.sin(angle)
    T = np.array([[c, -s, 0], [s, c, 0], [0, 0, 1.0]])
    T[:2, 2] = np.asarray(eye) - T[:2, :2] @ REF_EYE
    return T


def remap(img, field_x, field_y):
    return cv2.remap(img, field_x.astype(np.float32), field_y.astype(np.float32), cv2.INTER_LINEAR, borderValue=0)


def apply(M, x, y):
    return M[0, 0] * x + M[0, 1] * y + M[0, 2], M[1, 0] * x + M[1, 1] * y + M[1, 2]


def heads(frames, phases, reference):
    """Move each drawing's own head onto one size and a smooth path; the neck absorbs the difference."""
    feats = [feature(f) for f in frames]
    fits = [ecc(feats[reference], f, FACE) for f in feats]  # reference head -> drawing
    eyes = np.array([(M @ [*REF_EYE, 1])[:2] for M in fits])
    angles = np.array([math.atan2(M[1, 0] - M[0, 1], M[0, 0] + M[1, 1]) for M in fits])
    # Keep the stride's own head motion (two rises per stride) and drop the drawing-to-drawing noise.
    ex, ey, th = fourier(phases, eyes[:, 0], 2), fourier(phases, eyes[:, 1], 4), fourier(phases, angles, 2)
    targets = [similarity(th[i], (ex[i], ey[i])) for i in range(len(frames))]
    out = []
    for i, f in enumerate(frames):
        inv = np.linalg.inv(targets[i])
        sx, sy = apply(fits[i] @ inv, xx, yy)             # target -> drawing, for the head
        out.append(remap(f, xx + HEAD * (sx - xx), yy + HEAD * (sy - yy)))
    # Antlers are bone: fit each set to the reference set on the now-aligned head, and move it rigidly.
    to_ref = lambda img, i: cv2.warpAffine(img, targets[i][:2].astype(np.float32), (W, H), flags=cv2.WARP_INVERSE_MAP | cv2.INTER_LINEAR)
    ref = feature(to_ref(out[reference], reference))
    final = []
    for i, f in enumerate(out):
        try:
            A = ecc(ref, feature(to_ref(f, i)), ANTLER_FIT)  # reference antlers -> this drawing's, in head space
        except cv2.error:
            A = np.eye(3)
        inv = np.linalg.inv(targets[i])
        rx, ry = apply(inv, xx, yy)                       # where each target pixel sits on the reference head
        weight = remap(ANTLERS.astype(np.float32), rx, ry) * HEAD
        ax, ay = apply(targets[i] @ A @ inv, xx, yy)
        final.append(remap(f, xx + weight * (ax - xx), yy + weight * (ay - yy)))
    report = [dict(eye=[round(float(v), 1) for v in eyes[i]], to=[round(float(ex[i]), 1), round(float(ey[i]), 1)],
                   angle=round(math.degrees(angles[i]), 2), to_angle=round(math.degrees(th[i]), 2),
                   scale=round(float(np.sqrt(np.linalg.det(fits[i][:2, :2]))), 3)) for i in range(len(frames))]
    return final, report


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


def warp(img, f):
    return cv2.remap(img, xx + f[..., 0], yy + f[..., 1], cv2.INTER_LINEAR, borderValue=0)


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
    At, Bt = warp(A, -t * fab), warp(B, -(1 - t) * fba)
    # Where the flow found the same animal in both, blend gently. Where a fast leg
    # could not be matched, show only the nearer drawing's leg, never two faint legs.
    miss = cv2.GaussianBlur(np.clip((np.abs(At[..., 1] - Bt[..., 1]) / 255 - 0.05) / 0.25, 0, 1), (0, 0), 2.5)
    wb = (1 - miss) * smooth(0, 1, t) + miss * float(t >= 0.5)
    return tidy((1 - wb[..., None]) * At + wb[..., None] * Bt)


def tidy(frame):
    """Drop specks the warp tore off a leg, and faint smears it stretched away from the
    solid animal; a real edge is never more than a couple of pixels from solid fur.
    Every frame gets the same treatment, so edges do not change between drawings and in-betweens."""
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


def bake_stride(frames, starts, drawings, count):
    """`count` frames at even steps through the stride: one per 60 Hz refresh at running speed."""
    n = len(frames)
    flows = {}
    baked, sources = [], []
    for k in range(count):
        p = k / count
        i = max(j for j in range(n) if starts[j] <= p + 1e-12)
        t = (p - starts[i]) / (starts[i + 1] - starts[i])
        if t < 1e-9:
            baked.append(tidy(frames[i])); sources.append(drawings[i]['source']); continue
        if i not in flows:
            A, B = frames[i], frames[(i + 1) % n]
            a, b = feature(A), feature(B)
            flows[i] = (ground_lock(flow(a, b), A, B), ground_lock(flow(b, a), B, A))
        baked.append(inbetween(frames[i], frames[(i + 1) % n], *flows[i], t)); sources.append(None)
    return baked, [k / count for k in range(count)], sources


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
    reference = next(i for i, d in enumerate(drawings) if d['source'] == spec['headReference'])

    frames = [gray(f) for f in register(drawings)]
    frames, report = heads(frames, starts[:-1], reference)
    frames = match_tones(frames)
    baked, phases, sources = bake_stride(frames, starts, drawings, spec['frames'])
    keys = {str(d['source']): round(starts[i], 6) for i, d in enumerate(drawings)}
    meta = pack([outline(f) for f in baked], phases, sources, keys, spec['perAtlas'], spec['columns'], spec['prefix'])
    module = ('// Generated by art/milu/bake.py from the drawings in art/milu. Do not edit by hand.\n'
              '// Baked stride frames: size and origin in frame pixels, unit = frame pixels per scene unit,\n'
              '// phases = where each frame sits in the stride; sources = the drawing a frame reproduces, or null for an in-between;\n'
              '// keys = where each source drawing sits in the stride.\n'
              f'export const STRIDE = {json.dumps(meta, separators=(",", ":"))};\n')
    (SITE / 'scripts/meadow/stride.js').write_text(module)
    (HERE / 'heads.json').write_text(json.dumps(report, indent=1))
    print(f'{len(baked)} frames, {meta["size"][0]}x{meta["size"][1]} px, {len(meta["atlases"])} atlases')
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
