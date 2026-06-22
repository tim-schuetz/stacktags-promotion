# Bake a DASHED silhouette outline onto the cut-out Tsingtao bottle → one
# transparent PNG (with padding so nothing clips). Outline follows the alpha.
import math, os
import numpy as np
from PIL import Image, ImageDraw
from skimage import measure
from scipy import ndimage

HERE = os.path.dirname(__file__)
SRC = os.path.join(HERE, '../assets/tsingtao.png')
OUT = os.path.join(HERE, '../assets/tsingtao-dashed.png')

img = Image.open(SRC).convert('RGBA')
W, H = img.size
a = np.array(img)[:, :, 3]
mask = ndimage.binary_fill_holes(a > 60)
mask = ndimage.binary_dilation(mask, iterations=11)   # outline sits a touch outside the glass
m = np.pad(mask.astype(float), 1, mode='constant')
c = sorted(measure.find_contours(m, 0.5), key=lambda x: -len(x))[0]
c = measure.approximate_polygon(c, tolerance=1.6)
pts = [(p[1] - 1, p[0] - 1) for p in c]   # (x, y)

P = 18          # transparent padding around the bottle
S = 3           # supersample for smooth dashes
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
            dot((ax, ay)); dot((bx, by))   # round caps
        d += step
    phase = (phase + seg) % period

canvas.alpha_composite(dl)
canvas = canvas.resize((W + 2 * P, H + 2 * P), Image.LANCZOS)
canvas.save(OUT)
print('wrote', OUT, '|', canvas.size, '| contour pts:', len(pts))
