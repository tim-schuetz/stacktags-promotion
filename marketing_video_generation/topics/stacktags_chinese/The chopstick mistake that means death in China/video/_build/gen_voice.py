# Generate the narration mp3 with ElevenLabs (Liam - Viral Short-Form Storyteller).
# stdlib only (urllib). Saves to ../../script_voice.mp3 (the title folder).
import json, os, sys, urllib.request, urllib.error

API_KEY = os.environ.get("ELEVENLABS_API_KEY", "")   # pass per-task: ELEVENLABS_API_KEY=... python gen_voice.py
if not API_KEY:
    print("set ELEVENLABS_API_KEY env var"); sys.exit(1)
VOICE_ID = "VCgLBmBjldJmfphyB8sZ"   # Liam - Viral Short-Form Storyteller
MODEL = "eleven_multilingual_v2"

NARRATION = """There's one thing you must never do with chopsticks in China: stand them straight up in your bowl of rice. Do it, and you've just set a place... for the dead.

It's one of the deepest dining taboos in Chinese culture. And the reason is what it resembles. At funerals and ancestor rituals, a bowl of rice with incense — or chopsticks — standing straight up is offered to the deceased. It's a gift for the dead. So at a normal dinner, chopsticks jammed upright look exactly like a death offering. It's read as an omen — almost like inviting death to the table.

Instead, you lay your chopsticks flat — across the top of the bowl, or on a little rest. Tiny gesture, completely different meaning. And these death-related taboos get taken even more seriously during the seventh lunar month — "Ghost Month" — when spirits are said to roam, and people avoid anything that might invite bad luck.

It's just two sticks and a bowl of rice. But stand them up, and you've turned dinner into a funeral — which is exactly why"""

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
