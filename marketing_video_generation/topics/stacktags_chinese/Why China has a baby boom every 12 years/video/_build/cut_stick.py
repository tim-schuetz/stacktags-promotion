# Turn the black-on-white line-doodle baby into a transparent PNG: alpha follows
# ink darkness (black lines opaque, white → transparent), keep smooth edges.
# No dashed outline (it gets replicated tiny). -> assets/photos/baby_stick.png
import os
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
RAW = os.path.join(HERE, '..', 'assets', 'raw', 'baby_stick.png')
OUT = os.path.join(HERE, '..', 'assets', 'photos', 'baby_stick.png')

img = Image.open(RAW).convert('RGBA')
arr = np.asarray(img).astype(np.int16).copy()
rgb = arr[..., :3]
# alpha = how dark the pixel is (min channel): black ink -> 255, white -> 0
alpha = 255 - rgb.min(axis=-1)
alpha = np.clip((alpha.astype(np.float32) - 18) * 1.4, 0, 255)   # drop faint paper noise, boost ink
arr[..., 3] = alpha.astype(np.uint8)
arr[..., :3] = 20   # force the lines to near-black ink
out = Image.fromarray(arr.astype(np.uint8), 'RGBA')
bbox = out.split()[3].point(lambda v: 255 if v > 20 else 0).getbbox()
if bbox:
    pad = 10
    out = out.crop((max(0, bbox[0]-pad), max(0, bbox[1]-pad),
                    min(out.width, bbox[2]+pad), min(out.height, bbox[3]+pad)))
out.save(OUT)
print('OK baby_stick.png', out.size)
