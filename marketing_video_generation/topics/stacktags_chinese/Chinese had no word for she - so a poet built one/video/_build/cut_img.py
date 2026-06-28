# Generalized: cut out <name>_raw.png (rembg) + bake dashed turquoise outline -> <name>_dashed.png
# Usage: python cut_img.py <name>
import os, sys, math
import numpy as np
from rembg import remove
from PIL import Image, ImageDraw
from scipy import ndimage
from skimage import measure

NAME = sys.argv[1] if len(sys.argv) > 1 else 'man'
HERE = os.path.dirname(__file__)
IMG = os.path.join(HERE, '..', 'assets', 'img')

inp = Image.open(os.path.join(IMG, NAME + '_raw.png')).convert('RGBA')
cut = remove(inp, alpha_matting=True, alpha_matting_foreground_threshold=240, alpha_matting_background_threshold=15)
bb = cut.getbbox()
if bb:
    cut = cut.crop(bb)
cut.save(os.path.join(IMG, NAME + '_cut.png'))
print('cut', NAME, cut.size)

im = cut
W, H = im.size
alpha = np.array(im)[:, :, 3]
SS, PAD, DIL = 3, 40, 9
DASH_ON, DASH_OFF, WIDTH = 16, 11, 7
COLOR = (17, 146, 113, 255)

mask = alpha > 100
lbl, n = ndimage.label(mask)
if n > 1:
    sizes = ndimage.sum(np.ones_like(lbl), lbl, range(1, n + 1))
    mask = lbl == (int(np.argmax(sizes)) + 1)
mask = ndimage.binary_fill_holes(mask)

big = np.zeros((H + 2 * PAD, W + 2 * PAD), dtype=bool)
big[PAD:PAD + H, PAD:PAD + W] = mask
dbig = ndimage.binary_dilation(big, iterations=DIL)

contours = measure.find_contours(dbig.astype(float), 0.5)
def arclen(c):
    d = np.diff(c, axis=0)
    return float(np.sum(np.hypot(d[:, 0], d[:, 1])))
contour = max(contours, key=arclen)
pts = [(p[1] * SS, p[0] * SS) for p in contour]
if pts[0] != pts[-1]:
    pts.append(pts[0])

canvas = Image.new('RGBA', ((W + 2 * PAD) * SS, (H + 2 * PAD) * SS), (0, 0, 0, 0))
draw = ImageDraw.Draw(canvas)
r = WIDTH * SS / 2
on, seg_remain = True, DASH_ON * SS
for i in range(len(pts) - 1):
    x0, y0 = pts[i]; x1, y1 = pts[i + 1]
    seg_len = math.hypot(x1 - x0, y1 - y0)
    if seg_len == 0:
        continue
    dx, dy = (x1 - x0) / seg_len, (y1 - y0) / seg_len
    pos = 0.0
    while pos < seg_len:
        step = min(seg_remain, seg_len - pos)
        if on:
            sx, sy = x0 + dx * pos, y0 + dy * pos
            ex, ey = x0 + dx * (pos + step), y0 + dy * (pos + step)
            draw.line([(sx, sy), (ex, ey)], fill=COLOR, width=WIDTH * SS)
            draw.ellipse([sx - r, sy - r, sx + r, sy + r], fill=COLOR)
            draw.ellipse([ex - r, ey - r, ex + r, ey + r], fill=COLOR)
        pos += step
        seg_remain -= step
        if seg_remain <= 1e-4:
            on = not on
            seg_remain = (DASH_ON if on else DASH_OFF) * SS

canvas = canvas.resize((W + 2 * PAD, H + 2 * PAD), Image.LANCZOS)
out = Image.new('RGBA', (W + 2 * PAD, H + 2 * PAD), (0, 0, 0, 0))
out.paste(canvas, (0, 0), canvas)
out.paste(im, (PAD, PAD), im)
out.save(os.path.join(IMG, NAME + '_dashed.png'))
print('saved', NAME + '_dashed', out.size)
