# Deployment

> Entfällt größtenteils für uns – siehe [DECISIONS.md](DECISIONS.md) Eintrag 9. Hier
> nur noch das, was für die Integration relevant bleibt.

Die Erweiterung läuft im bestehenden Spring-Boot-Backend mit, folgt also dessen
vorhandenem Deployment-Prozess (Docker oder sonst, vermutlich bereits etabliert). Kein
eigenes Docker-Compose-Setup, kein eigener Container von uns.

## Was trotzdem zu klären ist

- **Volume-Pfade:** die neuen Service-Klassen (`backend/FormulareService.java`,
  `backend/FavoritenService.java`) erwarten je einen konfigurierbaren Verzeichnispfad
  (`teststapel.formulare-verzeichnis`, `teststapel.favoriten-verzeichnis`) – muss im
  bestehenden Deployment auf ein persistentes Volume zeigen und befüllt/angelegt werden.
- **Erstbefüllung Formular-Bibliothek:** die PDFs (bisher lokal, z. B. aus
  `formulare/` mit Unterordnern je Schutzrecht) müssen einmalig auf das Volume
  übertragen werden.
- Ob die neuen Endpunkte in der bestehenden CI/CD-Pipeline automatisch mitgebaut/
  mitdeployt werden, sobald sie im Projekt liegen, oder ob da noch etwas einzurichten
  ist – vermutlich nicht, da es sich einfach um neue Dateien im bestehenden Projekt
  handelt, aber bitte beim Review kurz bestätigen.
