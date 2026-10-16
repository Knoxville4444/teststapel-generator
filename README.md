# Teststapel-Erzeugung

Werkzeug zum Erzeugen realistischer Testdokumente (PDF, künftig auch Fax/TIFF) für die
Digitalisierungs-Anwendung – ohne echte Scandaten. Formulare werden mit generierten
Trennblättern (Paket, Dokument, ZBH) und Dummy-Seiten zu Testdokumenten
zusammengestellt.

**Status:** Umbau von reiner Client-Anwendung (lokal, `file://`) zu zentral gehosteter
Variante läuft – Integration in ein vorhandenes Spring-Boot-Backend statt eines neuen
eigenständigen Service. Siehe [docs/](docs/) für die Planungsdokumente.

## Struktur

```
frontend/   Vue 3 + Vite (siehe frontend/README.md) – Build-Ergebnis (dist/) wandert
            nach src/main/resources/static/ im Backend-Projekt
backend/    Java-Snippets (Controller + Service je Formulare/Favoriten) zum Einbau ins
            vorhandene Spring-Boot-Backend – kein eigenständiger Service
docs/       Architektur, Entscheidungen, API-Entwurf
```

`deploy/` entfällt (siehe [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)) – folgt dem
bestehenden Deployment-Prozess des Spring-Boot-Backends.

## Dokumentation

- [docs/DECISIONS.md](docs/DECISIONS.md) – Entscheidungsprotokoll mit Begründungen
  (zuerst lesen, insbesondere Eintrag 9: Integration statt neuem Service)
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) – Systemüberblick
- [docs/API.md](docs/API.md) – REST-Endpunkte, verweist auf die Java-Snippets
- [docs/AUTH.md](docs/AUTH.md) – warum hier nichts Neues aufzusetzen ist
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) – was für die Integration noch zu klären ist
- [docs/FAX_EXPORT.md](docs/FAX_EXPORT.md) – Fax/TIFF-Export (zwei Ausbaustufen)
- [frontend/README.md](frontend/README.md) – Bedienung und Technik der bestehenden
  Oberfläche

## Herkunft

Das Projekt ist aus einer Zwischenablage (`Knoxville4444/exchange`, Branch
`scan-helper`) in dieses eigene Repository umgezogen, siehe
[docs/DECISIONS.md](docs/DECISIONS.md) Punkt 8.
