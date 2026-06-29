# Cut the chosen figures to transparent PNGs (rembg), tight-cropped. Cartoon/illustrated
# people → NO dashed outline (per the dotted-line rule).
import os
from rembg import remove
from PIL import Image

HERE = os.path.dirname(__file__)
IMG = os.path.join(HERE, '..', 'assets', 'img')
PICKS = {
    'china_scholar': 'china_scholar_1_raw.png',
    'jp_a': 'jp_a_0_raw.png',
    'jp_b': 'jp_b_1_raw.png',
    'jp_c': 'jp_c_0_raw.png',
}
for name, raw in PICKS.items():
    inp = Image.open(os.path.join(IMG, raw)).convert('RGBA')
    out = remove(inp, alpha_matting=True,
                 alpha_matting_foreground_threshold=240,
                 alpha_matting_background_threshold=15)
    bb = out.getbbox()
    if bb:
        out = out.crop(bb)
    dst = os.path.join(IMG, name + '_cut.png')
    out.save(dst)
    print('saved', dst, out.size)
