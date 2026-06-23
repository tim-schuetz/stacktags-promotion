# Generate the narration via ElevenLabs (Liam - Viral Short-Form Storyteller).
# Saves to the topic/title folder as script_voice.mp3 (one level above video/).
import json, os, sys, urllib.request, urllib.error

API_KEY = "sk_2ef1e55d611c664a21399d7c844d3f1f29e35177df10f6e8"
VOICE_ID = "VCgLBmBjldJmfphyB8sZ"   # Liam - Viral Short-Form Storyteller
MODEL = "eleven_multilingual_v2"

# Spoken text ONLY (verbatim from skript_text.txt, bracket directions stripped;
# percentages spelled out so the TTS reads them naturally).
TEXT = (
    "Men underperform women at the stock market — and it's not because they pick "
    "worse stocks. It's because they trade too much. The more you trade, the more "
    "you quietly bleed to costs — every single time. In one of the most famous "
    "studies in finance, the investors who traded the most badly lost to the ones "
    "who did almost nothing. And no — this isn't a rookie mistake. Even professional "
    "fund managers fall for it. Here's the psychology.\n\n"
    "It starts with one deeply human glitch: we love selling our winners, and we "
    "can't let go of our losers. Across tens of thousands of US investors, people "
    "cashed in their gains about 50 percent more often than their losses — locking in "
    "what's working, babysitting what isn't. And here's the kicker: tax-wise, that's "
    "exactly backwards. Selling a winner hands you a tax bill; selling a loser would "
    "actually save you money. We do the opposite — on pure instinct. Think the pros "
    "are above this? They're not. Even professional funds realize their gains about "
    "21 percent more often than their losses. It's wired in.\n\n"
    "Now stack the second mistake on top: overtrading. Every trade costs — fees, "
    "spreads, taxes — and those tiny leaks compound. In that 1990s US data, the most "
    "active twenty percent of investors earned just 11.4 percent a year. Buy-and-hold "
    "investors? Over 18 percent. Same market. The difference wasn't worse "
    "stock-picking — their picks were about as good. It was the cost of all that "
    "activity.\n\n"
    "Which brings us back to the title. Men churned their portfolios around 80 percent "
    "a year; women, around 50 percent. Men traded roughly 45 percent more — fueled by "
    "overconfidence — and that extra activity is exactly what dragged their net "
    "returns below women's. Less trading, more keeping.\n\n"
    "So the uncomfortable secret of the market: doing less beats doing more. The best "
    "investors aren't the busiest — they're the most patient. Want more "
    "counterintuitive truths like this? Follow Stacktags."
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
