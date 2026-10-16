# API-Entwurf

> Entwurf zur Review, noch nicht implementiert. Alle Endpunkte erfordern ein gültiges
> Keycloak-Token (siehe [AUTH.md](AUTH.md)), außer explizit anders vermerkt.

## Formulare

Ersetzt den bisherigen lokalen Verzeichnis-Picker durch eine zentrale Quelle.

### `GET /api/formulare`

Liefert die Formular-Bibliothek, gruppiert wie bisher nach Unterverzeichnisname (eine
Ebene).

```json
{
  "gruppen": [
    {
      "name": "Marken",
      "formulare": [
        { "pfad": "Marken/W7005.pdf", "name": "W7005", "seiten": 1 }
      ]
    }
  ]
}
```

### `GET /api/formulare/{pfad}`

Liefert die PDF-Datei (Binärinhalt, `Content-Type: application/pdf`).

## Favoriten

Ersetzt `localStorage` + manuellen `favoriten.json`-Austausch. Datenformat identisch zu
den bisherigen Anweisungsfolgen (siehe `frontend/app.js`, `itemsToInstructions`).

**Offen:** privat je Nutzer, geteilt im Team, oder beides? Beeinflusst, ob die Endpunkte
einen Nutzerbezug brauchen oder global sind.

### `GET /api/favoriten`

Liste aller (eigenen bzw. geteilten) Favoriten.

```json
[
  {
    "name": "Standard-Nachgang Marke",
    "items": [
      { "type": "paket-trenn", "kategorie": "NEUANMELDUNG" },
      { "type": "dokument-trenn", "doktyp": { "nr": 120, "name": "...", "fachsystem": "marke" } },
      { "type": "datei", "relPath": "Marken/W7005.pdf", "label": "W7005" }
    ]
  }
]
```

### `POST /api/favoriten`

Legt einen Favoriten an oder überschreibt einen vorhandenen mit gleichem Namen (Body:
wie oben, ein Objekt).

### `DELETE /api/favoriten/{name}`

Löscht einen Favoriten.

## Fax-Export (vorläufig, Phase 2)

Noch nicht festgelegt, ob TIFF+Metadaten rein clientseitig bleiben (aktueller Plan,
siehe [FAX_EXPORT.md](FAX_EXPORT.md)) oder ob das Backend das Ergebnis zusätzlich
ablegt/protokolliert. Kein Endpunkt hierfür vorgesehen, solange Erzeugung clientseitig
bleibt.

## Noch nicht entschieden

- Doktypen/Dokumentenkategorien (`doktypen.json`, `dokumentkategorien.json`) weiterhin
  statisch im Frontend bündeln, oder ebenfalls über die API ausliefern (relevant für die
  geplante "Formularpflege"-Erweiterung, siehe [DECISIONS.md](DECISIONS.md))?
