# Cut out each raw Imagen photo (rembg) and bake a dashed silhouette outline.
# Run with Python 3.14 (where rembg + scikit-image are installed):
#   py -3.14 crop_images.py            # all
#   py -3.14 crop_images.py bitcoin    # one
import sys, os, math
import numpy as np
from PIL import Image, ImageDraw
from rembg import remove
from scipy import ndimage
from skimage import measure
from skimage.measure import approximate_polygon

RAW = os.path.join(os.path.dirname(__file__), '..', 'assets', 'raw')
OUT = os.path.join(os.path.dirname(__file__), '..', 'assets', 'photos')
os.makedirs(OUT, exist_ok=True)

# dashed-outline params
DILATE = 14          # distance of the line from the object (iterations)
DASH_ON, DASH_OFF = 16, 11
STROKE = 7           # line width (in supersampled space it's *SS)
SS = 3               # supersample factor for smooth anti-aliasing
PAD = 26             # transparent padding so the outset line isn't clipped
TEAL = (53, 162, 146, 255)   # --stk-teal


def cutout(key):
    raw = Image.open(os.path.join(RAW, key + '.png')).convert('RGBA')
    out = remove(raw, alpha_matting=True,
                 alpha_matting_foreground_threshold=240,
                 alpha_matting_background_threshold=15)
    bbox = out.getbbox()
    if bbox:
        out = out.crop(bbox)
    out.save(os.path.join(OUT, key + '.png'))
    return out


def dashed(key, cut):
    # pad so the dilated outline has room
    w, h = cut.size
    canvas = Image.new('RGBA', (w + 2 * PAD, h + 2 * PAD), (0, 0, 0, 0))
    canvas.paste(cut, (PAD, PAD), cut)

    alpha = np.array(canvas.split()[-1])
    mask = alpha > 40
    mask = ndimage.binary_fill_holes(mask)
    mask = ndimage.binary_dilation(mask, iterations=DILATE)

    contours = measure.find_contours(mask.astype(float), 0.5)
    if not contours:
        canvas.save(os.path.join(OUT, key + '_dash.png'))
        return
    contour = max(contours, key=len)
    contour = approximate_polygon(contour, tolerance=1.2)  # (row, col) pts

    # supersample drawing surface
    big = Image.new('RGBA', (canvas.width * SS, canvas.height * SS), (0, 0, 0, 0))
    d = ImageDraw.Draw(big)
    pts = [(c * SS, r * SS) for r, c in contour]  # (x, y)

    # walk arc length, alternate dash on/off, round caps
    on = True
    carry = 0.0
    seg_target = DASH_ON * SS
    rad = STROKE * SS / 2
    for i in range(len(pts) - 1):
        x0, y0 = pts[i]
        x1, y1 = pts[i + 1]
        seg = math.hypot(x1 - x0, y1 - y0)
        if seg == 0:
            continue
        ux, uy = (x1 - x0) / seg, (y1 - y0) / seg
        dist = 0.0
        while dist < seg:
            step = min(seg_target - carry, seg - dist)
            ax, ay = x0 + ux * dist, y0 + uy * dist
            bx, by = x0 + ux * (dist + step), y0 + uy * (dist + step)
            if on:
                d.line([(ax, ay), (bx, by)], fill=TEAL, width=int(STROKE * SS))
                d.ellipse([ax - rad, ay - rad, ax + rad, ay + rad], fill=TEAL)
                d.ellipse([bx - rad, by - rad, bx + rad, by + rad], fill=TEAL)
            dist += step
            carry += step
            if carry >= seg_target - 0.001:
                carry = 0.0
                on = not on
                seg_target = (DASH_ON if on else DASH_OFF) * SS

    big = big.resize((canvas.width, canvas.height), Image.LANCZOS)
    canvas.alpha_composite(big)
    canvas.save(os.path.join(OUT, key + '_dash.png'))


if __name__ == '__main__':
    keys = sys.argv[1:] or [f[:-4] for f in os.listdir(RAW) if f.endswith('.png')]
    for k in keys:
        try:
            cut = cutout(k)
            dashed(k, cut)
            print('OK', k, '->', k + '.png +', k + '_dash.png')
        except Exception as e:
            print('X', k, e)
