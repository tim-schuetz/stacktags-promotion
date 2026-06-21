# Learn 10 Chinese words in 100 seconds — animated video

HTML-animated marketing video in the new Stacktags **depth-transition style**
(see `../../../designguide.md` and `../../../example_video_text_depth_transitions`):
a **dynamic grey grid** background and a **faux-3D camera** carry the whole video,
moving between beats with varied moves (zoom-in / zoom-out / pan / lift). White +
turquoise (`#35A292`), Inter only (CJK uses a sans face), no borders. Every element
lands on the timestamp its line is spoken (subtitles mirror the narration).

## Play it
Open `index.html` and press **Play** (or Space). Press **C** for clean mode
(hides chrome, fills the viewport) — used for recording.

Self-contained: the depth engine, HanziWriter library + stroke data, the morph
photos and the theme are all bundled under `elements/` and `assets/`. Only the web
fonts load from the network (CJK falls back to a system font offline).

## The finished file
`learn-10-chinese-words-100s.mp4` (1080×1920, 9:16) — the rendered video with audio.

## How it's built
The whole flow is ONE `StacktagsDepthTransitionsOptimized` instance (the default
`text-depth-transitions` element, copied to `elements/depth.js` + lightly extended
to accept `{ html }` beats and a `seekTo()` for QA). `app.js` is an
`audio.currentTime` cue engine that calls `depth.transitionTo(i, move)` on the beat,
swaps the subtitle, and triggers each word's HanziWriter morph.

```
index.html        stage skeleton + subtitle strip + outro layer
styles.css        custom beat styling (word card, scribble, enum grid, twist, recap)
app.js            beat list (BEAT[]) + subtitles (SUBS[]) + audio cue engine
elements/         reusable bits
  depth.js/.css   the depth-transition engine (default element + html/seekTo ext.)
  outro.js/.css   closing brand card (logo + Follow + folder link), unified to #35A292
  theme.css       shared tokens/grid (copied from default_video_elements/_shared)
  hanzi-writer.min.js, hanzi-data.js   stroke animation lib + data (local)
assets/photos/    the 10 "real photo → character" morph images (Imagen 4)
_build/           tooling (server :8853 -> capture -> mux)
```

## Storyboard (beats -> camera move)
- **Hook** (text beats): "100 seconds / 10 characters" -> "without memorizing" (lift).
- **Scribbles -> 人** (`text-popup` element): complex characters POP onto the grid
  ("Chinese looks like random scribbles"), then the simple **人 rises out of them** —
  the lead-in to word 1 (no 1-10 overview grid).
- **The 10**: one word card each — the **character is drawn first** (stroke-by-stroke
  in turquoise, HanziWriter), **then the real photo reveals** (character -> image).
  Each card arrives with a different camera move.
- **Twist**: pictures stack into new words — 木+木→林→森 · 日+月→明 · 人+木→休 · 田+力→男.
- **Outro**: recap grid ("you just read 10 characters"), then the Stacktags brand
  card on the same grid — the updated default design (isometric stack bracketed by
  two chevrons + the "stacktags" wordmark + "stacktags.io"), ported from
  `promotion/instagram/defaults/outro-animation`.

## Re-rendering the MP4
```
cd _build
node server.js          # serves the topic folder on :8853
node capture.js         # records the page playing -> capture/recording.webm + preroll.json
node mux.js             # -> ../learn-10-chinese-words-100s.mp4
```
Never run two captures at once — CPU contention corrupts the first ~40s. Render solo.
