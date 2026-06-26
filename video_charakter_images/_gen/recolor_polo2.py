#!/usr/bin/env python3
"""Recolor the polo using a COLOR-DERIVED mask (selects the light-blue fabric, excludes neck-skin and
the dark mic) -> no hard neckline seam, no mic halo. Python 3.14 (PIL+numpy+scipy)."""
import os, numpy as np
from PIL import Image, ImageFilter
import scipy.ndimage as ndi

SRC = r"C:\software_projekte\stacktags-promotion\video_charakter_images\szuchack_polo\polo_lightblue.jpg"
OUT = r"C:\software_projekte\stacktags-promotion\video_charakter_images\szuchack_polo"

src = Image.open(SRC).convert("RGB"); W, H = src.size
rgb = np.asarray(src).astype(np.float32)
R, G, B = rgb[..., 0], rgb[..., 1], rgb[..., 2]
V = rgb.max(axis=2)
yy = np.arange(H)[:, None].repeat(W, axis=1)

# light-blue/grey fabric: blue not below red (skin has R>>B), bright enough (mic is dark), in torso band
shirt = (B >= R - 10) & (V > 95) & (yy > int(0.56 * H))
shirt = ndi.binary_closing(shirt, iterations=3)
shirt = ndi.binary_opening(shirt, iterations=2)
# keep only the largest blob (the polo), drop stray specks
lbl, n = ndi.label(shirt)
if n:
    big = np.argmax(ndi.sum(np.ones_like(lbl), lbl, index=range(1, n + 1))) + 1
    shirt = lbl == big

a = (np.asarray(Image.fromarray((shirt * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.8)))
     .astype(np.float32) / 255.0)[..., None]

hsv = np.asarray(src.convert("HSV")).astype(np.float32)
Vc = hsv[..., 2]

TARGETS = [
    ("polo_grey3",     0,   16,  1.00),
    ("polo_navy3",     158, 205, 0.45),
    ("polo_darkgreen3",95,  150, 0.52),
    ("polo_burgundy3", 248, 175, 0.48),
]
for name, th, ts, vk in TARGETS:
    nh = np.full_like(Vc, th); ns = np.full_like(Vc, ts); nv = np.clip(Vc * vk, 0, 255)
    trgb = np.asarray(Image.fromarray(np.stack([nh, ns, nv], -1).astype(np.uint8), "HSV").convert("RGB")).astype(np.float32)
    comp = (rgb * (1 - a) + trgb * a).clip(0, 255).astype(np.uint8)
    Image.fromarray(comp).save(os.path.join(OUT, f"{name}.jpg"), quality=92)
    print(f"[ok] {name}")
print(f"\nshirt px={int(shirt.sum())} -> {OUT}")
