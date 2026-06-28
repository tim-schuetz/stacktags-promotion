# Cut out each prop (rembg) and bake a dashed silhouette outline (single objects).
# - <key>_cut.png    : transparent cut-out, cropped to the object
# - <key>_dashed.png : cut-out with a dashed outline baked on (single objects only)
# The office (a building) is cut out but NOT dashed (it sits at the bottom edge).
import math, os, sys
import numpy as np
from PIL import Image, ImageDraw
from rembg import remove
from skimage import measure
from scipy import ndimage

HERE = os.path.dirname(__file__)
PHOTOS = os.path.join(HERE, '..', 'assets', 'photos')

# key -> dash? (False = cut only, no dashed outline)
ITEMS = {
    'dollar': True,
    'vault': True,
    'magnifier': True,
    'cash': True,
    'office': False,
}

def cut(key):
    src = os.path.join(PHOTOS, key + '.png')
    if not os.path.exists(src):
        print('  ! missing', src); return None
    inp = Image.open(src).convert('RGBA')
    out = remove(inp, alpha_matting=True,
                 alpha_matting_foreground_threshold=240,
                 alpha_matting_background_threshold=15)
    bb = out.getbbox()
    if bb:
        out = out.crop(bb)
    dst = os.path.join(PHOTOS, key + '_cut.png')
    out.save(dst)
    print(f'  cut {key}: {out.size}')
    return dst

def dash(key):
    src = os.path.join(PHOTOS, key + '_cut.png')
    img = Image.open(src).convert('RGBA')
    W, H = img.size
    a = np.array(img)[:, :, 3]
    mask = ndimage.binary_fill_holes(a > 60)
    mask = ndimage.binary_dilation(mask, iterations=11)
    m = np.pad(mask.astype(float), 1, mode='constant')
    cs = measure.find_contours(m, 0.5)
    if not cs:
        print('  ! no contour for', key); return
    c = sorted(cs, key=lambda x: -len(x))[0]
    c = measure.approximate_polygon(c, tolerance=1.6)
    pts = [(p[1] - 1, p[0] - 1) for p in c]

    P, S = 18, 3
    NW, NH = (W + 2 * P) * S, (H + 2 * P) * S
    canvas = Image.new('RGBA', (NW, NH), (0, 0, 0, 0))
    canvas.alpha_composite(img.resize((W * S, H * S), Image.LANCZOS), (P * S, P * S))

    dl = Image.new('RGBA', (NW, NH), (0, 0, 0, 0))
    dr = ImageDraw.Draw(dl)
    COL = (42, 47, 54, 235)
    WID = 4 * S
    DASH_ON, DASH_OFF = 13 * S, 9 * S
    period = DASH_ON + DASH_OFF
    sp = [((x + P) * S, (y + P) * S) for (x, y) in pts]

    def dot(p):
        dr.ellipse([p[0] - WID / 2, p[1] - WID / 2, p[0] + WID / 2, p[1] + WID / 2], fill=COL)

    phase = 0.0
    for i in range(len(sp) - 1):
        (x0, y0), (x1, y1) = sp[i], sp[i + 1]
        seg = math.hypot(x1 - x0, y1 - y0)
        if seg < 1e-6:
            continue
        ux, uy = (x1 - x0) / seg, (y1 - y0) / seg
        d = 0.0
        while d < seg:
            pos = (phase + d) % period
            on = pos < DASH_ON
            step = (DASH_ON - pos) if on else (period - pos)
            step = min(step, seg - d)
            if on:
                ax, ay = x0 + ux * d, y0 + uy * d
                bx, by = x0 + ux * (d + step), y0 + uy * (d + step)
                dr.line([(ax, ay), (bx, by)], fill=COL, width=WID)
                dot((ax, ay)); dot((bx, by))
            d += step
        phase = (phase + seg) % period

    canvas.alpha_composite(dl)
    canvas = canvas.resize((W + 2 * P, H + 2 * P), Image.LANCZOS)
    dst = os.path.join(PHOTOS, key + '_dashed.png')
    canvas.save(dst)
    print(f'  dashed {key}: {canvas.size} ({len(pts)} pts)')

if __name__ == '__main__':
    only = sys.argv[1:]
    for key, do_dash in ITEMS.items():
        if only and key not in only:
            continue
        if cut(key) and do_dash:
            dash(key)
    print('Done.')
