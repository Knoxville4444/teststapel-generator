// TODO: an euer Package anpassen
package de.beispiel.teststapel.favoriten;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.*;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Stream;

/**
 * Speichert Favoriten als Ordnerbaum auf einem Volume (ein Unterordner = ein
 * Favoriten-Ordner, eine .json-Datei = ein Favorit) - bewusst kein DB-Server, siehe
 * docs/DECISIONS.md Eintrag 9.
 */
@Service
public class FavoritenService {

    // TODO: Property-Namen/Pfad an eure Konfiguration anpassen
    private final Path basisVerzeichnis;
    private final ObjectMapper objectMapper;

    public FavoritenService(@Value("${teststapel.favoriten-verzeichnis}") String basisPfad,
                             ObjectMapper objectMapper) {
        this.basisVerzeichnis = Path.of(basisPfad);
        this.objectMapper = objectMapper;
    }

    public FavoritenOrdnerInhalt liste(String pfad) {
        Path ordner = aufgeloest(pfad);
        if (!Files.isDirectory(ordner)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Ordner nicht gefunden");
        }
        List<String> unterordner = new ArrayList<>();
        List<Favorit> favoriten = new ArrayList<>();
        try (Stream<Path> eintraege = Files.list(ordner)) {
            for (Path eintrag : eintraege.sorted(Comparator.comparing(p -> p.getFileName().toString())).toList()) {
                if (Files.isDirectory(eintrag)) {
                    unterordner.add(eintrag.getFileName().toString());
                } else if (eintrag.toString().endsWith(".json")) {
                    favoriten.add(objectMapper.readValue(eintrag.toFile(), Favorit.class));
                }
            }
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Favoriten-Ordner konnte nicht gelesen werden", e);
        }
        return new FavoritenOrdnerInhalt(unterordner, favoriten);
    }

    public void speichern(String pfad, Favorit favorit) {
        Path ziel = aufgeloest(pfad + ".json");
        try {
            Files.createDirectories(ziel.getParent());
            objectMapper.writeValue(ziel.toFile(), favorit);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Favorit konnte nicht gespeichert werden", e);
        }
    }

    public void ordnerAnlegen(String pfad) {
        try {
            Files.createDirectories(aufgeloest(pfad));
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Ordner konnte nicht angelegt werden", e);
        }
    }

    public void loeschen(String pfad) {
        Path ziel = aufgeloest(pfad);
        Path zielDatei = aufgeloest(pfad + ".json");
        try {
            if (Files.isDirectory(ziel)) {
                try (Stream<Path> alle = Files.walk(ziel)) {
                    for (Path p : alle.sorted(Comparator.reverseOrder()).toList()) {
                        Files.delete(p);
                    }
                }
            } else if (Files.exists(zielDatei)) {
                Files.delete(zielDatei);
            } else {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Nichts zu löschen unter diesem Pfad");
            }
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Löschen fehlgeschlagen", e);
        }
    }

    // Path-Traversal-Schutz: aufgelöster Pfad muss unterhalb basisVerzeichnis bleiben
    private Path aufgeloest(String relPfad) {
        Path ziel = basisVerzeichnis.resolve(relPfad).normalize();
        if (!ziel.startsWith(basisVerzeichnis)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ungueltiger Pfad");
        }
        return ziel;
    }
}
