# Bake a teal dashed outline that follows a cut-out's silhouette.
# Reads ../assets/<key>_cut.png, writes ../assets/<key>_dash.png.
import os, sys
import numpy as np
from PIL import Image, ImageDraw
from skimage import measure
from skimage.measure import approximate_polygon
from scipy import ndimage

HERE = os.path.dirname(os.path.abspath(__file__))
AS = os.path.join(HERE, '..', 'assets')
SS, PAD, OFFSET, LW, ON, OFF = 3, 30, 13, 6, 17, 12
COL = (17, 146, 113, 255)   # teal-d #119271

def make(key):
    im = Image.open(os.path.join(AS, key + '_cut.png')).convert('RGBA')
    W, H = im.size
    cw, ch = W + 2 * PAD, H + 2 * PAD
    canv = Image.new('RGBA', (cw, ch), (0, 0, 0, 0))
    canv.alpha_composite(im, (PAD, PAD))
    mask = np.asarray(canv)[..., 3] > 40
    mask = ndimage.binary_fill_holes(mask)
    mask = ndimage.binary_dilation(mask, iterations=OFFSET)
    mask = ndimage.gaussian_filter(mask.astype(float), 2.2) > 0.5
    conts = sorted(measure.find_contours(mask.astype(float), 0.5), key=len, reverse=True)
    if not conts:
        print('  !! no contour for', key); return
    ov = Image.new('RGBA', (cw * SS, ch * SS), (0, 0, 0, 0))
    d = ImageDraw.Draw(ov)
    r = LW * SS / 2.0
    period = ON + OFF
    poly = approximate_polygon(conts[0], tolerance=1.5)
    pts = poly[:, ::-1].astype(float)
    pts = np.vstack([pts, pts[:1]])
    seg = np.hypot(np.diff(pts[:, 0]), np.diff(pts[:, 1]))
    acc = 0.0
    for i in range(len(pts) - 1):
        p0, p1, L = pts[i], pts[i + 1], seg[i]
        if L < 1e-6:
            continue
        steps = max(1, int(L))
        for s in range(steps):
            t = s / steps
            if (acc + t * L) % period < ON:
                x = (p0[0] + (p1[0] - p0[0]) * t) * SS
                y = (p0[1] + (p1[1] - p0[1]) * t) * SS
                d.ellipse([x - r, y - r, x + r, y + r], fill=COL)
        acc += L
    ov = ov.resize((cw, ch), Image.LANCZOS)
    canv.alpha_composite(ov)
    canv.save(os.path.join(AS, key + '_dash.png'))
    print(f'  OK {key}_dash.png  {canv.size[0]}x{canv.size[1]}  (src {W}x{H})')

if __name__ == '__main__':
    for k in (sys.argv[1:] or ['mixer']):
        make(k)
    print('Done.')
