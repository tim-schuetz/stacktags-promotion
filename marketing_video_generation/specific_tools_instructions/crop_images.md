Bilder freistellen (rechteckiges Foto → nur das Objekt, transparent)

  Prinzip: Das Bild wird ganz normal generiert (Imagen/Gemini liefert immer ein rechteckiges Foto mit Hintergrund). Das Freistellen ist Nachbearbeitung mit einem Segmentierungs-Modell, das den Vordergrund erkennt und
  den Rest transparent macht.

  Werkzeug: rembg (https://github.com/danielgatis/rembg) (Python, nutzt das U²-Net-Neuronetz). Installiert in Python 3.14 (rembg + onnxruntime).

  Schritte:
  1. Bild erzeugen (Imagen 4 via Gemini-API, z. B. „a single Tsingtao bottle, … on a plain solid white background") — ein einfacher/klarer Hintergrund erleichtert das Freistellen.
  2. Freistellen:
  from rembg import remove
  from PIL import Image
  inp = Image.open("raw.png").convert("RGBA")
  out = remove(inp, alpha_matting=True,
               alpha_matting_foreground_threshold=240,
               alpha_matting_background_threshold=15)
  if out.getbbox(): out = out.crop(out.getbbox())   # eng auf das Objekt zuschneiden
  out.save("cutout.png")                              # transparentes RGBA-PNG
  2. alpha_matting=True gibt sauberere Kanten; crop(getbbox()) entfernt den leeren Rand.
  3. Ergebnis: transparentes PNG, das im Video frei über andere Elemente schweben kann (kein sichtbares Rechteck).

  Hinweis: Für transparente Cut-outs ist rembg (oder alternativ OpenAI gpt-image-1 mit background:"transparent") nötig — Imagen/Gemini selbst kann keine Transparenz.
