# Generate the narration mp3 with ElevenLabs (Liam - Viral Short-Form Storyteller).
# stdlib only (urllib). Saves to ../../script_voice.mp3 (the title folder).
import json, os, sys, urllib.request, urllib.error

API_KEY = os.environ.get("ELEVENLABS_API_KEY", "")   # pass per-task: ELEVENLABS_API_KEY=... python gen_voice.py
if not API_KEY:
    print("set ELEVENLABS_API_KEY env var"); sys.exit(1)
VOICE_ID = "VCgLBmBjldJmfphyB8sZ"   # Liam - Viral Short-Form Storyteller
MODEL = "eleven_multilingual_v2"

# Spoken-only narration (storyboard [brackets] + header stripped from skript_text.txt).
# Numbers are spelled as words to force a digit-by-digit read ("five two zero", not
# "five hundred twenty"). Pinyin keeps tone marks — eleven_multilingual_v2 code-switches;
# if it reads them oddly, respell phonetically (woo ar ling / waw eye nee / ar bye woo).
NARRATION = """In China, "five two zero" means "I love you." But "two five zero" means "you idiot." Numbers there aren't just numbers — they're a whole secret language. Here's how to read it.

It works because Chinese is full of words that sound almost exactly like numbers. So people started using strings of numbers as code — something you can text, comment, or even put on a gift. A few digits standing in for a whole phrase.

Say five two zero fast — wǔ èr líng — and it sounds like wǒ ài nǐ: "I love you." It's so well known that May twentieth — written five twenty — has become an unofficial romance day, like a second Valentine's. Add "one three one four" — which sounds like "forever, a lifetime" — and "five two zero, one three one four" means "I'll love you forever."

But the same trick cuts the other way. Call someone a "two five zero" — èr bǎi wǔ — and you've called them a fool. The story goes it comes from an old expression about half a string of coins — being "not quite all there." And there's more: "eight eight" sounds like "bye-bye." "Six six six" means you're a legend, seriously skilled. A few digits can carry an entire mood.

So a string of numbers in a Chinese chat might be a maths problem... or a love letter... or an insult. One block of numbers — two completely different worlds.

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
