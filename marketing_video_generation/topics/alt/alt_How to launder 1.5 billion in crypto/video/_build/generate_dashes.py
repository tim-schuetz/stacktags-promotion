# Bake a hand-drawn DASHED outline that follows each cut-out's silhouette
# (per specific_tools_instructions/draw_dotted_line.md): trace the alpha edge,
# offset it outward, walk it and stamp round dashes -> one padded PNG with the
# image + its dashed "sticker" cut-line baked in.  numpy + PIL + skimage + scipy.
import os
import numpy as np
from PIL import Image, ImageDraw
from skimage import measure
from skimage.measure import approximate_polygon
from scipy import ndimage

HERE = os.path.dirname(os.path.abspath(__file__))
PH = os.path.join(HERE, '..', 'assets', 'photos')

SS = 3                      # supersample factor (anti-aliasing)
PAD = 30                    # px padding so the outward line is never clipped
OFFSET = 13                 # px the line sits outside the silhouette
LW = 6                      # dash line width (1x px)
ON, OFF = 17, 12            # dash on / off run lengths (1x px)
COL = (17, 146, 113, 255)   # teal-d  #119271

def make(key):
    im = Image.open(os.path.join(PH, key + '.png')).convert('RGBA')
    W, H = im.size
    cw, ch = W + 2 * PAD, H + 2 * PAD
    canv = Image.new('RGBA', (cw, ch), (0, 0, 0, 0))
    canv.alpha_composite(im, (PAD, PAD))

    mask = np.asarray(canv)[..., 3] > 40
    mask = ndimage.binary_fill_holes(mask)
    mask = ndimage.binary_dilation(mask, iterations=OFFSET)
    mask = ndimage.gaussian_filter(mask.astype(float), 2.2) > 0.5   # smooth jaggies

    conts = sorted(measure.find_contours(mask.astype(float), 0.5), key=len, reverse=True)
    if not conts:
        print('  !! no contour for', key); return

    ov = Image.new('RGBA', (cw * SS, ch * SS), (0, 0, 0, 0))
    d = ImageDraw.Draw(ov)
    r = LW * SS / 2.0
    period = ON + OFF

    poly = approximate_polygon(conts[0], tolerance=1.5)   # (row,col)
    pts = poly[:, ::-1].astype(float)                     # -> (x,y)
    pts = np.vstack([pts, pts[:1]])                       # close the loop
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
    canv.save(os.path.join(PH, key + '_dash.png'))
    print(f'  OK {key}_dash.png  {canv.size[0]}x{canv.size[1]}  (src {W}x{H})')

if __name__ == '__main__':
    import sys
    keys = sys.argv[1:] or ['coin', 'tumbler']
    print('Baking dashed outlines:', ', '.join(keys))
    for k in keys:
        make(k)
    print('Done.')
