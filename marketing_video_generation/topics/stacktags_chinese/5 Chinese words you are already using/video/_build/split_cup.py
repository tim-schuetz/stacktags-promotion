# Split englishman.png into two layers, the same idea as split_helmet.py:
#   englishman_body.png = the figure with the TEACUP+SAUCER erased (the open hand stays,
#                         ready to "receive" the rice bowl that flies in on the China beat)
#   cup.png             = just the extracted teacup+saucer (kept for reference/preview)
# The cup/saucer are white + pale-blue against a peach skin hand and a brown suit, so a
# colour mask (white OR pale-blue) inside the left-hand region, grown to grab only the
# DARK outline (never the skin), isolates it cleanly. Pure numpy + PIL.
import os
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, '..', 'assets', 'photos', 'englishman.png')
OUT = os.path.join(HERE, '..', 'assets', 'photos')

im = Image.open(SRC).convert('RGBA')
a = np.asarray(im).astype(np.int16)
H, W = a.shape[:2]
al = a[..., 3]
r, g, b = a[..., 0], a[..., 1], a[..., 2]
lum = 0.299 * r + 0.587 * g + 0.114 * b
mx = np.maximum(np.maximum(r, g), b); mn = np.minimum(np.minimum(r, g), b)
sat = mx - mn

def shift(m, dy, dx):
    out = np.zeros_like(m)
    ys = slice(max(0, dy), H + min(0, dy)); yd = slice(max(0, -dy), H + min(0, -dy))
    xs = slice(max(0, dx), W + min(0, dx)); xd = slice(max(0, -dx), W + min(0, -dx))
    out[yd, xd] = m[ys, xs]; return out

def dilate(m, k=1):
    for _ in range(k): m = m | shift(m, 1, 0) | shift(m, -1, 0) | shift(m, 0, 1) | shift(m, 0, -1)
    return m

# left-hand region (viewer-left) around the cup; right edge kept off the white shirt-cuff
reg = np.zeros((H, W), bool)
reg[352:506, 16:198] = True
# upper sub-zone = pure cup (above the fingers): everything non-skin here is the cup/steam
topzone = np.zeros((H, W), bool)
topzone[352:462, 16:190] = True

opaque = al > 110
# peach skin of the hand — must be PRESERVED (fingers, palm, thumb)
skin  = opaque & (r > 168) & (g > 116) & (b > 88) & (r > b + 20) & (r + 10 >= g) & (g + 8 >= b)
# brown suit/sleeve — preserve
suit  = opaque & (r > g + 6) & (g > b + 3) & (r < 188) & (lum < 155) & (~skin)
# the HAND = skin plus the dark outline hugging it (so the fingers keep their definition);
# the cup/saucer outline that touches the fingers is kept too (reads as the finger's top edge)
hand  = dilate(skin, 4) | suit

# everything in the cup region that is NOT the hand is cup/saucer/steam → erase it whole
cup = reg & opaque & (~hand)
cup = ndimage.binary_fill_holes(cup)      # solidify cup + saucer
# over-erase past the edge (incl. sub-threshold anti-aliased outline pixels) to kill all
# residue, but never eat into the skin
cup = dilate(cup, 3) & (~dilate(skin, 2))

# feather the cut edge only slightly
cup_img = Image.fromarray((cup * 255).astype(np.uint8), 'L').filter(ImageFilter.GaussianBlur(0.6))
cup_a = np.asarray(cup_img).astype(np.float32) / 255.0

src = np.asarray(im).astype(np.float32)

# ---- BODY: figure with the cup/saucer removed ----
body = src.copy()
body[..., 3] = body[..., 3] * (1.0 - cup_a)
Image.fromarray(np.clip(body, 0, 255).astype(np.uint8), 'RGBA').save(os.path.join(OUT, 'englishman_body.png'))

# ---- CUP: only the extracted cup/saucer ----
cuponly = src.copy()
cuponly[..., 3] = cuponly[..., 3] * cup_a
Image.fromarray(np.clip(cuponly, 0, 255).astype(np.uint8), 'RGBA').save(os.path.join(OUT, 'cup.png'))

print(f'cup px = {int(cup.sum())}  ({cup.sum()/max(1,opaque.sum())*100:.1f}% of figure)')
print('wrote englishman_body.png + cup.png')

# ---- preview: body and cup side by side on grey, downscaled ----
def on_grey(img):
    bg = Image.new('RGBA', img.size, (150, 150, 150, 255)); bg.alpha_composite(img); return bg.convert('RGB')
b_im = Image.open(os.path.join(OUT, 'englishman_body.png'))
c_im = Image.open(os.path.join(OUT, 'cup.png'))
prev = Image.new('RGB', (W, H // 2), (150, 150, 150))
prev.paste(on_grey(b_im).resize((W // 2, H // 2)), (0, 0))
prev.paste(on_grey(c_im).resize((W // 2, H // 2)), (W // 2, 0))
prev.save(os.path.join(HERE, 'cup_split_preview.png'))
print('wrote cup_split_preview.png')
