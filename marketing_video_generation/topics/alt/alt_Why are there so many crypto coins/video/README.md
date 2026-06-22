# Why are there so many crypto coins? — animated video

HTML-animated marketing video in the **Stacktags style** (white + turquoise `#35A292`,
Inter only, no borders) — a continuous **faux-3D camera over a dynamic grid**, with depth
transitions between every beat and subtitles that mirror the narration. Synced to
`../script_voice.mp3` (≈81.5s, ElevenLabs "Liam – Viral Short-Form Storyteller"); every
element lands on the exact timestamp its line is spoken (force-aligned with Whisper).

## Play it
Open `index.html` in a browser and press **Play** (or Space). Press **C** for clean mode
(hides the control bar) — used for recording. The seek slider re-renders end-states instantly.

## The finished file
`why-so-many-crypto-coins.mp4` (1080×1920, 9:16, H.264+AAC, ≈83.6s — narration ≈81.5s,
then the outro endcard holds ~2s). On-screen text never echoes the spoken sentences (the
bottom subtitles do that); short keyword labels + visuals carry the story.

`thumbnail.png` (1280×720) — the YouTube/feed thumbnail.

## Storyboard (mapped to the script)
- **Hook (0–8s)** — a counter rockets to **9.4 M+** crypto coins over a flood of coin chips,
  then zooms to a single Bitcoin plodding behind a snail ("too slow").
- **Wave 1 · Bitcoin (8–20s)** — one rail, one job (move BTC); apps can't be built on top.
- **Wave 2 · Ethereum (20–35s)** — a programmable platform: apps + **smart contracts**,
  then a few lines of **code** mint a token → the floodgates crack open.
- **Wave 3 · Rivals (35–47s)** — a `graph-chart` of Ethereum **fees** climbing to $130, then
  rival chains (Solana, BNB, +many) each with their own coin.
- **Wave 4 · Memecoins (47–63s)** — a Pump.fun **MINT** button spits out tokens; a flood of
  joke tickers ($DOGE, $PEPE, …) around a doge, most going worthless.
- **Punchline (63–78s)** — the **branching tree**: 1 Bitcoin → 2 Ethereum → 3 rival chains →
  4 memecoin explosion; the tips fade to worthless.
- **Outro (78–83s)** — the default brand endcard with a **Follow** prompt.

## Default elements reused (in `elements/`)
```
theme.css         shared tokens + grid + subtitles (design system)
graph-chart.{js,css}  the rising Ethereum-fees line chart (Wave 3)
text-popup.{js,css}   (loaded; flood chips are bespoke for the dead-state)
enumeration.{js,css}  (loaded for parity with the element library)
outro.js          the brand endcard (makeStacktagsLogo + .ec layout)
```
The depth-grid camera + depth transitions (rise/drop/zoom/pan/lift/fade) are ported into `app.js`.

## Re-rendering the MP4
```
cd _build
node generate_images.js          # (once) the coin/doge/snail photos  [GEMINI_API_KEY]
py -3.14 crop_images.py           # (once) rembg cut-outs + dashed outlines
# narration: ../script_voice.mp3 (ElevenLabs) → whisper.json (OpenAI Whisper, word-level)
node server.js                    # serves the topic folder on :8871
node capture.js                   # records the page playing -> capture/recording.webm + sfx.json + preroll
node mix_sfx.js                   # overlays swoosh/pop/ticking onto the narration -> narration_sfx.m4a
node mux.js                       # -> ../why-so-many-crypto-coins.mp4
node render_thumb.js              # -> ../thumbnail.png
```

## Notes
- **Sounds** (`assets/sound/`) are normalised to ~−3 dBFS (the shipped assets are mastered
  very quietly); swoosh fires on grid-moving transitions / default elements, ticking on the
  count-ups + chart, pop per popped word/object. Verified: voice level preserved, SFX ~8 dB under.
- **Port 8871** across server/capture/shoot/thumb. Kill stray headless Chrome before capturing
  (CPU contention stretches the recorded timeline → drift). This capture matched wall-clock (no drift).
