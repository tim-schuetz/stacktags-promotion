# How to launder $1.5 billion in crypto — animated video

HTML-animated marketing video in the Stacktags design (white + turquoise `#35A292`),
synced to the narration in `../script_voice.mp3` (≈84.7s, ElevenLabs voice
*Liam – Viral Short-Form Storyteller*). Built per
[`designguide.md`](../../../designguide.md): one continuous **faux-3D depth
fly-through on a dynamic moving grid**, subtitles that mirror the narration
verbatim, Inter (+ JetBrains Mono for ledger hashes), no borders, soft turquoise
fills, red avoided (not a brand colour).

The thesis: crypto is **not** anonymous — it's the most transparent money ever
made — so even a state-backed hacker who stole ~$1.5B (Bybit, 2025 / Lazarus)
can't just spend it. The fix they reach for: **chain hopping · mixers · splitting.**

## The look / default elements
- **`elements/depth.js`** (`StacktagsDepthTransitionsOptimized`) is the engine:
  every beat flies through space with a varied camera move (zoom-in/out, pan,
  lift), driven by the **audio cue engine** in `app.js`, so each beat lands on the
  spoken word (timings force-aligned via faster-whisper → `_build/whisper.json`).
- **`elements/bar-chart.js`** (`StacktagsGraphChart`, from `charts/bar-chart-v2`)
  opens the video: *Biggest crypto heists* — Bybit's $1,500M bar towers, value
  counts up with a **ticking** SFX (the finance bar/graph-chart per the guide).
- **`elements/enum-detail.js`** (`StacktagsEnumerationDetail`) is the enumeration:
  the **3 laundering moves** line up, fold into the stacked Stacktags logo, and
  dock top-left as a progress badge that lights one layer per move.
- **`elements/outro.js`** is the default `outro` endcard (`makeStacktagsLogo`):
  stacked-cube logo + chevrons, the `stacktags` wordmark, `stacktags.io`, and a
  *follow Stacktags* line.
- **Subtitles** (`#subs`, theme `.stk-subs`) carry the full verbatim narration,
  line by line, grey with turquoise key-words. No spoken sentence is dumped as
  on-screen text — only short concept labels (the move names, `FALSE`, `FROZEN`,
  `$1.5B`, *the most transparent money ever made*).
- Cut-outs (Imagen 4 → rembg): a cartoon **hacker** (loot pose + stuck pose),
  a **coin** and a **mixer/tumbler** (single objects → baked dashed outline).
  The public ledger, anonymous→FALSE stamp, flagged/frozen exchange, chain-hop,
  mixer swirl and splitting cloud are pure CSS/SVG.

## Sounds
SFX rebuilt at the real CUE times (`window.SFX`, mixed in by `_build/mix_sfx.js`,
since headless can't capture Web-Audio): **swoosh** only when the grid actually
moves (a depth transition) or a default element animates (chart / enum / outro);
**pop** on a chip/stamp/line appearing; **ticking** on the chart count-up. Assets
in `assets/sound/` were normalised to ~−3 dBFS (raw assets are ~−25 dBFS → silent).

## The finished file
`how-to-launder-1.5b-crypto.mp4` (1080×1920, 9:16, ≈86.4s). Voice level fully
preserved (mean −17.9 dB, peak −0.8 dB, no clipping).

## Structure
```
index.html   stage skeleton (1080×1920): chart-host + depth-host + enum-host + outro-host + subs
styles.css   all beat styling (.beat-* classes) + chart/enum/outro + subtitles
app.js       BEATS array + audio-currentTime cue engine (CUES) + SFX + verbatim SUBS
elements/    theme.css, depth.js/.css, enum-detail.js/.css, bar-chart.js/.css, outro.js
assets/      photos/ (hacker_loot, hacker_stuck, coin(+_dash), tumbler(+_dash)) · sound/ (swoosh, pop, ticking)
_build/      tooling: gen_voice.js (ElevenLabs), align_fw.py (faster-whisper),
             gen_images.js (Imagen), rembg_cut.py, generate_dashes.py,
             server.js, qa.js, capture.js, mix_sfx.js, mux.js
```

## Re-rendering
```
cd _build
node server.js            # (shell 1) serves the topic folder on :8861
node capture.js           # (shell 2) records the page playing -> capture/recording.webm
node mix_sfx.js           # narration + SFX -> capture/narration_sfx.m4a
node mux.js               # -> ../how-to-launder-1.5b-crypto.mp4
```
Regenerate assets only if needed: `node gen_voice.js` (mp3),
`<Python314>/python.exe align_fw.py small.en` (whisper.json),
`node gen_images.js` + `<Python314>/python.exe rembg_cut.py` + `generate_dashes.py coin tumbler`.

Notes: port **8861**; capture uses `domcontentloaded` (Google-Fonts CDN never
idles); don't run two captures at once (CPU contention corrupts the recording).
`mux.js` pads ~1.7s of trailing silence so the Follow end-card holds.
