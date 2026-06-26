# Generate the narration mp3 with ElevenLabs (Liam - Viral Short-Form Storyteller).
# stdlib only (urllib). Saves to ../../script_voice.mp3 (the title folder).
import json, os, sys, urllib.request, urllib.error

API_KEY = os.environ.get("ELEVENLABS_API_KEY", "")   # pass per-task: ELEVENLABS_API_KEY=... python gen_voice.py
if not API_KEY:
    print("set ELEVENLABS_API_KEY env var"); sys.exit(1)
VOICE_ID = "VCgLBmBjldJmfphyB8sZ"   # Liam - Viral Short-Form Storyteller
MODEL = "eleven_multilingual_v2"

# Spoken-only narration (storyboard [brackets] + header stripped from skript_text.txt).
# Numbers spelled as words for clean reads ("twelve", "twenty twelve"). The single
# Chinese word here (lóng) carries a tone mark — eleven_multilingual_v2 code-switches;
# if it reads oddly, respell phonetically (long).
NARRATION = """Every twelve years, China — and much of East Asia — has a baby boom. Not because of the economy. Not because of policy. Because of the zodiac. Parents want their child born in the Year of the Dragon.

The Chinese zodiac runs on twelve animals, one per year. And the Dragon is the most prized of them all — tied to strength, luck, ambition, success. A "dragon child" is seen as destined for great things. So couples actually plan around it — trying to time a birth for a dragon year.

And here's the wild part: you can see it in the numbers. In dragon years, births rise. China's last full dragon year, twenty twelve, brought a clear bump — reportedly the most births in over a decade. And the effect is even sharper in places like Taiwan, Hong Kong, and Singapore, where dragon years produce a visible spike — followed by a dip the very next year. A superstition, leaving a hard fingerprint on a country's demographics.

There's even a catch for the dragon kids themselves. Being born in a boom year means a bigger generation — so more competition for school places, university spots, jobs, their whole lives. A lucky sign... and a very crowded class.

We tend to think of superstition as harmless. But the wish for a dragon child literally bends the birth rate of the most populous region on Earth — every twelve years, like clockwork.

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
