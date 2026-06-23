# Generate the narration via ElevenLabs (Liam - Viral Short-Form Storyteller).
# Saves to the topic/title folder as script_voice.mp3 (one level above video/).
import json, os, sys, urllib.request, urllib.error

API_KEY = "sk_2ef1e55d611c664a21399d7c844d3f1f29e35177df10f6e8"
VOICE_ID = "VCgLBmBjldJmfphyB8sZ"   # Liam - Viral Short-Form Storyteller
MODEL = "eleven_multilingual_v2"

# Spoken text ONLY (verbatim from skript_text.txt, [bracket] directions stripped).
# "biang" is spelled without the tone mark so the voice says it naturally; on
# screen it is shown as "biáng".
TEXT = (
    "This is one single Chinese character. It has around 58 strokes, it means one "
    "specific kind of noodle — and until 2020, no computer on Earth could type it.\n\n"
    "Meet biang. Most Chinese characters have a handful of strokes — five, ten, maybe "
    "fifteen. This one crams nearly sixty strokes into a single character. It's so "
    "packed it looks less like writing and more like a tiny painting. And after all "
    "that complexity, it means... just one thing.\n\n"
    "Biang biang noodles — a thick, hand-pulled noodle from the Shaanxi region of "
    "China. That's it. One of the most complicated characters ever, for one bowl of "
    "food. It doesn't even appear in standard dictionaries. As the story goes, it was "
    "dreamed up around a noodle stall — the biang being the slapping sound of the "
    "dough hitting the table.\n\n"
    "And because it's so rare and so complex, for years it simply didn't exist in "
    "Unicode — the master list of every character computers can display. So you "
    "couldn't type it, text it, or put it on a digital menu. Restaurants had to draw "
    "it by hand or paste in a picture. Only in 2020 did it finally get added — so "
    "computers could at last render a single bowl of noodles.\n\n"
    "A character too complicated for the digital age — invented for a plate of "
    "noodles. Proof that even in a world of emojis, some words are just too gloriously "
    "complex to type. Wanna actually start learning Chinese? Discover thousands of "
    "free exercises and more learning content on stacktags.io."
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
