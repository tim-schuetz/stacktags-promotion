# 5 Chinese words you are already using — animated video (v2, depth style)

HTML-animated marketing video in the Stacktags design (white + turquoise `#35A292`),
synced to the narration in `../script_voice.mp3` (≈115.2s). Built per
[`designguide.md`](../../../designguide.md): one continuous **faux-3D depth
fly-through on a dynamic moving grid**, subtitles that mirror the narration,
Inter (+ Noto Sans SC for hanzi), no borders, soft turquoise fills.

The video reveals 5 English loanwords that came from Chinese:
**Typhoon 台风 · Tofu 豆腐 · Yin & Yang 阴阳 · Taikonaut 太空 · Paper Tiger 纸老虎**.

## The look (what's new)
- **`elements/depth.js`** (`StacktagsDepthTransitionsOptimized`, from
  `default_video_elements/text-depth-transitions-example-optimized`) is the engine:
  every beat (text or a cut-out image) flies through space with a **varied camera
  move** (zoom-in / zoom-out / pan / lift / rise), and the **grid carries each move**.
  It is driven **by the audio cue engine** (`app.js`), not its own auto-timer, so each
  beat lands on the spoken word.
- **`elements/enum-detail.js`** (`StacktagsEnumerationDetail`, from
  `default_video_elements/enumeration_with_in_detail_follow_up`) is the enumeration:
  the 5 words line up (English + pinyin·meaning + hanzi tile), then **fold into the
  stacked Stacktags logo**, which **docks top-left as a progress badge** and lights up
  one layer per word.
- **`elements/outro.js`** is the **default `outro` endcard** (`window.makeStacktagsLogo`):
  the stacked-cube logo + chevrons assemble (add `.play`), with the `stacktags` wordmark
  (Nunito), `stacktags.io`, and a folder link (`stacktags.io/f/chinese-words-you-know`).
- **Subtitles** (`#subs`, theme `.stk-subs`) carry the **full verbatim narration**, line by
  line, grey with turquoise key-words. **NO spoken sentence is ever drawn as on-screen text**
  — only vocabulary shows on screen (hanzi + pinyin + short meaning/word labels). See
  [[feedback_video_no_spoken_text_echo]].
- The hook opens on a big `中文` glyph, then teases the 5 words as **big cut-out images
  scattered across the frame** (typhoon = a real photo, circle-cropped; tofu/astronaut/tiger
  cut-outs; yin-yang SVG). The "borrowed from Latin & French" beat is a **cartoon gag**
  (`beat-gag`): an Englishman gets a Roman helmet seated on his head (face still visible), a
  baguette flown into his hand, then a small legged table + bowl of rice slides up from below.
  It closes on a **hanzi-wall** (the 5 characters) → the outro endcard.
- Cut-outs (tofu, astronaut, tiger, englishman, baguette, helmet, rice) are Imagen 4 →
  **rembg**; the typhoon is a real photo; yin-yang and the South-Korean flag are inline SVG.

## Play it
Open `index.html` and press **Play** (or Space). Press **C** for clean mode (hides the
control bar, fills the viewport) — used for recording.

CDN deps: Google Fonts only (Inter + Noto Sans SC). No Three.js.

## The finished file
`5-chinese-words-you-already-use.mp4` (1080×1920, 9:16, ≈116.6s) — the rendered video.

## Structure
```
index.html        stage skeleton (1080×1920, scaled to fit): depth-host + enum-host + subs
styles.css        all beat styling (.beat-* classes) + subtitles + the corner badge
app.js            BEATS array + audio-currentTime cue engine + subtitle track
elements/         copied from ../../../default_video_elements:
  theme.css        shared tokens, grid, .stk-subs
  depth.js/.css    the depth fly-through engine
  enum-detail.js/.css  enumeration -> stacked-logo
  outro.js         default `outro` endcard — window.makeStacktagsLogo() SVG
assets/photos/    typhoon (real photo) + cut-outs (Imagen 4 -> rembg):
                  tofu, astronaut, tiger, englishman, baguette, helmet, rice_table
_build/           tooling (not part of the video):
  whisper_align.js  transcribe audio -> whisper.json (word timestamps) [OPENAI_API_KEY]
  gen_cutouts.js    Imagen word heroes -> assets/raw/ [GEMINI_API_KEY]
  gen_extra.js      Imagen typhoon photo + cartoon gag assets -> assets/raw/ [GEMINI_API_KEY]
  rembg_cut.py      rembg (u2net) background-removal -> assets/photos/ (transparent)
  server.js         static dev server (serves the topic folder on :8853)
  qa.js             play in real time + screenshot at key timestamps -> shots/
  capture.js        record the playing page -> capture/recording.webm + preroll.json
  mux.js            mux webm + mp3 -> ../5-chinese-words-you-already-use.mp4 (ffmpeg)
```

## Re-rendering the MP4
```
cd _build
node server.js            # (shell 1) serves on :8853
node capture.js           # (shell 2) records the page playing -> capture/recording.webm
node mux.js               # -> ../5-chinese-words-you-already-use.mp4
```
Regenerating the cut-out photos (only if you want new heroes):
```
node gen_cutouts.js                       # -> assets/raw/*.png   [GEMINI_API_KEY]
# rembg lives in Python 3.14, not the default (Inkscape) python:
"$LOCALAPPDATA/Programs/Python/Python314/python.exe" rembg_cut.py   # -> assets/photos/*.png
```

## Notes
- Cue timestamps in `app.js` (`CUES`) and subtitle timings (`SUBS`) were placed from the
  Whisper word/segment timestamps (`_build/whisper.json`).
- Port is **8853** (8848 was occupied by another build's dev server). Capture/QA use
  `domcontentloaded` (not `networkidle` — the Google-Fonts CDN never goes idle here).
- `mux.js` pads ~1.4s of trailing silence (`-af apad -t 116.6`) so the Follow end-card holds.
- Don't run two `capture.js` recordings at once — CPU contention corrupts the first ~40s.
