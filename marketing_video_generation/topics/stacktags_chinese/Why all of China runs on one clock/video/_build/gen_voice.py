# Generate the narration mp3 with ElevenLabs (Liam - Viral Short-Form Storyteller).
# stdlib only (urllib). Saves to ../../script_voice.mp3 (the title folder).
import json, os, sys, urllib.request, urllib.error

API_KEY = os.environ.get("ELEVENLABS_API_KEY", "")   # pass per-task: ELEVENLABS_API_KEY=... python gen_voice.py
if not API_KEY:
    print("set ELEVENLABS_API_KEY env var"); sys.exit(1)
VOICE_ID = "VCgLBmBjldJmfphyB8sZ"   # Liam - Viral Short-Form Storyteller
MODEL = "eleven_multilingual_v2"

NARRATION = """China is almost 5,000 kilometers wide — wide enough to cross five time zones. But the entire country runs on a single clock: Beijing time.

Which means that out in the far west, the sun sometimes doesn't come up until ten in the morning.

Geographically, China is about as wide as the United States — which uses four separate time zones. So China should have roughly five.

But in 1949, the new government scrapped them all and put the whole nation on one time — Beijing time — as a symbol of national unity. One country, one clock.

Near Beijing, that's fine. But thousands of kilometers west, in Xinjiang, the official time is wildly out of step with the sky. In winter, sunrise can come around 10 a.m. — and the sun can still be up late into the evening.

So people out there quietly run their lives on an unofficial Xinjiang time — two hours behind Beijing. The buses, the shops, when you meet for dinner...

Ask someone the time, and you might have to ask back: Beijing time, or our time?

A single time zone keeps the country on the same page. But the sun doesn't take orders from Beijing — so half a continent away, people just quietly made their own time anyway...

Want more places that break the map? Follow Stacktags."""

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
