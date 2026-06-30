# Background-remove the raw renders in ../assets/raw to transparent cut-outs
# in ../assets/photos using rembg (u2net). Then autocrop + light feather.
import os, sys
from PIL import Image, ImageFilter
from rembg import remove, new_session

HERE = os.path.dirname(os.path.abspath(__file__))
RAW  = os.path.join(HERE, '..', 'assets', 'raw')
OUT  = os.path.join(HERE, '..', 'assets', 'photos')
os.makedirs(OUT, exist_ok=True)

session = new_session('u2net')

def cut(key):
    p = os.path.join(RAW, key + '.png')
    if not os.path.exists(p):
        print('  skip (missing)', key); return
    img = Image.open(p).convert('RGBA')
    out = remove(img, session=session,
                 alpha_matting=True,
                 alpha_matting_foreground_threshold=240,
                 alpha_matting_background_threshold=15,
                 alpha_matting_erode_size=8)
    # light feather of the alpha edge
    a = out.split()[3].filter(ImageFilter.GaussianBlur(0.8))
    out.putalpha(a)
    # autocrop to content + small padding
    bbox = out.split()[3].point(lambda v: 255 if v > 12 else 0).getbbox()
    if bbox:
        pad = int(0.03 * max(out.width, out.height))
        l = max(0, bbox[0]-pad); t = max(0, bbox[1]-pad)
        r = min(out.width, bbox[2]+pad); b = min(out.height, bbox[3]+pad)
        out = out.crop((l, t, r, b))
    out.save(os.path.join(OUT, key + '.png'))
    import numpy as np
    frac = float((np.asarray(out)[..., 3] < 128).mean())
    print(f'  OK {key}.png  {out.width}x{out.height}  transparent={frac*100:.0f}%')

keys = sys.argv[1:] or ['tiger', 'tofu', 'astronaut']
print('rembg cutting:', ', '.join(keys))
for k in keys:
    cut(k)
print('Done.')
