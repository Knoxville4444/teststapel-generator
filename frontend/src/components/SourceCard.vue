<script setup>
import { onMounted } from 'vue';
import { useDocumentStore } from '../stores/documentStore.js';

const props = defineProps({
  sf: { type: Object, required: true },
});

const documentStore = useDocumentStore();

onMounted(() => {
  documentStore.ensureThumbnail(props.sf).catch((err) => console.error('Thumbnail-Fehler', props.sf.name, err));
});

function onClick() {
  documentStore.addWholePdf(props.sf);
}

function onDragStart(e) {
  e.dataTransfer.setData('text/x-source-file', props.sf.id);
}
</script>

<template>
  <div class="source-card" draggable="true" :title="sf.name" @click="onClick" @dragstart="onDragStart">
    <div class="thumb-box" :style="sf.thumbDataUrl ? { backgroundImage: `url(${sf.thumbDataUrl})` } : {}" />
    <div class="source-name">{{ sf.name }}</div>
    <div v-if="sf.pageCount" class="page-badge">{{ sf.pageCount }}</div>
  </div>
</template>
