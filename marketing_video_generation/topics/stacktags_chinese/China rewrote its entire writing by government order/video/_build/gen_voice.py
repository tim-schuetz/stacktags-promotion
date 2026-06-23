# Generate the narration via ElevenLabs (Liam - Viral Short-Form Storyteller).
# Saves to the topic/title folder as script_voice.mp3 (one level above video/).
import json, os, sys, urllib.request, urllib.error

API_KEY = "sk_2ef1e55d611c664a21399d7c844d3f1f29e35177df10f6e8"
VOICE_ID = "VCgLBmBjldJmfphyB8sZ"   # Liam - Viral Short-Form Storyteller
MODEL = "eleven_multilingual_v2"

# Spoken text ONLY (verbatim from skript_text.txt, bracket directions stripped).
# No Chinese in the spoken track — every hanzi in this video is on-screen only.
TEXT = (
    "In the 20th century, China did something almost no country ever does: it "
    "rewrote its own writing — by government order. The first time, it stuck. The "
    "second time, it was such a disaster they had to cancel it. Here's the story of "
    "how you redesign a language — and how it can backfire.\n\n"
    "Back in the mid-1900s, most people in China couldn't read. The characters were "
    "beautiful — but complex, often with dozens of strokes each. So to lift literacy, "
    "the government decided to simplify the writing itself — officially cutting "
    "strokes and streamlining thousands of characters.\n\n"
    "That first simplification, through the 1950s and 60s, largely worked. Characters "
    "got faster to write, literacy climbed — and \"Simplified Chinese\" is still what "
    "the mainland uses today, while Taiwan and Hong Kong kept the original, "
    "traditional forms. So far, a rare success in engineering a language. Then they "
    "pushed their luck.\n\n"
    "In 1977 came a second round, simplifying characters even further. But this one "
    "went too far. The new forms were confusing, stripped of so much that they lost "
    "their clarity — and people hated them. It was so unpopular that in 1986, the "
    "government officially scrapped the entire second round. A rare, public admission "
    "that a language reform had simply failed.\n\n"
    "Most languages drift and evolve slowly, on their own. China engineered its "
    "writing by decree — proving you really can redesign a language from the top "
    "down... but only up to the point where the people writing it push back.\n\n"
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
