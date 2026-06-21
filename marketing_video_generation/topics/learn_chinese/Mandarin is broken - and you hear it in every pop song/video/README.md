# Mandarin is broken — depth fly-through build

HTML-animated 9:16 marketing video (1080×1920) in the current Stacktags design
system (white + turquoise `#35A292`, Inter only, thin grey **dynamic grid**), synced
to the narration in `../script_audio.mp3` (≈102.6s). Every beat lands on the spoken
word (timestamps force-aligned with OpenAI Whisper — see `_build/whisper.json`).

## The new style — a depth fly-through

The whole video is one continuous **depth camera** flying between beats over a
**living grid** (see `designguide.md` §6 and the `text-depth-transitions` default
element). There are no hard cuts: each section change is a varied 3D-ish move —
`zoom-in` / `zoom-out` / `pan` / `lift` — and the grid carries the same move so it
reads as a real camera. The reusable engine is `elements/depth.js`
(`StacktagsDepthTransitionsOptimized`), forked here to also host **full-stage
mounted elements** as beats (a `{ html }` beat type).

### Default elements reused
- **`depth.js`** (`text-depth-transitions`) — the spine + dynamic grid camera.
- **`enumeration-detail.js`** (`enumeration_with_in_detail_follow_up`) — the four
  lost hard endings **‑p ‑t ‑k ‑m** (glyph tiles), spotlighting the `‑t` before the
  camera dives into the moon.
- **`globe.js`** — 3D world globe that fills China turquoise, drops a Hong Kong
  marker and **dives onto it, handing off to a real photo**.
- **`text-popup.js`** — the homophone web (a dozen different words that all read
  *shì*) popping around one big `shì`.
- **`outro.js`** — closing brand card (stacked-cube logo + Follow + folder link).
- plus the local **`waveform.js`** (pop / open-vowel canvas waveform) and the shared
  **`theme.css`** tokens.

## HUD overlays (float above the moving grid)
A persistent **syllable counter** (glows in at **1200**, ticks live down to **400**,
ends as a hero number with a ghost *1200* behind it), bottom **subtitles** that mirror
the spoken line, a small brand watermark and a progress bar.

## The finished file
`mandarin-is-broken-103s.mp4` (1080×1920, 9:16, ~104.5s, h264/aac).

## Storyboard (mapped to the script)
- **Hook (0–6s)** — title *Mandarin is a ~~broken~~ language* + a pop waveform.
- **Tang golden age (6–20s)** — depth text beats; the counter glows in at **1200**;
  the four hard endings line up (enumeration) and the camera spotlights **‑t**.
- **The moon 月 (20–32s)** — zoom into the hero 月; the Tang sound **NGWAT** (hard ‑t)
  **morphs to YUÈ**.
- **The collapse (32–52s)** — a trio (十 SAP→SHÍ · 六 LUK→LIÙ · 心 SAM→XĪN), the four
  endings get struck through, the counter ticks **1200 → 400**, "1.4 billion / ~400".
- **Why you hear it in pop (52–67s)** — a homophone web collapses onto one **shì**;
  the open vowels **ahh / eyy / ohh / wayy** + an "open" waveform.
- **The southern time capsule (67–91s)** — the **globe** dives onto South China + a
  Hong Kong marker, crossfades to a real **Hong Kong / Guangdong** photo; Cantonese
  kept p t k m; the Tang poem **江雪** rhymes ✗ in Mandarin but ✓ in Cantonese.
- **Punchline / outro (91–104s)** — *Mandarin won the country* — the counter rests at
  **400** with the ghost **1200** behind it; the brand card assembles with **Follow**
  and the folder link `stacktags.com/f/mandarin-lost-sounds` (placeholder).

## Re-rendering the MP4
```
cd _build
node whisper_align.js     # (once) audio -> whisper.json            [needs OPENAI_API_KEY]
node generate_images.js          # (once) the Hong Kong photo        [needs GEMINI_API_KEY]
node generate_illustrations.js   # (once) the cut-out figures        [needs OPENAI_API_KEY]
node server.js            # serves the topic folder on :8872  (run in one shell / bg)
node capture.js           # records the page playing -> capture/recording.webm + preroll.json
node mux.js               # webm + narration (+ swoosh/ticking SFX) -> ../mandarin-is-broken-103s.mp4
```

## Build notes / gotchas
- **Capture is wall-clock driven, not audio-driven.** Under `--disable-gpu` the
  software-WebGL globe can stall media playback, which would make `audio.currentTime`
  lag wall-time and desync the recording. `app.js` exposes `window.__playForCapture()`
  which runs the cue engine off `performance.now()` (no audio); the narration is muxed
  back in afterwards, so the timeline is always true regardless of frame drops.
- **The globe is the heavy bit.** It is mounted lazily (~57.8s), rendered at 0.6×
  resolution, throttled to ~14fps and **stopped** once the camera leaves the south
  scene — otherwise its software-WebGL render loop starves the cue engine and the
  whole timeline freezes during capture. Depth-transition blur radii were also reduced
  so large layers composite in real time.
- Port is **8872** (unique per build, so a stale dev server can't serve the wrong topic).
- Cue timestamps live in the `CUES` array in `app.js` (placed from `whisper.json`).
- The previous (scene-based) build is archived in `_old_v1/`.

## v2 — creative visuals (no on-screen echo of the narration)
The screen never just prints the spoken line. Idea-by-idea it shows a **device or
figure** while the bottom **subtitles** carry the words **verbatim**:
- *"It wasn't always this way"* → a **rewind** dial (year ticks 2024 → 618).
- *"the Tang dynasty, golden age of poetry"* → a **Tang scholar-poet cut-out**
  (`assets/illus/tang_poet.png`, gpt-image-1 transparent PNG).
- *"1.4 billion people, ~400 syllables"* → a **dot-crowd → few-waves funnel**.
- *"Mandarin pop leans on long open vowels"* → a **pop-singer cut-out**
  (`assets/illus/pop_singer.png`) with the vowels flying out as pills.
- *"Mandarin won the country"* → a **China map fills turquoise** (`region-fill.js`,
  flat canvas from the world-atlas — no WebGL); then the lonely **400 / ghost 1200**.
- The **outro** is rebuilt per designguide (cube + two wide flat chevrons + `stacktags`
  wordmark in **Inter** + grey `stacktags.io`; no CTA / no folder link).
- Cut-outs are generated by `_build/generate_illustrations.js` (gpt-image-1,
  `background:'transparent'`). See `../../../designguide.md` and the channel memory.
