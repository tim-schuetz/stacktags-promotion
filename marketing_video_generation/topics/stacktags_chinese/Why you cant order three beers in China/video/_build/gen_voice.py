# Generate the narration mp3 with ElevenLabs (Liam - Viral Short-Form Storyteller).
# stdlib only (urllib). Saves to ../../script_voice.mp3 (the title folder).
import json, os, sys, urllib.request, urllib.error

API_KEY = os.environ.get("ELEVENLABS_API_KEY", "")   # pass per-task: ELEVENLABS_API_KEY=... python gen_voice.py
if not API_KEY:
    print("set ELEVENLABS_API_KEY env var"); sys.exit(1)
VOICE_ID = "VCgLBmBjldJmfphyB8sZ"   # Liam - Viral Short-Form Storyteller
MODEL = "eleven_multilingual_v2"

NARRATION = """In China, you can't order "three beer." And the reason has nothing to do with alcohol — but with grammar.

In Chinese, you can't put a number straight onto a noun. No "three beer," no "two dog," no "five book." Between the number and the thing, you need a "measure word" — a classifier. So "three beers" becomes, literally, "three bottles beer" — 三瓶啤酒. That little 瓶, "bottle," is the measure word. Leave it out, and it's broken Chinese.

And it goes deeper. There are over 150 of these measure words — and which one you use depends on the shape or type of thing. Flat things, long things, animals, books, machines — almost everything has its own.

But here's the relief. One general measure word — 个 — works for the huge majority of cases. By some counts, around 94% of the time. So if you blank on the exact one, 个 will usually save you. Not always perfect — but understood.

In English, "three" just works on everything. In Chinese, you have to know what kind of thing you're counting before you can count it. Which is why ordering three beers is secretly a grammar exam.

Wanna actually start learning Chinese? Discover thousands of free exercises and more learning content on stacktags.io."""

OUT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "script_voice.mp3"))

body = json.dumps({
    "text": NARRATION,
    "model_id": MODEL,
    "voice_settings": {
        "stability": 0.45,
        "similarity_boost": 0.8,
        "style": 0.35,
        "use_speaker_boost": True,
    },
}).encode("utf-8")

url = f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}?output_format=mp3_44100_128"
req = urllib.request.Request(url, data=body, method="POST", headers={
    "xi-api-key": API_KEY,
    "Content-Type": "application/json",
    "Accept": "audio/mpeg",
})

try:
    with urllib.request.urlopen(req, timeout=120) as r:
        data = r.read()
except urllib.error.HTTPError as e:
    print("HTTP", e.code, e.read().decode("utf-8", "replace"))
    sys.exit(1)

with open(OUT, "wb") as f:
    f.write(data)
print("WROTE", OUT, round(len(data) / 1024), "KB")
print("WORDS", len(NARRATION.split()))
