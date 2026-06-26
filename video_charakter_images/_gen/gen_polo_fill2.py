#!/usr/bin/env python3
"""FLUX Fill round 2: feed pre-tinted inputs so the new garment takes the target COLOR.
Python 3.12 (requests). Mask = same shirt mask. composite_polo2.py then mask-composites onto original."""
import os, base64
import requests
from concurrent.futures import ThreadPoolExecutor

API_KEY = "fa762e25-61b5-420d-a069-3804b4eeb863:f6cc83ac7235bcaccb23ed755fe6f8ae"
MODEL   = "fal-ai/flux-pro/v1/fill"
TINTDIR = r"C:\software_projekte\stacktags-promotion\video_charakter_images\_gen\tinted_inputs"
MASK    = r"C:\software_projekte\stacktags-promotion\video_charakter_images\_gen\polo_mask.png"
OUTDIR  = r"C:\software_projekte\stacktags-promotion\video_charakter_images\_gen\polo_fill_raw2"

def data_uri(path):
    with open(path, "rb") as f:
        return "data:image/png;base64," + base64.b64encode(f.read()).decode()

MASK_URI = data_uri(MASK)
STYLEW = ("solid color, plain blank fabric, NO logo, NO emblem, NO text, NO print; amateur webcam still, "
          "flat dull indoor lighting, slightly soft, realistic natural fabric folds, matching the scene lighting")

OPTIONS = [
    ("polo_grey",       9202, "a young man wearing a plain solid heather-grey polo shirt with a small soft folded collar, cotton pique, " + STYLEW),
    ("polo_navy",       9203, "a young man wearing a plain solid navy blue polo shirt with a small soft folded collar, cotton pique, " + STYLEW),
    ("polo_darkgreen",  9204, "a young man wearing a plain solid dark green polo shirt with a small soft folded collar, cotton pique, " + STYLEW),
    ("tshirt_charcoal", 9205, "a young man wearing a plain solid charcoal grey crew-neck cotton t-shirt, " + STYLEW),
    ("hoodie_grey",     9206, "a young man wearing a plain solid grey pullover hoodie with a hood, " + STYLEW),
]

def gen(job):
    pid, seed, prompt = job
    img_uri = data_uri(os.path.join(TINTDIR, f"{pid}.png"))
    payload = {
        "image_url": img_uri,
        "mask_url": MASK_URI,
        "prompt": prompt,
        "num_inference_steps": 44,
        "safety_tolerance": "5",
        "output_format": "jpeg",
        "seed": seed,
    }
    headers = {"Authorization": f"Key {API_KEY}", "Content-Type": "application/json"}
    try:
        r = requests.post(f"https://fal.run/{MODEL}", json=payload, headers=headers, timeout=300)
        if r.status_code != 200:
            return pid, None, f"HTTP {r.status_code}: {r.text[:300]}"
        res = r.json()
        url = res["images"][0]["url"]
        img = requests.get(url, timeout=300)
        out = os.path.join(OUTDIR, f"{pid}.jpg")
        with open(out, "wb") as f:
            f.write(img.content)
        return pid, out, f"seed={res.get('seed')}"
    except Exception as e:
        return pid, None, f"{type(e).__name__}: {e}"

def main():
    os.makedirs(OUTDIR, exist_ok=True)
    with ThreadPoolExecutor(max_workers=5) as ex:
        results = list(ex.map(gen, OPTIONS))
    ok = 0
    for pid, out, info in sorted(results):
        flag = "OK  " if out else "FAIL"
        ok += 1 if out else 0
        print(f"[{flag}] {pid}: {info}")
    print(f"\n{ok}/{len(results)} -> {OUTDIR}")

if __name__ == "__main__":
    main()
