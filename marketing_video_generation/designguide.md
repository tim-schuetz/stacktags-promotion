# Stacktags video — Design Guide

The shared look every marketing video (Instagram / YouTube, 9:16, 1080×1920) must
follow, so the whole channel feels homogeneous, is faster to build, and looks
professional. The rules below are encoded in code under
[`default_video_elements/_shared/theme.css`](default_video_elements/_shared/theme.css) —
import that first in every video and reuse the default elements instead of
re-inventing them.

---

## 1. Colours

- **Only two brand colours: white and turquoise.** Everything is built on a white
  background with turquoise as the single accent.
- **Primary turquoise: `#35A292`** (token `--stk-teal`).
- **Deep turquoise: `#119271`** (token `--stk-teal-d`) — for *emphasis* / active
  words and the second-level accent (e.g. the highlighted word in a headline).
- **Tinted fill: `#e7f4ef`** (token `--stk-teal-soft`) — soft turquoise pill/chip
  backgrounds (no border needed).
- **Text ink: `#232B33`** (`--stk-ink`); secondary text `#4a5560` (`--stk-ink-2`).
- **Grey for captions / subtitles: `#8a949d`** (`--stk-muted`).
- **Red `#d8443b`** is *not* a brand colour — use it **only** for a map pin /
  location marker (e.g. the globe), never for text or UI.

> Note: older elements/videos used `#3EAE93` as the turquoise. That is visually
> almost identical; **new work standardises on `#35A292`**. If you touch an old
> file, you may unify it to `#35A292`.

## 2. Background — the grid

Every scene sits on a **white background with a thin grey checkered grid**: 1–2px
light grey lines (`rgba(35,43,51,0.05)`) spaced **wide apart** (`120px`). Add the
class `stk-grid-bg` to the stage/scene. Never use a heavy or dark grid.

## 3. No borders

**No element ever gets a `border`** — and **lists / enumerations must never have
bordered items.** Separate things with whitespace, a soft shadow, or a tinted
turquoise fill instead. (See the border-less rows in the `enumeration` element.)

## 4. Typography — Inter only

**Inter is the only typeface.** No serif fonts, ever. The only exception is real
CJK glyphs, which use a CJK *sans* face (opt-in, e.g. `.stk-enum-glyph.cjk`).

Reference styles (reuse these exact specs):

- **Headline:** Inter, **80px**, weight **800**, letter-spacing **-1.6px**, colour
  **`#232B33`** (key words in **`#119271`**).
- **Sub / caption:** Inter, **38px**, weight **600**, colour **`#8a949d`**.

Type scale used across the elements: hero number 110–130px/900; section title
54–58px/800; body 30–46px; sub 22–34px/600. Keep letter-spacing slightly negative
on large weights (-1 to -4px).

## 5. Subtitles

Videos carry **subtitles that mirror exactly what is being said**, one line at a
time, near the **bottom** of the frame. They are **grey** (`#8a949d`) by default;
**key words may be turquoise** (`#119271`). Use the `StacktagsSubtitles` helper
([`_shared/subtitles.js`](default_video_elements/_shared/subtitles.js) +
`.stk-subs` styles in the theme).

## 6. Transitions — fake depth between text beats

When a scene rattles through several text beats, **don't hard-cut** — sell a
**faux-3D camera move**:

- **Zoom-out:** the grid converges (lines pull together), the current text
  **shrinks and blurs** as it recedes, while the **next line slides in from the
  top** and is itself pulled a little smaller (as if also caught by the dolly).
- **Zoom-in:** then push back in — the grid expands and the next line **grows in
  at the zoom target**.

Reference implementation:
[`default_video_elements/text-depth-transitions-example`](default_video_elements/text-depth-transitions-example).

## 7. Motion principles

- Ease with springy `cubic-bezier(.34,1.56,.64,1)` for "pop" entrances, and
  `cubic-bezier(.2,.8,.2,1)` for settles.
- Things **animate in on the beat** they're spoken (audio-synced cue engine, see
  any topic video's `app.js`).
- Prefer one clear motion at a time; avoid everything moving at once.

---

## Default elements

Reusable, namespaced, dependency-light building blocks in
[`default_video_elements/`](default_video_elements). Each ships a `demo.html` and a
rendered **`*-demo.mp4`** preview.

| Element | What it does |
|---|---|
| `globe` | 3D world globe: fills a country turquoise, drops a **red** city marker, **zooms into it and hands off to a photo** (with a swoosh). Example: Hong Kong. |
| `graph-chart` | Animated line/area or bar chart that draws in, with a counting headline value. |
| `timeline` | Thin time-line that scrolls past a playhead, **accelerating**, popping year/event ticks, then lands on a captioned photo. |
| `text-depth-transitions-example` | The faux-3D zoom-out / zoom-in text transition from §6. |
| `text-popup` | Words that pop onto the screen with a springy scale-in (+ optional quiet sound). |
| `enumeration` | Border-less numbered line-up that cascades in and zooms into one item. |
| `outro` | Closing brand card: stacked-cube logo bracketed by two wide, flat turquoise chevrons, the `stacktags` wordmark, and a grey `stacktags.io` line. |

Shared: [`_shared/theme.css`](default_video_elements/_shared/theme.css) (tokens,
grid, subtitles) and [`_shared/subtitles.js`](default_video_elements/_shared/subtitles.js).

### Sounds

Some elements take a sound effect:

- `globe` — **swoosh** during the dive-in (shipped: `globe/sound/swoosh.ogg`).
- `graph-chart` → `graph-chart/sound/graph.mp3` *(placeholder — drop a file in)*
- `timeline` → `timeline/sound/timeline.mp3` *(placeholder)*
- `text-popup` → `text-popup/sound/pop.mp3` *(quiet; placeholder)*

Each element calls its sound with a guarded `Audio().play()` — a missing file just
plays nothing. Drop the real file at the path above, then re-render the preview.

### Rendering the previews

```
cd default_video_elements/_preview
npm install            # once (playwright-core)
node render-all.js     # all elements  ->  <element>/<element>-demo.mp4
node render-all.js globe graph-chart   # just some
```

Each `demo.html` declares `window.DEMO = { duration, settleMs, sfx }` and a
`window.__demoPlay()`; the renderer records it headless (1080×1920) and muxes any
sound effects at their timestamps. Missing placeholder sounds are skipped (silent).
