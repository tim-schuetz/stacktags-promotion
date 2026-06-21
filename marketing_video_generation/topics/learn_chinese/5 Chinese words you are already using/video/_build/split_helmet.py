# Split helmet.png into two layers so the man's FACE can sit between them:
#   helmet_front.png = the golden shell + crest + cheek guards, with the dark
#                      face-opening cut out (transparent) -> goes IN FRONT of the face
#   helmet_back.png  = the dark interior (the face-opening filled dark) -> goes BEHIND the head
# Pure numpy + PIL. Morphological erode kills the thin dark outlines so only the
# thick opening blob is isolated; flood-propagate from a seed in the opening.
import os
import numpy as np
from PIL import Image, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, '..', 'assets', 'photos', 'helmet.png')
OUT = os.path.join(HERE, '..', 'assets', 'photos')

im = Image.open(SRC).convert('RGBA')
a = np.asarray(im).astype(np.int16)
H, W = a.shape[:2]
al = a[..., 3]
lum = 0.299 * a[..., 0] + 0.587 * a[..., 1] + 0.114 * a[..., 2]
dark = (al > 140) & (lum < 78)

def shift(m, dy, dx):
    out = np.zeros_like(m)
    ys = slice(max(0, dy), H + min(0, dy)); yd = slice(max(0, -dy), H + min(0, -dy))
    xs = slice(max(0, dx), W + min(0, dx)); xd = slice(max(0, -dx), W + min(0, -dx))
    out[yd, xd] = m[ys, xs]; return out

def erode(m, k=1):
    for _ in range(k): m = m & shift(m, 1, 0) & shift(m, -1, 0) & shift(m, 0, 1) & shift(m, 0, -1)
    return m

def dilate(m, k=1):
    for _ in range(k): m = m | shift(m, 1, 0) | shift(m, -1, 0) | shift(m, 0, 1) | shift(m, 0, -1)
    return m

core = erode(dark, 3)                 # remove the thin outlines, keep the thick opening blob

# seed in the centre of the opening (lower-centre); snap to nearest core pixel
sy, sx = int(H * 0.74), W // 2
if not core[sy, sx]:
    ys, xs = np.where(core)
    j = np.argmin((ys - sy) ** 2 + (xs - sx) ** 2)
    sy, sx = int(ys[j]), int(xs[j])

region = np.zeros((H, W), bool); region[sy, sx] = True
prev = -1
while region.sum() != prev:
    prev = region.sum()
    region = dilate(region, 4) & core
opening = dilate(region, 4) & dark    # grow back to the original opening extent

# feather the opening edge a touch
op_img = Image.fromarray((opening * 255).astype(np.uint8), 'L').filter(ImageFilter.GaussianBlur(1.4))
op_a = np.asarray(op_img).astype(np.float32) / 255.0

# ---- FRONT: helmet with the opening removed (alpha 0 where opening) ----
front = np.asarray(im).astype(np.float32).copy()
front[..., 3] = front[..., 3] * (1.0 - op_a)
Image.fromarray(np.clip(front, 0, 255).astype(np.uint8), 'RGBA').save(os.path.join(OUT, 'helmet_front.png'))

# ---- BACK: the dark interior, filled a solid dark, only where the opening is ----
back = np.zeros((H, W, 4), np.float32)
back[..., 0] = 28; back[..., 1] = 26; back[..., 2] = 30      # near-black interior
back[..., 3] = op_a * 255.0
Image.fromarray(np.clip(back, 0, 255).astype(np.uint8), 'RGBA').save(os.path.join(OUT, 'helmet_back.png'))

print(f'opening px = {int(opening.sum())}  ({opening.sum()/max(1,dark.sum())*100:.0f}% of dark)')
print('wrote helmet_front.png + helmet_back.png')

# ---- preview: back + a stand-in face + front, to check the split reads ----
front_im = Image.open(os.path.join(OUT, 'helmet_front.png'))
back_im = Image.open(os.path.join(OUT, 'helmet_back.png'))
canv = Image.new('RGBA', (W, H), (255, 255, 255, 255))
canv.alpha_composite(back_im)
# stand-in face: a peach ellipse with two eyes where the opening is
from PIL import ImageDraw
face = Image.new('RGBA', (W, H), (0, 0, 0, 0)); fd = ImageDraw.Draw(face)
fd.ellipse([W*0.30, H*0.50, W*0.70, H*0.92], fill=(247, 206, 172, 255))
fd.ellipse([W*0.40, H*0.66, W*0.46, H*0.72], fill=(40, 40, 40, 255))
fd.ellipse([W*0.54, H*0.66, W*0.60, H*0.72], fill=(40, 40, 40, 255))
canv.alpha_composite(face)
canv.alpha_composite(front_im)
canv.convert('RGB').resize((int(W*0.5), int(H*0.5))).save(os.path.join(HERE, 'helmet_split_preview.png'))
print('wrote helmet_split_preview.png')
