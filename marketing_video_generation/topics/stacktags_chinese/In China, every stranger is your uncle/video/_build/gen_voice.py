# Generate the narration mp3 with ElevenLabs (Liam - Viral Short-Form Storyteller).
# stdlib only (urllib). Saves to ../../script_voice.mp3 (the title folder).
import json, os, sys, urllib.request, urllib.error

API_KEY = os.environ.get("ELEVENLABS_API_KEY", "")   # pass per-task: ELEVENLABS_API_KEY=... python gen_voice.py
if not API_KEY:
    print("set ELEVENLABS_API_KEY env var"); sys.exit(1)
VOICE_ID = "VCgLBmBjldJmfphyB8sZ"   # Liam - Viral Short-Form Storyteller
MODEL = "eleven_multilingual_v2"

NARRATION = """In China, the man at the shop, the bus driver, your neighbor — they're all your "uncle" or "aunty." But here's the irony: there's no single Chinese word for "uncle" at all. There are at least eight. Let me explain.

English has one lazy word — "uncle" — for a whole crowd of different people. Chinese refuses to be that vague. It needs to know exactly who you mean. Is he your father's brother, or your mother's? Is he older than your parent, or younger? Is he blood, or married in? Every combination is a different word. Father's older brother, father's younger brother, mother's brother, the husband of your father's sister — all completely separate terms. There's no neutral "uncle" to fall back on. The word itself tells you the exact relationship.

It's because family structure mattered so much that the language baked it right in — which side, which generation, which order of birth. You don't just say "uncle." You say precisely where he sits in the family.

And yet — Chinese uses these very same family words for total strangers. You call an older man "uncle," an older woman "aunty," a young woman "big sister" — as a sign of warmth and respect. Everyone gets slotted into the family.

So Chinese can't translate "uncle" with a single word — it has a whole map of them. But it'll happily call a stranger on the street your uncle. A language incredibly precise about family... that treats the entire world like one.

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
