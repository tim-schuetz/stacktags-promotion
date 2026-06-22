# 5 Chinese words from 5 Chinese cities — animated video

HTML-animated marketing video in the **new Stacktags style** (white + turquoise `#35A292`,
Inter only, no borders) — a continuous **faux-3D camera over a dynamic grid**, with depth
transitions between every beat and subtitles that mirror the narration. Synced to
`../script_voice.mp3` (≈113.45s); every element lands on the exact timestamp its line is
spoken (timestamps force-aligned from the audio with Whisper → `_build/timings.json`).

See `../../designguide.md` and `../../default_video_elements/` — this video reuses the
default elements rather than re-inventing them (see below).

## Play it
Open `index.html` in a browser and press **Play** (or Space). Press **C** for clean mode
(hides the control bar, fills the viewport) — used for recording. The seek slider re-renders
end-states instantly (for tuning).

CDN deps: Google Fonts (Inter + Noto Sans SC), Three.js r128 + earcut + topojson-client
(for the 3D globe and the flat China silhouette, both from the real world-atlas geometry).
The 5 city skyline photos live under `assets/photos/` (Imagen 4).

## The finished file
`5-chinese-words-5-cities.mp4` (1080×1920, 9:16, H.264+AAC, ≈137s — the narration
is ≈134.4s, then the outro endcard holds ~2.6s in silence). On-screen visuals never
echo the spoken sentences (only vocab glyphs/meanings + the bottom subtitles do that);
the outro is the default `outro/` element and lands on the closing "…on stacktags.io".

## Default elements reused (in `elements/`)
```
theme.css                            shared tokens + grid + subtitles (design system)
depth-transitions.{js,css}           the dynamic-grid look (we reuse its grid CSS; the
                                     camera/pose math is ported into app.js so every scene
                                     enters/exits with a faux-3D move)
globe.js                             3D globe → China fill + grey marker → dive → photo
                                     handoff. Used TWICE: globe1 dives into Shanghai (~21s);
                                     globe2 zooms OUT of Qingdao then dives INTO Hong Kong
                                     (~84s). Local extras: pause/resume/dispose (render gate),
                                     setView (snap), moveMarker (2nd dot) — see the gotcha.
china-map.js                         flat geo-accurate China silhouette (payoff backdrop)
enumeration_with_in_detail_follow_up the 5 cities cascade into a list, then fold into the
                                     Stacktags logo stack
text-popup.{js,css}                  the recap words (海 sea · 北 north · …) — they then
                                     converge to a centred column = "a vocabulary list"
outro.{js,css}                       the updated brand card (isometric stack + chevrons +
                                     stacktags + stacktags.io) — copied from the "Learn 10
                                     Chinese words" topic (no outro ships in default_video_elements)
```

## Structure
```
index.html        stage skeleton: #grid (dynamic grid) + .scene layers + #subs
styles.css        scene styling (hook, payoff, city cards, compass, recap, cta, follow)
app.js            persistent grid camera + ported depth transitions + audio-cue engine
elements/         the default elements above
assets/photos/    the 5 city skylines (Imagen 4): shanghai, beijing, nanjing, qingdao, hongkong
_build/           tooling (not part of the video):
  whisper_align.js / align_lines.js   audio → whisper.json → timings.json
  generate_images.js                  the 5 skylines (Imagen 4)
  server.js                           static dev server (PORT 8861 — see gotcha)
  shoot.js                            seek to timestamps + screenshot (instant-state QA)
  capture.js                          record the playing page to webm (playwright-core)
  mux.js                              mux webm + mp3 → ../5-chinese-words-5-cities.mp4
```

## Storyboard (mapped to the script)
- **Hook (0–10s)** — 5 rapid depth-beats over the grid: city hanzi + meaning (sea / north /
  south / island / harbor), the camera doing a different move each time.
- **Payoff (10s)** — "every name is a tiny description · a map you can actually read", a faint
  China silhouette behind.
- **Enumeration (16s)** — the 5 cities cascade in as a list, then fold into the Stacktags
  logo stack (`enumeration_with_in_detail_follow_up`).
- **Globe → Shanghai (20.7s)** — the globe fills China teal, drops a marker on Shanghai and
  dives in, bursting into the Shanghai skyline photo (the geography centrepiece).
- **The 5 breakdowns (22–93s)** — per city: skyline panel + the name split into two
  characters, the learned one lights up teal + gloss. Nanjing adds the 北京/南京 compare;
  Qingdao adds the Tsingtao / German-colony note.
- **Compass (54.7s)** — 北 南 西 东 on a rose; 西 = Xī'ān (west), 东 = Guǎngdōng (east) pop in.
- **Outro (93–113s)** — text-popup recap of the 7 words → "a map isn't just a map — it's a
  **vocabulary list**" → a pulsing **Practice** button + folder link → the Stacktags brand
  card with **Follow** (`stacktags.com/f/chinese-city-names`, placeholder).

## Re-rendering the MP4
```
cd _build
node whisper_align.js     # (once) audio -> whisper.json   [needs OPENAI_API_KEY]
node align_lines.js       # whisper.json -> timings.json
node generate_images.js   # (once) the 5 skylines           [needs GEMINI_API_KEY]
node server.js            # serves the topic folder on :8861
node capture.js           # records the page playing -> capture/recording.webm + preroll.json
node mux.js               # -> ../5-chinese-words-5-cities.mp4
```

## Gotchas (learned building this)
- **Port 8861, not 8848.** A leftover dev server from another topic was already holding
  :8848 and silently served the WRONG video. This build uses **:8861** across
  server/capture/shoot. Always sanity-check a screenshot shows *this* topic.
- **CPU contention stretches the recorded timeline → drift.** `capture.js` records in real
  time; if the CPU is saturated the page plays in slow-motion and the webm comes out *longer*
  than wall-clock (e.g. 152s instead of ~118s). Muxed against the real-time mp3 the video
  then lags the audio, growing over the clip. Causes seen here: (1) orphaned headless
  Chromium / `capture.js` from earlier killed runs still rendering — **kill all stray
  `--headless` chrome and stray `node server.js/capture.js` before capturing**; (2) the globe
  rendering for the whole 113s with software WebGL — fixed by enabling the GPU in capture
  (`--ignore-gpu-blocklist`, dropped `--disable-gpu`) **and** gating the globe (it now
  `pause()`s until ~19s and `dispose()`s right after the handoff). Quick check after a
  capture: `ffprobe -show_entries format=duration capture/recording.webm` should be ≈ wall
  clock (~118s), not stretched.
- **Measure preroll at real playback start.** `capture.js` now starts playback, then polls
  until `vo.currentTime` actually advances and computes `preroll = wallclock(audio t=0)`.
  Trimming the *call* time of `__play()` left a residual lag (audio decode/buffer latency).

## Alignment note
Gemini 2.5 timestamp alignment (`transcribe.js`) drifted badly past ~1 min. OpenAI Whisper
(`whisper_align.js`, word-level) is reliable across the whole clip; `align_lines.js` pins each
script line to the Whisper word stream with monotonic anchor matching.
