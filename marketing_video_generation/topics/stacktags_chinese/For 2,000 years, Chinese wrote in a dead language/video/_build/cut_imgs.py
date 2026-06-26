# Cut out each generated figure -> transparent, tight-cropped PNG.
import os
from rembg import remove
from PIL import Image

HERE = os.path.dirname(__file__)
IMG = os.path.join(HERE, '..', 'assets', 'img')
NAMES = ['hushi', 'hero', 'scholar', 'crowd']

for name in NAMES:
    src = os.path.join(IMG, name + '_raw.png')
    if not os.path.exists(src):
        print('MISSING', name); continue
    inp = Image.open(src).convert('RGBA')
    out = remove(inp, alpha_matting=True,
                 alpha_matting_foreground_threshold=240,
                 alpha_matting_background_threshold=15)
    bb = out.getbbox()
    if bb:
        out = out.crop(bb)
    dst = os.path.join(IMG, name + '_cut.png')
    out.save(dst)
    print('saved', name, out.size)
