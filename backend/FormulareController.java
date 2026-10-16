// TODO: an euer Package anpassen
package de.beispiel.teststapel.formulare;

import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Liefert die zentrale Formular-Bibliothek aus, ersetzt den bisherigen lokalen
 * Verzeichnis-Picker im Frontend. Siehe docs/API.md im teststapel-generator-Repo.
 *
 * TODO: Endpunkte in die vorhandene Security-Konfiguration einhängen (siehe
 * docs/AUTH.md) - hier bewusst keine eigenen Annotations gesetzt, da Konvention
 * im bestehenden Projekt abweichen kann.
 */
@RestController
@RequestMapping("/api/formulare")
public class FormulareController {

    private final FormulareService service;

    public FormulareController(FormulareService service) {
        this.service = service;
    }

    @GetMapping
    public FormulareUebersicht liste() {
        return service.listeGruppen();
    }

    @GetMapping("/datei")
    public ResponseEntity<Resource> datei(@RequestParam String pfad) {
        Resource resource = service.ladeDatei(pfad);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .body(resource);
    }
}
