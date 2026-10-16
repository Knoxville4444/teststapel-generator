<script setup>
import { computed } from 'vue';
import { useDocumentStore } from '../stores/documentStore.js';
import { humanize } from '../lib/pdfgen.js';

const props = defineProps({
  item: { type: Object, required: true },
  index: { type: Number, required: true },
});

const documentStore = useDocumentStore();

const cardClass = computed(() => {
  const item = props.item;
  if (item.type === 'paket-trenn') return 'sheet-paket';
  if (item.type === 'dokument-trenn') return 'sheet-dokument';
  if (item.type === 'zbh') return 'sheet-zbh';
  if (item.type === 'seite-stapel') return 'stapel';
  if (item.type === 'fehlend') return 'sheet-fehlend';
  return '';
});

const cardText = computed(() => {
  const item = props.item;
  if (item.type === 'paket-trenn') return 'Paket' + (item.kategorie ? '\n' + humanize(item.kategorie) : '');
  if (item.type === 'dokument-trenn') return item.doktyp ? `D${String(item.doktyp.nr).padStart(3, '0')}` : 'Dokument';
  if (item.type === 'zbh') return 'ZBH';
  if (item.type === 'seite' && !item.thumbDataUrl) return item.label || '…';
  if (item.type === 'seite-stapel' && !item.thumbDataUrl) return item.label || '…';
  if (item.type === 'fehlend') return 'Fehlt:\n' + (item.label || item.relPath);
  return '';
});

const thumbStyle = computed(() => {
  const item = props.item;
  if ((item.type === 'seite' || item.type === 'seite-stapel') && item.thumbDataUrl) {
    return { backgroundImage: `url(${item.thumbDataUrl})` };
  }
  return {};
});

const selected = computed(() => documentStore.insertIndex === props.index);

function onClick() {
  documentStore.insertIndex = props.index + 1;
}

function onDragStart(e) {
  e.dataTransfer.setData('text/x-item-id', props.item.id);
}

function remove() {
  documentStore.removeItem(props.item.id);
}
</script>

<template>
  <div v-if="item.type === 'seite-stapel'" class="stapel-wrap">
    <div
      class="item-card"
      :class="[cardClass, { selected }]"
      :data-id="item.id"
      :style="thumbStyle"
      draggable="true"
      :title="item.type === 'fehlend' ? `Datei nicht im gewählten Verzeichnis gefunden: ${item.relPath}` : null"
      @click="onClick"
      @dragstart="onDragStart"
    >
      {{ cardText }}
      <div v-if="item.source.pageCount > 1" class="page-badge">{{ item.source.pageCount }}</div>
      <div class="del-btn" @click.stop="remove">×</div>
    </div>
    <div class="stapel-caption" :title="item.label">{{ item.label }}</div>
  </div>
  <div
    v-else
    class="item-card"
    :class="[cardClass, { selected }]"
    :data-id="item.id"
    :style="thumbStyle"
    draggable="true"
    :title="item.type === 'fehlend' ? `Datei nicht im gewählten Verzeichnis gefunden: ${item.relPath}` : null"
    @click="onClick"
    @dragstart="onDragStart"
  >
    {{ cardText }}
    <div class="del-btn" @click.stop="remove">×</div>
  </div>
</template>
