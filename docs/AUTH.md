# Authentifizierung

> **Erledigt sich durch Entscheidung 9** (siehe [DECISIONS.md](DECISIONS.md)) – hier
> dokumentiert, damit die ursprüngliche Überlegung nachvollziehbar bleibt.

## Ursprünglicher Plan (verworfen)

Zunächst war ein eigener, selbst gehosteter Keycloak vorgesehen, gebunden an LDAP.
Grund war die organisatorische Vorgabe, interne Webanwendungen nicht ungesichert
anzubieten.

## Aktueller Stand

Die Funktionalität wird in ein **vorhandenes Spring-Boot-Backend** integriert, das
bereits über eine fertige Absicherung verfügt (siehe
[DECISIONS.md](DECISIONS.md), Eintrag 9). Damit ist die organisatorische Vorgabe
automatisch erfüllt, ohne dass wir etwas Neues aufsetzen müssen.

**Für die Integration zu beachten (vom Integrierenden zu prüfen, nicht Teil der hier
vorbereiteten Snippets):**

- Die neuen Endpunkte (`/api/formulare/**`, `/api/favoriten/**`, siehe
  [API.md](API.md)) müssen in die vorhandene Security-Konfiguration des Backends
  eingehängt werden (z. B. vorhandene `SecurityFilterChain`/`@PreAuthorize`-Regeln).
- Kein eigenes Rollenkonzept vorgesehen – "eingeloggt über das bestehende Backend"
  reicht für den aktuellen Umfang (sehr kleine Nutzerzahl, geteilte Favoriten ohne
  Besitzkonzept, siehe [DECISIONS.md](DECISIONS.md) Eintrag 10).
- Der genaue Verzeichnisdienst (LDAP, wie zwischenzeitlich bestätigt) ist für uns nicht
  mehr relevant, da er bereits Teil des bestehenden Backends ist.
