# Architektur

> Entwurf zur Review. Siehe [DECISIONS.md](DECISIONS.md) für die Begründungen der
> einzelnen Punkte.

## Überblick

```
                         ┌─────────────────────┐
  Browser (Firefox) ───▶ │  Keycloak (OIDC)     │  Login / Token
         │               └─────────────────────┘
         │ Token
         ▼
┌─────────────────────────────────────────────┐
│  Backend (Python / FastAPI)                  │
│  - validiert Token gegen Keycloak            │
│  - liefert Frontend-Assets aus (statisch)    │
│  - REST-API: Formulare, Favoriten            │
└─────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│  Storage (flache Dateien / SQLite)           │
│  - Formular-Bibliothek (PDFs + Struktur)     │
│  - Favoriten (je Nutzer oder geteilt – offen)│
└─────────────────────────────────────────────┘
```

Die eigentliche Dokumentenerzeugung (PDF, QR-Codes, Scan-Effekt, künftig TIFF) passiert
**ausschließlich im Browser**, nicht im Backend. Das Backend liefert nur Rohdaten
(Formular-PDFs, Favoriten-Listen) und übernimmt die Zugriffskontrolle.

## Komponenten

### Frontend (`frontend/`)

Unverändert aus dem bisherigen Stand übernommen (siehe
[frontend/README.md](../frontend/README.md)). Zwei Anpassungen für den Hosting-Betrieb
offen:

- **Formular-Quelle:** aktuell lokaler Verzeichnis-Picker (`webkitdirectory`). Wird um
  einen zweiten Modus ergänzt, der die Formulare per `GET /api/formulare` vom Backend
  lädt, statt sie lokal auszuwählen. Ob der lokale Picker als Fallback erhalten bleibt
  (z. B. für Tests ohne Backend), ist offen.
- **Favoriten:** `localStorage` + `favoriten.json`-Austausch wird durch
  `GET/POST/DELETE /api/favoriten` ersetzt.
- **Auth:** Frontend braucht einen OIDC-Login-Flow (Redirect zu Keycloak, Callback,
  Token-Handling/-Refresh) – bisher nicht vorhanden.

### Backend (`backend/`)

Python/FastAPI-Service. Aufgaben:

1. Statische Auslieferung des Frontends (oder per separatem Webserver – offen, siehe
   [DEPLOYMENT.md](DEPLOYMENT.md))
2. REST-API (siehe [API.md](API.md))
3. Token-Validierung gegen Keycloak (OIDC)
4. Zugriff auf Storage (Formular-Bibliothek, Favoriten)

Bewusst **kein** ORM/DB-Server für den aktuellen Umfang – flache Dateien oder SQLite
reichen.

### Auth (Keycloak)

Siehe [AUTH.md](AUTH.md).

### Storage

Für den aktuellen Umfang reicht ein einfaches Modell:

- Formular-PDFs: Dateisystem, gleiche Ordnerstruktur wie bisher lokal (Gruppierung nach
  Unterverzeichnisname, siehe `frontend/app.js`)
- Favoriten: SQLite oder flache JSON-Dateien je Nutzer/Team (Entscheidung zu
  Sichtbarkeit noch offen, siehe [API.md](API.md))

## Offene Punkte für die Review

- Favoriten: pro Nutzer privat, team-/global geteilt, oder beides (z. B. "meine" +
  "geteilte")?
- Soll der lokale Verzeichnis-Picker als Fallback-Modus erhalten bleiben?
- Verzeichnisdienst-Typ für Keycloak-Anbindung (LDAP/AD) – siehe
  [DECISIONS.md](DECISIONS.md) Punkt 6
- Soll das Backend das Frontend selbst ausliefern (ein Service) oder getrennt
  (Backend nur API, Frontend separat z. B. über nginx) – siehe
  [DEPLOYMENT.md](DEPLOYMENT.md)
