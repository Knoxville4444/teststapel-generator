# Backend

Kein eigenständiger Service. Diese Java-Dateien sind Code-Bausteine zum Einbau ins
vorhandene Spring-Boot-Backend (siehe [../docs/DECISIONS.md](../docs/DECISIONS.md)
Eintrag 9) – `package`-Namen, Security-Einbindung und Volume-Konfiguration müssen beim
Integrieren angepasst werden (siehe `// TODO`-Kommentare in den Dateien).

## Formulare

- `FormulareController.java` – `GET /api/formulare`, `GET /api/formulare/datei`
- `FormulareService.java` – liest die Formular-Bibliothek von einem Volume
- `Formular.java`, `FormularGruppe.java`, `FormulareUebersicht.java` – DTOs

## Favoriten

- `FavoritenController.java` – `GET/PUT/DELETE /api/favoriten`,
  `POST /api/favoriten/ordner`
- `FavoritenService.java` – speichert Favoriten als Ordnerbaum auf einem Volume
- `Favorit.java`, `FavoritenOrdnerInhalt.java` – DTOs

Details und Beispiel-Payloads: [../docs/API.md](../docs/API.md).
