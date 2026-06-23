#!/usr/bin/env python3
"""EXACT same character as q1_var4 (seed 7204, identical identity text from gen_v7) — NO aging, NO extras.
Changes vs original: WHITE background + framed a bit CLOSER to the mic. Vary only expression.
FLUX Pro Ultra raw + degrade pass."""
import os
import requests
from concurrent.futures import ThreadPoolExecutor

API_KEY = "fa762e25-61b5-420d-a069-3804b4eeb863:f6cc83ac7235bcaccb23ed755fe6f8ae"
MODEL   = "fal-ai/flux-pro/v1.1-ultra"
OUTDIR  = r"C:\software_projekte\stacktags-promotion\video_charakter_images\presenter_v10_raw"
SEED    = 7204   # exact same seed as q1_var4

# verbatim q1_var4 identity (do NOT change a word)
IDENT = ("an ordinary average-looking young man around 27, pale skin with slight redness, short dark "
         "slightly messy hair, thin round wire glasses, wide eyes, a plain pale blue button-up shirt, a bit awkward")

# closer-to-mic framing + white background + the imperfect amateur-video-frame style
SHOT = ("a tighter head-and-shoulders close-up, the person sitting close to a large black podcast microphone "
        "that is prominent in the lower foreground in front of his chin but NOT covering his face, face fully "
        "visible. a plain white wall in the background, bright soft even lighting, clean white, softly out of "
        "focus. a still frame screenshot from an amateur vertical talking-head video, candid snapshot, shot on "
        "a cheap webcam or front phone camera, flat dull ordinary lighting, slightly soft focus, faint motion "
        "blur, visible digital noise and slight compression, mediocre everyday image quality, looking into the "
        "camera. unremarkable real person, NOT a model, NOT professional, no studio lighting, no cinematic look, "
        "no pretty bokeh, no glamour, no retouching")

VARIANTS = [
    ("q1var4_same_v1", "caught mid-sentence talking, mouth slightly open, a natural unposed moment"),
    ("q1var4_same_v2", "wide-eyed, eyebrows raised, mouth slightly open in mild surprise"),
    ("q1var4_same_v3", "neutral plain expression, mouth closed"),
    ("q1var4_same_v4", "mid-sentence talking, eyebrows slightly raised"),
    ("q1var4_same_v5", "a slightly awkward earnest look, mouth barely open"),
    ("q1var4_same_v6", "talking, a natural candid moment"),
]

def gen(job):
    pid, pose = job
    payload = {
        "prompt": f"{IDENT}, {pose}. {SHOT}",
        "aspect_ratio": "3:4",
        "num_images": 1,
        "seed": SEED,
        "raw": True,
        "output_format": "jpeg",
        "enable_safety_checker": False,
        "safety_tolerance": "5",
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
    with ThreadPoolExecutor(max_workers=6) as ex:
        results = list(ex.map(gen, VARIANTS))
    ok = 0
    for pid, out, info in sorted(results):
        flag = "OK  " if out else "FAIL"
        ok += 1 if out else 0
        print(f"[{flag}] {pid}: {info}")
    print(f"\n{ok}/{len(results)} -> {OUTDIR}")

if __name__ == "__main__":
    main()
