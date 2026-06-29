# Generate the narration via ElevenLabs (Liam - Viral Short-Form Storyteller).
# Saves to the topic/title folder as script_voice.mp3 (one level above video/).
import json, os, sys, urllib.request, urllib.error

API_KEY = "sk_2ef1e55d611c664a21399d7c844d3f1f29e35177df10f6e8"
VOICE_ID = "VCgLBmBjldJmfphyB8sZ"   # Liam - Viral Short-Form Storyteller
MODEL = "eleven_multilingual_v2"

# Spoken text ONLY (verbatim from skript_text.txt, bracket directions stripped).
# No Chinese in the spoken track — every hanzi in this video is on-screen only.
TEXT = (
    "Is it actually possible to rewrite an entire language — by government order? "
    "Yes. It is. And yes — it can fail. China is proof of both.\n\n"
    "In the mid-1900s, most people in China couldn't read. The characters were "
    "beautiful — but brutally complex, often dozens of strokes each. So to lift "
    "literacy, the government did something almost no country ever does: it simplified "
    "the writing itself — by decree.\n\n"
    "Take a few everyday characters. In the 1950s, the first reform cut them down — "
    "fewer strokes, faster to write. And it worked.\n\n"
    "Literacy climbed — from around one in five adults who could read, to most of the "
    "country.\n\n"
    "So in 1977, they pushed their luck — a second round, simplifying even further. But "
    "this time, they went too far. The new forms were stripped down so much they lost "
    "their meaning — confusing, and unpopular. People just refused to use them.\n\n"
    "So in 1986, the government did something rare: it admitted the reform had failed, "
    "and scrapped the entire second round.\n\n"
    "Today, that first simplification is what the mainland writes — 简体, \"simplified\". "
    "But Taiwan and Hong Kong never adopted it — they kept the original 繁体, "
    "\"traditional\". One language... two ways to write it — redesigned from the top "
    "down, but only as far as the people would allow.\n\n"
    "Wanna actually start learning Chinese? Discover thousands of free exercises and "
    "more learning content on stacktags.io."
)

OUT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "script_voice.mp3"))

body = json.dumps({
    "text": TEXT,
    "model_id": MODEL,
    "voice_settings": {
        "stability": 0.45,
        "similarity_boost": 0.8,
        "style": 0.35,
        "use_speaker_boost": True,
    },
}).encode("utf-8")

req = urllib.request.Request(
    f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}?output_format=mp3_44100_128",
    data=body,
    headers={"xi-api-key": API_KEY, "Content-Type": "application/json", "Accept": "audio/mpeg"},
    method="POST",
)
try:
    with urllib.request.urlopen(req, timeout=120) as r:
        data = r.read()
except urllib.error.HTTPError as e:
    print("HTTPError", e.code, e.read().decode("utf-8", "replace"))
    sys.exit(1)

with open(OUT, "wb") as f:
    f.write(data)
print("SAVED", OUT, len(data), "bytes")
