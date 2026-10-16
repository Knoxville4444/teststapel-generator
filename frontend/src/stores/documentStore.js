import { defineStore } from 'pinia';
import { ref, computed, markRaw } from 'vue';
import * as pdfgen from '../lib/pdfgen.js';
import { loadPdfJsDoc, renderPageToDataUrl } from '../lib/pdfRender.js';
import pdfjsLib from '../lib/pdfjs.js';
import { PDFDocument } from 'pdf-lib';
import { DOKTYPEN, SONSTIGE_KEY } from '../data/index.js';

export const useDocumentStore = defineStore('document', () => {
  const items = ref([]);
  const insertIndex = ref(null);
  const sourceFiles = ref([]);
  const collapsedGroups = ref(new Set());
  const dragPlaceholderIndex = ref(null);
  const exportProgress = ref('');

  const status = computed(() => {
    if (exportProgress.value) return exportProgress.value;
    const totalPages = items.value.reduce((sum, it) => {
      if (it.type === 'seite-stapel') return sum + it.source.pageCount;
      if (it.type === 'fehlend') return sum;
      return sum + 1;
    }, 0);
    const missingCount = items.value.filter((it) => it.type === 'fehlend').length;
    return totalPages ? `${totalPages} Seite(n)` + (missingCount ? `, ${missingCount} fehlend` : '') : '';
  });

  const sourceDocCache = new Map();
  let nextId = 1;
  const nextItemId = () => 'it' + nextId++;
  const nextFileId = () => 'f' + nextId++;

  // ---------- Quellen ----------

  function detectGroup(relPath) {
    // segments[0] = Name des gewählten Wurzelverzeichnisses, segments[1] = direktes
    // Unterverzeichnis (eine Ebene), weitere Verschachtelung wird ignoriert.
    const segments = relPath.split('/');
    if (segments.length > 2) {
      const name = segments[1];
      return { key: name, label: name };
    }
    return { key: SONSTIGE_KEY, label: 'Sonstige' };
  }

  async function handleDirPicked(fileList) {
    const allFiles = Array.from(fileList);
    const pdfFiles = allFiles.filter((f) => f.name.toLowerCase().endsWith('.pdf'));
    sourceFiles.value = pdfFiles.map((file) => {
      const fullRelPath = file.webkitRelativePath || file.name;
      const group = detectGroup(fullRelPath);
      const relPath = fullRelPath.split('/').slice(1).join('/') || fullRelPath;
      return {
        id: nextFileId(),
        file: markRaw(file),
        relPath,
        group: group.key,
        groupLabel: group.label,
        name: file.name.replace(/\.pdf$/i, ''),
        pageCount: null,
        thumbDataUrl: null,
        pdfjsDoc: null,
      };
    });
    return allFiles;
  }

  async function ensureThumbnail(sf) {
    if (sf.thumbDataUrl) return sf.thumbDataUrl;
    const doc = await loadPdfJsDoc(sf);
    const dataUrl = await renderPageToDataUrl(doc, 1, 105);
    sf.thumbDataUrl = dataUrl;
    return dataUrl;
  }

  async function createSeiteStapelItem(sf) {
    const doc = await loadPdfJsDoc(sf);
    const item = {
      id: nextItemId(),
      type: 'seite-stapel',
      source: { kind: 'file', fileId: sf.id, pageCount: doc.numPages },
      relPath: sf.relPath,
      label: sf.name,
      thumbDataUrl: sf.thumbDataUrl || null,
    };
    if (!item.thumbDataUrl) {
      renderPageToDataUrl(doc, 1, 100)
        .then((dataUrl) => {
          item.thumbDataUrl = dataUrl;
        })
        .catch((err) => console.error(err));
    }
    return item;
  }

  async function addWholePdf(sf, atIndex) {
    const item = await createSeiteStapelItem(sf);
    insertItems([item], atIndex);
  }

  async function loadSourceDocForLib(fileId) {
    if (sourceDocCache.has(fileId)) return sourceDocCache.get(fileId);
    const sf = sourceFiles.value.find((s) => s.id === fileId);
    const bytes = await sf.file.arrayBuffer();
    const doc = await PDFDocument.load(bytes);
    sourceDocCache.set(fileId, doc);
    return doc;
  }

  async function loadSourcePdfJsDocForLib(fileId) {
    const sf = sourceFiles.value.find((s) => s.id === fileId);
    return loadPdfJsDoc(sf);
  }

  // ---------- Item-Verwaltung ----------

  function insertItems(newItems, atIndex) {
    const idx = atIndex === undefined ? insertIndex.value : atIndex;
    if (idx === null || idx === undefined || idx >= items.value.length) {
      items.value.push(...newItems);
      insertIndex.value = null;
    } else {
      items.value.splice(idx, 0, ...newItems);
      insertIndex.value = idx + newItems.length;
    }
  }

  function setInsertIndexAfter(itemId) {
    insertIndex.value = items.value.findIndex((it) => it.id === itemId) + 1;
  }

  function removeItem(id) {
    items.value = items.value.filter((it) => it.id !== id);
  }

  function removeGroup(startIndex, level) {
    let end = startIndex + 1;
    while (end < items.value.length) {
      const t = items.value[end].type;
      const isBoundary = level === 'paket' ? t === 'paket-trenn' : t === 'paket-trenn' || t === 'dokument-trenn' || t === 'zbh';
      if (isBoundary) break;
      end++;
    }
    items.value.splice(startIndex, end - startIndex);
    if (insertIndex.value !== null) {
      if (insertIndex.value > startIndex && insertIndex.value <= end) insertIndex.value = startIndex;
      else if (insertIndex.value > end) insertIndex.value -= end - startIndex;
    }
  }

  function moveItemToIndex(id, toIndex) {
    const fromIdx = items.value.findIndex((it) => it.id === id);
    if (fromIdx === -1) return;
    const [moved] = items.value.splice(fromIdx, 1);
    let insertAt = fromIdx < toIndex ? toIndex - 1 : toIndex;
    insertAt = Math.max(0, Math.min(items.value.length, insertAt));
    items.value.splice(insertAt, 0, moved);
  }

  // ---------- Generator-Items ----------

  function makePaketTrennItem(kategorie) {
    return { id: nextItemId(), type: 'paket-trenn', kategorie: kategorie || null };
  }

  function makeDokumentTrennItem(fsKey, nr) {
    let doktyp = null;
    if (nr) {
      const entry = (DOKTYPEN[fsKey] || []).find((d) => String(d.nr) === String(nr));
      if (entry) doktyp = { nr: entry.nr, name: entry.name, fachsystem: fsKey };
    }
    return { id: nextItemId(), type: 'dokument-trenn', doktyp };
  }

  function makeZbhItem() {
    return { id: nextItemId(), type: 'zbh' };
  }

  function makeDummySeiten(kind, anzahl) {
    const n = Math.max(1, Math.min(50, anzahl || 1));
    const newItems = [];
    for (let i = 1; i <= n; i++) {
      newItems.push({
        id: nextItemId(),
        type: 'seite',
        source: {
          kind: 'generated',
          dummy: { kind, pageLabel: kind === 'stempel' ? `Seite ${i} von ${n}` : `Dummy-Seite ${i}/${n}` },
        },
        label: `Dummy ${i}/${n}`,
      });
    }
    return newItems;
  }

  // ---------- Favoriten: Umwandlung Items <-> Anweisungen ----------

  function itemsToInstructions(list) {
    const instructions = [];
    let i = 0;
    while (i < list.length) {
      const item = list[i];
      if (item.type === 'paket-trenn') {
        instructions.push({ type: 'paket-trenn', kategorie: item.kategorie });
        i++;
      } else if (item.type === 'dokument-trenn') {
        instructions.push({ type: 'dokument-trenn', doktyp: item.doktyp });
        i++;
      } else if (item.type === 'zbh') {
        instructions.push({ type: 'zbh' });
        i++;
      } else if (item.type === 'seite-stapel') {
        instructions.push({ type: 'datei', relPath: item.relPath, label: item.label });
        i++;
      } else if (item.type === 'seite' && item.source && item.source.kind === 'generated') {
        const kind = item.source.dummy.kind;
        let count = 0;
        while (
          i < list.length &&
          list[i].type === 'seite' &&
          list[i].source &&
          list[i].source.kind === 'generated' &&
          list[i].source.dummy.kind === kind
        ) {
          count++;
          i++;
        }
        instructions.push({ type: 'seite-generiert', kind, anzahl: count });
      } else {
        i++;
      }
    }
    return instructions;
  }

  async function instructionsToItems(instructions) {
    const newItems = [];
    const missing = [];
    for (const instr of instructions) {
      if (instr.type === 'paket-trenn') {
        newItems.push(makePaketTrennItem(instr.kategorie));
      } else if (instr.type === 'dokument-trenn') {
        const fsKey = instr.doktyp ? instr.doktyp.fachsystem : null;
        newItems.push(makeDokumentTrennItem(fsKey, instr.doktyp ? instr.doktyp.nr : null));
      } else if (instr.type === 'zbh') {
        newItems.push(makeZbhItem());
      } else if (instr.type === 'seite-generiert') {
        newItems.push(...makeDummySeiten(instr.kind, instr.anzahl));
      } else if (instr.type === 'datei') {
        const sf = sourceFiles.value.find((s) => s.relPath === instr.relPath);
        if (sf) {
          newItems.push(await createSeiteStapelItem(sf));
        } else {
          missing.push(instr.relPath);
          newItems.push({ id: nextItemId(), type: 'fehlend', relPath: instr.relPath, label: instr.label || instr.relPath });
        }
      }
    }
    return { items: newItems, missing };
  }

  // ---------- Export ----------

  async function exportPdf({ scanMode }) {
    if (!items.value.length) {
      return { error: 'Noch keine Seiten im Dokument.' };
    }
    const missing = items.value.filter((it) => it.type === 'fehlend');
    exportProgress.value = 'Erzeuge PDF…';
    try {
      const bytes = await pdfgen.buildFinalPdf(items.value, loadSourceDocForLib, {
        scanMode,
        loadSourcePdfJsDoc: loadSourcePdfJsDocForLib,
        onProgress: (done, total) => {
          exportProgress.value = `Erzeuge PDF… (${done}/${total})`;
        },
      });
      exportProgress.value = '';
      return { blob: new Blob([bytes], { type: 'application/pdf' }), missing };
    } catch (err) {
      console.error(err);
      exportProgress.value = '';
      return { error: 'Fehler beim Erzeugen des PDFs: ' + err.message };
    }
  }

  return {
    items,
    insertIndex,
    sourceFiles,
    collapsedGroups,
    dragPlaceholderIndex,
    status,
    detectGroup,
    handleDirPicked,
    ensureThumbnail,
    addWholePdf,
    createSeiteStapelItem,
    insertItems,
    setInsertIndexAfter,
    removeItem,
    removeGroup,
    moveItemToIndex,
    makePaketTrennItem,
    makeDokumentTrennItem,
    makeZbhItem,
    makeDummySeiten,
    itemsToInstructions,
    instructionsToItems,
    exportPdf,
  };
});
