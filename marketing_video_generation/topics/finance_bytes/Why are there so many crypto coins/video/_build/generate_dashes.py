# Bake a dashed silhouette outline around a cut-out object (single objects only).
# Input <name>_cut.png  ->  output <name>-dashed.png (transparent, padded).
import sys, os, math
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage
from skimage import measure
from skimage.measure import approximate_polygon

HERE = os.path.dirname(os.path.abspath(__file__))
IMG = os.path.join(HERE, '..', 'assets', 'img')

COLOR = (17, 146, 113, 255)   # --stk-teal-d
SS = 3                        # supersample for clean anti-aliased dashes

def make_dashed(name, dilate=12, dash_on=15, dash_off=11, width=6, pad=30):
    src = Image.open(os.path.join(IMG, name + '_cut.png')).convert('RGBA')
    W, H = src.width + pad * 2, src.height + pad * 2
    base = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    base.paste(src, (pad, pad), src)

    alpha = np.array(base.split()[-1])
    mask = alpha > 40
    mask = ndimage.binary_fill_holes(mask)
    mask = ndimage.binary_dilation(mask, iterations=dilate)

    contours = measure.find_contours(mask.astype(float), 0.5)
    if not contours:
        base.save(os.path.join(IMG, name + '-dashed.png')); print('no contour', name); return
    cont = max(contours, key=len)
    cont = approximate_polygon(cont, tolerance=1.4)          # (row, col)
    pts = [(c * SS, r * SS) for r, c in cont]                # (x, y) supersampled

    big = Image.new('RGBA', (W * SS, H * SS), (0, 0, 0, 0))
    d = ImageDraw.Draw(big)
    on, off = dash_on * SS, dash_off * SS
    period = on + off
    r = width * SS / 2.0
    acc = 0.0
    prev = None
    step = 1.0
    for i in range(len(pts)):
        x0, y0 = pts[i]
        x1, y1 = pts[(i + 1) % len(pts)]
        seg = math.hypot(x1 - x0, y1 - y0)
        n = max(1, int(seg / step))
        for k in range(n):
            t = k / n
            x, y = x0 + (x1 - x0) * t, y0 + (y1 - y0) * t
            if prev is not None:
                acc += math.hypot(x - prev[0], y - prev[1])
            prev = (x, y)
            if (acc % period) < on:
                d.ellipse([x - r, y - r, x + r, y + r], fill=COLOR)

    big = big.resize((W, H), Image.LANCZOS)
    out = Image.alpha_composite(big, base)   # object on top of the dashes
    out.save(os.path.join(IMG, name + '-dashed.png'))
    print('dashed', name, '->', out.size)

for n in (sys.argv[1:] or ['bitcoin']):
    make_dashed(n)
print('done')
