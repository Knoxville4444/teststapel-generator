# Architekturentscheidungen

Fortlaufendes Protokoll der getroffenen Entscheidungen, mit Begründung. Neue Einträge
unten anfügen, bestehende nicht rückwirkend umschreiben (wenn sich etwas ändert: neuer
Eintrag, der den alten referenziert).

## 1. Browser-Zielgruppe: Firefox primär, Chrome sekundär

Die Anwendung muss in Firefox laufen, Chrome als Fallback. Beeinflusst z. B. die
PDF.js-Version und das Laden von Bibliotheken (siehe Eintrag 2).

## 2. Erzeugungslogik bleibt clientseitig

PDF-Aufbau, QR-Code-Zeichnung, "Wie gescannt aussehen"-Effekt und künftig die
TIFF-Erzeugung laufen vollständig im Browser (JavaScript), nicht auf dem Server. Diese
Entscheidung bleibt auch beim Wechsel zu zentralem Hosting bestehen (siehe Eintrag 6) –
der Server liefert Daten/Dateien und übernimmt Auth, erzeugt aber keine Dokumente.

**Historischer Kontext:** Ursprünglich musste die App als einzelne `index.html` per
`file://` auf abgesicherten Windows-Rechnern ohne Admin-Rechte und ohne Skript-/
Programmausführung außerhalb freigegebener Verzeichnisse laufen. Das erzwang: klassische
`<script>`-Tags statt ES-Module, Daten inline statt per `fetch()`, PDF.js in der letzten
Version mit klassischem (nicht-modulbasiertem) Build. Mit zentralem Hosting (Eintrag 6)
entfällt dieser Zwang – die Clients öffnen nur noch eine URL im bereits freigegebenen
Firefox, nichts Neues wird auf dem Client ausgeführt. Der bestehende Code bleibt aber
unverändert lauffähig, ein Rewrite auf ES-Module ist optional, keine Voraussetzung.

## 3. Fax-Export: zwei Ausbaustufen

1. **Einfache Variante zuerst:** unkomprimiertes bzw. einfach komprimiertes
   Multi-Page-TIFF, erzeugt aus den ohnehin für den Scan-Effekt gerasterten Seiten.
2. **Fax-typische Variante danach:** CCITT-Group-4-komprimiertes 1-bit-TIFF in
   fax-üblicher Auflösung (typ. 200dpi, 1728px Breite), plus eine Metadaten-Datei
   (Format wird noch geliefert) und ein vom Benutzer einzugebendes Eingangsdatum.

Siehe [FAX_EXPORT.md](FAX_EXPORT.md) für Details.

## 4. Zentrales Hosting: Variante B (mit geteiltem Zustand)

Nicht nur statisches Hosting der Oberfläche, sondern ein eigenes Backend für:
- **Favoriten** zentral statt lokal (`localStorage`) + manuellem `favoriten.json`-Austausch
- **Formular-Bibliothek** zentral statt lokaler Verzeichnis-Auswahl pro Nutzer

**Geplante Erweiterung (nicht im aktuellen Scope):** eine "Formularpflege"-Oberfläche zur
Verwaltung der zentralen Formular-Bibliothek.

## 5. Backend-Sprache: Python

Python wird im Haus bereits eingesetzt und passt organisatorisch. Für den Umfang (wenige
REST-Endpunkte, Datei-Auslieferung, Auth-Integration) ist ein leichtgewichtiges Framework
vorgesehen (FastAPI – siehe [ARCHITECTURE.md](ARCHITECTURE.md)), keine eigene Datenbank
nötig (flache Dateien/SQLite genügen für den Umfang).

## 6. Authentifizierung: Pflicht, nicht optional

Interne Webanwendungen dürfen organisatorisch nicht ohne Absicherung angeboten werden.
Eingesetzt wird ein **selbst gehosteter Keycloak**, gebunden an einen internen
Verzeichnisdienst (LDAP/Active Directory – **genauer Typ bitte beim Review bestätigen**,
das Detail kam in der Übermittlung nicht eindeutig an). Siehe [AUTH.md](AUTH.md).

## 7. Deployment: Docker

Zentrale Bereitstellung über Docker-Container (Backend, Frontend-Auslieferung, Keycloak).
Siehe [DEPLOYMENT.md](DEPLOYMENT.md) für den Entwurf.

## 8. Projektstruktur: eigenes Repository

Das Projekt ist aus der vorherigen Zwischenablage in `Knoxville4444/exchange`
(Branch `scan-helper`) in ein eigenes Repository umgezogen:
`Knoxville4444/teststapel-generator`. Grund: eigenständiges Projekt mit wachsendem
Funktionsumfang (Backend, Auth, Deployment), passt nicht mehr zu einer
Zwischenablage-Struktur.

## 9. Rollback von 5 und 6: Integration in vorhandenes Spring-Boot-Backend statt neuem Service

**Ersetzt Eintrag 5 (Backend-Sprache: Python) und Eintrag 6 (Keycloak neu aufsetzen).**

Es existiert bereits ein Backend im Haus (Spring Boot/Java) samt fertiger
Absicherung. Statt eines neuen, eigenständigen Python-Services mit eigenem Keycloak
wird die Funktionalität in dieses vorhandene Backend integriert:

- **Sprache/Framework:** Java/Spring Boot (vorhandener Code), kein neuer Python-Service
- **Auth:** bereits vorhanden und gelöst im bestehenden Backend – nichts Neues
  aufzusetzen, unsere neuen Endpunkte hängen sich nur in die vorhandene
  Security-Konfiguration ein. Die ursprünglich diskutierte Keycloak/LDAP-Anbindung
  (Eintrag 6) ist damit hinfällig für diesen Teil; die LDAP-Bestätigung aus Eintrag 6
  war ohnehin nur für den (jetzt verworfenen) neuen Keycloak nötig.
- **Umfang für uns:** nur noch ein REST-Controller + zugehörige Service-Schicht als
  Code-Bausteine (siehe [API.md](API.md), konkrete Dateien unter `backend/`), die
  händisch ins bestehende Projekt integriert werden – kein eigenständig lauffähiges
  Backend in diesem Repository.
- **Storage:** bleibt wie zuvor überlegt bei flachen Dateien auf einem Volume (kein
  DB-Server) – explizit bestätigt, u. a. weil die Nutzerzahl sehr klein ist.
- **Deployment:** entfällt für uns weitgehend – folgt dem bestehenden
  Deployment-Prozess des Spring-Boot-Backends, kein eigenes Docker-Compose-Setup nötig
  (siehe [DEPLOYMENT.md](DEPLOYMENT.md)).
- **Rendering/Erzeugung:** unverändert clientseitig im Browser (Eintrag 2 bleibt
  bestehen, ausdrücklich erneut bestätigt).

## 10. Favoriten: geteilt, mit Ordnerstruktur, kein Besitzkonzept

Favoriten sind **team-weit geteilt**, nicht privat je Nutzer. Zusätzlich gibt es eine
**Ordnerstruktur mit beliebig vielen Ebenen** (nicht nur eine flache Liste) – Nutzer
können Ordner anlegen und Favoriten darin ablegen. Jeder Nutzer darf alles anlegen,
verschieben und löschen, unabhängig davon, wer es ursprünglich angelegt hat (kein
Besitz-/Berechtigungskonzept auf Favoriten-Ebene). Ersetzt die in Eintrag 4 noch offene
Frage "privat vs. geteilt".

## 11. Frontend-Auslieferung: direkt durch das (bestehende) Backend

Das Frontend wird direkt vom Backend mit ausgeliefert, kein separater Webserver nur
fürs Frontend. Spricht nichts dagegen für diesen Umfang – Spring Boot kann statische
Ressourcen ohne Zusatzaufwand mitausliefern. Ersetzt die in Eintrag 7/Architektur noch
offene Frage dazu.
