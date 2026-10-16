// TODO: an euer Package anpassen
package de.beispiel.teststapel.favoriten;

import java.util.List;
import java.util.Map;

/**
 * items bewusst generisch (Liste beliebiger JSON-Objekte) statt eigener Klassen je
 * Anweisungstyp (paket-trenn, dokument-trenn, datei, seite-generiert, ...) - das
 * Schema gehört dem Frontend (siehe frontend/app.js, itemsToInstructions) und kann
 * sich dort weiterentwickeln, ohne dass das Backend mitgeaendert werden muss. Das
 * Backend speichert/liefert das nur unveraendert durch.
 */
public record Favorit(String name, List<Map<String, Object>> items) {}
