<script setup>
import { computed, ref } from 'vue';
import { useDocumentStore } from '../stores/documentStore.js';
import { SONSTIGE_KEY } from '../data/index.js';
import SourceCard from './SourceCard.vue';

const documentStore = useDocumentStore();
const dirInput = ref(null);

const groupedSources = computed(() => {
  const groups = {};
  const labels = {};
  for (const sf of documentStore.sourceFiles) {
    (groups[sf.group] ||= []).push(sf);
    labels[sf.group] = sf.groupLabel;
  }
  const keys = Object.keys(groups).sort((a, b) => {
    if (a === SONSTIGE_KEY) return 1;
    if (b === SONSTIGE_KEY) return -1;
    return labels[a].localeCompare(labels[b], 'de');
  });
  return keys.map((key) => ({ key, label: labels[key], files: groups[key] }));
});

function isCollapsed(key) {
  return documentStore.collapsedGroups.has(key);
}

function toggleGroup(key) {
  if (documentStore.collapsedGroups.has(key)) documentStore.collapsedGroups.delete(key);
  else documentStore.collapsedGroups.add(key);
}

function pickDirectory() {
  dirInput.value.click();
}

async function onDirChange(e) {
  const allFiles = await documentStore.handleDirPicked(e.target.files);
  // TODO: sobald /api/favoriten existiert, hier zusätzlich serverseitige Favoriten
  // laden statt nur des lokalen favoriten.json-Austauschs aus der Vorgängerversion.
  void allFiles;
}
</script>

<template>
  <div>
    <button class="wide-btn" @click="pickDirectory">Verzeichnis wählen…</button>
    <input ref="dirInput" type="file" webkitdirectory multiple hidden @change="onDirChange" />

    <div class="quellen-groups">
      <div v-for="group in groupedSources" :key="group.key" class="quellen-group">
        <div class="quellen-group-title" :class="{ collapsed: isCollapsed(group.key) }" @click="toggleGroup(group.key)">
          <span class="chevron">&#9660;</span> {{ group.label }} ({{ group.files.length }})
        </div>
        <div class="quellen-grid" :class="{ collapsed: isCollapsed(group.key) }">
          <SourceCard v-for="sf in group.files" :key="sf.id" :sf="sf" />
        </div>
      </div>
    </div>
  </div>
</template>
