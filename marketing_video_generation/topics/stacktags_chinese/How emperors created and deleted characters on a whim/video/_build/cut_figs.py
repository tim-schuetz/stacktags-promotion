# Cut out each figure (foreground) -> transparent PNG, keep only the largest
# connected component (drops the painting's corner calligraphy/seal), tight crop.
import os, sys
from rembg import remove
from PIL import Image
import numpy as np
from scipy import ndimage

HERE = os.path.dirname(__file__)
IMG = os.path.join(HERE, '..', 'assets', 'img')
names = sys.argv[1:] or ['taizong', 'wuzetian', 'guanyin']

for name in names:
    src = os.path.join(IMG, name + '_raw.png')
    inp = Image.open(src).convert('RGBA')
    out = remove(inp, alpha_matting=True,
                 alpha_matting_foreground_threshold=240,
                 alpha_matting_background_threshold=15)
    arr = np.array(out)
    alpha = arr[:, :, 3]
    mask = alpha > 30
    lbl, n = ndimage.label(mask)
    if n > 1:
        sizes = ndimage.sum(np.ones_like(lbl), lbl, range(1, n + 1))
        keep = int(np.argmax(sizes)) + 1
        arr[:, :, 3] = np.where(lbl == keep, alpha, 0).astype(np.uint8)
        out = Image.fromarray(arr)
    bb = out.getbbox()
    if bb:
        out = out.crop(bb)
    dst = os.path.join(IMG, name + '_cut.png')
    out.save(dst)
    print('saved', dst, out.size)
