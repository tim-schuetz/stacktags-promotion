#!/usr/bin/env python3
"""Round 6 (WHITE background):
  - new character: curly BLACK hair, early-to-mid 20s -> a few faces (neutral + talking)
  - variations of s7var_v3 (blue plaid / thick glasses / nerdy), a bit YOUNGER (talking)
Same imperfect amateur-video-frame style; FLUX Pro Ultra raw + degrade pass."""
import os
import requests
from concurrent.futures import ThreadPoolExecutor

API_KEY = "fa762e25-61b5-420d-a069-3804b4eeb863:f6cc83ac7235bcaccb23ed755fe6f8ae"
MODEL   = "fal-ai/flux-pro/v1.1-ultra"
OUTDIR  = r"C:\software_projekte\stacktags-promotion\video_charakter_images\presenter_v6_raw"

STYLE = ("a still frame screenshot from an amateur vertical talking-head video, candid snapshot, "
         "shot on a cheap webcam or front phone camera, flat dull ordinary lighting, "
         "slightly soft focus, faint motion blur, visible digital noise and slight compression, "
         "mediocre everyday image quality, a black podcast microphone in the lower foreground just in "
         "front of the chin not covering the face, looking into the camera. "
         "unremarkable real person, NOT a model, NOT professional, no studio lighting, no cinematic look, "
         "no pretty bokeh, no glamour, no retouching")

BG_WHITE = "a plain plain white wall in the background, bright flat even lighting, slightly overexposed, softly out of focus."

TALK = "caught mid-sentence talking, mouth slightly open, eyebrows slightly raised, a natural unposed moment"
NEUT = "neutral plain expression, looking straight into the camera, mouth closed"

# curly BLACK hair, early-to-mid 20s. (id, seed, identity)
CURLY = [
    ("c1_curly_grey_tee", 6101,
     "an ordinary young man around 22, short-to-medium curly black hair, light stubble, a plain grey "
     "t-shirt, normal imperfect skin, no glasses, average non-model face"),
    ("c2_curly_hoodie", 6102,
     "an ordinary young man around 24, curly black hair, clean shaven, a plain dark hoodie, a friendly "
     "slightly awkward look, normal skin, average face"),
    ("c3_curly_white_tee", 6103,
     "an ordinary young man around 21, curly black hair, a youthful face with slightly uneven skin and a "
     "few small spots, a plain white t-shirt, average looks, no glasses"),
    ("c4_curly_buttonup", 6104,
     "an ordinary young man around 23, curly black hair, light beard stubble, a plain casual button-up "
     "shirt, normal imperfect skin, average non-model face"),
    ("c5_curly_glasses", 6105,
     "an ordinary slightly nerdy young man around 25, curly black hair, round glasses, faint stubble, a "
     "plain crewneck sweater, average forgettable face"),
]

# s7var_v3 variations, a bit YOUNGER (talking). (id, seed, identity)
S7YOUNG = [
    ("s7young_v1", 6301,
     "an ordinary slightly nerdy young man around 22, short dark messy hair, thick black-framed glasses, "
     "faint stubble, a blue checked flannel shirt, a bit awkward, youthful face"),
    ("s7young_v2", 6302,
     "an ordinary slightly nerdy young man around 23, short dark hair, thick black-framed glasses, very "
     "light stubble, a blue checked flannel shirt, a bit awkward, youthful face"),
    ("s7young_v3", 6303,
     "an ordinary slightly nerdy young man around 22, short dark curly-ish hair, thick black-framed glasses, "
     "barely any stubble, a blue checked flannel shirt, a bit shy, young looking"),
    ("s7young_v4", 6304,
     "an ordinary slightly nerdy young man around 23, short dark hair, thick square black glasses, faint "
     "stubble, a blue-and-grey checked flannel shirt, a bit awkward, youthful face"),
]

def build_jobs():
    jobs = []
    for pid, seed, ident in CURLY:
        jobs.append((f"{pid}__a_neutral", seed, ident, NEUT))
        jobs.append((f"{pid}__b_talking", seed, ident, TALK))
    for pid, seed, ident in S7YOUNG:
        jobs.append((f"{pid}__b_talking", seed, ident, TALK))
    return jobs

def gen(job):
    pid, seed, identity, pose = job
    payload = {
        "prompt": f"{identity}, {pose}. {BG_WHITE} {STYLE}",
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
    jobs = build_jobs()
    with ThreadPoolExecutor(max_workers=6) as ex:
        results = list(ex.map(gen, jobs))
    ok = 0
    for pid, out, info in sorted(results):
        flag = "OK  " if out else "FAIL"
        ok += 1 if out else 0
        print(f"[{flag}] {pid}: {info}")
    print(f"\n{ok}/{len(results)} -> {OUTDIR}")

if __name__ == "__main__":
    main()
