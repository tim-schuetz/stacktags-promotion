# One poem with only one word — possible in Chinese · animated video

**NEW STYLE rebuild** (follows `promotion/marketing_video_generation/designguide.md`):
white background + thin grey **moving grid**, turquoise `#35A292`, **Inter only** (CJK in a
sans face), full verbatim subtitles. It opens with a **bespoke scene** (`#scene-open`): a
**manuscript scroll** (wooden rods top + bottom, black side lines, parchment interior) in which the
poem is typed **letter by letter** while the scroll follows the cursor (smooth accelerate /
decelerate); the scroll then fades to the white grid as its characters **fly out of the text** into
a 6-character cluster (each labelled "shi"), then fly again into the **title**, then the linguist
portrait **slides up** from below (its full dashed silhouette baked in) while the title stays. From the tones beat on it rides the default **depth-transition** element (faux-3D camera on
the moving grid), closing on the default **outro** (voiced). Synced via OpenAI Whisper word-level
timestamps (`_build/whisper.json`, `node whisper_align.js`).

**Audio:** the user records two files — `../script_audio.mp3` (full narration) + a Chinese voice
reading just the first four-tone "shī shí shǐ shì" (`../script_audio_chinese_part.mp3`). The build
splices them into **`../script_audio_combined.mp3`** (the video's real source; ~68.68s): cut the
English four-tone block at the Whisper word boundaries, drop in the Chinese clip (boosted +10.5 dB
+ limiter), concat with short fades. The whole video runs to ~70.6s (audio + a short end-card hold).

The hook: **The Lion-Eating Poet in the Stone Den** (施氏食獅史) by linguist Yuen Ren Chao —
a Classical-Chinese poem of 90-odd characters where *every* character is pronounced "shi"
(only the tone differs: shī / shí / shǐ / shì). Read aloud it's an unintelligible wall of "shi";
written down it's a perfectly clear story. Punchline: **in Chinese, the writing — not the sound —
carries the meaning.** (Honest about it: a deliberate stunt in literary Chinese, NOT everyday
speech; homophony shown qualitatively, with no invented "distinct-syllable" numbers.)

## Design principle for the visuals
The big on-screen visual is **never a transcription of the narration** — the spoken line lives
only in the bottom subtitle. Each beat is either a **conceptual graphic** (the four-tone chips
with contour lines, the read-aloud waveform, the `shì → 詩獅石史是食` fan-out, the older-sounds
melt-to-one-`shī`, the READ ✓ / HEARD ✗ split) or a **transparent cut-out illustration** that
*acts out* the story (the poet, a lion popping in beside him, the market stall, the grey **stone**
lion for the twist, a baffled listener, the Yuen Ren Chao portrait).

## The finished file
`one-poem-one-word.mp4` (1080×1920, 9:16, ~70.6s, H.264+AAC) — the rendered video with audio + SFX.
The previous (old-style) build is archived under `_archive_v1/`. The dashed portrait border is
baked by `_build/bake_dotted.py` (run with Python 3.14 — see `_build` notes) per
`../../../specific_tools_instructions/draw_dotted_line.md`.

## Structure
```
index.html        stage skeleton (1080×1920, scaled); depth + outro scenes; subtitle strip
styles.css        stage chrome + the bespoke look of every depth beat (waveform, tone chips,
                  character fan, sound-collapse, the read-vs-heard split)
app.js            audio-currentTime cue engine: STEPS (beat content) + BEATS (time+camera move)
                  + SUBS (full verbatim subtitles) + the outro choreography
elements/         default elements copied from ../../../default_video_elements
  theme.css       shared tokens, grid, subtitle styles (_shared/theme.css)
  depth.css/js    the moving-grid depth-transition fly-through (StacktagsDepthTransitionsOptimized)
  outro.js        the default endcard element (window.makeStacktagsLogo); reveals on `.play`
  outro.css       the endcard's reveal styles (logo → wordmark → stacktags.io url), scoped to #outro-host
assets/cutouts/   transparent cut-out illustrations (gpt-image-1) — poet, lion, stone_lion,
                  market, listener, chao(+chao_dotted)
assets/sound/     SFX, normalised to ~-3 dBFS: swoosh.wav (transitions), pop.wav (char snap-ins)
_build/           tooling (not part of the video):
  generate_cutouts.js  gpt-image-1, background:transparent -> assets/cutouts/*.png
  bake_dotted.py       dashed silhouette line baked onto a cut-out (Python 3.14, see notes)
  whisper.json         word-level timestamps (OpenAI Whisper) used to place the cues
  server.js            static dev server (serves the topic folder on :8867)
  shoot.js             seek to key beats (window.__seek) + screenshot -> shots/
  capture.js           record the playing page to webm (burns a t=0 black sync flash) + sfx.json
  mix_sfx.js           overlay window.SFX onto the narration (mono) -> capture/narration_sfx.m4a
  mux.js               blackdetect-trim + mux narration_sfx.m4a (or the mp3) -> ../one-poem-one-word.mp4
```

## Sound effects
The default elements ship SFX but Web-Audio can't be captured headless, so they're rebuilt
deterministically (see `../../../specific_tools_instructions/add_sound_effects.md`): `app.js`
declares `SFX = [[t,'swoosh'|'pop',vol], …]` at the **real cue times** (every transition / fly-in /
outro-assemble = swoosh; character snap-ins = pop), `mix_sfx.js` overlays them onto the narration
**mono** (`amix … normalize=0` keeps the voice at full level; a limiter prevents clipping), and
`mux.js` uses that mix. Assets are normalised to ~-3 dBFS first (they ship ~20 dB too quiet to hear
under the voice). Verified with `volumedetect`: voice mean unchanged (-16.7→-16.8 dB), SFX peak
~-8 dB (audible), overall peak -0.5 dB (no clip).

## Why cut-outs use gpt-image-1 (not Imagen)
The depth element floats transparent cut-outs on the grid. Imagen 4 has no alpha channel, so the
illustrations are generated with **OpenAI gpt-image-1** (`background: "transparent"`, flat editorial
vector style, white + turquoise palette so the six read as one set). This is the one place OpenAI is
the right tool over the Imagen-4 default — transparency is a hard requirement Imagen can't meet.

## Re-rendering the MP4
```
cd _build
node generate_cutouts.js   # (once) illustrations -> ../assets/cutouts/*.png   [needs OPENAI_API_KEY]
node server.js             # (in one shell) serves on :8867
node shoot.js              # optional QA: seek to each beat -> shots/
node capture.js            # records the page playing -> capture/recording.webm + capture/sfx.json
node mix_sfx.js            # overlay the SFX onto the narration -> capture/narration_sfx.m4a
node mux.js                # -> ../one-poem-one-word.mp4
```
(SFX-only tweaks: edit `SFX` in `app.js`, re-dump `capture/sfx.json`, then `mix_sfx.js` + `mux.js`
— no re-capture needed.)

## Notes
- Audio is `../script_audio.mp3` (≈98.22s) and now matches the script verbatim — opening
  "What you see here is a poem." and a closing that ends on "…more learning content on
  **stacktags.io**" (which matches the default endcard). The voiceover gets replaced by the user;
  whenever it changes, re-anchor the cues (see below).
- Port is **8867** (each build uses a unique port so a leftover dev server can't serve the wrong topic).
- The capture burns a black frame at audio t=0; `mux.js` finds it with `blackdetect` for an exact trim,
  then pads ~1.9s so the end-card holds past the last spoken word.
- Don't run two `capture.js` recordings at once — CPU contention corrupts the timeline.
- `_build/gemini_transcribe.js` re-checks the audio's spoken content; `_build/silencedetect`-derived
  phrase onsets (run ffmpeg) are how the cue times were placed without Whisper.
- The full poem 施氏食獅史 fills the hook wall; every character reads shī/shí/shǐ/shì.
```
