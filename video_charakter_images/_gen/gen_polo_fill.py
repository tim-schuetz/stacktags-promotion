#!/usr/bin/env python3
"""Inpaint new clothing onto szuchack_middle via FLUX Fill (mask = shirt only). Python 3.12 (requests).
Saves raw fill results; composite_polo.py (3.14) then keeps everything outside the mask byte-identical."""
import os, base64, json
import requests
from concurrent.futures import ThreadPoolExecutor

API_KEY = "fa762e25-61b5-420d-a069-3804b4eeb863:f6cc83ac7235bcaccb23ed755fe6f8ae"
MODEL   = "fal-ai/flux-pro/v1/fill"
IMG     = r"C:\software_projekte\stacktags-promotion\video_charakter_images\szuchack_middle.png"
MASK    = r"C:\software_projekte\stacktags-promotion\video_charakter_images\_gen\polo_mask.png"
OUTDIR  = r"C:\software_projekte\stacktags-promotion\video_charakter_images\_gen\polo_fill_raw"

def data_uri(path):
    with open(path, "rb") as f:
        return "data:image/png;base64," + base64.b64encode(f.read()).decode()

IMG_URI  = data_uri(IMG)
MASK_URI = data_uri(MASK)

STYLEW = ("amateur vertical talking-head webcam still, flat dull indoor lighting, slightly soft, realistic "
          "natural fabric, matching the scene lighting, no logos, no text")

OPTIONS = [
    ("polo_lightblue", 9101, "a young man wearing a plain light blue polo shirt with a small soft folded collar, casual cotton pique fabric with natural folds, " + STYLEW),
    ("polo_grey",      9102, "a young man wearing a plain heather grey polo shirt with a small soft folded collar, casual cotton pique fabric with natural folds, " + STYLEW),
    ("polo_navy",      9103, "a young man wearing a plain navy blue polo shirt with a small soft folded collar, casual cotton pique fabric with natural folds, " + STYLEW),
    ("polo_darkgreen", 9104, "a young man wearing a plain dark green polo shirt with a small soft folded collar, casual cotton pique fabric with natural folds, " + STYLEW),
    ("tshirt_grey",    9105, "a young man wearing a plain grey crew-neck cotton t-shirt with natural folds, " + STYLEW),
    ("sweater_navy",   9106, "a young man wearing a plain navy knit crew-neck sweater with natural folds, " + STYLEW),
]

def gen(job):
    pid, seed, prompt = job
    payload = {
        "image_url": IMG_URI,
        "mask_url": MASK_URI,
        "prompt": prompt,
        "num_inference_steps": 40,
        "safety_tolerance": "5",
        "output_format": "jpeg",
        "seed": seed,
    }
    headers = {"Authorization": f"Key {API_KEY}", "Content-Type": "application/json"}
    try:
        r = requests.post(f"https://fal.run/{MODEL}", json=payload, headers=headers, timeout=300)
        if r.status_code != 200:
            return pid, None, f"HTTP {r.status_code}: {r.text[:400]}"
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
    with ThreadPoolExecutor(max_workers=4) as ex:
        results = list(ex.map(gen, OPTIONS))
    ok = 0
    for pid, out, info in sorted(results):
        flag = "OK  " if out else "FAIL"
        ok += 1 if out else 0
        print(f"[{flag}] {pid}: {info}")
    print(f"\n{ok}/{len(results)} -> {OUTDIR}")

if __name__ == "__main__":
    main()
