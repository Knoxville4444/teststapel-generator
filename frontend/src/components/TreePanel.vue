<script setup>
import { computed } from 'vue';
import { useDocumentStore } from '../stores/documentStore.js';
import { humanize } from '../lib/pdfgen.js';

const documentStore = useDocumentStore();

const treeRows = computed(() => {
  const rows = [];
  let paketOpen = false;
  let dokOpen = false;
  let dokCount = 0;

  const ensureLeadingPaket = () => {
    if (!paketOpen) {
      rows.push({ type: 'paket', text: 'Paket (unbenannt)', itemId: null });
      paketOpen = true;
    }
  };
  const ensureLeadingDok = () => {
    if (!dokOpen) {
      rows.push({ type: 'dok', text: 'Dokument (unbenannt)', itemId: null });
      dokOpen = true;
      dokCount = 0;
    }
  };
  const flushDok = () => {
    if (dokOpen && dokCount > 0) {
      rows.push({ type: 'count', text: `${dokCount} Seite(n)` });
    }
    dokOpen = false;
    dokCount = 0;
  };

  for (const item of documentStore.items) {
    if (item.type === 'paket-trenn') {
      flushDok();
      rows.push({
        type: 'paket',
        text: 'Paket' + (item.kategorie ? ' · ' + humanize(item.kategorie) : ''),
        itemId: item.id,
      });
      paketOpen = true;
    } else if (item.type === 'dokument-trenn' || item.type === 'zbh') {
      ensureLeadingPaket();
      flushDok();
      rows.push({
        type: 'dok',
        text: item.type === 'zbh' ? 'ZBH' : 'Dokument' + (item.doktyp ? ' · D' + String(item.doktyp.nr).padStart(3, '0') : ''),
        itemId: item.id,
      });
      dokOpen = true;
    } else if (item.type === 'seite') {
      ensureLeadingPaket();
      ensureLeadingDok();
      dokCount++;
    } else if (item.type === 'seite-stapel') {
      ensureLeadingPaket();
      ensureLeadingDok();
      dokCount += item.source.pageCount;
    } else if (item.type === 'fehlend') {
      ensureLeadingPaket();
      ensureLeadingDok();
    }
  }
  flushDok();
  return rows;
});

function scrollToItem(itemId) {
  if (!itemId) return;
  const el = document.querySelector(`.item-card[data-id="${itemId}"]`);
  if (el) el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
}
</script>

<template>
  <aside class="tree">
    <div class="panel-title">Gliederung</div>
    <div class="tree-content">
      <div v-if="!treeRows.length" class="tree-empty">Noch leer</div>
      <template v-for="(row, i) in treeRows" :key="i">
        <div
          v-if="row.type === 'paket'"
          class="tree-node tree-paket"
          @click="scrollToItem(row.itemId)"
        >{{ row.text }}</div>
        <div
          v-else-if="row.type === 'dok'"
          class="tree-node tree-dok"
          @click="scrollToItem(row.itemId)"
        >{{ row.text }}</div>
        <div v-else class="tree-seiten-count">{{ row.text }}</div>
      </template>
    </div>
  </aside>
</template>
