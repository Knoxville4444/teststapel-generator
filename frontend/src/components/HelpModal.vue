<script setup>
import { onMounted, onUnmounted } from 'vue';
import { useHelp } from '../composables/useHelp.js';

const { showHelp } = useHelp();

function close() {
  showHelp.value = false;
}

function onKeydown(e) {
  if (e.key === 'Escape') close();
}

onMounted(() => document.addEventListener('keydown', onKeydown));
onUnmounted(() => document.removeEventListener('keydown', onKeydown));
</script>

<template>
  <div class="modal-overlay" :class="{ open: showHelp }" @click.self="close">
    <div class="modal">
      <div class="modal-header">
        <span>Hilfe</span>
        <button class="modal-close" title="Schließen" @click="close">&times;</button>
      </div>
      <div class="modal-body">
        <ol>
          <li>
            <strong>Quellen</strong>: "Verzeichnis wählen…" wählt einen Ordner mit PDF-Formularen.
            Dateien werden automatisch nach dem Namen ihres direkten Unterverzeichnisses gruppiert
            (eine Ebene, frei benennbar); Dateien direkt im Wurzelverzeichnis landen unter "Sonstige".
            Klick oder Drag auf eine Karte fügt das ganze PDF als Seitenstapel in den Streifen ein.
            Gruppentitel klappen auf/zu.
          </li>
          <li>
            <strong>Generator</strong>: erzeugt auf Zuruf ein Pakettrennblatt (optional mit
            Dokumentenkategorie), ein Dokumenttrennblatt (optional mit Dokumenttyp, gefiltert nach
            Fachsystem), ein statisches ZBH-Blatt oder Dummy-Seiten (Seitenzahl-Stempel oder
            Lorem-Text).
          </li>
          <li>
            <strong>Favoriten</strong>: geteilt im Team, mit Ordnerstruktur. Speichert die aktuelle
            Zusammenstellung als Anweisungsfolge (nicht das fertige PDF) – beim Anwenden wird mit den
            aktuell geladenen Dateien neu erzeugt. Fehlt eine Datei, erscheint eine rote
            "Fehlt: …"-Karte.
          </li>
          <li>
            Der <strong>Streifen</strong> in der Mitte wächst horizontal und gruppiert alles
            sichtbar nach Paket/Dokument – auch lose Seiten vor dem ersten Pakettrennblatt erscheinen
            als "Paket (unbenannt)". Karten per Drag&amp;Drop umsortieren; Hover zeigt ein × zum
            Löschen einzelner Seiten oder ganzer Paket-/Dokument-Gruppen. Klick auf eine Karte setzt
            die Einfügeposition für Quellen/Generator.
          </li>
          <li>
            Die <strong>Gliederung</strong> links zeigt dieselbe Struktur als Baum – Klick springt
            zur jeweiligen Stelle im Streifen.
          </li>
          <li>
            <strong>Download</strong> lädt das fertige PDF herunter, <strong>Drucken</strong> öffnet
            es in einem neuen Tab zum Ausdrucken über den Browser (z. B. als PDF-Drucker).
          </li>
          <li>
            <strong>"Wie gescannt aussehen lassen"</strong>: rastert beim Export jede Seite und legt
            Rauschen, Kontrast-/Helligkeitsschwankung, Schräglage (±3°), ungleichmäßige Ausleuchtung
            und einzelne Staubkörner/Kratzer darüber. Deutlich sichtbar, aber so dosiert, dass
            QR-/Patch-Codes lesbar bleiben. Dauert je nach Seitenzahl einige Sekunden und vergrößert
            die Datei.
          </li>
        </ol>
      </div>
    </div>
  </div>
</template>
