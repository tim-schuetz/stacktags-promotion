#!/usr/bin/env python3
"""Pre-tint the masked shirt region with a flat target color so FLUX Fill follows that color
(it otherwise anchors to the surrounding light blue). Python 3.14 (PIL+numpy)."""
import os, numpy as np
from PIL import Image

ORIG = r"C:\software_projekte\stacktags-promotion\video_charakter_images\szuchack_middle.png"
MASK = r"C:\software_projekte\stacktags-promotion\video_charakter_images\_gen\polo_mask.png"
OUT  = r"C:\software_projekte\stacktags-promotion\video_charakter_images\_gen\tinted_inputs"

orig = Image.open(ORIG).convert("RGB"); W, H = orig.size
mask = np.asarray(Image.open(MASK).convert("L").resize((W, H))) > 128
arr0 = np.asarray(orig).astype(np.uint8)

COLORS = {
    "polo_grey":      (150, 152, 156),
    "polo_navy":      ( 36,  50,  86),
    "polo_darkgreen": ( 40,  68,  54),
    "tshirt_charcoal":( 58,  60,  64),
    "hoodie_grey":    (122, 124, 128),
}

os.makedirs(OUT, exist_ok=True)
for name, rgb in COLORS.items():
    a = arr0.copy()
    a[mask] = rgb
    Image.fromarray(a).save(os.path.join(OUT, f"{name}.png"))
    print(f"[ok] tinted -> {name}.png  rgb={rgb}")
print(f"\n-> {OUT}")
