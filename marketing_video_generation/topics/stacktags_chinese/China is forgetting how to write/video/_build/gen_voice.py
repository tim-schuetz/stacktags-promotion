# Generate the narration via ElevenLabs (Liam - Viral Short-Form Storyteller).
# Saves to the topic/title folder as script_voice.mp3 (one level above video/).
import json, os, sys, urllib.request

API_KEY = "sk_2ef1e55d611c664a21399d7c844d3f1f29e35177df10f6e8"
VOICE_ID = "VCgLBmBjldJmfphyB8sZ"   # Liam - Viral Short-Form Storyteller
MODEL = "eleven_multilingual_v2"

# Spoken text ONLY (verbatim from skript_text.txt, bracket directions stripped).
# The one Chinese term (提笔忘字) is left as hanzi so the multilingual voice says
# it in Mandarin; on screen it is shown with pinyin "tí bǐ wàng zì".
TEXT = (
    "A billion people can read their own language perfectly — but more and more of "
    "them can't write it by hand anymore. There's even a name for it: character "
    "amnesia. And the cause is sitting in your pocket.\n\n"
    "Picture an educated Chinese speaker, pen in hand — and they suddenly blank on "
    "how to write a character they use every single day. The Chinese term for it is "
    "提笔忘字 — literally, pick up the pen, forget the character. And it's spreading. "
    "So what's going on?\n\n"
    "It comes down to how you type Chinese… You don't draw the characters. You type "
    "the sound. The Pinyin… and your phone shows you a list of matching characters. "
    "You just pick the right one.\n\n"
    "So all day long, you only have to recognize the correct character — never build "
    "it from memory, stroke by stroke. And recognition is easy. Active recall — "
    "producing the whole thing from scratch — is hard.\n\n"
    "Classic use-it-or-lose-it. People read fluently, type fluently — then freeze the "
    "moment they have to handwrite. Even simple, everyday characters slip away.\n\n"
    "For thousands of years, to truly know a character was to be able to write it. "
    "Now, a billion people know their characters perfectly — and just can't quite "
    "draw them anymore. Maybe the first writing system in history quietly handed over "
    "to a keyboard.\n\n"
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
