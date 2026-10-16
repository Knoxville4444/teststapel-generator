<script setup>
import { ref } from 'vue';
import QuellenTab from './QuellenTab.vue';
import GeneratorTab from './GeneratorTab.vue';
import FavoritenTab from './FavoritenTab.vue';

const activeTab = ref('quellen');
</script>

<template>
  <aside class="side-panel">
    <div class="tabs">
      <button class="tab" :class="{ active: activeTab === 'quellen' }" @click="activeTab = 'quellen'">Quellen</button>
      <button class="tab" :class="{ active: activeTab === 'generator' }" @click="activeTab = 'generator'">Generator</button>
      <button class="tab" :class="{ active: activeTab === 'favoriten' }" @click="activeTab = 'favoriten'">Favoriten</button>
    </div>

    <div class="tab-content" :class="{ active: activeTab === 'quellen' }">
      <QuellenTab />
    </div>
    <div class="tab-content" :class="{ active: activeTab === 'generator' }">
      <GeneratorTab />
    </div>
    <div class="tab-content" :class="{ active: activeTab === 'favoriten' }">
      <FavoritenTab />
    </div>
  </aside>
</template>
