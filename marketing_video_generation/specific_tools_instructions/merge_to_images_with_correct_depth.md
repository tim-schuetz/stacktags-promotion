Anleitung: Zwei Bilder tiefenrichtig verschmelzen

  Kernidee: Ein Objekt B (Helm) flach über ein Motiv A (Person) zu legen, wirkt fake — weil ein Teil von B eigentlich vor A und ein Teil hinter A gehört. Der Trick ist deshalb fast immer derselbe: B in eine Vorder- und 
  eine Hinter-Ebene zerlegen und A dazwischen legen („Sandwich"). Dazu sauberes Freistellen und passgenaue Positionierung.

  0. Voraussetzung: beide Bilder freigestellt (transparenter Hintergrund)

  - Per rembg (alpha_matting=True) für Fotos, Chroma-Key/Flood-Fill für flache Cartoons mit klarem Hintergrund, oder per Hand in paint.net.
  - Auf das Inhalts-Rechteck zuschneiden (autocrop auf die Alpha-Bounding-Box) — macht spätere Positionierung berechenbar.

  1. Konzept festlegen: Was gehört vor, was hinter A?

  Faustregel: Der Teil von B, der A umschließt/dahinter greift, gehört nach hinten; der Teil, der A von vorne verdeckt, nach vorne.
  - Helm: goldene Schale + Wangenklappen = vorne; dunkler Innenraum (die Öffnung) = hinten (da steckt das Gesicht durch).
  - Übertragbar: Brille → Bügel hinter den Ohren = hinten; Sonnenhut → Krempe vorne, Kopf-Innenseite hinten; jemand hinter einer Mauer → Mauer vorne, Person hinten.

  2. Die „Trennregion" in B finden (welcher Bereich ist hinten?)

  Beim Helm ist das die dunkle Öffnung. Zwei Wege:

  A) Automatisch — wenn die Hinter-Region farblich klar abgrenzbar ist:
  1. Maske bilden: Pixel die undurchsichtig und z. B. dunkel sind (alpha>140 & luminanz<78).
  2. Problem: dünne dunkle Outlines hängen mit drin und verbinden alles. Lösung = morphologisches „Opening":
    - Erodieren (Maske um ~3 px schrumpfen) → dünne Linien (≤3 px) verschwinden, der dicke Block bleibt → er wird zur isolierten Insel.
    - Flood-Fill von einem Saatpunkt mitten in der Region → greift nur diesen einen zusammenhängenden Block.
    - Dilatieren (um ~4 px wieder aufblasen) + mit der Original-Maske schneiden → Region hat wieder ihre echte Kante.
    - (Erode/Dilate kann man in numpy selbst bauen: Array um 1 px verschieben und per UND bzw. ODER verknüpfen — kein scipy nötig.)

  B) Manuell (paint.net) — wenn der Bereich farblich nicht klar trennbar ist:
  - Hinter-Region mit Zauberstab/Lasso auswählen, auf eine eigene Ebene ausschneiden. Fertig — gleiche zwei-Ebenen-Logik wie unten.

  3. B in zwei PNGs schneiden (gleiche Leinwandgröße!)

  - B_front.png = Original-B, an der Trennregion Alpha = 0 (Loch). Übrig: der Vorderteil.
  - B_back.png = nur die Trennregion (beim Helm dunkel gefüllt = Innenraum), drumherum transparent.
  - Wichtig: beide auf identischer Leinwand lassen → gleiche Position/Skalierung im Layout, kein Verrutschen.
  - Kanten leicht weichzeichnen (Gauß ~1 px), damit der Schnitt nicht hart wirkt.

  4. Stapeln (z-index)

  B_back   (hinten)   z = 1
  A (Person/Motiv)    z = 2
  B_front  (vorne)    z = 3
  A steckt jetzt im „Loch" der Front, hinter A schimmert die Back-Ebene durch → Tiefe.

  5. Passgenau positionieren — ohne Render-Cycles

  - Skalierung von B relativ zu A festlegen (z. B. Helmbreite ≈ 0,4 × Personbreite).
  - Den Anker ausmessen: das Bild von A mit einem Koordinaten-Raster überlagern und ablesen, wo z. B. die Handfläche/das Gesicht liegt.
  - B so verschieben, dass seine Öffnung/sein Loch über dem richtigen Teil von A sitzt.
  - Den Look mit einem schnellen PIL-Komposit (back + A + front) durchprobieren und Varianten als Kontaktbogen vergleichen — erst wenn's passt, in CSS/Layout übernehmen. Spart teure Render-/Aufnahme-Durchläufe.

  6. Bewegung: beide B-Ebenen synchron animieren

  - Front- und Back-Ebene bekommen denselben Transform (z. B. von oben reinfallen: translateY(-700px) → 0, gleiche Dauer/Easing, gemeinsame Trigger-Klasse).
  - A bleibt statisch dazwischen → B fällt als eine Einheit auf/um A. (Genau so, falls du B mal in paint.net trennst: zwei Dateien, identische Animation, A mit z-index dazwischen.)

  7. Feinschliff

  - Schlagschatten nur auf B_front (auf der Back-Ebene sähe er falsch aus).
  - Despill: falls Farbreste vom alten Hintergrund an B-Kanten kleben, die Störfarbe rausrechnen.
  - Sanity-Check immer am fertigen Render (das gemuxte MP4), nicht nur am Einzel-Frame.

  ---
  Wann es nicht automatisch geht: Der Erode→Flood→Dilate-Trick funktioniert nur, wenn die Hinter-Region ein großer, kompakter Block ist und die störenden Strukturen dünn. Grenzt die Region direkt an gleichfarbiges
  Material (dunkel an dunkel, ohne Kante), ist Schritt 2B (paint.net von Hand) der sauberere Weg — der Rest der Anleitung (3–7) bleibt identisch.