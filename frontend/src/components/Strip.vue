<script setup>
import { computed } from 'vue';
import { useDocumentStore } from '../stores/documentStore.js';
import { humanize } from '../lib/pdfgen.js';
import ItemCard from './ItemCard.vue';

const documentStore = useDocumentStore();

const groupedStrip = computed(() => {
  const root = [];
  let currentPaket = null;
  let currentDok = null;
  let paketOpen = false;
  let dokOpen = false;
  const items = documentStore.items;
  const placeholderIdx = documentStore.dragPlaceholderIndex;

  const currentContainer = () => (currentDok ? currentDok.children : currentPaket ? currentPaket.children : root);

  const openImplicitPaket = (startIdx) => {
    currentPaket = { kind: 'paket', label: 'Paket (unbenannt)', startIndex: startIdx, isZbh: false, children: [] };
    root.push(currentPaket);
    currentDok = null;
    paketOpen = true;
  };
  const openImplicitDok = (startIdx) => {
    currentDok = { kind: 'dok', label: 'Dokument (unbenannt)', startIndex: startIdx, isZbh: false, children: [] };
    currentPaket.children.push(currentDok);
    dokOpen = true;
  };

  for (let i = 0; i < items.length; i++) {
    if (placeholderIdx === i) currentContainer().push({ kind: 'placeholder', key: `ph-${i}` });
    const item = items[i];
    if (item.type === 'paket-trenn') {
      currentPaket = {
        kind: 'paket',
        label: 'Paket' + (item.kategorie ? ' · ' + humanize(item.kategorie) : ''),
        startIndex: i,
        isZbh: false,
        children: [],
      };
      root.push(currentPaket);
      currentDok = null;
      paketOpen = true;
      dokOpen = false;
      currentContainer().push({ kind: 'item', item, index: i });
    } else if (item.type === 'dokument-trenn' || item.type === 'zbh') {
      if (!paketOpen) openImplicitPaket(i);
      currentDok = {
        kind: 'dok',
        label: item.type === 'zbh' ? 'ZBH' : 'Dokument' + (item.doktyp ? ' · D' + String(item.doktyp.nr).padStart(3, '0') : ''),
        startIndex: i,
        isZbh: item.type === 'zbh',
        children: [],
      };
      currentPaket.children.push(currentDok);
      dokOpen = true;
      currentContainer().push({ kind: 'item', item, index: i });
    } else {
      if (!paketOpen) openImplicitPaket(i);
      if (!dokOpen) openImplicitDok(i);
      currentContainer().push({ kind: 'item', item, index: i });
    }
  }
  if (placeholderIdx === items.length) currentContainer().push({ kind: 'placeholder', key: 'ph-end' });
  return root;
});

function getDropIndexFromPosition(clientX, clientY) {
  const cardEls = [...document.querySelectorAll('#strip .item-card[data-id]')];
  if (!cardEls.length) return 0;
  const withRects = cardEls.map((el) => ({ el, rect: el.getBoundingClientRect() }));
  const sameRow = withRects.filter((c) => clientY >= c.rect.top && clientY <= c.rect.bottom);
  const candidates = sameRow.length ? sameRow : withRects;

  let closest = null;
  let closestDist = Infinity;
  for (const c of candidates) {
    const cx = c.rect.left + c.rect.width / 2;
    const dist = Math.abs(clientX - cx);
    if (dist < closestDist) {
      closestDist = dist;
      closest = c;
    }
  }
  const idx = documentStore.items.findIndex((it) => it.id === closest.el.dataset.id);
  const before = clientX < closest.rect.left + closest.rect.width / 2;
  return before ? idx : idx + 1;
}

function onDragOver(e) {
  e.preventDefault();
  const idx = getDropIndexFromPosition(e.clientX, e.clientY);
  if (idx !== documentStore.dragPlaceholderIndex) {
    documentStore.dragPlaceholderIndex = idx;
  }
}

function onDragLeave(e) {
  const stripEl = e.currentTarget;
  if (!stripEl.contains(e.relatedTarget)) {
    documentStore.dragPlaceholderIndex = null;
  }
}

function onDrop(e) {
  e.preventDefault();
  const idx = documentStore.dragPlaceholderIndex !== null ? documentStore.dragPlaceholderIndex : getDropIndexFromPosition(e.clientX, e.clientY);
  documentStore.dragPlaceholderIndex = null;
  const itemId = e.dataTransfer.getData('text/x-item-id');
  const sourceFileId = e.dataTransfer.getData('text/x-source-file');
  if (itemId) {
    documentStore.moveItemToIndex(itemId, idx);
  } else if (sourceFileId) {
    const sf = documentStore.sourceFiles.find((s) => s.id === sourceFileId);
    if (sf) documentStore.addWholePdf(sf, idx);
  }
}

function onDragEnd() {
  documentStore.dragPlaceholderIndex = null;
}

function onEndZoneClick() {
  documentStore.insertIndex = null;
}
</script>

<template>
  <section class="strip-wrap">
    <div id="strip" class="strip" @dragover="onDragOver" @dragleave="onDragLeave" @drop="onDrop" @dragend="onDragEnd">
      <div v-for="paket in groupedStrip" :key="paket.startIndex ?? 'implicit-paket'">
        <template v-if="paket.kind === 'placeholder'">
          <div class="drop-placeholder" />
        </template>
        <div v-else class="group-paket">
          <div class="group-label">{{ paket.label }}</div>
          <div
            class="group-del-btn"
            title="Ganzes Paket löschen"
            @click.stop="documentStore.removeGroup(paket.startIndex, 'paket')"
          >×</div>
          <div class="group-inner">
            <template v-for="dok in paket.children" :key="dok.startIndex ?? dok.key ?? 'implicit-dok'">
              <div v-if="dok.kind === 'placeholder'" class="drop-placeholder" />
              <div v-else class="group-dokument" :class="{ 'group-zbh': dok.isZbh }">
                <div class="group-label">{{ dok.label }}</div>
                <div
                  class="group-del-btn"
                  title="Ganzes Dokument löschen"
                  @click.stop="documentStore.removeGroup(dok.startIndex, 'dokument')"
                >×</div>
                <div class="group-inner">
                  <template v-for="node in dok.children" :key="node.key ?? node.item.id">
                    <div v-if="node.kind === 'placeholder'" class="drop-placeholder" />
                    <ItemCard v-else :item="node.item" :index="node.index" />
                  </template>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
      <div class="insert-end" :class="{ active: documentStore.insertIndex === null }" @click="onEndZoneClick" />
    </div>
    <div class="strip-empty" v-if="!documentStore.items.length">
      Noch keine Seiten – links eine Quelle anklicken oder rechts etwas erzeugen.
    </div>
  </section>
</template>
