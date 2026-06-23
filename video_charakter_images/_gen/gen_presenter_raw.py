#!/usr/bin/env python3
"""Realistic *imperfect* talking-head close-ups that look like real screengrabs from amateur
vertical talking-head videos (NOT glossy AI renders). FLUX Pro Ultra in raw mode + imperfection prompts."""
import json, os
import requests
from concurrent.futures import ThreadPoolExecutor

API_KEY = "fa762e25-61b5-420d-a069-3804b4eeb863:f6cc83ac7235bcaccb23ed755fe6f8ae"
MODEL   = "fal-ai/flux-pro/v1.1-ultra"
OUTDIR  = r"C:\software_projekte\stacktags-promotion\video_charakter_images\presenter_v2_raw"

# Push HARD toward "real amateur video frame", away from studio/glam.
STYLE = ("a still frame screenshot from an amateur vertical talking-head video, candid snapshot, "
         "shot on a cheap webcam or front phone camera, flat dull ordinary indoor lighting, "
         "slightly soft focus, faint motion blur, visible digital noise and slight compression, "
         "mediocre everyday image quality, a plain boring nondescript dim room wall in the background "
         "heavily but flatly out of focus with no decorations, a black podcast microphone in the lower "
         "foreground just in front of the chin not covering the face, looking into the camera. "
         "unremarkable real person, NOT a model, NOT professional, no studio lighting, no cinematic look, "
         "no pretty bokeh, no glamour, no retouching")

# Ordinary, imperfect, varied everyday men (European/German everyman channel host vibe).
# (id, seed, identity)
PERSONAS = [
    ("q1_glasses_awkward", 2011,
     "an ordinary average-looking young man around 27, pale skin with uneven texture and slight redness, "
     "short dark slightly messy curly hair with a faint receding hairline, thin round wire glasses, "
     "wide slightly intense earnest eyes, a plain light blue button-up shirt, a bit awkward, not handsome, "
     "asymmetric plain face"),
    ("q2_plain_tshirt", 2022,
     "an ordinary average young man around 24, plain flat mousy-brown hair, no glasses, ordinary forgettable "
     "face, a slightly tired neutral look, faint stubble, wearing a plain grey t-shirt, normal imperfect skin"),
    ("q3_tired_hoodie", 2033,
     "an ordinary man around 31, thinning short hair, a slightly round face and double chin, patchy stubble, "
     "tired eyes with light bags, wearing a worn dark hoodie, very normal non-model appearance, uneven skin"),
    ("q4_acne_messy", 2044,
     "an ordinary skinny young man around 22, longer messy unstyled brown hair, some acne and uneven blotchy "
     "skin, sparse patchy facial hair, wearing a faded plain t-shirt, a bit nerdy and awkward"),
    ("q5_plaid_nerd", 2055,
     "an ordinary man around 29, plain short brown hair with a slightly crooked side part, thick black-framed "
     "glasses, mild stubble, a plaid flannel shirt, a slightly stiff awkward expression, plain ordinary face"),
    ("q6_average_smirk", 2066,
     "an ordinary man around 26, short plain dark hair, a faintly crooked nose and slightly uneven smile, "
     "light five o'clock shadow, wearing a simple dark crewneck, completely average everyday looks"),
]

POSES = [
    ("a_neutral", "neutral plain expression, looking straight into the camera, mouth closed"),
    ("b_talking", "caught mid-sentence talking, mouth slightly open, eyebrows slightly raised, a natural unposed moment"),
]

def gen(job):
    pid, seed, identity, pose_id, pose = job
    name = f"{pid}__{pose_id}"
    payload = {
        "prompt": f"{identity}, {pose}. {STYLE}",
        "aspect_ratio": "3:4",
        "num_images": 1,
        "seed": seed,
        "raw": True,                      # <-- key: natural, less-processed look
        "output_format": "jpeg",
        "enable_safety_checker": False,
        "safety_tolerance": "5",
    }
    headers = {"Authorization": f"Key {API_KEY}", "Content-Type": "application/json"}
    try:
        r = requests.post(f"https://fal.run/{MODEL}", json=payload, headers=headers, timeout=300)
        if r.status_code != 200:
            return name, None, f"HTTP {r.status_code}: {r.text[:300]}"
        res = r.json()
        url = res["images"][0]["url"]
        img = requests.get(url, timeout=300)
        out = os.path.join(OUTDIR, f"{name}.jpg")
        with open(out, "wb") as f:
            f.write(img.content)
        return name, out, f"seed={res.get('seed')}"
    except Exception as e:
        return name, None, f"{type(e).__name__}: {e}"

def main():
    os.makedirs(OUTDIR, exist_ok=True)
    jobs = [(pid, seed, identity, pose_id, pose)
            for pid, seed, identity in PERSONAS for pose_id, pose in POSES]
    with ThreadPoolExecutor(max_workers=6) as ex:
        results = list(ex.map(gen, jobs))
    ok = 0
    for name, out, info in sorted(results):
        flag = "OK  " if out else "FAIL"
        ok += 1 if out else 0
        print(f"[{flag}] {name}: {info}")
    print(f"\n{ok}/{len(results)} -> {OUTDIR}")

if __name__ == "__main__":
    main()
