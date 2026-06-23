#!/usr/bin/env python3
"""Round 4 host candidates: same approved imperfect amateur-video-frame style as v2 q1/q2.
Constraints from user: mid-to-late 20s, DARK/BROWN SHORT hair only (no blondes, no long hair),
ordinary/awkward 'q1/q2 type', untidy shelf/desk background. FLUX Pro Ultra raw + degrade pass."""
import os
import requests
from concurrent.futures import ThreadPoolExecutor

API_KEY = "fa762e25-61b5-420d-a069-3804b4eeb863:f6cc83ac7235bcaccb23ed755fe6f8ae"
MODEL   = "fal-ai/flux-pro/v1.1-ultra"
OUTDIR  = r"C:\software_projekte\stacktags-promotion\video_charakter_images\presenter_v4_raw"

STYLE = ("a still frame screenshot from an amateur vertical talking-head video, candid snapshot, "
         "shot on a cheap webcam or front phone camera, flat dull ordinary indoor lighting, "
         "slightly soft focus, faint motion blur, visible digital noise and slight compression, "
         "mediocre everyday image quality, a black podcast microphone in the lower foreground just in "
         "front of the chin not covering the face, looking into the camera. "
         "unremarkable real person, NOT a model, NOT professional, no studio lighting, no cinematic look, "
         "no pretty bokeh, no glamour, no retouching")

# All: mid-to-late 20s, dark/brown SHORT hair, no blonde, no long hair. (id, seed, identity, background)
PERSONAS = [
    ("s1_wire_glasses_books", 4011,
     "an ordinary slightly awkward man around 26, short dark-brown hair, pale uneven skin, thin round "
     "wire glasses, earnest eyes, a plain light grey button-up shirt, average non-model face",
     "behind him an out-of-focus cluttered bookshelf full of messy books, dim ordinary room"),
    ("s2_clean_desk", 4022,
     "an ordinary man around 25, short brown hair, clean shaven, a plain neutral expression, wearing a "
     "plain navy t-shirt, normal imperfect skin, no glasses",
     "behind him a messy desk with scattered papers, a mug and tangled cables, dim home room, out of focus"),
    ("s3_square_glasses_hoodie", 4033,
     "an ordinary man around 28, short dark hair, square glasses, short patchy stubble, a worn dark hoodie, "
     "a bit tired, forgettable average looks",
     "behind him a shelf with random clutter and boxes, plain untidy dim room, softly out of focus"),
    ("s4_sidepart_olive", 4044,
     "an ordinary man around 27, short brown hair with a side part, no glasses, light stubble, a plain "
     "olive-green t-shirt, very normal everyday appearance",
     "behind him an out-of-focus bookshelf with messy books and a couple of trinkets, dim ordinary room"),
    ("s5_beard_henley_monitor", 4055,
     "an ordinary man around 29, short dark hair, a neat thin short beard, wearing a plain charcoal henley, "
     "average non-model face, normal skin",
     "behind him a desk with the edge of a monitor, papers and a keyboard, plain dim room, out of focus"),
    ("s6_messy_crewneck", 4066,
     "an ordinary man around 24, short messy dark-brown hair, no glasses, clean shaven, a plain dark "
     "crewneck sweater, plain forgettable face, normal imperfect skin",
     "behind him a shelf with random odds and ends, untidy dim home room, softly out of focus"),
    ("s7_thick_glasses_flannel", 4077,
     "an ordinary slightly nerdy man around 26, short dark hair, thick black-framed glasses, faint stubble, "
     "a plain checked flannel shirt, a bit awkward",
     "behind him a cluttered bookshelf packed with books and odds and ends, dim flat lighting, out of focus"),
    ("s8_plain_white_tee", 4088,
     "an ordinary man around 28, short brown hair, clean shaven, a completely average forgettable face, "
     "wearing a plain white t-shirt, normal skin, no glasses",
     "behind him a messy desk and shelf with random stuff, plain dim ordinary room, out of focus"),
]

POSES = [
    ("a_neutral", "neutral plain expression, looking straight into the camera, mouth closed"),
    ("b_talking", "caught mid-sentence talking, mouth slightly open, eyebrows slightly raised, a natural unposed moment"),
]

def gen(job):
    pid, seed, identity, background, pose_id, pose = job
    name = f"{pid}__{pose_id}"
    payload = {
        "prompt": f"{identity}, {pose}. {background}. {STYLE}",
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
    jobs = [(pid, seed, identity, bg, pose_id, pose)
            for pid, seed, identity, bg in PERSONAS for pose_id, pose in POSES]
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
