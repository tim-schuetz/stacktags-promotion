#!/usr/bin/env python3
"""Deterministically recolor ONLY the polo region of the clean light-blue polo result (no AI, no logos).
Keeps fabric folds (preserves relative V). Python 3.14 (PIL+numpy)."""
import os, numpy as np
from PIL import Image, ImageFilter

SRC  = r"C:\software_projekte\stacktags-promotion\video_charakter_images\szuchack_polo\polo_lightblue.jpg"
MASK = r"C:\software_projekte\stacktags-promotion\video_charakter_images\_gen\polo_mask.png"
OUT  = r"C:\software_projekte\stacktags-promotion\video_charakter_images\szuchack_polo"

src = Image.open(SRC).convert("RGB"); W, H = src.size
rgb0 = np.asarray(src).astype(np.float32)
m = Image.open(MASK).convert("L").resize((W, H)).filter(ImageFilter.GaussianBlur(2.0))
a = (np.asarray(m).astype(np.float32) / 255.0)[..., None]

hsv = np.asarray(src.convert("HSV")).astype(np.float32)
Hc, Sc, Vc = hsv[..., 0], hsv[..., 1], hsv[..., 2]

# (name, target_hue 0-255, target_sat 0-255 or None=keep-desat, V-scale)
TARGETS = [
    ("polo_grey2",     0,   14,  1.00),   # desaturate -> neutral grey
    ("polo_navy2",     160, 200, 0.42),
    ("polo_darkgreen2",95,  150, 0.50),
    ("polo_burgundy2", 248, 180, 0.45),
]

for name, th, ts, vk in TARGETS:
    nh = np.full_like(Hc, th)
    ns = np.full_like(Sc, ts)
    nv = np.clip(Vc * vk, 0, 255)
    thsv = np.stack([nh, ns, nv], axis=-1).astype(np.uint8)
    trgb = np.asarray(Image.fromarray(thsv, "HSV").convert("RGB")).astype(np.float32)
    comp = (rgb0 * (1 - a) + trgb * a).clip(0, 255).astype(np.uint8)
    Image.fromarray(comp).save(os.path.join(OUT, f"{name}.jpg"), quality=92)
    print(f"[ok] {name}")
print(f"\n-> {OUT}")
