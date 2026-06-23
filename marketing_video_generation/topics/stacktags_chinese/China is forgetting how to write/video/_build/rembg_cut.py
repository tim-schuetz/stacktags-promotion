# Cut out the student (foreground) from the generated photo -> transparent PNG, tight crop.
import os
from rembg import remove
from PIL import Image

HERE = os.path.dirname(__file__)
src = os.path.join(HERE, '..', 'assets', 'img', 'student_raw.png')
inp = Image.open(src).convert('RGBA')
out = remove(inp, alpha_matting=True,
             alpha_matting_foreground_threshold=240,
             alpha_matting_background_threshold=15)
bb = out.getbbox()
if bb:
    out = out.crop(bb)
dst = os.path.join(HERE, '..', 'assets', 'img', 'student_cut.png')
out.save(dst)
print('saved', dst, out.size)
