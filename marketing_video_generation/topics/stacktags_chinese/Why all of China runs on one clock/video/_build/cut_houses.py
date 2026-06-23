# rembg cut-out (crop to object) for the night houses — NO dashed outline (they form a city row).
import os
from PIL import Image
from rembg import remove

HERE = os.path.dirname(__file__)
PH = os.path.join(HERE, '../assets/photos')
for key in ['house1', 'house2', 'house3', 'house4', 'house5']:
    src = os.path.join(PH, key + '_raw.png')
    if not os.path.exists(src):
        print('missing', src); continue
    inp = Image.open(src).convert('RGBA')
    out = remove(inp, alpha_matting=True, alpha_matting_foreground_threshold=240, alpha_matting_background_threshold=15)
    bb = out.getbbox()
    if bb:
        out = out.crop(bb)
    out.save(os.path.join(PH, key + '.png'))
    print('wrote', key + '.png', out.size)
