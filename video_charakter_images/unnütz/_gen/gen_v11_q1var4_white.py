#!/usr/bin/env python3
"""q1_var4 again, ONLY the background swapped to white. Identity + pose + STYLE + seed are byte-identical
to the original gen_v7 q1_var4 generation, so at the same seed the face deviates as little as possible.
Three white-background phrasings to pick from. FLUX Pro Ultra raw + degrade pass."""
import os
import requests
from concurrent.futures import ThreadPoolExecutor

API_KEY = "fa762e25-61b5-420d-a069-3804b4eeb863:f6cc83ac7235bcaccb23ed755fe6f8ae"
MODEL   = "fal-ai/flux-pro/v1.1-ultra"
OUTDIR  = r"C:\software_projekte\stacktags-promotion\video_charakter_images\presenter_v11_raw"
SEED    = 7204

# --- copied VERBATIM from gen_v7.py ---
STYLE = ("a still frame screenshot from an amateur vertical talking-head video, candid snapshot, "
         "shot on a cheap webcam or front phone camera, flat dull ordinary lighting, "
         "slightly soft focus, faint motion blur, visible digital noise and slight compression, "
         "mediocre everyday image quality, a black podcast microphone in the lower foreground just in "
         "front of the chin not covering the face, looking into the camera. "
         "unremarkable real person, NOT a model, NOT professional, no studio lighting, no cinematic look, "
         "no pretty bokeh, no glamour, no retouching")
TALK = "caught mid-sentence talking, mouth slightly open, eyebrows slightly raised, a natural unposed moment"
IDENT = ("an ordinary average-looking young man around 27, pale skin with slight redness, short dark "
         "slightly messy hair, thin round wire glasses, wide eyes, a plain pale blue button-up shirt, a bit awkward")
# original q1_var4 bg was:
# BG_PLAIN = "a plain boring nondescript dim room wall in the background heavily but flatly out of focus with no decorations."

# Only the background sentence changes (white). v1 = minimal edit (dim room -> white); v3 = brightest/cleanest.
BG_VARIANTS = [
    ("q1var4_white_v1", "a plain boring nondescript white wall in the background heavily but flatly out of focus with no decorations."),
    ("q1var4_white_v2", "a plain white wall in the background, softly out of focus with no decorations."),
    ("q1var4_white_v3", "a plain white wall in the background, bright flat even lighting, slightly overexposed, softly out of focus."),
]

def gen(job):
    pid, bg = job
    payload = {
        "prompt": f"{IDENT}, {TALK}. {bg} {STYLE}",   # exact same assembly as gen_v7
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
    with ThreadPoolExecutor(max_workers=3) as ex:
        results = list(ex.map(gen, BG_VARIANTS))
    ok = 0
    for pid, out, info in sorted(results):
        flag = "OK  " if out else "FAIL"
        ok += 1 if out else 0
        print(f"[{flag}] {pid}: {info}")
    print(f"\n{ok}/{len(results)} -> {OUTDIR}")

if __name__ == "__main__":
    main()
