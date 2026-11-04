"""Split six generated sheets into 60 PNGs and concatenate them, with no tweening."""
import hashlib
import json
from pathlib import Path
import subprocess
import zipfile

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parent
FRAME_SIZE = 416
FONT = '/Library/Fonts/Arial Unicode.ttf'


def extract():
    frames, sources = [], []
    (ROOT / 'frames').mkdir(exist_ok=True)
    for batch in range(6):
        first, last = batch * 10 + 1, batch * 10 + 10
        path = ROOT / 'sheets' / f'frames-{first:02d}-{last:02d}.png'
        sheet = Image.open(path).convert('RGB')
        width, height = sheet.size
        # One fixed transform per sheet, based on its grid, never its deer bounds.
        cell_width, cell_height = width / 5, height / 2
        scale = min(FRAME_SIZE / cell_width, FRAME_SIZE / cell_height)
        output_size = (round(cell_width * scale), round(cell_height * scale))
        offset = tuple((FRAME_SIZE - n) // 2 for n in output_size)
        for cell in range(10):
            row, col = divmod(cell, 5)
            box = tuple(round(v) for v in (
                col * cell_width, row * cell_height,
                (col + 1) * cell_width, (row + 1) * cell_height))
            cel = sheet.crop(box).resize(output_size, Image.Resampling.LANCZOS)
            frame = Image.new('RGB', (FRAME_SIZE, FRAME_SIZE), 'white')
            frame.paste(cel, offset)
            number = first + cell
            name = f'frame-{number:03d}.png'
            frame.save(ROOT / 'frames' / name)
            frames.append(frame)
            sources.append({'frame': number, 'file': 'frames/' + name,
                'sheet': str(path.relative_to(ROOT)), 'crop': list(box),
                'sha256': hashlib.sha256((ROOT / 'frames' / name).read_bytes()).hexdigest()})
    if len(frames) != 60 or len({s['sha256'] for s in sources}) != 60:
        raise ValueError('Expected exactly 60 distinct image files')
    return frames, sources


def encode(frames, fps, name, label):
    font = ImageFont.truetype(FONT, 22)
    large = [frame.resize((632, 632), Image.Resampling.LANCZOS) for frame in frames]
    process = subprocess.Popen([
        'ffmpeg', '-y', '-hide_banner', '-loglevel', 'warning',
        '-f', 'rawvideo', '-pixel_format', 'rgb24', '-video_size', '960x720',
        '-framerate', str(fps), '-i', '-', '-an', '-c:v', 'libx264',
        '-crf', '17', '-preset', 'medium', '-pix_fmt', 'yuv420p',
        '-movflags', '+faststart', str(ROOT / name),
    ], stdin=subprocess.PIPE)
    try:
        for index in range(6 * fps):
            frame_index = index % len(frames)
            canvas = Image.new('RGB', (960, 720), 'white')
            canvas.paste(large[frame_index], (164, 30))
            draw = ImageDraw.Draw(canvas)
            draw.text((36, 26), 'Deernova · 行走序列', font=font, fill='#62625e')
            draw.text((36, 670), label, font=font, fill='#62625e')
            draw.text((800, 670), f'{frame_index + 1:02d} / 60', font=font, fill='#62625e')
            process.stdin.write(canvas.tobytes())
    finally:
        process.stdin.close()
    if process.wait() != 0:
        raise RuntimeError('Video encoding failed')


def main():
    frames, sources = extract()
    # Every input picture contributes exactly one video frame on each loop.
    encode(frames, 60, 'walk-60fps.mp4', '60 帧 / 秒 · 原图顺序播放')
    encode(frames, 30, 'walk-half-speed.mp4', '半速 · 原图顺序播放')
    sheet = Image.new('RGB', (1600, 1080), '#efefed')
    draw = ImageDraw.Draw(sheet)
    font = ImageFont.truetype(FONT, 13)
    for i, frame in enumerate(frames):
        x, y = i % 10 * 160, i // 10 * 180
        sheet.paste(frame.resize((160, 160), Image.Resampling.LANCZOS), (x, y))
        draw.text((x + 8, y + 160), f'{i + 1:03d}', font=font, fill='#444')
    sheet.save(ROOT / 'contact-sheet.jpg', quality=94)
    manifest = {'frame_count': 60, 'fps': 60, 'loop_seconds': 1,
        'image_generation': 'builtin image_gen, six ten-cell sheets',
        'interpolation': False, 'crossfade': False, 'homepage_replaced': False,
        'sources': sources}
    (ROOT / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
    with zipfile.ZipFile(ROOT / 'walk-60-frames.zip', 'w', zipfile.ZIP_DEFLATED) as archive:
        for source in sources:
            archive.write(ROOT / source['file'], source['file'])
        archive.write(ROOT / 'manifest.json', 'manifest.json')
    print('Created 60 numbered PNGs, contact sheet, 60fps and half-speed videos, ZIP.')


if __name__ == '__main__':
    main()
