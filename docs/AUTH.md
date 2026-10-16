# Authentifizierung

> Entwurf zur Review. Pflichtthema, keine optionale Ausbaustufe – interne
> Webanwendungen dürfen organisatorisch nicht ungesichert angeboten werden (siehe
> [DECISIONS.md](DECISIONS.md), Punkt 6).

## Setup

- **Identity Provider:** selbst gehosteter Keycloak (eigener Container, siehe
  [DEPLOYMENT.md](DEPLOYMENT.md))
- **Verzeichnisanbindung:** Keycloak wird gegen einen internen Verzeichnisdienst
  gebunden (LDAP oder Active Directory). **Zu bestätigen beim Review:** welcher der
  beiden genau, sowie Zugangsdaten/Endpunkt für die Anbindung.
- **Protokoll:** OIDC (OpenID Connect) – Standard-Login-Flow

## Frontend

Aktuell keinerlei Auth-Code vorhanden (reine Client-Anwendung ohne Backend-Anbindung).
Neu nötig:

1. Beim Start prüfen, ob ein gültiges Token vorliegt (z. B. `oidc-client-ts` oder
   vergleichbare Bibliothek, lokal vendored wie die übrigen Abhängigkeiten)
2. Falls nicht: Redirect zu Keycloaks Login-Seite
3. Nach Login: Callback verarbeiten, Token speichern (z. B. `sessionStorage`)
4. Token bei jedem API-Aufruf im `Authorization`-Header mitsenden
5. Token-Refresh vor Ablauf

## Backend

FastAPI validiert eingehende Requests gegen Keycloak:

- JWT-Signaturprüfung über Keycloaks öffentliche Schlüssel (JWKS-Endpunkt,
  Standard-OIDC-Discovery)
- Abgelehnte/fehlende Token → `401`
- Für den Scope ausreichend: Rollen-/Gruppenprüfung aus dem Token, keine eigene
  Nutzerverwaltung im Backend nötig (Keycloak bleibt die einzige Quelle der Wahrheit)

## Offene Punkte für die Review

- LDAP oder Active Directory? (siehe oben)
- Gibt es bereits einen Keycloak-Realm/-Instanz im Haus, die mitgenutzt werden kann,
  oder wird für dieses Projekt ein neuer, dedizierter Realm aufgesetzt?
- Rollenkonzept nötig (z. B. normale Nutzer vs. "Formularpflege"-Berechtigte für die
  geplante Erweiterung), oder reicht initial "eingeloggt = darf alles"?
