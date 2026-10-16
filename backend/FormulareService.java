// TODO: an euer Package anpassen
package de.beispiel.teststapel.formulare;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Stream;

@Service
public class FormulareService {

    // TODO: Property-Namen/Pfad an eure Konfiguration anpassen (z.B. application.yml,
    // gemountetes Volume)
    private final Path formularVerzeichnis;

    public FormulareService(@Value("${teststapel.formulare-verzeichnis}") String basisPfad) {
        this.formularVerzeichnis = Path.of(basisPfad);
    }

    public FormulareUebersicht listeGruppen() {
        List<FormularGruppe> gruppen = new ArrayList<>();
        try (Stream<Path> unterordner = Files.list(formularVerzeichnis)) {
            for (Path ordner : unterordner.filter(Files::isDirectory)
                    .sorted(Comparator.comparing(p -> p.getFileName().toString()))
                    .toList()) {
                gruppen.add(leseGruppe(ordner));
            }
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Formular-Verzeichnis konnte nicht gelesen werden", e);
        }
        return new FormulareUebersicht(gruppen);
    }

    private FormularGruppe leseGruppe(Path ordner) throws IOException {
        List<Formular> formulare = new ArrayList<>();
        try (Stream<Path> dateien = Files.list(ordner)) {
            for (Path datei : dateien.filter(p -> p.toString().toLowerCase().endsWith(".pdf"))
                    .sorted(Comparator.comparing(p -> p.getFileName().toString()))
                    .toList()) {
                String dateiname = datei.getFileName().toString();
                String name = dateiname.substring(0, dateiname.length() - 4);
                String relPfad = ordner.getFileName() + "/" + dateiname;
                formulare.add(new Formular(relPfad, name));
            }
        }
        return new FormularGruppe(ordner.getFileName().toString(), formulare);
    }

    public Resource ladeDatei(String relPfad) {
        // Path-Traversal-Schutz: aufgelöster Pfad muss unterhalb formularVerzeichnis bleiben
        Path ziel = formularVerzeichnis.resolve(relPfad).normalize();
        if (!ziel.startsWith(formularVerzeichnis)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ungueltiger Pfad");
        }
        if (!Files.isRegularFile(ziel)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Datei nicht gefunden");
        }
        try {
            return new UrlResource(ziel.toUri());
        } catch (MalformedURLException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Pfadfehler", e);
        }
    }
}
