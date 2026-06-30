# Cut out the graduation student -> transparent PNG, tight crop.
# Black gown on grey: plain rembg (no alpha matting) gives a cleaner edge than matting (which halos).
import os
from rembg import remove
from PIL import Image

HERE = os.path.dirname(__file__)
src = os.path.join(HERE, '..', 'assets', 'img', 'grad_3.png')
inp = Image.open(src).convert('RGBA')
out = remove(inp)  # no alpha_matting -> no dark halo around the gown
bb = out.getbbox()
if bb:
    out = out.crop(bb)
dst = os.path.join(HERE, '..', 'assets', 'img', 'grad_cut.png')
out.save(dst)
print('saved', dst, out.size)

# QA: composite onto white so halos are visible
white = Image.new('RGBA', out.size, (255, 255, 255, 255))
white.alpha_composite(out)
white.convert('RGB').save(os.path.join(HERE, '..', 'assets', 'img', 'grad_cut_onwhite.png'))
print('qa saved')
