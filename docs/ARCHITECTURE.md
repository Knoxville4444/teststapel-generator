# Architektur

> Entwurf zur Review. Siehe [DECISIONS.md](DECISIONS.md) für die Begründungen der
> einzelnen Punkte, insbesondere Eintrag 9 (Integration statt neuem Service).

## Überblick

```
┌───────────────────────────────────────────────────────────┐
│  Vorhandenes Spring-Boot-Backend (Java)                     │
│                                                               │
│  - Security: bereits vorhanden, hier nichts Neues            │
│  - src/main/resources/static/  ← Frontend (unverändert)      │
│  - FormulareController + FormulareService   (neu)            │
│  - FavoritenController + FavoritenService   (neu)            │
└───────────────────────────────────────────────────────────┘
         │
         ▼
┌───────────────────────────────────────────────────────────┐
│  Volume (Dateisystem, kein DB-Server)                        │
│  - Formular-Bibliothek (PDFs, nach Unterverzeichnis gruppiert)│
│  - Favoriten (Ordnerstruktur, geteilt, JSON je Favorit)       │
└───────────────────────────────────────────────────────────┘
```

Browser (Firefox) spricht nur mit diesem einen Backend – Login läuft über die bereits
vorhandene Absicherung des Backends, dort ist nichts Neues zu integrieren außer den
beiden Controllern in die vorhandene Security-Konfiguration einzuhängen.

Die eigentliche Dokumentenerzeugung (PDF, QR-Codes, Scan-Effekt, künftig TIFF) passiert
weiterhin **ausschließlich im Browser**, nicht im Backend. Das Backend liefert nur
Rohdaten (Formular-PDFs, Favoriten) – siehe
[DECISIONS.md](DECISIONS.md) Eintrag 2.

## Komponenten

### Frontend (`frontend/`)

Wird auf Vue 3 + Vite umgebaut (siehe [DECISIONS.md](DECISIONS.md) Eintrag 12). Das
Produktionsbuild (`dist/`) wandert nach `src/main/resources/static/` des bestehenden
Spring-Boot-Projekts (Entscheidung 11) – Spring Boots Standard-Static-Resource-Handling
liefert das automatisch aus, kein eigener Controller nötig. Die Erzeugungs-Engine
(`pdfgen.js`) wird unverändert übernommen. Funktional:

- **Formular-Quelle:** aktuell lokaler Verzeichnis-Picker (`webkitdirectory`). Wird um
  einen zweiten Modus ergänzt, der die Formulare per `GET /api/formulare` lädt. Ob der
  lokale Picker als Fallback erhalten bleibt (z. B. für Offline-Tests), ist offen.
- **Favoriten:** `localStorage` + `favoriten.json`-Austausch wird durch die neuen
  `/api/favoriten`-Endpunkte ersetzt (inkl. Ordnerstruktur, siehe [API.md](API.md)) –
  dafür eine Ordner-Navigation in der UI statt der bisherigen flachen Liste.
- **Auth:** bewusst zurückgestellt (siehe [DECISIONS.md](DECISIONS.md) Eintrag 13).
  Der Cookie-Flow (ausgestellt durch einen vorgeschalteten kleinen Service, bereits in
  den vorhandenen Vue-Apps gelöst) wird nachgezogen, sobald die Details vorliegen.

### Backend-Erweiterung (`backend/`, zur Integration)

Kein eigenständiger Service – zwei Controller + zugehörige Service-Klassen als
Java-Dateien zum Einbau ins bestehende Projekt, siehe [API.md](API.md) für die
Endpunkte und `backend/` für den Code.

### Storage

- Formular-PDFs: Dateisystem-Volume, gleiche Ordnerstruktur wie bisher lokal
  (Gruppierung nach Unterverzeichnisname, eine Ebene – siehe `frontend/app.js`)
- Favoriten: Dateisystem-Volume, als Ordnerbaum gespiegelt (ein Unterordner = ein
  Favoriten-Ordner, eine `.json`-Datei = ein Favorit) – kein DB-Server nötig, passt zur
  sehr kleinen Nutzerzahl (siehe [DECISIONS.md](DECISIONS.md) Eintrag 9/10)

## Offene Punkte für die Review

- Genauer Cookie-Flow (siehe [DECISIONS.md](DECISIONS.md) Eintrag 13) – wird
  nachgeliefert
- Soll der lokale Verzeichnis-Picker als Fallback-Modus erhalten bleiben, oder wird die
  Formular-Quelle komplett auf die API umgestellt?
- Genauer Volume-Pfad/Konvention im bestehenden Deployment, unter dem Formulare und
  Favoriten abgelegt werden sollen (für die `@Value`-Konfiguration in den
  Service-Klassen, siehe `backend/`)
