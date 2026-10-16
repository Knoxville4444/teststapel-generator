# Teststapel-Erzeugung – Frontend

Erzeugt mehrseitige Test-PDFs für die Digitalisierungs-Anwendung – ohne echte Scandaten.
Formulare werden per Klick/Drag&Drop mit generierten Trennblättern (Paket, Dokument,
ZBH) und Dummy-Seiten zu einem Gesamtdokument zusammengestellt und als PDF
heruntergeladen oder gedruckt.

Vue 3 + Vite (siehe [../docs/DECISIONS.md](../docs/DECISIONS.md) Eintrag 12). Empfohlen:
**Firefox**. Chrome funktioniert ebenfalls.

## Entwicklung

```bash
npm install
npm run dev      # Dev-Server mit Hot-Reload
npm run build    # Produktionsbuild nach dist/
```

Das `dist/`-Ergebnis von `npm run build` wandert nach `src/main/resources/static/` im
Spring-Boot-Backend-Projekt (siehe [../docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md)) –
dort liefert Spring Boots Standard-Static-Resource-Handling es automatisch aus.

## Benutzung

1. **Quellen**-Tab: "Verzeichnis wählen…" klickt sich zu einem Ordner mit PDF-Formularen
   durch (lokaler Verzeichnis-Picker, solange `/api/formulare` noch nicht angebunden
   ist – siehe [../docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md), offene Punkte).
   Dateien werden automatisch nach dem Namen ihres direkten Unterverzeichnisses
   gruppiert (eine Ebene, frei benennbar). Dateien direkt im Wurzelverzeichnis landen
   unter "Sonstige". Gruppentitel klappen per Klick auf/zu. Klick oder Drag auf eine
   Karte fügt das ganze PDF als Seitenstapel in den Streifen ein.
2. **Generator**-Tab: erzeugt auf Zuruf
   - **Pakettrennblatt** (optional mit Dokumentenkategorie)
   - **Dokumenttrennblatt** (optional mit Dokumenttyp, gefiltert nach Fachsystem)
   - **ZBH** (statisches Zusatzbehandlung-Trennblatt, keine Eingaben)
   - **Dummy-Seite(n)** (Seitenzahl-Stempel oder Lorem-Text, frei wählbare Anzahl)
3. **Favoriten**-Tab: geteilt im Team, mit Ordnerstruktur beliebiger Tiefe (siehe
   [../docs/DECISIONS.md](../docs/DECISIONS.md) Eintrag 10). Speichert die aktuelle
   Zusammenstellung als wiederverwendbare Anweisungsfolge – **nicht** das fertige PDF,
   damit beim erneuten Anwenden immer mit den aktuell verfügbaren Dateien neu erzeugt
   wird. Fehlt eine referenzierte Datei, erscheint im Streifen eine rote
   "Fehlt: …"-Karte statt sie stillschweigend wegzulassen.

   Aktuell über `src/lib/favoritenApi.js` **lokal in `localStorage` gemockt** (gleiche
   Ordnerstruktur/Funktionssignaturen wie die geplante `/api/favoriten`-API, siehe
   [../docs/API.md](../docs/API.md)) – sobald das Backend steht, wird nur diese eine
   Datei gegen echte `fetch()`-Aufrufe ausgetauscht, der Rest der UI bleibt unverändert.
4. Der **Streifen** in der Mitte wächst horizontal und gruppiert alles automatisch
   sichtbar nach Paket/Dokument – auch lose Seiten vor dem ersten Pakettrennblatt
   werden als "Paket (unbenannt)" dargestellt. Karten lassen sich per Drag&Drop
   umsortieren (wandernder Platzhalter zeigt die Einfügeposition); Hover zeigt ein × zum
   Löschen einzelner Seiten oder ganzer Paket-/Dokument-Gruppen.
5. Die **Gliederung** links zeigt dieselbe Struktur als Baum zur schnellen Navigation.
6. **Download** lädt das fertige PDF herunter, **Drucken** öffnet es in einem neuen Tab
   zum Ausdrucken über den Browser (z. B. als PDF-Drucker).
7. Schalter **"Wie gescannt aussehen lassen"** in der Kopfzeile: rastert beim Export jede
   Seite und legt Rauschen, Kontrast-/Helligkeitsschwankung, eine Schräglage (±3°), eine
   ungleichmäßige Ausleuchtung sowie einzelne Staubkörner/Kratzer darüber. Deutlich
   sichtbar, aber so dosiert, dass QR-/Patch-Codes auf den Trennblättern lesbar bleiben.
   Erhöht Dateigröße und Exportdauer spürbar.

## Struktur

```
index.html              Vite-Einstiegspunkt
src/
  main.js                App-Bootstrap (Vue + Pinia)
  App.vue                 Wurzelkomponente
  components/             TopBar, HelpModal, TreePanel, Strip, ItemCard, SidePanel,
                           QuellenTab, SourceCard, GeneratorTab, FavoritenTab
  stores/
    documentStore.js       Items, Quellen, Export – zentraler Zustand
    favoritenStore.js       Aktueller Ordner, Favoriten-Aktionen
  lib/
    pdfgen.js               PDF-Erzeugung: Trennblätter, Dummy-Seiten, Scan-Effekt,
                             finaler Zusammenbau (framework-unabhängig)
    pdfjs.js                 PDF.js-Import inkl. Worker-Einbindung (Vite)
    pdfRender.js             Gemeinsame Rendering-Hilfsfunktionen (Thumbnails)
    favoritenApi.js          TEMPORÄRER localStorage-Mock der künftigen Favoriten-API
  data/
    index.js                 Exportiert Doktypen/Kategorien/Fachsysteme
    doktypen.json             Dokumenttypen je Fachsystem (editierbar)
    dokumentkategorien.json   Kategorien fürs Pakettrennblatt (editierbar)
    doktyp-formular-mapping.json  Platzhalter für Doktyp↔Formularname (noch leer)
  style.css                Globales Stylesheet
```

## Technische Hinweise

- QR-Codes werden als Vektor-Rechtecke gezeichnet (kein Rasterbild), Patch-Code-Rahmen
  sind eine vereinfachte, visuelle Annäherung – keine hardwaregenauen Kodak-Patchcodes.
- `doktyp-formular-mapping.json` ist vorbereitet, aber noch ohne Daten und ohne
  UI-Anbindung.
- Auth bewusst noch nicht eingebaut (siehe [../docs/DECISIONS.md](../docs/DECISIONS.md)
  Eintrag 13) – folgt, sobald der genaue Cookie-Flow bekannt ist.
- `npm run build` meldet einen Bundle-Size-Hinweis (Hauptbundle ~960 kB wegen pdf-lib +
  PDF.js + QR-Generator) – für den aktuellen Nutzerkreis unkritisch, Code-Splitting bei
  Bedarf später möglich.
