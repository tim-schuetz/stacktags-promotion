# Trace the cut-out student's silhouette and bake a dashed turquoise outline
# offset slightly outward. Walks the RAW (dense) contour so the line follows the
# exact silhouette. Output: student_dashed.png (+ capture/dash_preview.png on white).
import os, math
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage
from skimage import measure

HERE = os.path.dirname(__file__)
IMG = os.path.join(HERE, '..', 'assets', 'img')
im = Image.open(os.path.join(IMG, 'student_cut.png')).convert('RGBA')
W, H = im.size
alpha = np.array(im)[:, :, 3]

SS = 3            # supersample for clean anti-aliasing
PAD = 40          # transparent margin so the outward line isn't clipped
DIL = 9           # dilation iterations = gap between line and object
DASH_ON, DASH_OFF = 16, 11
WIDTH = 7
COLOR = (17, 146, 113, 255)   # --stk-teal-d

# clean binary mask: largest connected component, holes filled
mask = alpha > 100
lbl, n = ndimage.label(mask)
if n > 1:
    sizes = ndimage.sum(np.ones_like(lbl), lbl, range(1, n + 1))
    mask = lbl == (int(np.argmax(sizes)) + 1)
mask = ndimage.binary_fill_holes(mask)

# The cut-out is tightly cropped, so the figure touches all four image edges.
# Embed the mask in a PADDED array BEFORE dilating, otherwise the dilated mask
# hits the array border and find_contours returns broken (open) contours — only
# one side of the silhouette gets traced. Padding keeps the whole figure interior
# so we get a single closed contour all the way around.
big = np.zeros((H + 2 * PAD, W + 2 * PAD), dtype=bool)
big[PAD:PAD + H, PAD:PAD + W] = mask
dbig = ndimage.binary_dilation(big, iterations=DIL)

# pick the longest contour by arc length (the outer silhouette), walk it RAW
contours = measure.find_contours(dbig.astype(float), 0.5)
def arclen(c):
    d = np.diff(c, axis=0)
    return float(np.sum(np.hypot(d[:, 0], d[:, 1])))
contour = max(contours, key=arclen)
pts = [(p[1] * SS, p[0] * SS) for p in contour]   # already in padded coords -> (x, y)
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
out.save(os.path.join(IMG, 'student_dashed.png'))

prev = Image.new('RGBA', out.size, (255, 255, 255, 255))
prev.paste(out, (0, 0), out)
os.makedirs(os.path.join(HERE, 'capture'), exist_ok=True)
prev.convert('RGB').save(os.path.join(HERE, 'capture', 'dash_preview.png'))
print('saved', out.size, '| contours found:', len(contours), '| contour pts:', len(contour))
