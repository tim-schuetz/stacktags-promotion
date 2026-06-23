#!/usr/bin/env python3
"""Targeted variations requested by the user:
  - s7 (thick glasses / flannel / bookshelf, talking): a few fresh variants
  - q1 (awkward wire-glasses guy, talking): a bit OLDER
  - q2 (plain ordinary guy, neutral): wearing a casual button-up SHIRT (not fancy)
FLUX Pro Ultra raw mode; then degrade_videoframe.py."""
import os
import requests
from concurrent.futures import ThreadPoolExecutor

API_KEY = "fa762e25-61b5-420d-a069-3804b4eeb863:f6cc83ac7235bcaccb23ed755fe6f8ae"
MODEL   = "fal-ai/flux-pro/v1.1-ultra"
OUTDIR  = r"C:\software_projekte\stacktags-promotion\video_charakter_images\presenter_v5_raw"

STYLE = ("a still frame screenshot from an amateur vertical talking-head video, candid snapshot, "
         "shot on a cheap webcam or front phone camera, flat dull ordinary indoor lighting, "
         "slightly soft focus, faint motion blur, visible digital noise and slight compression, "
         "mediocre everyday image quality, a black podcast microphone in the lower foreground just in "
         "front of the chin not covering the face, looking into the camera. "
         "unremarkable real person, NOT a model, NOT professional, no studio lighting, no cinematic look, "
         "no pretty bokeh, no glamour, no retouching")

BG_PLAIN = "a plain boring nondescript dim room wall in the background heavily but flatly out of focus with no decorations."
BG_BOOKS = "behind him a cluttered bookshelf packed with books and odds and ends, dim flat lighting, out of focus."

TALK = "caught mid-sentence talking, mouth slightly open, eyebrows slightly raised, a natural unposed moment"
NEUT = "neutral plain expression, looking straight into the camera, mouth closed"

# (id, seed, identity, pose, background)
JOBS = [
    # --- s7 variations (talking, bookshelf, nerdy flannel + thick glasses) ---
    ("s7var_v1", 5701,
     "an ordinary slightly nerdy man around 26, short dark hair, thick black-framed glasses, faint stubble, "
     "a plain checked flannel shirt, a bit awkward", TALK, BG_BOOKS),
    ("s7var_v2", 5702,
     "an ordinary slightly nerdy man around 27, short dark hair, thick black-framed glasses, faint stubble, "
     "a red-and-black checked flannel shirt, a bit awkward, head tilted slightly", TALK, BG_BOOKS),
    ("s7var_v3", 5703,
     "an ordinary slightly nerdy man around 25, short dark messy hair, thick black-framed glasses, light "
     "stubble, a blue checked flannel shirt, a bit awkward, slightly more serious look", TALK, BG_BOOKS),
    ("s7var_v4", 5704,
     "an ordinary slightly nerdy man around 28, short dark hair, thick square black glasses, short stubble, "
     "a grey-and-green checked flannel shirt, a bit awkward", TALK, BG_BOOKS),

    # --- q1 a bit OLDER (talking, plain wall, awkward wire glasses) ---
    ("q1older_t1", 2011,
     "an ordinary average-looking man around 35, pale skin with uneven texture, a few forehead wrinkles and "
     "faint crow's feet, short dark slightly messy hair with a receding hairline, thin round wire glasses, "
     "wide slightly intense earnest eyes, a plain light blue button-up shirt, a bit awkward, not handsome", TALK, BG_PLAIN),
    ("q1older_t2", 5102,
     "an ordinary average-looking man around 34, pale uneven skin with light wrinkles, short dark thinning "
     "hair with a receding hairline, thin round wire glasses, earnest eyes, a plain light blue button-up "
     "shirt, a bit awkward, not handsome, asymmetric plain face", TALK, BG_PLAIN),
    ("q1older_t3", 5103,
     "an ordinary man around 37, pale skin with forehead lines and faint eye bags, short dark hair receding "
     "at the temples, thin round wire glasses, a slightly awkward earnest look, a plain light blue button-up "
     "shirt, average non-model face", TALK, BG_PLAIN),

    # --- q2 with a casual SHIRT (neutral, plain wall, no glasses) ---
    ("q2shirt_n1", 2022,
     "an ordinary average young man around 25, plain flat mousy-brown hair, no glasses, ordinary forgettable "
     "face, a slightly tired neutral look, faint stubble, normal imperfect skin, wearing a plain casual "
     "button-up shirt, a simple everyday shirt slightly wrinkled, not fancy, not formal", NEUT, BG_PLAIN),
    ("q2shirt_n2", 5202,
     "an ordinary average young man around 26, plain short brown hair, no glasses, forgettable face, neutral "
     "tired look, light stubble, normal imperfect skin, wearing a plain casual checked button-up shirt, "
     "everyday and a bit wrinkled, not fancy", NEUT, BG_PLAIN),
    ("q2shirt_n3", 5203,
     "an ordinary average young man around 24, plain flat brown hair, no glasses, very normal face, neutral "
     "expression, faint stubble, normal skin, wearing a plain light denim casual shirt over a t-shirt, "
     "everyday and unironed, not fancy", NEUT, BG_PLAIN),
]

def gen(job):
    pid, seed, identity, pose, bg = job
    payload = {
        "prompt": f"{identity}, {pose}. {bg} {STYLE}",
        "aspect_ratio": "3:4",
        "num_images": 1,
        "seed": seed,
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
        results = list(ex.map(gen, JOBS))
    ok = 0
    for pid, out, info in sorted(results):
        flag = "OK  " if out else "FAIL"
        ok += 1 if out else 0
        print(f"[{flag}] {pid}: {info}")
    print(f"\n{ok}/{len(results)} -> {OUTDIR}")

if __name__ == "__main__":
    main()
