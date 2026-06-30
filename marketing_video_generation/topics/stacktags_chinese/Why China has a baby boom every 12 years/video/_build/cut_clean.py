# Cleaner cut for white-bg subjects: rembg post-processed mask + a hard alpha
# threshold to kill the soft grey halo, then a tiny feather. Avoids the grey ring
# that alpha-matting leaves when the AI background isn't pure white.
#   python cut_clean.py couple baby_real school university office
import os, sys
from PIL import Image, ImageFilter
from rembg import remove, new_session

HERE = os.path.dirname(os.path.abspath(__file__))
RAW = os.path.join(HERE, '..', 'assets', 'raw')
OUT = os.path.join(HERE, '..', 'assets', 'photos')
os.makedirs(OUT, exist_ok=True)
session = new_session('u2net')

def cut(key, thresh=70):
    p = os.path.join(RAW, key + '.png')
    if not os.path.exists(p):
        print('  skip (missing)', key); return
    img = Image.open(p).convert('RGBA')
    out = remove(img, session=session, post_process_mask=True)
    a = out.split()[3].point(lambda v: 0 if v < thresh else 255)   # hard cut → no halo
    a = a.filter(ImageFilter.GaussianBlur(0.7))                     # tiny feather
    out.putalpha(a)
    bbox = a.point(lambda v: 255 if v > 12 else 0).getbbox()
    if bbox:
        pad = int(0.02 * max(out.width, out.height))
        out = out.crop((max(0, bbox[0]-pad), max(0, bbox[1]-pad),
                        min(out.width, bbox[2]+pad), min(out.height, bbox[3]+pad)))
    out.save(os.path.join(OUT, key + '.png'))
    import numpy as np
    frac = float((np.asarray(out)[..., 3] < 128).mean())
    print(f'  OK {key}.png  {out.width}x{out.height}  transparent={frac*100:.0f}%')

if __name__ == '__main__':
    keys = sys.argv[1:] or ['couple', 'baby_real', 'school', 'university', 'office']
    print('clean cutting:', ', '.join(keys))
    for k in keys:
        cut(k)
    print('Done.')
