import { defineStore } from 'pinia';
import { ref } from 'vue';
import * as favoritenApi from '../lib/favoritenApi.js';
import { useDocumentStore } from './documentStore.js';

export const useFavoritenStore = defineStore('favoriten', () => {
  const pfad = ref(''); // aktueller Ordner, '' = Wurzel
  const unterordner = ref([]);
  const favoriten = ref([]);
  const loading = ref(false);

  async function refresh() {
    loading.value = true;
    try {
      const result = await favoritenApi.listFavoriten(pfad.value);
      unterordner.value = result.unterordner;
      favoriten.value = result.favoriten;
    } finally {
      loading.value = false;
    }
  }

  function segmente() {
    return pfad.value ? pfad.value.split('/') : [];
  }

  async function oeffneOrdner(name) {
    pfad.value = pfad.value ? `${pfad.value}/${name}` : name;
    await refresh();
  }

  async function springeZu(index) {
    // index === -1 bedeutet Wurzel
    pfad.value = index < 0 ? '' : segmente().slice(0, index + 1).join('/');
    await refresh();
  }

  async function neuerOrdner(name) {
    const neuerPfad = pfad.value ? `${pfad.value}/${name}` : name;
    await favoritenApi.createFolder(neuerPfad);
    await refresh();
  }

  async function speichern(name) {
    const documentStore = useDocumentStore();
    const zielPfad = pfad.value ? `${pfad.value}/${name}` : name;
    const instructions = documentStore.itemsToInstructions(documentStore.items);
    await favoritenApi.saveFavorit(zielPfad, { name, items: instructions });
    await refresh();
  }

  async function loeschen(name) {
    const zielPfad = pfad.value ? `${pfad.value}/${name}` : name;
    await favoritenApi.deleteFavorit(zielPfad);
    await refresh();
  }

  async function ordnerLoeschen(name) {
    const zielPfad = pfad.value ? `${pfad.value}/${name}` : name;
    await favoritenApi.deleteFavorit(zielPfad);
    await refresh();
  }

  async function anwenden(favorit) {
    const documentStore = useDocumentStore();
    const { items, missing } = await documentStore.instructionsToItems(favorit.items);
    documentStore.insertItems(items);
    return missing;
  }

  return {
    pfad,
    unterordner,
    favoriten,
    loading,
    refresh,
    segmente,
    oeffneOrdner,
    springeZu,
    neuerOrdner,
    speichern,
    loeschen,
    ordnerLoeschen,
    anwenden,
  };
});
