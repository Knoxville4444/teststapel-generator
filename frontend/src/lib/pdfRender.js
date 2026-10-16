import { markRaw } from 'vue';
import pdfjsLib from './pdfjs.js';

export async function loadPdfJsDoc(sourceFile) {
  if (sourceFile.pdfjsDoc) return sourceFile.pdfjsDoc;
  const buf = await sourceFile.file.arrayBuffer();
  const doc = await pdfjsLib.getDocument({ data: buf }).promise;
  // markRaw: pdf.js-Dokumentobjekt soll nicht in einen Vue-Reactive-Proxy
  // gewrappt werden (unnötiger Overhead, moegliche Identitaetsprobleme intern)
  sourceFile.pdfjsDoc = markRaw(doc);
  sourceFile.pageCount = doc.numPages;
  return doc;
}

export async function renderPageToDataUrl(doc, pageNumber, targetWidth) {
  const page = await doc.getPage(pageNumber);
  const viewport = page.getViewport({ scale: 1 });
  const scale = targetWidth / viewport.width;
  const scaledViewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = scaledViewport.width;
  canvas.height = scaledViewport.height;
  const ctx = canvas.getContext('2d');
  await page.render({ canvasContext: ctx, viewport: scaledViewport }).promise;
  return canvas.toDataURL('image/png');
}
