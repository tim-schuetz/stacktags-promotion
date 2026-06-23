#!/usr/bin/env python3
"""Generate the narration mp3 with ElevenLabs (Liam - Viral Short-Form Storyteller).
Key is read from the ELEVEN_API_KEY env var (passed per-task, not stored in repo)."""
import os, sys, json, urllib.request, pathlib

VOICE_ID = "VCgLBmBjldJmfphyB8sZ"  # Liam - Viral Short-Form Storyteller
MODEL = "eleven_multilingual_v2"
HERE = pathlib.Path(__file__).resolve().parent
TEXT = (HERE / "narration.txt").read_text(encoding="utf-8").strip()
OUT = HERE.parent.parent / "script_voice.mp3"   # <title>/script_voice.mp3

key = os.environ.get("ELEVEN_API_KEY")
if not key:
    sys.exit("ELEVEN_API_KEY not set")

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

url = f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}?output_format=mp3_44100_128"
req = urllib.request.Request(url, data=body, method="POST", headers={
    "xi-api-key": key,
    "Content-Type": "application/json",
    "Accept": "audio/mpeg",
})
with urllib.request.urlopen(req, timeout=180) as r:
    audio = r.read()
OUT.write_bytes(audio)
print(f"wrote {OUT} ({len(audio)//1024} KB), {len(TEXT.split())} words")
