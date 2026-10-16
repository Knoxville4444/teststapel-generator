# Teststapel-Erzeugung

Werkzeug zum Erzeugen realistischer Testdokumente (PDF, künftig auch Fax/TIFF) für die
Digitalisierungs-Anwendung – ohne echte Scandaten. Formulare werden mit generierten
Trennblättern (Paket, Dokument, ZBH) und Dummy-Seiten zu Testdokumenten
zusammengestellt.

**Status:** Umbau von reiner Client-Anwendung (lokal, `file://`) zu zentral gehosteter
Variante mit Backend und Authentifizierung läuft. Siehe [docs/](docs/) für die
Planungsdokumente.

## Struktur

```
frontend/   Die bisherige, vollständig clientseitige Anwendung (siehe frontend/README.md)
backend/    Python/FastAPI-Service – API, Auth-Anbindung, Dateiauslieferung (im Aufbau)
deploy/     Docker-Setup für den zentralen Betrieb (im Aufbau)
docs/       Architektur, Entscheidungen, API- und Auth-Entwurf
```

## Dokumentation

- [docs/DECISIONS.md](docs/DECISIONS.md) – Entscheidungsprotokoll mit Begründungen
  (zuerst lesen)
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) – Systemüberblick
- [docs/API.md](docs/API.md) – Geplante REST-Endpunkte
- [docs/AUTH.md](docs/AUTH.md) – Keycloak/OIDC-Anbindung
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) – Docker-Setup
- [docs/FAX_EXPORT.md](docs/FAX_EXPORT.md) – Fax/TIFF-Export (zwei Ausbaustufen)
- [frontend/README.md](frontend/README.md) – Bedienung und Technik der bestehenden
  Oberfläche

## Herkunft

Das Projekt ist aus einer Zwischenablage (`Knoxville4444/exchange`, Branch
`scan-helper`) in dieses eigene Repository umgezogen, siehe
[docs/DECISIONS.md](docs/DECISIONS.md) Punkt 8.
