"""Register a newly generated walking atlas: write art/milu/drawings.json from it.

The atlas is one imagegen sheet of 8 walking poses, 4 columns by 2 rows, in order. Its two
halves are drawn alike: in this side view the near and far legs look the same, so the second
half of a stride reuses the first half's drawings with the legs' roles swapped, and the page
plays both halves with consistent near/far occlusion. `--cells` picks which cell plays each moment of that half stride.
The script finds every deer, measures its torso and lowest hoof, gives all of them one
scale, and nudges each drawing sideways so that the planted hooves move back steadily from
one drawing to the next (the generator places them a little unevenly).

Usage: python art/milu/register.py source/milu-walk.png --cells 1 6 3 8 > art/milu/drawings.json
       (paths relative to art/milu; then run bake.py)
"""
import argparse, json, pathlib, statistics, sys
import numpy as np
import cv2

HERE = pathlib.Path(__file__).resolve().parent
OLD_UNIT, OLD_TORSO = 187, 337        # the gallop drawings: torso length in px at 187 px per scene unit


def measure(path):
    """Each deer in the atlas, in reading order: its box, torso centre and length, and lowest point."""
    im = cv2.imread(path, cv2.IMREAD_UNCHANGED)
    assert im.shape[2] == 4, 'atlas must be RGBA'
    solid = (im[..., 3] > 128).astype(np.uint8)
    # Group the pieces of one animal (antler tips, hooves) by closing small gaps, then take the big groups.
    n, lab, st, cen = cv2.connectedComponentsWithStats(cv2.dilate(solid, np.ones((25, 25), np.uint8)))
    deer = sorted((k for k in range(1, n) if st[k, cv2.CC_STAT_AREA] > 20000),
                  key=lambda k: (int(cen[k][1] // (im.shape[0] / 2)), cen[k][0]))
    out = []
    for k in deer:
        m = (lab == k) & (solid > 0)
        ys, xs = np.nonzero(m)
        # The torso: what survives a large opening (legs, neck, antlers and tail are thinner).
        body = cv2.morphologyEx(m.astype(np.uint8), cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (45, 45)))
        bys, bxs = np.nonzero(body)
        out.append(dict(rect=[int(xs.min()) - 8, int(ys.min()) - 8, int(xs.max() - xs.min()) + 17, int(ys.max() - ys.min()) + 17],
                        torso=[float(bxs.mean()), float(bys.mean())], torso_len=int(bxs.max() - bxs.min()), ground=int(ys.max())))
    return out, im[..., 3]


def planted(alpha, m):
    """Centres of the hooves touching this deer's ground line, relative to its torso."""
    x, y, w, h = m['rect']; g = m['ground']
    band = np.r_[0, (alpha[g - 6:g + 1, x:x + w] > 128).any(axis=0).astype(np.int8), 0]
    e = np.flatnonzero(np.diff(band))
    return [(s + t) / 2 + x - m['torso'][0] for s, t in zip(e[::2], e[1::2])]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('atlas', help='the walking atlas, relative to art/milu')
    parser.add_argument('--rate', type=float, default=.75, help='full strides per second')
    parser.add_argument('--frames', type=int, default=160, help='baked frames per full stride; oversamples 60 Hz playback')
    parser.add_argument('--per-atlas', type=int, default=80, help='baked frames per output atlas')
    parser.add_argument('--columns', type=int, default=8, help='columns in each output atlas')
    parser.add_argument('--cells', type=int, nargs='+', default=[1, 6, 3, 8], help='the cell for each moment of the loop')
    parser.add_argument('--alert', type=int, nargs='+', default=[1], help='moments with a foreleg raised, to stop on')
    args = parser.parse_args()
    found, alpha = measure(str(HERE / args.atlas))
    assert len(found) == 8, f'found {len(found)} deer'
    deer = [dict(found[c - 1]) for c in args.cells]
    n = len(deer)

    # Nudge each drawing sideways (least squares, kept small) so every planted hoof moves back
    # by the same step from one drawing to the next.
    feet = [planted(alpha, m) for m in deer]
    moves = [y - x for i in range(n) for x in feet[i] for y in feet[(i + 1) % n] if -40 <= y - x <= 10]
    guess = statistics.median([d for d in moves if d < 0])
    pairs = []
    for i in range(n):
        for x in feet[i]:
            near = [y - x for y in feet[(i + 1) % n] if -40 <= y - x <= 10]
            if near: pairs.append((i, (i + 1) % n, x, x + min(near, key=lambda d: abs(d - guess))))
    rows, rhs = [], []
    for i, j, x0, x1 in pairs:                 # (x1 + o_j) - (x0 + o_i) + step = 0
        r = np.zeros(n + 1); r[j] += 1; r[i] -= 1; r[n] = 1; rows.append(r); rhs.append(x0 - x1)
    for i in range(n):                          # keep the nudges small
        r = np.zeros(n + 1); r[i] = 0.5; rows.append(r); rhs.append(0)
    sol, *_ = np.linalg.lstsq(np.array(rows), np.array(rhs), rcond=None)
    nudge = sol[:n] - sol[:n].mean()
    spread = lambda o: np.std([(x1 + o[j]) - (x0 + o[i]) for i, j, x0, x1 in pairs])
    print(f'cells {args.cells}: {len(pairs)} planted steps of {-sol[n]:.1f} px; spread {spread(np.zeros(n)):.1f} -> '
          f'{spread(nudge):.1f} px; nudges {np.round(nudge, 1).tolist()}', file=sys.stderr)

    unit = round(OLD_UNIT * statistics.median(m['torso_len'] for m in deer) / OLD_TORSO, 2)
    name = pathlib.Path(args.atlas).name
    drawings = [dict(source=101 + k, atlas=name, rect=m['rect'],
                     origin=[round(m['torso'][0] - nudge[k] - m['rect'][0], 1), round(m['ground'] - m['rect'][1], 1)],
                     unit=unit, duration=1) for k, m in enumerate(deer)]
    # Written to stdout and usually redirected over drawings.json, so read nothing from it.
    out = dict(bodyReference=101, landmarks='landmarks.json', halves=2, frames=args.frames, rate=args.rate, alert=[100 + a for a in args.alert],
               prefix='milu-run', perAtlas=args.per_atlas, columns=args.columns, drawings=drawings)
    print(json.dumps(out, indent=1, ensure_ascii=False))


if __name__ == '__main__':
    main()
