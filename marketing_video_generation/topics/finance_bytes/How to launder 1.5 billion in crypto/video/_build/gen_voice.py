# Generate the narration via ElevenLabs (Liam - Viral Short-Form Storyteller).
# Saves to the topic/title folder as script_voice.mp3 (one level above video/).
import json, os, sys, urllib.request

API_KEY = "sk_2ef1e55d611c664a21399d7c844d3f1f29e35177df10f6e8"
VOICE_ID = "VCgLBmBjldJmfphyB8sZ"   # Liam - Viral Short-Form Storyteller
MODEL = "eleven_multilingual_v2"

# Spoken text ONLY (verbatim from skript_text.txt, bracket directions stripped).
TEXT = (
    "When North Korean hackers pulled off the biggest crypto heist in history "
    "— around 1.5 billion dollars — they ran straight into a problem most "
    "people never expect: in crypto, you can't actually hide the money. Every coin "
    "they stole was visible to the entire world.\n\n"
    "Here's what most people get wrong. They think crypto is anonymous — perfect "
    "for crime. It's almost the opposite. Most blockchains are a public ledger: "
    "every transaction, every wallet, every movement, recorded forever, for anyone "
    "on Earth to read. So when the group known as Lazarus drained that exchange, the "
    "whole world could watch the stolen funds sitting in their wallets. Stealing it "
    "was the easy part. Spending it is the hard part.\n\n"
    "Because the moment they try to send that money to an exchange to cash out, it "
    "gets flagged and frozen. So to have any hope of using it, they try to break the "
    "trail. They do it three ways.\n\n"
    "One: chain hopping. They bounce the money across different blockchains, again "
    "and again, so the trail has to keep jumping networks.\n\n"
    "Two: mixers. They throw the coins into a pot with thousands of others and "
    "shuffle them, blurring which coins came from where.\n\n"
    "Three: splitting. They chop the haul into thousands of tiny transfers across "
    "countless wallets, so there's no single stream left to follow.\n\n"
    "And that's the irony. The only reason they need all of this is that crypto isn't "
    "anonymous at all. It's the most transparent money ever made — a permanent, "
    "public record. So stealing a billion is the easy part. Actually spending it is a "
    "problem most criminals never saw coming.\n\n"
    "Want more of how crypto really works? Follow Stacktags."
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
