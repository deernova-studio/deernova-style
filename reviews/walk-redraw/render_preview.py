"""Render the independent walk study; never writes website assets.

Requires Pillow, FFmpeg, and the official RIFE ncnn v4.6 executable/model.
Pass --frames to reuse a previously generated 204-frame sequence.
"""
import argparse
import math
from pathlib import Path
import subprocess
import tempfile

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parent
KEYS = 16
CYCLE_SECONDS = 1.6
SAMPLES = 192  # 120 samples/sec: normal and half speed both render at 60 fps.


def generate_frames(work, executable, model):
    source = Image.open(ROOT / 'walk-poses-v2.png').convert('RGB')
    w, h = source.size
    size = (math.ceil(w / 8) * 2 + 2, math.ceil(h / 8) * 2 + 2)
    inputs, outputs = work / 'input', work / 'output'
    inputs.mkdir()
    outputs.mkdir()
    for i in range(KEYS + 1):
        col, row = i % KEYS % 4, i % KEYS // 4
        box = tuple(round(n) for n in (
            col * w / 4, row * h / 4, (col + 1) * w / 4, (row + 1) * h / 4))
        cel = Image.new('RGB', size, 'white')
        cel.paste(source.crop(box), (0, 0))
        cel.save(inputs / f'{i:02d}.png')
    # RIFE uses input_count / output_count. Appending the first key and
    # requesting 17 * 12 samples includes the closing interval at exact times.
    subprocess.run([
        str(executable), '-i', str(inputs), '-o', str(outputs),
        '-m', str(model), '-n', '204', '-x', '-z', '-j', '2:2:2',
    ], check=True)
    return outputs


def encode(frames, output, font_path):
    frames = [Image.open(frames / f'{i + 1:08d}.png').convert('RGB').resize(
        (632, 632), Image.Resampling.LANCZOS) for i in range(SAMPLES)]
    font = ImageFont.truetype(str(font_path), 22)
    command = [
        'ffmpeg', '-y', '-hide_banner', '-loglevel', 'warning',
        '-f', 'rawvideo', '-pixel_format', 'rgb24', '-video_size', '960x720',
        '-framerate', '60', '-i', '-', '-an', '-c:v', 'libx264',
        '-crf', '17', '-preset', 'medium', '-pix_fmt', 'yuv420p',
        '-movflags', '+faststart', str(output),
    ]
    process = subprocess.Popen(command, stdin=subprocess.PIPE)
    try:
        for i in range(480):
            normal = i < 288
            index = (i * 2) % SAMPLES if normal else i - 288
            canvas = Image.new('RGB', (960, 720), 'white')
            canvas.paste(frames[index], (164, 32))
            draw = ImageDraw.Draw(canvas)
            draw.text((40, 30), 'Deernova · 行走样片', font=font, fill='#666660')
            draw.text((40, 670), '正常速度' if normal else '半速慢放',
                      font=font, fill='#666660')
            if i == 30:
                canvas.save(ROOT / 'poster.jpg', quality=93)
            process.stdin.write(canvas.tobytes())
    finally:
        process.stdin.close()
    if process.wait() != 0:
        raise RuntimeError('Video encoding failed')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--rife', type=Path)
    parser.add_argument('--model', type=Path)
    parser.add_argument('--frames', type=Path)
    parser.add_argument('--font', type=Path, default=Path('/Library/Fonts/Arial Unicode.ttf'))
    parser.add_argument('--output', type=Path, default=ROOT / 'walk-preview.mp4')
    args = parser.parse_args()
    if not args.frames and not (args.rife and args.model):
        parser.error('Provide --rife and --model, or an existing --frames directory')
    with tempfile.TemporaryDirectory(prefix='deernova-walk-study-') as temp:
        frames = args.frames or generate_frames(Path(temp), args.rife, args.model)
        encode(frames, args.output, args.font)


if __name__ == '__main__':
    main()
