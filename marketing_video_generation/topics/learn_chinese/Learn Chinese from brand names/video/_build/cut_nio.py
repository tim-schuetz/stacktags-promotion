# Cut out the NIO logo raws (white bg → transparent) with rembg.
# Per specific_tools_instructions/crop_images.md.
import sys
from rembg import remove
from PIL import Image

ASSETS = r"C:\software_projekte\bombatags\promotion\marketing_video_generation\topics\learn_chinese\Learn Chinese from brand names\video\assets"

for n in (1, 2, 3):
    src = f"{ASSETS}\\nio_logo_raw_{n}.png"
    try:
        inp = Image.open(src).convert("RGBA")
    except FileNotFoundError:
        continue
    out = remove(inp, alpha_matting=True,
                 alpha_matting_foreground_threshold=240,
                 alpha_matting_background_threshold=15)
    bb = out.getbbox()
    if bb:
        out = out.crop(bb)
    dst = f"{ASSETS}\\nio_logo_cut_{n}.png"
    out.save(dst)
    print("cut ->", dst, out.size)
