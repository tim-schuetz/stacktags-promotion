# Tether — the most genius business model ever invented (animated video)

HTML-animated marketing video in the **Stacktags style** (white + turquoise `#35A292`,
Inter only, no borders) — a continuous **faux-3D camera over a dynamic grid**, depth
transitions between every beat, and subtitles that mirror the narration. Synced to
`../script_voice.mp3` (≈119.6s, ElevenLabs voice *Liam – Viral Short-Form Storyteller*);
every beat lands on the spoken word (timestamps force-aligned with Whisper).

## The finished file
`tether-genius-business-model.mp4` (1080×1920, 9:16, H.264+AAC, ≈123.6s — the
narration is ≈119.6s, then the outro endcard holds ~4s). On-screen visuals never echo the
spoken sentences (only short labels / numbers + the bottom subtitles do that); the outro is
the default `outro/` element and lands on the closing "Follow Stacktags."

## Play it
Open `index.html` and press **Play** (Space). Press **C** for clean mode (recording).

## Storyboard (mapped to the script)
- **Hook (0–17s)** — a tiny office worker on a pile of cash; the deal: *$1 in → USDT token
  out → the dollar drops into the vault*; "100% legal"; the title card.
- **What it is (17–37s)** — the USDT coin · "stablecoin" · the 1 USDT ⇄ $1 peg · a dollar
  on the blockchain · minting · "the magic is your dollar".
- **The trick (37–56s)** — vault → **U.S. Treasury bills** · a yield chart counting to ≈5%
  (`graph-chart`) · the giant **0%** passed back · YOU 0% vs TETHER keeps the yield.
- **Free money (56–85s)** — a **$110,000,000,000** counter · other people's money → "FREE"
  · bank/company pay interest, Tether's cost = **$0** · a **$13B** profit bar (`graph-chart`).
- **The catch (85–103s)** — the token balanced on the vault = **Trust** · is every token
  really backed? · a magnifier over a reserve report (attestations, not audits) · "runs on
  confidence".
- **Punchline / outro (103–123s)** — stocks & coins (`text-popup`) fade away · the USDT
  token on a **throne built of T-bills** · "issue the dollar → keep the interest" · the
  Stacktags outro card.

## Default elements reused (`elements/`)
```
theme.css            shared tokens + grid + subtitles
depth-transitions.css the dynamic-grid look (camera math ported into app.js)
graph-chart.{js,css}  yield line chart (≈5%) + the $13B profit bar
text-popup.{js,css}   the stocks/coins word-cloud that fades on the punchline
outro.js              the Stacktags brand endcard (makeStacktagsLogo)
```
Images (`assets/`, Imagen 4 → rembg cut-out, dashed silhouette on single objects):
`cash_pile`, `vault`, `dollar_bill`, `character`, `bank_building`, `company_building`.

## Re-rendering
```
cd _build
node gen_voice.js        # (once) narration -> ../../script_voice.mp3   [ElevenLabs]
node whisper_align.js    # (once) audio -> whisper.json                 [OPENAI_API_KEY in .env]
node generate_images.js  # (once) the supporting images                 [GEMINI_API_KEY in .env]
py -3.14 cut_and_dash.py # (once) rembg cut-out + dashed outlines
node server.js           # serves the title folder on :8870
node capture.js          # records the page -> capture/recording.webm + sfx.json + preroll
node mix_sfx.js          # rebuilds swoosh/pop/ticking onto the narration -> narration_sfx.m4a
node mux.js              # -> ../tether-genius-business-model.mp4
node render_thumb.js     # -> ../thumbnail/thumbnail.png  (1280×720)
```

## Sounds
`assets/sound/` — `swoosh.ogg` (depth transitions only — fires when the grid moves),
`pop.wav` (words/labels popping), `ticking.wav` (the count-ups). All normalised to ~−3 dBFS
so they're audible under the voice; mixed with `amix(normalize=0)` so the narration keeps
its full level.

## Thumbnail
`thumbnail/thumbnail.png` (1280×720) — "You give a $1. They keep it." + the USDT coin, a
cash pile, a rising chart and a 100% LEGAL stamp.
