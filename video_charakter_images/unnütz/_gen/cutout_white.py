#!/usr/bin/env python3
"""ZERO-deviation 'white background' for q1_var4: take the REAL q1_var4 image and just replace its
background with white via rembg (the person + mic stay pixel-identical). Run with Python 3.14 (rembg).

Usage: python cutout_white.py <in_image> <out_image>
"""
import sys
from rembg import remove
from PIL import Image

IN  = sys.argv[1] if len(sys.argv) > 1 else r"C:\software_projekte\stacktags-promotion\video_charakter_images\presenter_v7_raw\q1_var4.jpg"
OUT = sys.argv[2] if len(sys.argv) > 2 else r"C:\software_projekte\stacktags-promotion\video_charakter_images\q1_var4_white_cutout.jpg"

src = Image.open(IN).convert("RGBA")
cut = remove(src)                                  # RGBA with transparent background
white = Image.new("RGBA", cut.size, (255, 255, 255, 255))
out = Image.alpha_composite(white, cut).convert("RGB")
out.save(OUT, format="JPEG", quality=92)
print(f"saved -> {OUT}  ({out.size[0]}x{out.size[1]})")
