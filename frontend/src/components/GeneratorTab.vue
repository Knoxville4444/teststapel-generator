<script setup>
import { ref } from 'vue';
import { useDocumentStore } from '../stores/documentStore.js';
import { DOKTYPEN, DOKUMENTKATEGORIEN, FACHSYSTEME } from '../data/index.js';
import { humanize } from '../lib/pdfgen.js';

const documentStore = useDocumentStore();

const paketKategorie = ref('');
const dokFachsystem = ref(FACHSYSTEME[0].key);
const dokTyp = ref('');
const seiteAnzahl = ref(1);
const seiteInhalt = ref('stempel');

const doktypOptions = () => DOKTYPEN[dokFachsystem.value] || [];

function addPaket() {
  documentStore.insertItems([documentStore.makePaketTrennItem(paketKategorie.value)]);
}

function addDokument() {
  documentStore.insertItems([documentStore.makeDokumentTrennItem(dokFachsystem.value, dokTyp.value)]);
}

function addZbh() {
  documentStore.insertItems([documentStore.makeZbhItem()]);
}

function addSeiten() {
  documentStore.insertItems(documentStore.makeDummySeiten(seiteInhalt.value, parseInt(seiteAnzahl.value, 10)));
}
</script>

<template>
  <div>
    <div class="gen-section">
      <h3>Pakettrennblatt</h3>
      <label>
        Dokumentenkategorie
        <select v-model="paketKategorie">
          <option value="">— keine Kategorie —</option>
          <option v-for="k in DOKUMENTKATEGORIEN" :key="k" :value="k">{{ humanize(k) }}</option>
        </select>
      </label>
      <button class="wide-btn" @click="addPaket">Einfügen</button>
    </div>

    <div class="gen-section">
      <h3>Dokumenttrennblatt</h3>
      <label>
        Fachsystem
        <select v-model="dokFachsystem">
          <option v-for="f in FACHSYSTEME" :key="f.key" :value="f.key">{{ f.label }}</option>
        </select>
      </label>
      <label>
        Dokumenttyp
        <select v-model="dokTyp">
          <option value="">— kein Dokumenttyp —</option>
          <option v-for="d in doktypOptions()" :key="d.nr" :value="String(d.nr)">{{ d.nr }} - {{ d.name }}</option>
        </select>
      </label>
      <button class="wide-btn" @click="addDokument">Einfügen</button>
    </div>

    <div class="gen-section">
      <h3>Zusatzbehandlung (ZBH)</h3>
      <p class="hint">Statisches Trennblatt ohne Eingabefelder.</p>
      <button class="wide-btn" @click="addZbh">Einfügen</button>
    </div>

    <div class="gen-section">
      <h3>Dummy-Seite</h3>
      <label>
        Anzahl
        <input type="number" v-model="seiteAnzahl" min="1" max="50" />
      </label>
      <label>
        Inhalt
        <select v-model="seiteInhalt">
          <option value="stempel">Seitenzahl-Stempel</option>
          <option value="lorem">Lorem-Text</option>
        </select>
      </label>
      <button class="wide-btn" @click="addSeiten">Einfügen</button>
    </div>
  </div>
</template>
