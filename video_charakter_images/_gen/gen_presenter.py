#!/usr/bin/env python3
"""Generate realistic young-male presenter close-ups (podcast/creator look) via fal.ai FLUX Pro Ultra.
Several different people, each in several poses. Same seed per persona -> recognizable across poses."""
import json, os
import requests
from concurrent.futures import ThreadPoolExecutor

API_KEY = "fa762e25-61b5-420d-a069-3804b4eeb863:f6cc83ac7235bcaccb23ed755fe6f8ae"
MODEL   = "fal-ai/flux-pro/v1.1-ultra"
OUTDIR  = r"C:\software_projekte\stacktags-promotion\video_charakter_images\presenter_v1"

SHOT = ("photorealistic, ultra realistic photograph, shot on 50mm lens, shallow depth of field, "
        "soft cinematic lighting, head and shoulders close-up portrait, "
        "a black podcast microphone on a boom arm in the lower foreground, positioned slightly in front of "
        "his chin in the lower part of the frame, NOT covering his face, face fully visible, "
        "cozy modern room background softly blurred with warm bokeh, highly detailed natural skin texture, "
        "sharp focus on the eyes, 4k, professional content creator portrait")

# (id, seed, identity, background)
PERSONAS = [
    ("p1_brown_hoodie", 1011,
     "a friendly approachable young man around 25 years old, short tidy brown hair, light stubble, "
     "warm genuine look, wearing a casual heather-grey hoodie",
     "bright modern room with green plants and warm shelf lights in the blurred background"),
    ("p2_glasses_shirt", 1022,
     "a smart clean-cut young man around 27 years old, dark short hair, modern clear acetate glasses, "
     "neat light beard, wearing a navy button-up shirt",
     "home office with a wooden bookshelf and a warm desk lamp, a subtle turquoise teal accent light in the blurred background"),
    ("p3_curly_beard", 1033,
     "a trendy young man around 23 years old, dark curly hair, full short beard, a thin gold chain, "
     "wearing a plain black t-shirt",
     "creator studio room with soft RGB LED ambient light in turquoise and blue, acoustic foam panels softly blurred"),
    ("p4_blonde_tshirt", 1044,
     "a cheerful young man around 24 years old, light blonde hair, clean shaven, blue eyes, "
     "wearing a plain white crew-neck t-shirt",
     "minimal bright Scandinavian room with soft daylight and a single plant in the blurred background"),
    ("p5_fade_sweater", 1055,
     "a confident young Black man around 28 years old, short fade haircut, neat short beard, "
     "wearing a dark green crew-neck sweater",
     "modern studio with warm wood tones and a subtle turquoise neon accent in the blurred background"),
    ("p6_asian_overshirt", 1066,
     "a relaxed young East Asian man around 26 years old, modern medium-length hairstyle, clean shaven, "
     "wearing an olive-green overshirt over a t-shirt",
     "cozy room with warm string lights and a shelf of books softly blurred in the background"),
]

# (pose_id, pose clause)
POSES = [
    ("a_neutral",   "calm confident neutral expression, looking straight into the camera"),
    ("b_explain",   "mid-sentence, talking and explaining with an engaged expression, one hand slightly raised gesturing near the chest"),
    ("c_smile",     "warm friendly smile, head turned slightly to one side, relaxed and natural"),
]

def build_prompt(identity, background, pose):
    return f"{identity}, {pose}. {background}. {SHOT}"

def gen(job):
    pid, seed, identity, background, pose_id, pose = job
    name = f"{pid}__{pose_id}"
    payload = {
        "prompt": build_prompt(identity, background, pose),
        "aspect_ratio": "3:4",
        "num_images": 1,
        "seed": seed,
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
    jobs = []
    for pid, seed, identity, background in PERSONAS:
        for pose_id, pose in POSES:
            jobs.append((pid, seed, identity, background, pose_id, pose))
    with ThreadPoolExecutor(max_workers=6) as ex:
        results = list(ex.map(gen, jobs))
    ok = 0
    for name, out, info in sorted(results):
        flag = "OK  " if out else "FAIL"
        if out: ok += 1
        print(f"[{flag}] {name}: {info}")
    print(f"\n{ok}/{len(results)} generated -> {OUTDIR}")

if __name__ == "__main__":
    main()
