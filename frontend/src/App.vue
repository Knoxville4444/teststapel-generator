<script setup>
import { onMounted } from 'vue';
import TopBar from './components/TopBar.vue';
import HelpModal from './components/HelpModal.vue';
import TreePanel from './components/TreePanel.vue';
import Strip from './components/Strip.vue';
import SidePanel from './components/SidePanel.vue';
import { useFavoritenStore } from './stores/favoritenStore.js';

const favoritenStore = useFavoritenStore();

onMounted(() => {
  favoritenStore.refresh();
});
</script>

<template>
  <TopBar />
  <div class="main">
    <TreePanel />
    <Strip />
    <SidePanel />
  </div>
  <HelpModal />
</template>
