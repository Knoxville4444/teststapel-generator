/**
 * TEMPORÄRER lokaler Mock der künftigen /api/favoriten-Endpunkte (siehe
 * docs/API.md im teststapel-generator-Repo), backed by localStorage statt
 * einem echten Backend. Gleiche Funktionssignaturen wie die geplanten
 * HTTP-Aufrufe, damit der Austausch gegen echte fetch()-Calls später klein
 * bleibt - nur die Implementierung dieser Datei ändert sich, Aufrufer bleiben
 * unberührt.
 *
 * Ordnerstruktur beliebiger Tiefe, geteilt (kein Besitzkonzept), siehe
 * docs/DECISIONS.md Eintrag 10.
 */

const FOLDERS_KEY = 'teststapel-favoriten-ordner';
const FAVORITEN_KEY = 'teststapel-favoriten-dateien';

function loadFolders() {
  try {
    return new Set(JSON.parse(localStorage.getItem(FOLDERS_KEY) || '[]'));
  } catch {
    return new Set();
  }
}

function saveFolders(set) {
  localStorage.setItem(FOLDERS_KEY, JSON.stringify([...set]));
}

function loadFavoriten() {
  try {
    return JSON.parse(localStorage.getItem(FAVORITEN_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveFavoritenMap(map) {
  localStorage.setItem(FAVORITEN_KEY, JSON.stringify(map));
}

function parentOf(pfad) {
  const idx = pfad.lastIndexOf('/');
  return idx === -1 ? '' : pfad.slice(0, idx);
}

function ensureParentFolders(folders, pfad) {
  let parent = parentOf(pfad);
  while (parent) {
    folders.add(parent);
    parent = parentOf(parent);
  }
}

export async function listFavoriten(pfad = '') {
  const folders = loadFolders();
  const favoritenMap = loadFavoriten();

  const unterordner = [...folders]
    .filter((f) => parentOf(f) === pfad)
    .map((f) => f.slice(pfad ? pfad.length + 1 : 0))
    .sort((a, b) => a.localeCompare(b, 'de'));

  const favoriten = Object.entries(favoritenMap)
    .filter(([p]) => parentOf(p) === pfad)
    .map(([, fav]) => fav)
    .sort((a, b) => a.name.localeCompare(b.name, 'de'));

  return { unterordner, favoriten };
}

export async function saveFavorit(pfad, favorit) {
  const folders = loadFolders();
  ensureParentFolders(folders, pfad);
  saveFolders(folders);

  const map = loadFavoriten();
  map[pfad] = favorit;
  saveFavoritenMap(map);
}

export async function createFolder(pfad) {
  const folders = loadFolders();
  folders.add(pfad);
  ensureParentFolders(folders, pfad);
  saveFolders(folders);
}

export async function deleteFavorit(pfad) {
  const folders = loadFolders();
  const map = loadFavoriten();

  if (folders.has(pfad)) {
    // Ordner: rekursiv alles darunter entfernen
    const prefix = pfad + '/';
    for (const f of [...folders]) {
      if (f === pfad || f.startsWith(prefix)) folders.delete(f);
    }
    for (const p of Object.keys(map)) {
      if (p === pfad || p.startsWith(prefix)) delete map[p];
    }
    saveFolders(folders);
    saveFavoritenMap(map);
  } else if (map[pfad]) {
    delete map[pfad];
    saveFavoritenMap(map);
  }
}
