"""Compare whole-frame horizontal placement of the original sixty drawings.

This is video composition only: no pose interpolation, head patch, scale change,
vertical stabilization or image regeneration. Originals are kept in walk-60/frames.
"""
import json
from pathlib import Path
import subprocess
import sys

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT.parents[1] / 'art/milu'))
from motion import horizontal_offsets


def encode(frames, name, size):
    p = subprocess.Popen(['ffmpeg', '-y', '-hide_banner', '-loglevel', 'warning',
        '-f', 'rawvideo', '-pixel_format', 'rgb24', '-video_size', f'{size[0]}x{size[1]}',
        '-framerate', '60', '-i', '-', '-an', '-c:v', 'libx264', '-crf', '17',
        '-preset', 'medium', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', str(ROOT / name)], stdin=subprocess.PIPE)
    try:
        for i in range(360):
            p.stdin.write(frames[i % 60].tobytes())
    finally:
        p.stdin.close()
    if p.wait():
        raise RuntimeError('Video encoding failed')


def main():
    frames = [np.asarray(Image.open(p).convert('RGB')) for p in sorted((ROOT.parent / 'walk-60/frames').glob('frame-*.png'))]
    assert len(frames) == 60
    gray = [cv2.cvtColor(f, cv2.COLOR_RGB2GRAY) for f in frames]
    offsets, before = horizontal_offsets(gray)
    aligned = [cv2.warpAffine(f, np.float32([[1, 0, x], [0, 1, 0]]), (416, 416),
        flags=cv2.INTER_LANCZOS4, borderMode=cv2.BORDER_CONSTANT, borderValue=(255, 255, 255))
        for f, x in zip(frames, offsets)]
    _, after = horizontal_offsets([cv2.cvtColor(f, cv2.COLOR_RGB2GRAY) for f in aligned])
    font = ImageFont.truetype('/Library/Fonts/Arial Unicode.ttf', 23)
    comparison, corrected = [], []
    for i, (original, fixed) in enumerate(zip(frames, aligned)):
        canvas = Image.new('RGB', (1280, 720), 'white')
        canvas.paste(Image.fromarray(original).resize((610, 610), Image.Resampling.LANCZOS), (15, 60))
        canvas.paste(Image.fromarray(fixed).resize((610, 610), Image.Resampling.LANCZOS), (655, 60))
        draw = ImageDraw.Draw(canvas)
        draw.text((32, 24), '原始序列', font=font, fill='#444444')
        draw.text((672, 24), '整只鹿统一校正横向位置', font=font, fill='#444444')
        draw.line((640, 22, 640, 662), fill='#dddddd')
        draw.text((32, 675), f'60 张原图 · 60 fps · 第 {i + 1:02d} 帧', font=font, fill='#666666')
        comparison.append(canvas)
        solo = Image.new('RGB', (960, 720), 'white')
        solo.paste(Image.fromarray(fixed).resize((632, 632), Image.Resampling.LANCZOS), (164, 30))
        draw = ImageDraw.Draw(solo)
        draw.text((36, 26), 'Deernova · 行走序列', font=font, fill='#62625e')
        draw.text((36, 670), '60 fps · 统一横向位置 · 保留原姿态', font=font, fill='#62625e')
        draw.text((800, 670), f'{i + 1:02d} / 60', font=font, fill='#62625e')
        corrected.append(solo)
    encode(comparison, 'walk-comparison.mp4', (1280, 720))
    encode(corrected, 'walk-stabilized.mp4', (960, 720))
    comparison[9].save(ROOT / 'comparison.jpg', quality=94)
    report = dict(frames=60, fps=60, correction='whole-frame horizontal translation only',
        offsetX=offsets, before=before, after=after,
        limitation='Torso registration measures placement, not anatomical or gait continuity. Original generated pose jumps remain.')
    (ROOT / 'registration.json').write_text(json.dumps(report, indent=2) + '\n')
    print(json.dumps(dict(before=before, after=after), indent=2))


if __name__ == '__main__':
    main()
