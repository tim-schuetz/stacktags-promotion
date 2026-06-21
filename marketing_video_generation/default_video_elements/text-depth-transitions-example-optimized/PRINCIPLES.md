# Text-Depth Transitions (optimized) — Bewegungs- & Platzierungsprinzipien

Dieses Element ist eine **faux-3D-Kamera**, die zwischen „Beats" (Text oder
freigestellte Bilder) fährt. Es soll **nicht monoton** wirken — nicht alles
zoomt gleich rein und nicht alles sitzt mittig. Mehrere Dinge dürfen
**gleichzeitig** sichtbar sein und sich überlagern.

Angetrieben über `text-depth-transitions-example-optimized.js`
(`StacktagsDepthTransitionsOptimized`). Jeder Schritt:

```js
{ text: 'Lorem ipsum' }                       // Text-Beat
{ image: 'assets/x.png',                      // freigestelltes (transparentes) Bild
  via: 'rise',                                // Bewegung in diesen Beat hinein
  atX: 0, atY: 600, atScale: 0.92 }           // Ruhe-Anker (Position/Größe)
{ placeholder: 'Gebäude', via:'zoom-out', atY: 560 }  // Platzhalter, bis ein Bild da ist
```

## 1. Bewegungs-Grammatik (welcher Move wann)

- **Hin zu einem Bild** (Text → Bild): **seitwärts bewegen** (`pan-left` /
  `pan-right`) **oder herauszoomen** (`zoom-out`). Die Kamera „weicht zurück"
  und das Bild taucht auf.
- **Von einem Bild weg zu Text** (Bild → Text): **seitwärts bewegen** **oder
  hineinzoomen** (`zoom-in`). Die Kamera „stößt vor" in den neuen Text.
- **Aufbauende Komposition** (Text bleibt, etwas kommt dazu):
  - `rise` — Objekt **steigt von unten** herein, der vorhandene Text **bleibt
    im Hintergrund sichtbar** (er verschwindet nicht).
  - `drop` — Objekt **kommt von oben** herein und **schwebt im oberen Bereich**.
  - `pop` — **kleines** Objekt erscheint an seinem Anker (kaum Reise), während
    Text/Großobjekt stehen bleiben.
- **`lift`** — die **ganze Szene fährt nach oben** (Kamera-Hub + Zoom): alle
  bisherigen Elemente **gleiten gemeinsam nach unten aus dem Bild** (sie
  *fliegen raus*, sie zoomen nicht weg und faden nicht), während der neue Text
  **von oben hereingleitet**. Wichtig: alles bewegt sich **synchron**, damit die
  Zoom-Illusion hält.

Grundsatz: **abwechseln**. Nie zweimal hintereinander derselbe Move. Das Gitter
macht jede Bewegung mit (skaliert beim Zoom, verschiebt sich beim Pan/Hub) und
stützt so die räumliche Illusion.

### Sound (Swoosh)

Ein **Swoosh** wird gespielt, wenn ein **am Rand verankertes Bild hereinschwebt**
(z. B. Elefanten unten, Tempel unten) — also bei `rise`/`drop`-Bildern, die an
einer Kante ruhen. **Nicht** für frei schwebende Objekte wie die **Laterne** oder
die **Münze**. Die Swoosh-Zeitpunkte stehen in `demo.html` unter `DEMO.sfx`
(`{ sound:'swoosh', t:<sek>, vol:… }`).

## 2. Platzierung richtet sich nach dem MOTIV

Objekte erscheinen **nicht zwangsläufig mittig**. Wo ein Objekt ruht, ergibt
sich daraus, was es zeigt (Anker via `atX` / `atY` / `atScale`; `0,0` = Mitte,
`atY` positiv = tiefer, `atX` positiv = rechts):

| Motiv | Ruheort | Anker (Richtwert) | Warum |
|---|---|---|---|
| **Elefanten auf Gras** | unten am Rand | `atY: 600` | das Gras bildet eine flache Standlinie |
| **Gebäude** | unten am Rand | `atY: 560` | steht auf seinem Fundament |
| **Laterne** | oben, schwebend | von oben (`drop`), `atY: -480` | hängt/kommt von oben |
| **Münze** | frei schwebend, **nicht** am Rand | `atY: -120, atX: 220` | Geld „schwebt", leicht aus der Mitte versetzt |
| **kleine Objekte** | beliebig, ggf. seitlich (`atX`) | klein (`atScale ≈ 0.4–0.6`) | dürfen **zusätzlich** zu Großobjekt/Text erscheinen |

Weitere Regeln:

- **Bilder dürfen am Rand erscheinen** (z. B. `atX: -300` links, `atX: 300`
  rechts), nicht nur zentriert.
- **Standlinie unten, Hängendes oben.** Was eine Bodenlinie hat (Tiere,
  Gebäude, Bäume) bleibt unten; was hängt/fliegt (Laterne, Vogel, Ballon) bleibt
  oben.
- **Schwebendes** (Münze, Symbol) sitzt **frei im Bild, etwas aus der Mitte**,
  bewusst **nicht** bündig am Rand.
- **Mehrere gleichzeitig:** ein **kleines** Objekt darf parallel zu einem
  **großen** Objekt **und** Text sichtbar sein — kleinere Objekte nacheinander
  einblenden (`pop`), während der Rest stehen bleibt.

## 3. Anker-Parameter

- `atX` — horizontaler Ruheort in px ab Mitte (−540 … +540 sichtbar). Default 0.
- `atY` — vertikaler Ruheort in px ab Mitte (−960 … +960 sichtbar). Default 0.
- `atScale` — Ruhegröße. Großobjekt ≈ 0.9–1.0, klein ≈ 0.4–0.6. Default 1.

Die Kamera-Moves bringen den Beat **auf seinen Anker** (nicht auf die Mitte) und
setzen den Zustand fort, sodass aufeinanderfolgende Moves nicht springen.
