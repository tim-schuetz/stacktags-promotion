# rembg cut-outs of the cartoon characters -> transparent PNGs cropped to the subject.
# Characters get NO dashed outline (per the design rules).
import os
from rembg import remove
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
PHOTOS = os.path.join(HERE, "..", "assets", "photos")
OUT = os.path.join(HERE, "..", "assets")

JOBS = ["trader_man", "calm_woman"]

for key in JOBS:
    src = os.path.join(PHOTOS, key + ".png")
    inp = Image.open(src).convert("RGBA")
    out = remove(
        inp,
        alpha_matting=True,
        alpha_matting_foreground_threshold=240,
        alpha_matting_background_threshold=15,
    )
    bbox = out.getbbox()
    if bbox:
        out = out.crop(bbox)
    dst = os.path.join(OUT, key + ".png")
    out.save(dst)
    print(f"  cut {key}.png -> {out.size[0]}x{out.size[1]}")

print("Done.")
