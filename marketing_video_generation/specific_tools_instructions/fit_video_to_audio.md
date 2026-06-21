Workflow: HTML-Animationsvideo audio-synchron rendern

  Prinzip: Das Video wird nicht mit festen Timern gebaut, sondern jede Bildaktion (Szenenwechsel, Aufleuchten, Untertitel) hängt an der Abspielposition des Audios (audio.currentTime). Die exakten Zeitpunkte kommen aus
  einer Wort-genauen Transkription des Audios.

  Aufbau im Code (app.js)

  - Eine requestAnimationFrame-Schleife liest jedes Frame audio.currentTime und feuert fällige Einträge aus zwei Listen:
    - CUES = [[zeit, aktion], …] — Szenen, Effekte, Übergänge
    - SUBS = [[zeit, "Untertitel"], …]
  - Contract der Seite: ein <audio id="vo">, eine globale window.__play()-Funktion zum Starten, ein „clean"-Modus (HUD ausblenden) fürs Aufnehmen.

  Schritte

  1. Audio transkribieren (Zeitstempel holen): Audio an OpenAI Whisper schicken (whisper-1, verbose_json, timestamp_granularities: ['word']) → whisper.json mit Wort-Zeiten. (Nicht Gemini — das driftet ab ~1 Min.)
  2. Anker setzen: im Wort-Stream die Schlüsselphrasen suchen (z. B. „now head north", „back to the coast") und deren Startsekunde notieren.
  3. Timings eintragen: diese Sekunden in CUES/SUBS setzen. Längere Sätze in lesbare Untertitel-Häppchen aufteilen.
  4. Aufnehmen (capture.js): Seite headless (Playwright) öffnen, Audio stumm abspielen, Seite in Echtzeit zu .webm filmen. Preroll messen = Wall-Clock, bis currentTime wirklich > 0 läuft (Audio-Bufferlatenz), nicht der
  play()-Aufrufzeitpunkt.
  5. Muxen (mux.js, ffmpeg): den gemessenen Preroll vorne wegschneiden und die originale MP3 wieder dazumischen → Frame bei Zeit t = Audiowort bei Zeit t. (Outro über den letzten Satz hinaus halten: -af apad -t <dauer>
  statt -shortest.)
  6. Verifizieren: mit ffmpeg -ss <zeit> Einzelframes aus dem fertigen MP4 an den Ankerzeiten ziehen und prüfen, dass die richtige Szene + der richtige Untertitel zu sehen ist.

  Zwei Stolperfallen (immer checken)

  - CPU-Last → Drift: Bei überlasteter CPU läuft die Seite in Zeitlupe, die .webm wird länger als Echtzeit, und das Bild hängt dem Ton hinterher. Nach jeder Aufnahme prüfen: ffprobe …recording.webm ≈ erwartete Echtzeit
  (Preroll + Audio + Tail). Wenn länger → hängende headless-Chrome-Prozesse killen und solo neu aufnehmen.
  - Neuer Audiotrack = neu alignen: Bei jeder neuen Audio-Aufnahme Whisper erneut laufen lassen und alle Timings neu setzen — schon kleine Pacing-Änderungen verschieben die Wort-Zeiten um Sekunden.
