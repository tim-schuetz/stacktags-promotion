#!/usr/bin/env python3
"""Round 7:
  A) NEW: light/fair-skinned men with BLACK hair, early-to-mid 20s (white bg, neutral+talking)
  B) variations (new faces, same look+background as the source image) of:
       s7young_v3 (white bg, talking) · r1_glasses_books (bookshelf, neutral)
       q1_glasses_awkward (plain dim wall, talking) · q2_plain_tshirt (plain dim wall, neutral)
FLUX Pro Ultra raw mode; then degrade_videoframe.py."""
import os
import requests
from concurrent.futures import ThreadPoolExecutor

API_KEY = "fa762e25-61b5-420d-a069-3804b4eeb863:f6cc83ac7235bcaccb23ed755fe6f8ae"
MODEL   = "fal-ai/flux-pro/v1.1-ultra"
OUTDIR  = r"C:\software_projekte\stacktags-promotion\video_charakter_images\presenter_v7_raw"

STYLE = ("a still frame screenshot from an amateur vertical talking-head video, candid snapshot, "
         "shot on a cheap webcam or front phone camera, flat dull ordinary lighting, "
         "slightly soft focus, faint motion blur, visible digital noise and slight compression, "
         "mediocre everyday image quality, a black podcast microphone in the lower foreground just in "
         "front of the chin not covering the face, looking into the camera. "
         "unremarkable real person, NOT a model, NOT professional, no studio lighting, no cinematic look, "
         "no pretty bokeh, no glamour, no retouching")

BG_WHITE = "a plain white wall in the background, bright flat even lighting, slightly overexposed, softly out of focus."
BG_BOOKS = "behind him an out-of-focus cluttered bookshelf full of messy books, dim ordinary room."
BG_PLAIN = "a plain boring nondescript dim room wall in the background heavily but flatly out of focus with no decorations."

TALK = "caught mid-sentence talking, mouth slightly open, eyebrows slightly raised, a natural unposed moment"
NEUT = "neutral plain expression, looking straight into the camera, mouth closed"

# A) light/fair skin + BLACK hair, early-to-mid 20s (white bg). (id, seed, identity)
LIGHT = [
    ("L1_blackwavy_tee", 7011,
     "an ordinary young man around 22, black wavy hair, very fair pale skin, light stubble, a plain grey "
     "t-shirt, no glasses, average European-looking non-model face"),
    ("L2_blackcurly_hoodie", 7012,
     "an ordinary young man around 24, black curly hair, fair pale skin, clean shaven, a plain dark hoodie, "
     "a friendly slightly awkward look, average European face"),
    ("L3_blackcurly_whitetee", 7013,
     "an ordinary young man around 21, black curly hair, pale skin with a few freckles, a plain white "
     "t-shirt, youthful, no glasses, average European look"),
    ("L4_blackshort_glasses", 7014,
     "an ordinary slightly nerdy young man around 23, short black hair, pale skin, black-framed glasses, "
     "faint stubble, a plain casual button-up shirt, average European face"),
    ("L5_blackwavy_sweater", 7015,
     "an ordinary young man around 25, slightly wavy black hair, fair skin, short beard stubble, a plain "
     "crewneck sweater, average European non-model face"),
    ("L6_blackneat_navytee", 7016,
     "an ordinary young man around 26, short neat black hair, pale skin, clean shaven, a plain navy "
     "t-shirt, completely average European look"),
]

# B) variation sets. (id, seed, identity, pose, bg)
VARS = [
    # s7young_v3 -> white bg, talking, young nerdy blue plaid thick glasses, shy
    ("s7young_v3_var1", 7301, "an ordinary slightly nerdy young man around 22, short dark hair, thick black-framed glasses, barely any stubble, a blue checked flannel shirt, a bit shy, young looking", TALK, BG_WHITE),
    ("s7young_v3_var2", 7302, "an ordinary slightly nerdy young man around 22, short dark slightly wavy hair, thick black-framed glasses, very light stubble, a blue checked flannel shirt, a bit shy, youthful face", TALK, BG_WHITE),
    ("s7young_v3_var3", 7303, "an ordinary slightly nerdy young man around 23, short dark hair, thick black-framed glasses, barely any stubble, a blue checked flannel shirt, a bit awkward, young looking", TALK, BG_WHITE),
    ("s7young_v3_var4", 7304, "an ordinary slightly nerdy young man around 22, short dark messy hair, thick black square glasses, barely any stubble, a blue checked flannel shirt, shy, youthful", TALK, BG_WHITE),

    # r1_glasses_books -> bookshelf, neutral, awkward wire glasses, light blue button-up, pale
    ("r1_var1", 7101, "an ordinary awkward young man around 26, pale uneven skin, short dark slightly messy hair, thin round wire glasses, wide earnest eyes, a plain light blue button-up shirt, not handsome", NEUT, BG_BOOKS),
    ("r1_var2", 7102, "an ordinary awkward young man around 25, pale skin, short dark hair, thin round wire glasses, earnest eyes, a plain light blue button-up shirt, average non-model face", NEUT, BG_BOOKS),
    ("r1_var3", 7103, "an ordinary awkward young man around 27, pale uneven skin, short dark hair, thin round wire glasses, a plain light blue button-up shirt, a bit shy, asymmetric plain face", NEUT, BG_BOOKS),
    ("r1_var4", 7104, "an ordinary awkward young man around 26, pale skin, short dark slightly messy hair, thin round metal glasses, a plain light grey-blue button-up shirt, not handsome", NEUT, BG_BOOKS),

    # q1_glasses_awkward -> plain dim wall, talking, awkward wire glasses
    ("q1_var1", 7201, "an ordinary average-looking young man around 27, pale skin with uneven texture, short dark slightly messy curly hair with a faint receding hairline, thin round wire glasses, wide slightly intense earnest eyes, a plain light blue button-up shirt, a bit awkward, not handsome", TALK, BG_PLAIN),
    ("q1_var2", 7202, "an ordinary average-looking young man around 26, pale uneven skin, short dark messy hair, thin round wire glasses, wide earnest eyes, a plain light blue button-up shirt, a bit awkward, asymmetric plain face", TALK, BG_PLAIN),
    ("q1_var3", 7203, "an ordinary average-looking young man around 28, pale skin, short dark curly hair, thin round wire glasses, intense earnest eyes, a plain light blue button-up shirt, awkward, not handsome", TALK, BG_PLAIN),
    ("q1_var4", 7204, "an ordinary average-looking young man around 27, pale skin with slight redness, short dark slightly messy hair, thin round wire glasses, wide eyes, a plain pale blue button-up shirt, a bit awkward", TALK, BG_PLAIN),

    # q2_plain_tshirt -> plain dim wall, neutral, plain ordinary guy, grey t-shirt, no glasses (brown hair)
    ("q2_var1", 7401, "an ordinary average young man around 24, plain flat mousy-brown hair, no glasses, ordinary forgettable face, a slightly tired neutral look, faint stubble, a plain grey t-shirt, normal imperfect skin", NEUT, BG_PLAIN),
    ("q2_var2", 7402, "an ordinary average young man around 25, plain short brown hair, no glasses, forgettable face, tired neutral look, light stubble, a plain grey t-shirt, normal skin", NEUT, BG_PLAIN),
    ("q2_var3", 7403, "an ordinary average young man around 23, plain flat brown hair, no glasses, very normal face, neutral look, faint stubble, a plain heather-grey t-shirt, normal imperfect skin", NEUT, BG_PLAIN),
    ("q2_var4", 7404, "an ordinary average young man around 26, plain short brown hair, no glasses, forgettable ordinary face, neutral tired look, faint stubble, a plain grey t-shirt", NEUT, BG_PLAIN),
]

def build_jobs():
    jobs = []
    for pid, seed, ident in LIGHT:
        jobs.append((f"{pid}__a_neutral", seed, ident, NEUT, BG_WHITE))
        jobs.append((f"{pid}__b_talking", seed, ident, TALK, BG_WHITE))
    for pid, seed, ident, pose, bg in VARS:
        jobs.append((pid, seed, ident, pose, bg))
    return jobs

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
