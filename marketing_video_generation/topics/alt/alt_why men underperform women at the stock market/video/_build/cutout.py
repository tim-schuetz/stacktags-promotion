import os
from rembg import remove
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
VIDEO = os.path.dirname(HERE)
PHOTOS = os.path.join(VIDEO, "assets", "photos")
ASSETS = os.path.join(VIDEO, "assets")

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
    dst = os.path.join(ASSETS, key + ".png")
    out.save(dst)
    print("cut", key, "->", out.size, dst)
print("done")
