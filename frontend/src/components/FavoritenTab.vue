<script setup>
import { ref } from 'vue';
import { useFavoritenStore } from '../stores/favoritenStore.js';

const favoritenStore = useFavoritenStore();

const favName = ref('');
const newFolderName = ref('');

async function speichern() {
  const name = favName.value.trim();
  if (!name) {
    alert('Bitte einen Namen für den Favoriten eingeben.');
    return;
  }
  await favoritenStore.speichern(name);
  favName.value = '';
}

async function neuerOrdner() {
  const name = newFolderName.value.trim();
  if (!name) return;
  await favoritenStore.neuerOrdner(name);
  newFolderName.value = '';
}

async function anwenden(fav) {
  const missing = await favoritenStore.anwenden(fav);
  if (missing.length) {
    alert(`Favorit "${fav.name}" angewendet, aber ${missing.length} Datei(en) fehlen im gewählten Verzeichnis:\n` + missing.join('\n'));
  }
}
</script>

<template>
  <div>
    <div class="gen-section">
      <h3>Ordner</h3>
      <div class="fav-breadcrumb">
        <button @click="favoritenStore.springeZu(-1)">Wurzel</button>
        <template v-for="(seg, i) in favoritenStore.segmente()" :key="i">
          <span class="sep">/</span>
          <button @click="favoritenStore.springeZu(i)">{{ seg }}</button>
        </template>
      </div>

      <div v-for="name in favoritenStore.unterordner" :key="name" class="folder-row" @click="favoritenStore.oeffneOrdner(name)">
        <span class="folder-icon">📁</span>
        <span class="folder-name">{{ name }}</span>
        <div class="del-btn" title="Ordner löschen" @click.stop="favoritenStore.ordnerLoeschen(name)">×</div>
      </div>

      <div class="fav-new-folder">
        <input type="text" v-model="newFolderName" placeholder="Neuer Unterordner" @keyup.enter="neuerOrdner" />
        <button @click="neuerOrdner">Anlegen</button>
      </div>
    </div>

    <div class="gen-section">
      <h3>Favoriten hier</h3>
      <div v-if="!favoritenStore.favoriten.length" class="hint">Noch keine Favoriten in diesem Ordner.</div>
      <div v-for="fav in favoritenStore.favoriten" :key="fav.name" class="favorit-row">
        <div class="favorit-info">
          <div class="favorit-name">{{ fav.name }}</div>
          <div class="favorit-meta">{{ fav.items.length }} Elemente</div>
        </div>
        <button @click="anwenden(fav)">Anwenden</button>
        <div class="del-btn favorit-del" title="Favorit löschen" @click="favoritenStore.loeschen(fav.name)">×</div>
      </div>
    </div>

    <div class="gen-section">
      <h3>Aktuelles als Favorit speichern</h3>
      <label>
        Name
        <input type="text" v-model="favName" placeholder="z. B. Standard-Nachgang Marke" @keyup.enter="speichern" />
      </label>
      <button class="wide-btn" @click="speichern">In diesem Ordner speichern</button>
      <p class="hint">
        Speichert nur die Anweisungen (Trennblätter, Dokumenttypen, Dateiverweise), nicht das fertige
        PDF – wird bei "Anwenden" mit den aktuell geladenen Dateien neu erzeugt. Geteilt im Team,
        jeder darf anlegen/verschieben/löschen.
      </p>
    </div>
  </div>
</template>
