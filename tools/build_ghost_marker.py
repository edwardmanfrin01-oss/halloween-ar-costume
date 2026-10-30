"""Build a printable ARToolKit marker and its four-orientation pattern."""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'assets/markers'
source = Image.open(ASSETS / 'ghost_icon_marker-removebg-preview.png').convert('RGBA')
# Flatten transparency onto white before encoding, including the eye openings.
source.thumbnail((352, 352), Image.Resampling.LANCZOS)
inner = Image.new('RGB', (400, 400), 'white')
inner.paste(source, ((400 - source.width) // 2, (400 - source.height) // 2), source)

# Match AR.js's default 0.5 pattern ratio and 10% outer white margin.
marker = Image.new('RGB', (1000, 1000), 'white')
marker.paste('black', (100, 100, 900, 900))
marker.paste(inner, (300, 300))
marker.save(ASSETS / 'ghost-marker.png')

# ARToolKit format: four counterclockwise rotations, BGR planes, 16 x 16 samples.
# Reference: AR.js 3.4.7 three.js/examples/marker-training/threex-arpatternfile.js.
sample = inner.resize((16, 16), Image.Resampling.BILINEAR)
blocks = []
for angle in (0, 90, 180, 270):
    rotated = sample.rotate(angle)
    lines = []
    for channel in (2, 1, 0):
        for y in range(16):
            lines.append(' '.join(f'{rotated.getpixel((x, y))[channel]:3d}' for x in range(16)))
    blocks.append('\n'.join(lines))
(ASSETS / 'ghost-marker.patt').write_text('\n\n'.join(blocks) + '\n', encoding='ascii')
values = [int(value) for value in (ASSETS / 'ghost-marker.patt').read_text().split()]
assert len(values) == 4 * 3 * 16 * 16
assert all(0 <= value <= 255 for value in values)
print('Created ghost-marker.png and ghost-marker.patt (3072 samples).')
