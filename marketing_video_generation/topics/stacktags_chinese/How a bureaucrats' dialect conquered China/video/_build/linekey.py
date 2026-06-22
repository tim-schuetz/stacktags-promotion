# Turn a black-on-white line drawing into a transparent PNG (white -> alpha 0,
# dark lines -> opaque near-black). Better than rembg for sketchy line art.
# Run: py -3.14 linekey.py doodle_house doodle_horse doodle_person
import sys, os
import numpy as np
from PIL import Image

BASE = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'assets'))
RAW = os.path.join(BASE, 'raw')
PHOTOS = os.path.join(BASE, 'photos')

for key in sys.argv[1:]:
    inp = os.path.join(RAW, key + '.png')
    if not os.path.exists(inp):
        print('  skip (missing):', inp); continue
    img = Image.open(inp).convert('RGB')
    arr = np.asarray(img).astype(np.float32)
    lum = arr @ np.array([0.299, 0.587, 0.114], dtype=np.float32)
    # hard key: keep only the dark INK lines; drop white AND any grey fill/shading
    a = np.clip((135.0 - lum) * 6.0, 0, 255).astype(np.uint8)
    h, w = a.shape
    rgba = np.zeros((h, w, 4), dtype=np.uint8)
    rgba[..., 0] = 28; rgba[..., 1] = 28; rgba[..., 2] = 28    # near-black ink
    rgba[..., 3] = a
    out = Image.fromarray(rgba, 'RGBA')
    bb = out.getbbox()
    if bb:
        out = out.crop(bb)
    dst = os.path.join(PHOTOS, key + '_cut.png')
    out.save(dst)
    print('  OK', key + '_cut.png', out.size)
print('done')
