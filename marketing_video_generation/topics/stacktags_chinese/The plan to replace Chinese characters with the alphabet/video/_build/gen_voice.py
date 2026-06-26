# Generate the narration mp3 with ElevenLabs (Liam - Viral Short-Form Storyteller).
# stdlib only (urllib). Saves to ../../script_voice.mp3 (the title folder).
import json, os, sys, urllib.request, urllib.error

API_KEY = os.environ.get("ELEVENLABS_API_KEY", "")   # pass per-task: ELEVENLABS_API_KEY=... python gen_voice.py
if not API_KEY:
    print("set ELEVENLABS_API_KEY env var"); sys.exit(1)
VOICE_ID = "VCgLBmBjldJmfphyB8sZ"   # Liam - Viral Short-Form Storyteller
MODEL = "eleven_multilingual_v2"

# Spoken text ONLY — exactly the un-bracketed words from skript_text.txt.
NARRATION = """Pinyin — the system that spells Chinese with the Latin alphabet — was originally built to do one thing: replace Chinese characters completely. The plan was to let the alphabet quietly kill them off. It failed. And today, it does the exact opposite.

Pinyin is the system that writes Chinese sounds using our familiar A-B-C letters. It was created in the 1950s by a committee led by a man named Zhou Youguang, who's often called the father of Pinyin.

But for many of the reformers behind it — including Mao himself — Pinyin wasn't meant to just sit politely beside the characters. It was meant to gradually replace them. The thinking went: the characters were too hard, holding back literacy; the future was a simple alphabet, like most of the world used. Pinyin was the bridge to get there. Now, the honest part: that goal was never fully written into law — and it was never officially declared dead, either. It was simply... buried. As literacy rose and the country modernized, the appetite to throw out thousands of years of characters faded, and Pinyin got quietly reclassified as a helper — a way to teach pronunciation and sound out characters, not to replace them.

And here's the twist. Pinyin didn't kill the characters. It saved them. Because today, how do you type Chinese on a phone or a keyboard? You type the Pinyin — and pick the character from a list. The system built to replace the characters is now the main reason they thrive in the digital age.

So Pinyin was a weapon aimed straight at Chinese characters — that completely missed, and became their life support instead. The bridge meant to lead away from the characters is now the bridge everyone uses to reach them.

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
