// TODO: an euer Package anpassen
package de.beispiel.teststapel.favoriten;

import org.springframework.web.bind.annotation.*;

/**
 * Geteilte Favoriten mit Ordnerstruktur (siehe docs/DECISIONS.md Eintrag 10): kein
 * Besitzkonzept, jeder Nutzer darf alles anlegen/verschieben/löschen.
 *
 * TODO: Endpunkte in die vorhandene Security-Konfiguration einhängen (siehe
 * docs/AUTH.md) - "eingeloggt" reicht fuer den aktuellen Umfang, kein eigenes
 * Rollenkonzept vorgesehen.
 */
@RestController
@RequestMapping("/api/favoriten")
public class FavoritenController {

    private final FavoritenService service;

    public FavoritenController(FavoritenService service) {
        this.service = service;
    }

    @GetMapping
    public FavoritenOrdnerInhalt liste(@RequestParam(defaultValue = "") String pfad) {
        return service.liste(pfad);
    }

    @PutMapping
    public void speichern(@RequestParam String pfad, @RequestBody Favorit favorit) {
        service.speichern(pfad, favorit);
    }

    @PostMapping("/ordner")
    public void ordnerAnlegen(@RequestParam String pfad) {
        service.ordnerAnlegen(pfad);
    }

    @DeleteMapping
    public void loeschen(@RequestParam String pfad) {
        service.loeschen(pfad);
    }
}
