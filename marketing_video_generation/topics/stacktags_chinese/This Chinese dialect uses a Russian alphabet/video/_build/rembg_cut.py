#!/usr/bin/env python3
"""Cut out a foreground object from a raw photo (transparent PNG, tight crop).
Usage: rembg_cut.py <key>  -> assets/raw/<key>.png -> assets/photos/<key>_cut.png"""
import sys, pathlib
from rembg import remove
from PIL import Image

HERE = pathlib.Path(__file__).resolve().parent
RAW = HERE.parent / "assets" / "raw"
OUT = HERE.parent / "assets" / "photos"
OUT.mkdir(parents=True, exist_ok=True)

key = sys.argv[1]
inp = Image.open(RAW / f"{key}.png").convert("RGBA")
out = remove(inp, alpha_matting=True,
             alpha_matting_foreground_threshold=240,
             alpha_matting_background_threshold=15)
bbox = out.getbbox()
if bbox:
    out = out.crop(bbox)
dst = OUT / f"{key}_cut.png"
out.save(dst)
print(f"{dst}  {out.size[0]}x{out.size[1]}")
