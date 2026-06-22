# why men underperform women at the stock market — animated video

HTML-animated marketing video in the Stacktags style (white + turquoise `#35A292`,
Inter only, no borders, thin grey dynamic grid). A continuous faux-3D camera over the
grid with depth transitions between beats and subtitles that mirror the narration.
Synced to `../script_voice.mp3` (≈105.2s, ElevenLabs "Liam – Viral Short-Form
Storyteller") — every beat lands on the spoken word (Whisper word-level alignment).

**Colour language:** TEAL = patient / winner / buy-and-hold / women;
GREY = busy / loser / active trader / men. Red is never used as UI (design guide).

## The finished file
`why-men-underperform-women.mp4` (1080×1920, 9:16, H.264 + AAC, 30 fps, ≈108.5s — the
narration is ≈105.2s, then the outro endcard holds ~3s). Thumbnail: `thumbnail.png`
(1280×720). On-screen visuals never echo the spoken sentences verbatim — only the
bottom subtitles do.

## Storyboard (mapped to the script)
- **Hook (0–17s)** — the two characters face off (frantic trader vs calm investor);
  then the recurring **two-lines** device draws (Men grey & jagged with fee-bite
  notches vs Women teal & smooth, finishing higher); the "famous study" reframes it as
  Active vs Patient; "even the pros" tease.
- **Mistake #1 · disposition effect (22–53s)** — winners sold / losers clutched;
  the **50%** count-up; the **TAX BILL** stamp vs **missed deduction**; pros at **21%**.
- **Mistake #2 · overtrading (53–79s)** — "leaks money"; `fees · spreads · taxes`
  text-popup; the default **bar chart** (Active 20% **11.4%** vs Buy & hold **18.5%**);
  "it was the cost".
- **The men-vs-women gap (79–94s)** — **turnover gauges** (Men 80% / Women 50%);
  the overconfident trader with **+45% more trades**.
- **Outro (94–105s)** — the patient line overtakes for good ("doing less beats doing
  more"); the default **outro** endcard lands on "Follow Stacktags." / stacktags.io.

## Elements
- Default (in `elements/`): `theme.css`, `depth-transitions.css`, `graph-chart` (bar),
  `text-popup` (fees/spreads/taxes), `outro` (endcard). Globe/timeline/enumeration are
  intentionally not used (they don't fit this script).
- Custom (in `elements/`): `two-lines.{js,css}` (the recurring device) and
  `turnover-gauges.{js,css}`.
- Assets: `trader_man.png` / `calm_woman.png` (Imagen 4 → rembg cut-outs);
  `sound/{swoosh,pop,ticking}` (normalised to ≈−3 dBFS).

## Re-rendering
```
cd _build
node generate_images.js          # (once) the two characters       [GEMINI_API_KEY]
py -3.14 cutout.py               # (once) rembg cut-outs
node whisper_align.js            # (once) audio -> whisper.json     [OPENAI_API_KEY]
node server.js &                 # serves the topic folder on :8871
node capture.js                  # records the page -> capture/recording.webm + sfx.json + preroll.json
node mix_sfx.js                  # swoosh/pop/ticking over the narration -> capture/narration_sfx.m4a
node mux.js                      # -> ../why-men-underperform-women.mp4
node render_thumb.js             # -> ../thumbnail.png
```
QA stills: `node shoot.js [t ...]` (seeks + screenshots). Audio for the narration is
generated with ElevenLabs (see `_build/narration.txt`).
