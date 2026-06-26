#!/usr/bin/env python3
"""More host candidates in the approved 'imperfect amateur talking-head' style (cf. v2 q1/q2),
now with an UNTIDY background (bookshelf / messy desk / shelf, dim & out of focus).
FLUX Pro Ultra raw mode. Then run degrade_videoframe.py on the output folder."""
import os
import requests
from concurrent.futures import ThreadPoolExecutor

API_KEY = "fa762e25-61b5-420d-a069-3804b4eeb863:f6cc83ac7235bcaccb23ed755fe6f8ae"
MODEL   = "fal-ai/flux-pro/v1.1-ultra"
OUTDIR  = r"C:\software_projekte\stacktags-promotion\video_charakter_images\presenter_v3_raw"

STYLE = ("a still frame screenshot from an amateur vertical talking-head video, candid snapshot, "
         "shot on a cheap webcam or front phone camera, flat dull ordinary indoor lighting, "
         "slightly soft focus, faint motion blur, visible digital noise and slight compression, "
         "mediocre everyday image quality, a black podcast microphone in the lower foreground just in "
         "front of the chin not covering the face, looking into the camera. "
         "unremarkable real person, NOT a model, NOT professional, no studio lighting, no cinematic look, "
         "no pretty bokeh, no glamour, no retouching")

# Two approved vibes: "awkward glasses guy" (q1) and "plain ordinary guy" (q2). Each gets an untidy bg.
# (id, seed, identity, background)
PERSONAS = [
    # --- awkward / glasses family (like q1) ---
    ("r1_glasses_books", 3011,
     "an ordinary awkward young man around 26, pale uneven skin, short dark slightly messy hair, "
     "thin round wire glasses, wide earnest eyes, a plain light blue button-up shirt, not handsome",
     "behind him an out-of-focus cluttered bookshelf full of messy books and a few random objects, dim ordinary room"),
    ("r2_nerd_desk", 3022,
     "an ordinary skinny nerdy young man around 23, slightly greasy flat brown hair, rectangular glasses, "
     "faint patchy stubble, a plain grey t-shirt, a bit awkward, forgettable face",
     "behind him a messy desk with scattered papers, a coffee mug, tangled cables and the edge of a monitor, dim room, out of focus"),
    ("r3_glasses_polo", 3033,
     "an ordinary man around 28, mild double chin, thick black-framed glasses, plain short hair, "
     "a slightly stiff expression, wearing a simple polo shirt, average non-model looks",
     "behind him a shelf with books and a small dull houseplant, plain untidy room, softly out of focus"),
    ("r4_ginger_glasses", 3044,
     "an ordinary pale young man around 24, light ginger hair, freckles, oval glasses, sparse stubble, "
     "a plain checked button-up shirt, a bit awkward and shy",
     "behind him an untidy shelf with random boxes and clutter, dim flat-lit ordinary room, out of focus"),
    # --- plain ordinary family (like q2) ---
    ("r5_plain_books", 3055,
     "an ordinary average young man around 25, short brown hair, light stubble, a slightly tired neutral "
     "look, wearing a plain heather-grey t-shirt, normal imperfect skin, no glasses",
     "behind him an out-of-focus bookshelf with messy books and a couple of trinkets, dim ordinary room"),
    ("r6_buzz_desk", 3066,
     "an ordinary man around 27, short buzzcut hair, faint stubble, a plain dark t-shirt, forgettable "
     "average face, normal skin",
     "behind him a cluttered desk with a keyboard, papers and a mug, plain dim home room, out of focus"),
    ("r7_hoodie_shelf", 3077,
     "an ordinary young man around 22, slightly long unstyled brown hair, no glasses, a worn grey hoodie, "
     "a relaxed plain expression, very normal looks",
     "behind him a shelf with random clutter, a tangled cable and some boxes, untidy dim room, softly out of focus"),
    ("r8_receding_sweater", 3088,
     "an ordinary man around 30, short receding hair, light beard stubble, a plain knit sweater, "
     "average everyday non-model appearance, tired eyes",
     "behind him a messy bookshelf packed with books and odds and ends, dim flat lighting, out of focus"),
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
