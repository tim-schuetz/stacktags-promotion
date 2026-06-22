# Bake a dashed line that follows the SILHOUETTE of a transparent cut-out
# (per specific_tools_instructions/draw_dotted_line.md): trace the alpha edge,
# offset outward, walk the arc length drawing round-capped dashes, supersample
# + LANCZOS down, save with padding. Outputs <name>_dotted.png next to the src.
#
# FIX: pad the working image with a transparent margin FIRST, so the silhouette
# is fully enclosed. Otherwise, if the subject touches an image edge (e.g. the
# shoulders at the bottom), find_contours only traces the free edges and the
# dashed line covers just part of the figure.
import sys, numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage
from skimage import measure
from skimage.measure import approximate_polygon

SRC = sys.argv[1] if len(sys.argv) > 1 else '../assets/cutouts/chao.png'
OFFSET = int(sys.argv[2]) if len(sys.argv) > 2 else 14     # dilation iters = gap to object
COLOR = (53, 162, 146, 255)                                 # #35A292 brand turquoise
LW = 6                                                       # line width (px, native)
DASH_ON, DASH_OFF = 15, 11                                   # dash density (px, native)
SS = 3                                                       # supersample factor

img = Image.open(SRC).convert('RGBA')
W, H = img.size
alpha = np.array(img)[:, :, 3]

# 0. pad with a transparent margin so the silhouette never touches the array edge
M = OFFSET + 22
alpha = np.pad(alpha, M, mode='constant', constant_values=0)
PW, PH = W + 2 * M, H + 2 * M

# 1. binary mask -> fill holes -> dilate outward
mask = alpha > 40
mask = ndimage.binary_fill_holes(mask)
mask_d = ndimage.binary_dilation(mask, iterations=OFFSET)

# 2. trace the outer silhouette (largest contour); coords are (row=y, col=x) in padded space
contours = measure.find_contours(mask_d.astype(float), 0.5)
if not contours:
    raise SystemExit('no contour found')
contour = max(contours, key=len)
# 3. simplify
contour = approximate_polygon(contour, tolerance=1.5)
pts = [(float(c[1]), float(c[0])) for c in contour]          # (x, y), already in padded coords
if pts[0] != pts[-1]:
    pts.append(pts[0])

# resample the closed path into ~1px steps so dashes are even
def resample(poly, step=1.0):
    out = []
    carry = 0.0
    for i in range(len(poly) - 1):
        ax, ay = poly[i]; bx, by = poly[i + 1]
        dx, dy = bx - ax, by - ay
        seglen = (dx * dx + dy * dy) ** 0.5
        if seglen < 1e-6:
            continue
        d = carry
        while d < seglen:
            t = d / seglen
            out.append((ax + dx * t, ay + dy * t))
            d += step
        carry = d - seglen
    return out

dense = resample(pts, step=1.0)

# 4. supersampled canvas; 5. round-capped dashes via filled dots while "on"
canvas = Image.new('RGBA', (PW * SS, PH * SS), (0, 0, 0, 0))
draw = ImageDraw.Draw(canvas)
r = (LW * SS) / 2.0
period = DASH_ON + DASH_OFF
acc = 0.0
prev = None
for (x, y) in dense:
    if (acc % period) < DASH_ON:
        cx, cy = x * SS, y * SS
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=COLOR)
    if prev is not None:
        acc += ((x - prev[0]) ** 2 + (y - prev[1]) ** 2) ** 0.5
    prev = (x, y)

# 5. downscale (anti-alias)
line_img = canvas.resize((PW, PH), Image.LANCZOS)

# 6. composite the original cut-out on top (at the padded offset)
out = Image.new('RGBA', (PW, PH), (0, 0, 0, 0))
out.alpha_composite(line_img, (0, 0))
out.alpha_composite(img, (M, M))

dst = SRC.replace('.png', '_dotted.png')
out.save(dst)
print('saved', dst, out.size, '| contour pts:', len(pts))
