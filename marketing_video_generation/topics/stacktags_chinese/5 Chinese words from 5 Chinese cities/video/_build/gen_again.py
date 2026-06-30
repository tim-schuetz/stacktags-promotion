# Regenerate ONLY the hook sentence that is missing the word "again", as a
# standalone clip for splicing into script_audio.mp3 at the sentence pauses.
# Liam - Viral Short-Form Storyteller, same voice settings as the rest of the narration.
import json, os, sys, urllib.request, urllib.error, re

# read the key from the backend .env (Elevenlabs_API_KEY=...)
ENV = r"C:/software_projekte/bombatags/application/backend/.env"
key = None
for line in open(ENV, encoding="utf-8"):
    m = re.match(r"\s*Elevenlabs_API_KEY\s*=\s*(.+)\s*$", line, re.I)
    if m:
        key = m.group(1).strip().strip('"').strip("'")
        break
if not key:
    print("no ElevenLabs key in .env"); sys.exit(1)

VOICE_ID = "VCgLBmBjldJmfphyB8sZ"   # Liam - Viral Short-Form Storyteller
MODEL = "eleven_multilingual_v2"

TEXT = "Learn five characters from five cities, and you'll never read a map the same way again. Let's go."

OUT = os.path.abspath(os.path.join(os.path.dirname(__file__), "again_clip.mp3"))

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
    headers={"xi-api-key": key, "Content-Type": "application/json", "Accept": "audio/mpeg"},
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
