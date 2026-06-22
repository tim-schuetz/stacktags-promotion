# One poem with only one word — possible in Chinese · animated video

HTML-animated marketing video in the Stacktags design (white + turquoise `#3EAE93`),
synced to the narration in `../script_audio.mp3` (≈96.36s). Every element appears on the
exact timestamp its line is spoken (timestamps force-aligned from the audio with OpenAI Whisper).

The hook: **The Lion-Eating Poet in the Stone Den** (施氏食獅史) by linguist Yuen Ren Chao —
a Classical-Chinese poem of 90-odd characters where *every* character is pronounced "shi"
(only the tone differs: shī / shí / shǐ / shì). Read aloud it's an unintelligible wall of "shi";
written down it's a perfectly clear story. Punchline: **in Chinese, the writing — not the sound —
carries the meaning.** (Honest about it: a deliberate stunt in literary Chinese, NOT everyday speech;
homophony shown qualitatively, with no invented "distinct-syllable" numbers.)

## Play it
Open `index.html` in a browser and press **Play** (or Space). Press **C** for clean mode
(hides the control bar, fills the viewport) — used for recording.

Self-contained except: Google Fonts + Three.js r128 (CDN, used only for the decorative
sound-collapse particle field). **No realistic photos** — this is a typographic/linguistics
explainer, so everything is graphic/typographic (Imagen images deliberately not used here).

## The finished file
`one-poem-one-word-96s.mp4` (1080×1920, 9:16, ~98.3s) — the rendered video with audio.

## Structure
```
index.html        stage skeleton (1080×1920, scaled to fit)
styles.css        all scene styling
app.js            audio-currentTime cue engine + scene choreography (CUES array) + the poem data
elements/         reusable bits (copied from ../../../default_video_elements)
  enumeration.*   the four-tones line-up (shī/shí/shǐ/shì) (StacktagsEnumeration)
  outro.*         closing brand card (logo + Follow + folder link) (StacktagsOutro)
  waveform.js     canvas waveform (mountWaveform; 'pop' for the read-aloud blur,
                  'flat' = a lifeless identical muted blur for the punchline)
  collapse.js     Three.js particle field (mountSoundCollapse) — older sounds converge into one
_build/           tooling (not part of the video):
  whisper_align.js   transcribe audio with word timestamps via OpenAI Whisper -> whisper.json
  server.js          static dev server (serves the topic folder on :8865)
  shoot.js           seek to key timestamps + screenshot (visual QA -> shots/)
  capture.js         record the playing page to webm (playwright-core + cached Chromium)
  mux.js             mux webm + mp3 -> ../one-poem-one-word-96s.mp4 (ffmpeg)
```

## Storyboard (mapped to the script)
- **Hook (0–10.7s)** — a faded, scrolling wall of the real poem characters (each pinyin label
  reads shī/shí/shǐ/shì); title card "90+ characters. And **one** sound." → the big "shī" reveal.
- **The poem (10.7–24.7s)** — title card 施氏食獅史 + a graphic Yuen Ren Chao author card; then the
  **enumeration element** lines up the four tones (shī/shí/shǐ/shì) → "Four flavors of a single syllable."
- **Read it aloud (24.7–37.1s)** — a persistent **READ ALOUD ⇄ ON PAPER** toggle flips to READ ALOUD;
  a busy teal **waveform**, the shi-blur subtitles, a baffled face with "???" and "Pure nonsense."
- **On paper (37.1–58s)** — the toggle flips to ON PAPER; the story plays out as a 6-beat strip
  (poet 詩士 → lions 獅 → vows to eat ten 誓食十 → market 適市 → kills/home 使逝 → **STONE lions 石獅**,
  greyed for the twist); verdict "every shi = a different character → zero confusion."
- **Why it works (58–83.7s)** — one "shì" **fans out** into clearly different characters (詩獅石史是食);
  "tones help, but the writing does the heavy lifting"; then a **Three.js particle collapse**: scattered
  older-sound chips (*srij *syi *zyip *dzyek *dzye) converge into one **shī** (qualitative, no numbers);
  honesty card: "Nobody actually talks like this — a deliberate stunt in classical written Chinese."
- **Punchline / outro (83.7–96.4s)** — "It's the writing, not the speech": a **READ ✓** card
  (perfect on paper) vs a **HEARD ✗** card (a flat, identical muted waveform); then the Stacktags brand
  card assembles with a **Follow** CTA and a folder link (`stacktags.com/f/lion-eating-poet`, placeholder).

## Re-rendering the MP4
```
cd _build
node whisper_align.js     # (once) audio -> whisper.json   [needs OPENAI_API_KEY]
node server.js            # (in one shell) serves on :8865
node capture.js           # records the page playing -> capture/recording.webm + preroll.json
node mux.js               # -> ../one-poem-one-word-96s.mp4
```

## Notes
- Cue timestamps in `app.js` (the `CUES` array) were placed from Whisper word-level timestamps
  (see `whisper.json`). Narration runs to ~96.36s; `mux.js` pads ~1.9s so the Follow end-card holds.
- Port is **8865** (each build uses a unique port so a leftover dev server can't serve the wrong topic).
- Don't run two `capture.js` recordings at once — CPU contention corrupts the first ~40s.
- The poem text is the full 施氏食獅史; the per-character pinyin in the scrolling hook column is the
  real reading (all shī/shí/shǐ/shì).
```
