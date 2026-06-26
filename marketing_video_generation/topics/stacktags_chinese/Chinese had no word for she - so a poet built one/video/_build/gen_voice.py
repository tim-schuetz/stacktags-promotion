# Generate the narration via ElevenLabs (Liam - Viral Short-Form Storyteller).
# Saves to the topic/title folder as script_voice.mp3 (one level above video/).
import json, os, sys, urllib.request, urllib.error

API_KEY = "sk_2ef1e55d611c664a21399d7c844d3f1f29e35177df10f6e8"
VOICE_ID = "VCgLBmBjldJmfphyB8sZ"   # Liam - Viral Short-Form Storyteller
MODEL = "eleven_multilingual_v2"

# Spoken text ONLY (verbatim narration from skript_text.txt, bracket directions stripped).
# Bare on-screen hanzi (他/她/女/它) are NOT spoken — only the pinyin sound "tā" is kept,
# since the whole point ("same sound") hinges on that one syllable.
TEXT = (
    "Just a hundred years ago, Chinese had no word for \"she.\" A single word covered "
    "he, she, and it. Then a poet sat down and literally built a new one.\n\n"
    "For most of its history, Chinese got by with one pronoun — tā — for he, she, and "
    "it. And spoken, it doesn't matter: tā is tā, no matter who you mean. In writing, "
    "that one character did the whole job. Nobody felt anything was missing.\n\n"
    "Then, in the early twentieth century, Chinese writers started translating a flood "
    "of Western books — full of \"he said,\" \"she said.\" And suddenly, that one "
    "catch-all pronoun was a problem. To translate faithfully, they needed a way to "
    "tell \"he\" and \"she\" apart on the page.\n\n"
    "So, around 1920, a poet and linguist named Liu Bannong did something elegant. He "
    "took the existing character for \"he,\" which is built with a little \"person\" "
    "piece on the left. And he simply swapped that piece out, replacing the \"person\" "
    "part with the character for \"woman.\" The result was a brand-new character, "
    "meaning \"she.\" And that shows you something about how Chinese actually works. "
    "Characters are built from parts — so you can engineer a whole new word just by "
    "changing one component. Person, plus the rest, equals \"he.\" Woman, plus the "
    "rest, equals \"she.\" Same sound, new meaning, built like Lego.\n\n"
    "It wasn't loved by everyone — some argued that giving women a separate pronoun, "
    "while men kept the original \"default\" one, was itself a statement. But it stuck. "
    "Today, it's everywhere. So the Chinese word for \"she\" is younger than the "
    "lightbulb — and unlike almost every other word, it has an author.\n\n"
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
