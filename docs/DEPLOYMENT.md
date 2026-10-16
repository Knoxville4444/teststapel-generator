# Deployment

> Entwurf zur Review, noch kein lauffähiges Setup.

## Container-Aufteilung (Vorschlag)

```
docker-compose.yml
├── keycloak        (offizielles Keycloak-Image, eigene Postgres- oder H2-Instanz)
├── backend          (Python/FastAPI, liefert API + optional das Frontend aus)
└── (frontend)        nur falls separat statt vom Backend ausgeliefert – offen
```

**Offene Entscheidung:** Liefert das FastAPI-Backend die Frontend-Dateien direkt mit aus
(`StaticFiles`-Mount, ein einziger Container/Service) oder gibt es einen separaten
schlanken Webserver (z. B. nginx) nur fürs Frontend? Für den aktuellen Umfang spricht
vieles für die einfachere Variante (ein Service), bis ein echter Grund für die Trennung
sichtbar wird (z. B. unabhängiges Skalieren).

## Storage

- Formular-Bibliothek und Favoriten (flache Dateien/SQLite, siehe
  [ARCHITECTURE.md](ARCHITECTURE.md)) über ein Docker-Volume persistiert
- Keycloak-Daten über eigenes Volume (Realm-Konfiguration, Nutzer-Zuordnungen –
  abhängig von der LDAP/AD-Anbindung ggf. ohnehin nur Referenzen, keine Kopie der
  Nutzerdaten)

## Netzwerk/TLS

Noch nicht festgelegt, ob TLS-Terminierung durch einen vorgeschalteten Reverse Proxy
(z. B. Traefik, oder ein bereits vorhandener zentraler Proxy im Haus) erfolgt, oder ob
das hier mit aufgebaut werden muss. Für ein rein internes Tool ggf. verzichtbar, je nach
Vorgaben – bitte beim Review klären.

## Offene Punkte für die Review

- Ein Service (Backend liefert Frontend mit aus) oder getrennt?
- Vorhandener zentraler Reverse Proxy/TLS im Haus nutzbar, oder hier mit aufbauen?
- Bereits vorhandene Keycloak-Instanz nutzbar, oder dedizierter Container für dieses
  Projekt? (siehe auch [AUTH.md](AUTH.md))
- Wo soll das Ganze laufen (eigener Server, vorhandenes Docker-/Kubernetes-Hosting im
  Haus)?
