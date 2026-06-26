# Cut out the full-body Dungan people (rembg) and bake a dashed silhouette
# outline. Output -> assets/photos/<key>_dash.png   (adapted from cut_and_dash.py)
import math, os, sys
import numpy as np
from PIL import Image, ImageDraw
from rembg import remove
from skimage import measure
from scipy import ndimage

HERE = os.path.dirname(__file__)
RAW = os.path.join(HERE, '../assets/raw')
OUT = os.path.join(HERE, '../assets/photos')

def cutout(key):
    inp = Image.open(os.path.join(RAW, key + '.png')).convert('RGBA')
    out = remove(inp, alpha_matting=True,
                 alpha_matting_foreground_threshold=240,
                 alpha_matting_background_threshold=15)
    bb = out.getbbox()
    if bb:
        out = out.crop(bb)
    return out

def bake_dashed(img):
    W, H = img.size
    a = np.array(img)[:, :, 3]
    mask = ndimage.binary_fill_holes(a > 60)
    mask = ndimage.binary_dilation(mask, iterations=11)
    m = np.pad(mask.astype(float), 1, mode='constant')
    contours = measure.find_contours(m, 0.5)
    if not contours:
        return img
    c = sorted(contours, key=lambda x: -len(x))[0]
    c = measure.approximate_polygon(c, tolerance=1.6)
    pts = [(p[1] - 1, p[0] - 1) for p in c]

    P, S = 20, 3
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
        dr.ellipse([p[0]-WID/2, p[1]-WID/2, p[0]+WID/2, p[1]+WID/2], fill=COL)

    phase = 0.0
    for i in range(len(sp) - 1):
        (x0, y0), (x1, y1) = sp[i], sp[i+1]
        seg = math.hypot(x1-x0, y1-y0)
        if seg < 1e-6:
            continue
        ux, uy = (x1-x0)/seg, (y1-y0)/seg
        d = 0.0
        while d < seg:
            pos = (phase + d) % period
            on = pos < DASH_ON
            step = (DASH_ON - pos) if on else (period - pos)
            step = min(step, seg - d)
            if on:
                ax, ay = x0+ux*d, y0+uy*d
                bx, by = x0+ux*(d+step), y0+uy*(d+step)
                dr.line([(ax, ay), (bx, by)], fill=COL, width=WID)
                dot((ax, ay)); dot((bx, by))
            d += step
        phase = (phase + seg) % period

    canvas.alpha_composite(dl)
    canvas = canvas.resize((W + 2*P, H + 2*P), Image.LANCZOS)
    return canvas

for key in (sys.argv[1:] or ['dungan_man_full', 'dungan_woman_full']):
    img = bake_dashed(cutout(key))
    dst = os.path.join(OUT, key + '_dash.png')
    img.save(dst)
    print('wrote', dst, img.size)
print('done')
