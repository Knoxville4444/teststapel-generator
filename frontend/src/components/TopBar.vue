<script setup>
import { ref } from 'vue';
import { useDocumentStore } from '../stores/documentStore.js';
import { useHelp } from '../composables/useHelp.js';

const documentStore = useDocumentStore();
const { showHelp } = useHelp();
const scanMode = ref(false);

async function download() {
  const result = await runExport();
  if (!result) return;
  const url = URL.createObjectURL(result.blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'testdokument.pdf';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

async function print() {
  const result = await runExport();
  if (!result) return;
  const url = URL.createObjectURL(result.blob);
  window.open(url, '_blank');
}

async function runExport() {
  if (!documentStore.items.length) {
    alert('Noch keine Seiten im Dokument.');
    return null;
  }
  const missing = documentStore.items.filter((it) => it.type === 'fehlend');
  if (missing.length) {
    const ok = confirm(
      `${missing.length} Datei(en) fehlen im gewählten Verzeichnis und werden im PDF übersprungen:\n` +
        missing.map((m) => m.relPath).join('\n') +
        '\n\nTrotzdem erzeugen?'
    );
    if (!ok) return null;
  }
  const result = await documentStore.exportPdf({ scanMode: scanMode.value });
  if (result.error) {
    alert(result.error);
    return null;
  }
  return result;
}
</script>

<template>
  <header class="topbar">
    <span class="title">Teststapel-Erzeugung</span>
    <div class="actions">
      <span class="status">{{ documentStore.status }}</span>
      <label
        class="scan-toggle"
        title="Seiten vor dem Export rastern und leicht verzerren (Rauschen, Schräglage, Kontrast) – wie ein echter Scan."
      >
        <input type="checkbox" v-model="scanMode" />
        Wie gescannt aussehen lassen
      </label>
      <button title="Hilfe" @click="showHelp = true">?</button>
      <button @click="download"><i class="icon">&#8595;</i> Download</button>
      <button @click="print"><i class="icon">&#9113;</i> Drucken</button>
    </div>
  </header>
</template>
