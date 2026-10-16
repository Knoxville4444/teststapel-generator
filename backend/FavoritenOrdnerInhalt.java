// TODO: an euer Package anpassen
package de.beispiel.teststapel.favoriten;

import java.util.List;

public record FavoritenOrdnerInhalt(List<String> unterordner, List<Favorit> favoriten) {}
