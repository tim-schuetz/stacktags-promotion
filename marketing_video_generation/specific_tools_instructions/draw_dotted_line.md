Gestrichelte Linie entlang der Silhouette zeichnen:
  Prinzip: Die Umrandung folgt nicht einem Rechteck, sondern der echten Form des Objekts. Dazu trace ich die Kante des Alpha-Kanals (Grenze Objekt↔transparent) zu einem Pfad und zeichne den gestrichelt — leicht nach
  außen versetzt.

  Werkzeuge: Python mit scikit-image (measure.find_contours, approximate_polygon), scipy.ndimage, PIL.

  Schritte:
  1. Maske bilden: Alpha-Kanal des Cut-outs → binäre Maske; binary_fill_holes (Löcher schließen); binary_dilation(iterations=N) — N steuert den Abstand der Linie zum Objekt (mehr Iterationen = weiter außen).
  2. Kontur tracen: skimage.measure.find_contours(maske, 0.5) (Marching-Squares) → die größte Kontur ist die äußere Silhouette als Punktliste.
  3. Vereinfachen: approximate_polygon(kontur, tolerance≈1.5) reduziert die Punkte (glattere, kürzere Linie).
  4. Stricheln: den Linienzug entlang seiner Bogenlänge ablaufen und abwechselnd „Strich an / Strich aus" zeichnen (z. B. 13px an / 9px aus), an den Strich-Enden kleine Kreise für runde Kappen.
  5. Glätten (Anti-Aliasing): alles 3×-supersamplen zeichnen und dann per LANCZOS herunterskalieren → saubere Kanten.
  6. Backen mit Rand: das Ganze auf ein transparentes PNG legen, mit ~18px Padding rundherum (damit die nach außen versetzte Linie nicht abgeschnitten wird). → ein einziges PNG mit eingebackener Strichlinie.

  Parameter zum Justieren:
  - iterations (Dilation) = Abstand der Linie zum Objekt
  - Strich an/aus = Dichte; Strichbreite & Farbe = Look

  Warum ein gebackenes PNG statt SVG-Overlay: Es gibt keine Ausrichtungs- oder Clipping-Probleme zwischen zwei Ebenen — das Video bindet einfach ein Bild ein (Größe/Position einmal an das Padding anpassen).
