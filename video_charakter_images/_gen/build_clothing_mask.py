#!/usr/bin/env python3
"""Build an inpaint mask covering ONLY the shirt/torso of szuchack_middle.png (keep face, hair,
glasses, mic, background untouched). White = repaint. Run with Python 3.14 (rembg+scipy+PIL).

Saves: <out_mask>  and  <out_overlay> (original tinted where it will be repainted) for visual check.
"""
import sys, numpy as np
from rembg import remove
from PIL import Image
import scipy.ndimage as ndi

IN      = sys.argv[1] if len(sys.argv) > 1 else r"C:\software_projekte\stacktags-promotion\video_charakter_images\szuchack_middle.png"
OUTMASK = sys.argv[2] if len(sys.argv) > 2 else r"C:\software_projekte\stacktags-promotion\video_charakter_images\_gen\polo_mask.png"
OUTOVL  = sys.argv[3] if len(sys.argv) > 3 else r"C:\software_projekte\stacktags-promotion\video_charakter_images\_gen\polo_mask_overlay.png"

NECK_FRAC  = 0.60    # start of shirt region (fraction of height); above this is kept (face/neck)
MIC_THRESH = 70      # pixels darker than this inside the torso = microphone -> keep (don't repaint)
MIC_DILATE = 12
EDGE_ERODE = 4       # pull mask in from the silhouette edge to avoid background bleed

img = Image.open(IN).convert("RGB")
W, H = img.size
arr = np.asarray(img).astype(np.float32)
gray = arr.mean(axis=2)

# 1) person silhouette (foreground = person + mic)
rgba = remove(img.convert("RGBA"))
alpha = np.asarray(rgba)[:, :, 3]
person = alpha > 128

# 2) restrict to the torso band (below the neckline)
yy = np.arange(H)[:, None].repeat(W, axis=1)
torso = person & (yy > int(NECK_FRAC * H))

# 3) pull in from edges so we don't paint into the wall
torso = ndi.binary_erosion(torso, iterations=EDGE_ERODE)

# 4) carve out the microphone (dark blob in the torso area)
mic = (gray < MIC_THRESH) & (yy > int(NECK_FRAC * H))
mic = ndi.binary_dilation(mic, iterations=MIC_DILATE)
mask = torso & ~mic

# 5) clean up tiny holes/specks
mask = ndi.binary_closing(mask, iterations=2)
mask = ndi.binary_opening(mask, iterations=1)

mask_img = Image.fromarray((mask * 255).astype(np.uint8), mode="L")
mask_img.save(OUTMASK)

# overlay for visual verification: tint the repaint area magenta
ov = arr.copy()
ov[mask] = ov[mask] * 0.4 + np.array([255, 0, 255]) * 0.6
Image.fromarray(ov.astype(np.uint8)).save(OUTOVL)
print(f"image {W}x{H}; mask px={int(mask.sum())}; saved mask -> {OUTMASK}")
