# Generate the narration via ElevenLabs (Liam - Viral Short-Form Storyteller).
# Saves to the topic/title folder as script_voice.mp3 (one level above video/).
import json, os, sys, urllib.request, urllib.error

API_KEY = "sk_2ef1e55d611c664a21399d7c844d3f1f29e35177df10f6e8"
VOICE_ID = "VCgLBmBjldJmfphyB8sZ"   # Liam - Viral Short-Form Storyteller
MODEL = "eleven_multilingual_v2"

# Spoken text ONLY (from skript_text.txt, bracket cues stripped). Chinese is ROMANISED
# for clean pronunciation — every hanzi is on-screen only.
TEXT = (
    "In imperial China, a ruler could delete a word from the language — or invent a "
    "brand-new one — just by decree. One emperor's name quietly renamed China's most "
    "beloved goddess forever. And an empress designed a character for herself that "
    "still exists today.\n\n"
    "For centuries, there was a strict rule called the naming taboo — bee-hway. You "
    "were not allowed to write the characters that appeared in the emperor's personal "
    "name. Out of respect, they had to be avoided, swapped, or left with a missing "
    "stroke. The emperor's name literally edited the language. Take the most famous "
    "case. The Tang emperor Taizong was named Li Shimin, and his name contained the "
    "character shir. Now, there was a hugely beloved figure of Buddhist mercy, called "
    "Guan-shir-yin. But her name contained that forbidden shir. So it was dropped. "
    "Guan-shir-yin became Guan-yin. And the shortened name stuck. To this day, the "
    "goddess of mercy worshipped across China is called Guan-yin — renamed, "
    "essentially, by an emperor's name, over a thousand years ago.\n\n"
    "And it ran the other way, too — rulers could invent characters. The boldest "
    "case: Wu Zetian, the only woman ever to rule China as emperor in her own right. "
    "She created a whole set of brand-new characters. The most famous was her own "
    "name: jaow — built from the characters for sun and moon, shining over the sky. "
    "Sun and moon in the heavens. A character she designed, for herself. Most of her "
    "inventions vanished after she died — but the idea behind them was very real: the "
    "writing itself was the ruler's to shape.\n\n"
    "We tend to think a language belongs to its people. For much of Chinese history, "
    "it also belonged to whoever sat on the throne — someone who could erase a "
    "character, or mint one, with a word. And sometimes, like with Guan-yin, that "
    "royal edit is still on everyone's lips, a thousand years later.\n\n"
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
