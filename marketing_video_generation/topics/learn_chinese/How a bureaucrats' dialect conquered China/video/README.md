# How a bureaucrats' dialect conquered China — 9:16 video

Audio-synced HTML animation in the **new Stacktags style**: a faux-3D depth
fly-through on a **moving grid**, bookended by the default **globe** (geography
hook) and **timeline** (rocket back past Rome), closed by the default **outro**.
Subtitles mirror the spoken line. White + turquoise (`#35A292`), **Inter only**
(CJK in a sans face, never serif), thin grey grid, no borders — per
`../../../designguide.md` and `_shared/theme.css`.

## Story / scenes (`app.js`)
1. **globe** — 3D world dives onto China (teal fill, red capital pin); the word
   **Mandarin** is struck through (ink, *not* red) — "a name foreigners gave it".
2. **timeline** — measuring-tape ruler rockets back past **Rome → Han → Zhou →
   Shang → Xia**, landing on "**3,000+ years** of dynasties".
3. **states honeycomb** (`elements/states.js`) — a gap-free flower of 7 tiles
   named 秦汉楚齐燕赵魏; names fade in (“dozens of kingdoms”), states overtake
   neighbours, then **汉 spreads from the centre and takes them all** (unification).
4. **depth spine** — the moving-grid fly-through. The big beats ILLUSTRATE the
   idea (the subtitles carry the words): writing standardised → **汉 / 汉语** →
   a parchment (字) flanked by two Imagen cartoon figures speaking gibberish
   (#$%!) → a mandarin official (bold #$°%! bubble) → **官话** → a generated
   Portuguese ship → **MANDARIN** → school·radio·TV → a 1.4-billion crowd →
   **普通话** → everyday chat. Vector illustrations in `elements/illus.js`
   (`window.ILLUS`); cartoon photos in `assets/photos/` (Imagen, `_build/gen_cartoon.js`).
5. **outro** — the default endcard element (`elements/outro.js`,
   `makeStacktagsLogo`): the stacked logo builds, wordmark + `stacktags.io` fade in,
   plus the **"Auf Stacktags"** folder reference. New CTA ending narration.

Narration: **`../script_voice.mp3`** (re-recorded take, ~122.2 s). Subtitles are
VERBATIM. Cue/beat times are aligned to it (`_build/whisper.json`).

## Default elements used (`elements/`, copied from `default_video_elements`)
- `theme.css` — shared tokens / grid / subtitle styles (imported first).
- `globe.js` — `mountStacktagsGlobe`. Patched locally: `halt()`/`resume()` and a
  `window.__GLOBE_RS` render-scale so the heavy software-WebGL stays real-time in
  the headless capture (it halts after its hand-off).
- `timeline.js` / `timeline.css` — `StacktagsTimeline` (the dynasty rocket-back).
- `depth.js` / `depth.css` — `StacktagsDepthTransitionsOptimized` (the spine).
- `outro.js` / `outro.css` — `StacktagsOutro` (teal unified to `#35A292`).

The cue engine drives the depth element beat-by-beat (`transitionTo`) keyed to
`#vo.currentTime`, so each beat starts on the word it illustrates.

## Build (`_build/`)
```
node server.js              # static server on :8848 (keep running)
node capture.js             # real-time record -> capture/recording.webm (+ a black
                            #   SYNC HOLD at audio t=0, and timing.json)
node mux.js                 # blackdetect finds the sync hold -> exact trim, then
                            #   muxes script_audio.mp3 -> ../how-mandarin-conquered-china.mp4
```
`shoot.js <t…>` seeks (`window.__seek`) and screenshots into `shots/` for QA.

### Why the sync hold (important)
Playwright's recording does **not** start when our wall-clock timer does, and a
headless render can lag non-uniformly — so neither wall-clock preroll nor a single
PTS factor keeps the beats on the words. Instead the page burns a **solid black
frame** (`#syncflash`) for ~0.6 s ending exactly at audio t=0; `mux.js` finds it
with `blackdetect` and trims there. Playback itself is real-time (the globe halts),
so a plain trim + `-shortest` stays in sync. (`remux.js` is an alternate per-frame
remap, kept as a fallback for very heavy renders.)

Output: **1080×1920, 30 fps, H.264 + AAC**, ≈122 s.
