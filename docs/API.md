# API-Entwurf

> Entwurf zur Review. Code-Bausteine zur Integration ins bestehende Spring-Boot-Backend
> liegen als Java-Dateien unter [`backend/`](../backend/). Auth: siehe
> [AUTH.md](AUTH.md) – hängt sich in die vorhandene Security-Konfiguration ein, hier
> nicht separat behandelt.

## Formulare

Ersetzt den bisherigen lokalen Verzeichnis-Picker durch eine zentrale Quelle.
Siehe `backend/FormulareController.java` + `backend/FormulareService.java`.

### `GET /api/formulare`

Liefert die Formular-Bibliothek, gruppiert wie bisher nach Unterverzeichnisname (eine
Ebene).

```json
{
  "gruppen": [
    {
      "name": "Marken",
      "formulare": [
        { "pfad": "Marken/W7005.pdf", "name": "W7005" }
      ]
    }
  ]
}
```

### `GET /api/formulare/datei?pfad=Marken/W7005.pdf`

Liefert die PDF-Datei (Binärinhalt, `Content-Type: application/pdf`). Pfad als
Query-Parameter statt Pfadsegmente, damit Unterordner-Namen mit Sonderzeichen keine
Spring-Pfad-Matching-Probleme verursachen – Service validiert gegen Path-Traversal
(siehe Kommentar im Snippet).

## Favoriten

Ersetzt `localStorage` + manuellen `favoriten.json`-Austausch. Geteilt (nicht privat je
Nutzer), mit Ordnerstruktur beliebiger Tiefe, kein Besitzkonzept – jeder darf alles
anlegen/verschieben/löschen (siehe [DECISIONS.md](DECISIONS.md) Eintrag 10).
Datenformat der einzelnen Favoriten identisch zu den bisherigen Anweisungsfolgen (siehe
`frontend/app.js`, `itemsToInstructions`).
Siehe `backend/FavoritenController.java` + `backend/FavoritenService.java`.

### `GET /api/favoriten?pfad=`

Inhalt eines Ordners (leerer `pfad` = Wurzel): Unterordner + enthaltene Favoriten.

```json
{
  "unterordner": ["Team-Marke", "Team-Patente"],
  "favoriten": [
    {
      "name": "Standard-Nachgang Marke",
      "items": [
        { "type": "paket-trenn", "kategorie": "NEUANMELDUNG" },
        { "type": "dokument-trenn", "doktyp": { "nr": 120, "name": "...", "fachsystem": "marke" } },
        { "type": "datei", "relPath": "Marken/W7005.pdf", "label": "W7005" }
      ]
    }
  ]
}
```

### `PUT /api/favoriten?pfad=Team-Marke/Standard-Nachgang`

Legt einen Favoriten an oder überschreibt ihn (Body: Favorit-Objekt wie oben, ohne
`pfad`-Feld – der Pfad steht im Query-Parameter). Elternordner werden bei Bedarf
automatisch angelegt.

### `POST /api/favoriten/ordner?pfad=Team-Marke/Untergruppe`

Legt einen (leeren) Unterordner an.

### `DELETE /api/favoriten?pfad=Team-Marke/Standard-Nachgang`

Löscht einen Favoriten oder – falls der Pfad ein Ordner ist – rekursiv den gesamten
Ordner.

## Fax-Export (vorläufig, Phase 2)

Bleibt wie der PDF-Export clientseitig (siehe [FAX_EXPORT.md](FAX_EXPORT.md)). Kein
Endpunkt hierfür vorgesehen, solange das so bleibt.

## Noch nicht entschieden

- Doktypen/Dokumentenkategorien (`doktypen.json`, `dokumentkategorien.json`) weiterhin
  statisch im Frontend bündeln, oder ebenfalls über die API ausliefern (relevant für die
  geplante "Formularpflege"-Erweiterung, siehe [DECISIONS.md](DECISIONS.md) Eintrag 4)?
- Genauer Volume-Pfad im Zieldeployment (siehe [ARCHITECTURE.md](ARCHITECTURE.md),
  offene Punkte)
