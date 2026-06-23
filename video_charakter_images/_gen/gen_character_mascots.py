#!/usr/bin/env python3
"""Generate Stacktags mascot-character exploration images via fal.ai (FLUX)."""
import json, os, sys
import requests
from concurrent.futures import ThreadPoolExecutor

API_KEY = "fa762e25-61b5-420d-a069-3804b4eeb863:f6cc83ac7235bcaccb23ed755fe6f8ae"
MODEL   = "fal-ai/flux/dev"
OUTDIR  = r"C:\software_projekte\stacktags-promotion\video_charakter_images"

BRAND = ("flat vector illustration, minimalist geometric design, clean bold simple shapes, "
         "turquoise teal (#35A292) and white color palette with soft grey accents, "
         "friendly and approachable, soft subtle shadow, full body, character centered, "
         "plain solid pure white background, modern mascot for a finance education brand, "
         "professional clean, no text, no letters, no words, no watermark")

CONCEPTS = {
    "01_cubestack": "A friendly mascot creature built from a few stacked rounded cubes forming a little "
                    "body and head, simple dot eyes and a tiny cheerful smile, tiny arms, " + BRAND,
    "02_tag":       "A friendly mascot character shaped like a rounded luggage/price tag label with a small "
                    "round string hole at the top corner, simple dot eyes and a cheerful smile, little arms "
                    "and legs, " + BRAND,
    "03_robot":     "A friendly minimalist robot assistant mascot, rounded rectangular head with a soft glowing "
                    "screen face showing two dot eyes and a smile, simple rounded geometric body, little arms, " + BRAND,
    "04_owl":       "A friendly cute round owl mascot wearing small round glasses, simple feathers, big calm eyes, "
                    "perched and waving, " + BRAND,
}

def gen(name, prompt):
    payload = {
        "prompt": prompt,
        "image_size": "square_hd",
        "num_images": 1,
        "num_inference_steps": 30,
        "guidance_scale": 3.5,
        "enable_safety_checker": True,
    }
    headers = {"Authorization": f"Key {API_KEY}", "Content-Type": "application/json"}
    try:
        r = requests.post(f"https://fal.run/{MODEL}", json=payload, headers=headers, timeout=240)
        if r.status_code != 200:
            return name, None, f"HTTP {r.status_code}: {r.text[:400]}"
        res = r.json()
    except Exception as e:
        return name, None, f"{type(e).__name__}: {e}"

    url = res["images"][0]["url"]
    out = os.path.join(OUTDIR, f"{name}.jpg")
    img = requests.get(url, timeout=240)
    with open(out, "wb") as f:
        f.write(img.content)
    return name, out, f"seed={res.get('seed')}"

def main():
    os.makedirs(OUTDIR, exist_ok=True)
    with ThreadPoolExecutor(max_workers=4) as ex:
        results = list(ex.map(lambda kv: gen(*kv), CONCEPTS.items()))
    for name, out, info in results:
        status = "OK  " if out else "FAIL"
        print(f"[{status}] {name}: {info}")
        if out:
            print(f"        -> {out}")

if __name__ == "__main__":
    main()
