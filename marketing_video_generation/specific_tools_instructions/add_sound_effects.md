Workflow: Soundeffekte der Default-Elemente ins Video einbauen

  Prinzip: Die Default-Elemente bringen eigene Soundeffekte mit (Swoosh bei Transitions, Pop beim Auftauchen von Wörtern, Ticking beim Hochzählen). Playwright-Headless kann Web-Audio aber NICHT mitschneiden. Deshalb wird
  der Ton nicht live aufgenommen, sondern deterministisch nachgebaut: eine SFX-Liste deklariert pro Beat {Zeit, Sound, Lautstärke}, und beim Muxen werden die Sounds per ffmpeg an exakt diesen Zeitpunkten über die
  Narration gelegt. Eine eigene SFX-Liste ist nötig, weil ein selbst-orchestriertes Video (eigene CUES) die `window.DEMO.sfx`-Deklarationen der Einzel-Elemente nicht automatisch erbt.

  Wie die Default-Elemente Sounds deklarieren

  - Jedes Element setzt `window.DEMO.sfx = [{ sound:'swoosh'|'ticking', t:<sek>, vol:<0..1> }]` (oder `{ src:'sound/pop.mp3', t, vol }`); der Standalone-Viewer (`_shared/viewer.js`) spielt sie mit `new Audio()`.
  - Assets liegen unter `default_video_elements/_shared/sound/`: `swoosh.ogg`, `tickingtimeline.mp3`.
  - ACHTUNG: `pop.mp3` wird von text-popup referenziert, EXISTIERT aber nicht im Repo → selbst synthetisieren (siehe Schritt 1).
  - Faustregel, welcher Sound wohin: `swoosh` bei jeder Tiefen-Transition / jedem Szenenwechsel / Globe-Dive / Enumeration-Fold / Outro-Assemble / einfliegenden Objekt; `pop` pro Wort beim text-popup (z. B. Recap-Wortwolke);
  `ticking` beim Hochzählen von timeline / bar-/graph-chart.

  Aufbau im Code

  - In `app.js` eine `SFX = [[t, 'swoosh'|'pop', vol], …]`-Liste an die ECHTEN CUE-Zeiten des Videos, und `window.SFX = SFX;` exponieren. Dazu eine `SND`-Map auf die lokalen Sounddateien und ein `playSfx(entry)`.
  - Die Cue-Engine spielt die SFX zusätzlich live ab (ein `firedSfx`-Set analog zu firedScene/firedSub; in `hardReset` leeren, in `applyUpTo` nur als „gespielt" markieren ohne abzuspielen, im Vorwärts-`tick` abspielen) — so
  hat man auch im Browser-Preview Ton.
  - `capture.js` liest nach dem Laden `window.SFX` aus und schreibt es nach `capture/sfx.json`.
  - `mix_sfx.js` (neu) baut daraus die Tonspur und legt sie über die Narration → `capture/narration_sfx.m4a`.
  - `mux.js` nimmt `narration_sfx.m4a` statt der nackten mp3 (mit Fallback auf die mp3, falls die Mischung fehlt).

  Schritte

  1. Assets bereitstellen + LAUT genug machen: `swoosh.ogg` nach `video/assets/sound/` kopieren; den Pop synthetisieren
     (`ffmpeg -f lavfi -i "sine=frequency=740:duration=0.12" -af "afade=t=out:st=0.004:d=0.116:curve=exp" -ar 44100 -ac 1 video/assets/sound/pop.wav`).
     Dann beide EINMALIG auf ~−3 dBFS Peak normalisieren (Gain = −3 − aktueller_max, via `ffmpeg -i datei -af "volume=<gain>dB" …`) und die Datei überschreiben. Ohne diesen Schritt sind die Sounds unhörbar (s. Stolperfallen).
  2. SFX-Liste in `app.js` setzen: Zeiten = die `CUES`-Zeiten der jeweiligen Transition/Aktion; Lautstärken typ. 0.4–0.6 (Swoosh), Pops ~0.55. `window.SFX` exponieren, `playSfx` + `firedSfx` in die Cue-Engine einhängen.
  3. `capture.js` ergänzen: `const sfx = await page.evaluate(() => window.SFX || []); fs.writeFileSync('capture/sfx.json', JSON.stringify(sfx));` (direkt nach dem Seitenaufbau, vor der Aufnahme).
  4. `mix_sfx.js` anlegen: pro SFX-Eintrag ein `-i <sounddatei>`; Filtergraph je Sound `aformat=…:channel_layouts=mono,adelay=${t*1000}:all=1,volume=${vol}`, alle plus `[base]` (die Narration) in
     `amix=inputs=N:normalize=0:duration=first` (normalize=0 ⇒ die Stimme behält ihren vollen Pegel), abschließend ein transparenter Safety-Limiter `alimiter=limit=0.98:level=false`, Ausgabe mono (`-ac 1`) → `narration_sfx.m4a`.
  5. `mux.js`: Audioquelle = `narration_sfx.m4a`, falls vorhanden, sonst die mp3. Rest (Preroll-Trim, `-af apad -t <dauer>`) bleibt.
  6. Render-Reihenfolge: `capture.js` → `mix_sfx.js` → `mux.js`. (Bei reinen Lautstärke-/Timing-Änderungen am Ton reicht `mix_sfx.js` + `mux.js`, kein Neu-Capture nötig.)
  7. Verifizieren (ffmpeg `volumedetect`): Gesamtpegel des fertigen MP4 ≈ rohe Narration (Stimme erhalten, kein Pegelverlust), SFX-Peak ~−9 dB (klar hörbar, ~8 dB unter der Sprache), Gesamt-Peak < 0 dB (kein Clipping).

  Stolperfallen (immer checken)

  - Assets sind sehr leise gemastert: `swoosh.ogg` hat nur ~−25 dBFS Peak. Bei vol 0.5 landet der Swoosh ~−31 dB, also 20–30 dB unter der Sprache → man hört NICHTS. „Energie ist messbar da" ≠ „hörbar". Deshalb Schritt 1
  (Normalisierung auf ~−3 dBFS) zwingend, sonst sind die Effekte stumm.
  - Narration ist meist MONO: ein erzwungenes `channel_layouts=stereo` schickt das Mono-Signal durch den Upmix-Pan-Law und senkt die Stimme ~3 dB (mean −18→−21, max −0.9→−3.7). Den GANZEN Filtergraph mono halten
  (`channel_layouts=mono` + `-ac 1`) — dann bleibt der Stimmpegel exakt erhalten.
  - `volumedetect` schreibt seine Zusammenfassung auf INFO-Level: NICHT mit `-v error` aufrufen, sonst kommt keine Ausgabe.
  - Dichte/Pegel rein über die `SFX`-Liste justierbar (vol-Werte) — kein Eingriff in die Mux-Logik nötig.
