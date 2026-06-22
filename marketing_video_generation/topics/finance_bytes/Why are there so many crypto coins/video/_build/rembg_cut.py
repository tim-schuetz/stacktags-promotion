# Cut crypto images out of their white background with rembg → <name>_cut.png (tight crop).
import sys, os
from rembg import remove
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
IMG = os.path.join(HERE, '..', 'assets', 'img')
names = sys.argv[1:] or ['bitcoin', 'coin-dog', 'coin-celeb', 'coin-moon']

for n in names:
    inp = Image.open(os.path.join(IMG, n + '.png')).convert('RGBA')
    out = remove(inp, alpha_matting=True,
                 alpha_matting_foreground_threshold=240,
                 alpha_matting_background_threshold=15)
    bbox = out.getbbox()
    if bbox:
        out = out.crop(bbox)
    out.save(os.path.join(IMG, n + '_cut.png'))
    print('cut', n, '->', out.size)
print('done')
