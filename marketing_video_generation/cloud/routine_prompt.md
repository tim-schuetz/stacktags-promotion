# Leaner cloud-routine prompt (point 3)

Tightened vs. the first run, which died of a full context window:
- references **ONE** example video instead of three,
- assumes the toolchain is **pre-installed** (see `environment_setup.sh`),
- tells the agent to keep **its own context lean** (delegate heavy reads/QA to sub-agents),
- works in **phases** and commits after each so an abort never loses everything.

Swap `<TOPIC-PATH>` per video. The body below is what goes into the routine's user message.

---

Kontext: Du laeufst als Cloud-Agent in einem frischen Checkout dieses Repos. Die Render-Toolchain (Node, ffmpeg, playwright+chromium, Python mit faster-whisper/rembg/scikit-image) ist in dieser Umgebung VORINSTALLIERT — nutze sie direkt; nur falls ein Tool wider Erwarten fehlt, installiere es nach. ALLE Pfade unten sind relativ zur Repo-Wurzel.

WICHTIG (Kontextfenster): Halte DEINEN eigenen Kontext schlank, sonst stirbt die Session vor dem Rendern. Lies grosse Dateien NICHT komplett. Delegiere umfangreiches Lesen sowie Bild- und Render-QA an Sub-Agenten (Task-Tool) und behalte nur deren Zusammenfassungen. Selbst lesen musst du nur: das Skript, den Designguide, und vom EINEN Referenzvideo die Kerndateien (index.html, app.js, styles.css) plus die Shared-Elemente, die du wirklich wiederverwendest.

Arbeite in PHASEN und committe nach jeder Phase auf den Branch `cloud/a-new-ocean-video` (bei Abbruch geht so nichts verloren):
1. Skript + Designguide lesen, visuelles Konzept (Beats) festlegen.
2. EIN Referenzvideo studieren (Aufbau, Transitions, welche Default-Elemente).
3. Video-Ordner + HTML/JS/CSS-Geruest bauen.
4. Bilder via Gemini erzeugen + auf Objekte zuschneiden (gestrichelte Linie wo passend).
5. Audio mit faster-whisper alignen (siehe fit_video_to_audio.md).
6. Rendern (server/capture/mux) + aus dem fertigen MP4 per Frame-Extraktion QA.
7. Thumbnail erzeugen.
8. Finalen Stand committen + pushen, kurze Schluss-Zusammenfassung (fertig / offen / wo es hakt).

AUFGABE: Erstelle ein HTML-animiertes Marketing-Video. Ablauf/Inhalt steht in:
promotion/marketing_video_generation/topics/geography/A new ocean is forming in Russia/skript_text.txt
Sei kreativ bei der visuellen Umsetzung, orientiere dich aber strikt am Designguide:
promotion/marketing_video_generation/designguide.md
Studiere als Referenz fuer den schematischen Aufbau (moeglichst wenig gesprochener Text als Schrift; zugeschnittene Bilder; ggf. Charaktere/Humor; Transitions; Default-Elemente) GENAU dieses EINE Beispielvideo:
promotion/marketing_video_generation/topics/learn_chinese/5 Chinese words from 5 Chinese cities/video

## Audio ##
Tonspur: promotion/marketing_video_generation/topics/geography/A new ocean is forming in Russia/script_audio.mp3
Zeitliche Synchronisation der Sequenzen zur Audiospur: promotion/marketing_video_generation/specific_tools_instructions/fit_video_to_audio.md (fuer Wort-Timestamps faster-whisper nutzen).

## Default Design Elements ## (promotion/marketing_video_generation/default_video_elements)
- Outro: jedes Video endet mit dem Outro.
- Globe: bei Geography-Themen zum Reinzoomen auf Laender als Transition zu einem realistischen Bild.
- Enumeration: falls das Video erst aufzaehlt und die Punkte dann chronologisch im Detail abarbeitet.
- timeline / bar-graph chart: nur falls inhaltlich wirklich passend.

## Bilder ##
Gemini API Key: application/backend/.env (Variable GEMINI_API_KEY). Bilder IMMER auf ihre Objekte zuschneiden statt das ganze Rechteck zu nehmen (promotion/marketing_video_generation/specific_tools_instructions/crop_images.md). Grosse Objekte (Gebaeude/Staedte) an den unteren Bildschirmrand legen. Einzelne Objekte (ausser Zeichentrickfiguren und was mit ihnen in Kontakt kommt) mit gestrichelter Linie umranden (promotion/marketing_video_generation/specific_tools_instructions/draw_dotted_line.md).

## Untertitel ##
Durchgehend wortgleich zum gesprochenen Skript ausschreiben (keine Kuerzungen).

## Abschluss ##
Branch `cloud/a-new-ocean-video` pushen bzw. PR oeffnen. NICHT committen: node_modules, _build/capture/*.webm. Thumbnail-Beispiel: promotion/marketing_video_generation/example_thumbnail
