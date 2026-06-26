#!/usr/bin/env python3
"""Degrade clean FLUX portraits so they look like real compressed talking-head VIDEO FRAMES:
soft resample, faint sensor noise, mild blur, JPEG compression. Run with Python 3.14 (has PIL+numpy).

Usage: python degrade_videoframe.py <in_dir> <out_dir>
"""
import os, sys, io
import numpy as np
from PIL import Image, ImageFilter

IN  = sys.argv[1] if len(sys.argv) > 1 else r"C:\software_projekte\stacktags-promotion\video_charakter_images\presenter_v2_raw"
OUT = sys.argv[2] if len(sys.argv) > 2 else r"C:\software_projekte\stacktags-promotion\video_charakter_images\presenter_v2_videoframe"

def degrade(im):
    w, h = im.size
    # 1) soften via downscale->upscale (mimics a lower-res sensor / streaming compression)
    small = im.resize((int(w * 0.62), int(h * 0.62)), Image.BILINEAR)
    im = small.resize((w, h), Image.BILINEAR)
    # 2) very slight blur
    im = im.filter(ImageFilter.GaussianBlur(0.5))
    # 3) faint luminance sensor noise
    arr = np.asarray(im).astype(np.float32)
    noise = np.random.normal(0, 4.5, arr.shape[:2])[..., None]   # mono noise across channels
    arr = np.clip(arr + noise, 0, 255).astype(np.uint8)
    im = Image.fromarray(arr)
    # 4) JPEG compression artifacts (4:2:0 chroma subsampling, low-ish quality)
    buf = io.BytesIO()
    im.save(buf, format="JPEG", quality=58, subsampling=2)
    buf.seek(0)
    return Image.open(buf).convert("RGB")

def main():
    os.makedirs(OUT, exist_ok=True)
    n = 0
    for fn in sorted(os.listdir(IN)):
        if not fn.lower().endswith((".jpg", ".jpeg", ".png")):
            continue
        im = Image.open(os.path.join(IN, fn)).convert("RGB")
        out = degrade(im)
        out.save(os.path.join(OUT, os.path.splitext(fn)[0] + ".jpg"), format="JPEG", quality=82)
        n += 1
        print(f"[ok] {fn}")
    print(f"\n{n} frames -> {OUT}")

if __name__ == "__main__":
    main()
