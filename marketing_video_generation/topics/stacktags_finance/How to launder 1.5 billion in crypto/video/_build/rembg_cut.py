# Cut each raw image to its object (transparent RGBA, cropped to bbox).
from rembg import remove
from PIL import Image
import sys, os
BASE = os.path.join(os.path.dirname(__file__), "..", "assets")
for key in sys.argv[1:]:
    inp = Image.open(os.path.join(BASE, "raw", key + ".png")).convert("RGBA")
    out = remove(inp, alpha_matting=True, alpha_matting_foreground_threshold=240, alpha_matting_background_threshold=15)
    bb = out.getbbox()
    if bb:
        out = out.crop(bb)
    out.save(os.path.join(BASE, key + "_cut.png"))
    print("cut", key, out.size)
