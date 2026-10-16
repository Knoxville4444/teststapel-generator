# Fax-Export

> Entwurf zur Review. Ergänzt den bestehenden PDF-Export um einen Fax-Modus.

## Ablauf (unverändert gegenüber PDF)

Das Zusammenstellen der Seiten (Quellen, Generator, Streifen, Favoriten) bleibt exakt
wie bisher. Erst beim Export wählt der Nutzer das Format:

- **PDF** (bisheriges Verhalten, unverändert)
- **Fax** (neu)

Bei "Fax" wird zusätzlich ein **Eingangsdatum** als Pflichtfeld abgefragt.

## Ausgabe bei "Fax"

Statt einer PDF-Datei werden zwei Dateien erzeugt:

1. Ein **Multi-Page-TIFF** (alle Seiten des Streifens, in Reihenfolge)
2. Eine **Metadaten-Datei** (Format folgt noch – Eingangsdatum fließt hier ein)

## Phase 1: einfache Variante (aktueller Stand)

- TIFF unkomprimiert bzw. einfach komprimiert, Graustufen/Farbe wie gerastert
- Technisch: gleiche Rasterungs-Pipeline wie der bestehende "Wie gescannt
  aussehen"-Effekt (PDF.js rendert jede Seite in ein Canvas) – die Pixeldaten sind die
  Grundlage für einen selbst geschriebenen TIFF-Writer (verkettete IFDs, eine pro Seite)
- Metadaten-Datei: Platzhalter-Struktur, bis das reale Format geliefert wird (siehe
  unten)

## Phase 2: fax-typische Variante (Ausbaustufe)

- CCITT-Group-4-Kompression, 1-bit Schwarz/Weiß
- Fax-übliche Auflösung (typisch 200dpi, 1728px Breite bei Standard-Fax)
- Ggf. fax-typische Bildartefakte (niedrigere Auflösung, reines Schwarz/Weiß ggf. mit
  eigenem Schwellwert statt des bestehenden Rausch-/Vignette-Effekts – zu klären, ob der
  bestehende Scan-Effekt wiederverwendet oder ein eigener fax-spezifischer Effekt
  gebaut wird)
- Reales Metadaten-Format (vom Fachbereich geliefert)

## Offene Punkte für die Review

- **Metadaten-Format:** wird nachgeliefert, Platzhalter-Struktur bis dahin
- Soll der bestehende "Wie gescannt aussehen"-Effekt bei Fax automatisch mit greifen,
  oder braucht es eine eigene fax-typische Variante davon (niedrigere Auflösung, reines
  Schwarz/Weiß)?
- Bleibt die Erzeugung (TIFF + Metadaten) rein clientseitig wie der PDF-Export, oder
  soll das Backend das Ergebnis zusätzlich zentral ablegen/protokollieren (aktuell nicht
  vorgesehen, siehe [API.md](API.md))?
