#!/usr/bin/env python3
"""Composite the FLUX-Fill clothing results back onto szuchack_middle so that everything OUTSIDE the
shirt mask is byte-identical to the original (face/hair/glasses/mic/background untouched).
Run with Python 3.14 (PIL+numpy)."""
import os, numpy as np
from PIL import Image, ImageFilter

ORIG   = r"C:\software_projekte\stacktags-promotion\video_charakter_images\szuchack_middle.png"
MASK   = r"C:\software_projekte\stacktags-promotion\video_charakter_images\_gen\polo_mask.png"
RAWDIR = r"C:\software_projekte\stacktags-promotion\video_charakter_images\_gen\polo_fill_raw"
OUTDIR = r"C:\software_projekte\stacktags-promotion\video_charakter_images\szuchack_polo"

orig = Image.open(ORIG).convert("RGB")
W, H = orig.size
mask = Image.open(MASK).convert("L").resize((W, H))
# feather the boundary a touch for a seamless blend
mask_f = mask.filter(ImageFilter.GaussianBlur(2.5))
a = (np.asarray(mask_f).astype(np.float32) / 255.0)[..., None]
o = np.asarray(orig).astype(np.float32)

os.makedirs(OUTDIR, exist_ok=True)
for fn in sorted(os.listdir(RAWDIR)):
    if not fn.lower().endswith((".jpg", ".jpeg", ".png")):
        continue
    res = Image.open(os.path.join(RAWDIR, fn)).convert("RGB")
    if res.size != (W, H):
        res = res.resize((W, H), Image.LANCZOS)
    r = np.asarray(res).astype(np.float32)
    comp = (o * (1 - a) + r * a).clip(0, 255).astype(np.uint8)
    out = os.path.join(OUTDIR, os.path.splitext(fn)[0] + ".jpg")
    Image.fromarray(comp).save(out, format="JPEG", quality=92)
    print(f"[ok] {out}")
print(f"\n-> {OUTDIR}")
