package com.efisoft.direccionesfiscales.ms_cif_procesamiento.service;

import com.efisoft.direccionesfiscales.ms_cif_procesamiento.dto.CifDomicilioDTO;
import com.efisoft.direccionesfiscales.ms_cif_procesamiento.dto.CifProcesarResponse;
import com.efisoft.direccionesfiscales.ms_cif_procesamiento.entity.CatalogoEstado;
import com.efisoft.direccionesfiscales.ms_cif_procesamiento.entity.CatalogoRegimenFiscal;
import com.efisoft.direccionesfiscales.ms_cif_procesamiento.repository.CatalogoEstadoRepository;
import com.efisoft.direccionesfiscales.ms_cif_procesamiento.repository.CatalogoPaisRepository;
import com.efisoft.direccionesfiscales.ms_cif_procesamiento.repository.CatalogoRegimenFiscalRepository;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.text.Normalizer;
import java.util.Comparator;

@Service
public class CifProcesamientoService {

    private static final String PAIS_DEFAULT = "México";
    private static final int PAIS_ID_DEFAULT = 1;

    private final CifParserService parser;
    private final FideicomisoClient fideicomisoClient;
    private final CatalogoEstadoRepository estadoRepository;
    private final CatalogoPaisRepository paisRepository;
    private final CatalogoRegimenFiscalRepository regimenRepository;

    public CifProcesamientoService(CifParserService parser,
                                    FideicomisoClient fideicomisoClient,
                                    CatalogoEstadoRepository estadoRepository,
                                    CatalogoPaisRepository paisRepository,
                                    CatalogoRegimenFiscalRepository regimenRepository) {
        this.parser = parser;
        this.fideicomisoClient = fideicomisoClient;
        this.estadoRepository = estadoRepository;
        this.paisRepository = paisRepository;
        this.regimenRepository = regimenRepository;
    }

    public CifProcesarResponse procesar(InputStream pdf, String fideicomisoId,
                                         String tipoParticipante, String numeroParticipante) {
        CifDomicilioDTO cif = parser.parsear(pdf);

        if (cif.rfc() == null || cif.rfc().isBlank()) {
            throw new CifParseException("No se pudo extraer el RFC del documento");
        }

        String rfcEsperado = fideicomisoClient.obtenerRfc(fideicomisoId, tipoParticipante, numeroParticipante);

        if (rfcEsperado == null) {
            throw new ParticipanteNoEncontradoException(fideicomisoId, tipoParticipante, numeroParticipante);
        }

        if (!cif.rfc().equalsIgnoreCase(rfcEsperado)) {
            throw new RfcNoCoincideException(cif.rfc(), rfcEsperado);
        }

        return mapearRespuesta(cif);
    }

    private static String normalizarNombre(String nombre) {
        return Normalizer.normalize(nombre, Normalizer.Form.NFD)
            .replaceAll("\\p{M}", "")
            .toLowerCase()
            .trim();
    }

    private static String normalizarRegimen(String regimen) {
        return normalizarNombre(regimen)
            .replaceAll("[^a-z0-9 ]", " ")
            .replaceAll("\\s+", " ")
            .trim();
    }

    private CifProcesarResponse mapearRespuesta(CifDomicilioDTO cif) {
        String calleCompleta = cif.nombreVialidad();

        String ref = null;
        String entre = cif.entreCalle() != null ? cif.entreCalle().trim() : "";
        String y = cif.yCalle() != null ? cif.yCalle().trim() : "";
        if (!entre.isEmpty() && !y.isEmpty()) {
            ref = entre + "/" + y;
        } else if (!entre.isEmpty()) {
            ref = entre;
        } else if (!y.isEmpty()) {
            ref = y;
        }

        Integer estadoId = null;
        if (cif.estado() != null) {
            String objetivo = normalizarNombre(cif.estado());
            CatalogoEstado match = estadoRepository.findAll().stream()
                .filter(e -> normalizarNombre(e.getEstadoNombre()).equals(objetivo))
                .findFirst()
                .orElse(null);
            if (match != null) {
                estadoId = match.getEstadoId();
            }
        }

        Integer paisId = PAIS_ID_DEFAULT;
        String paisNombre = PAIS_DEFAULT;

        Integer regimenFiscalId = null;
        if (cif.regimenFiscal() != null) {
            String objetivo = normalizarRegimen(cif.regimenFiscal());
            regimenFiscalId = regimenRepository.findAll().stream()
                .filter(r -> objetivo.contains(normalizarRegimen(r.getRegDescripcion())))
                .max(Comparator.comparingInt(r -> normalizarRegimen(r.getRegDescripcion()).length()))
                .map(CatalogoRegimenFiscal::getRegClave)
                .orElse(null);
        }

        return new CifProcesarResponse(
            calleCompleta,
            cif.numeroExterior(),
            cif.numeroInterior(),
            cif.colonia(),
            cif.localidad(),
            cif.municipio(),
            cif.estado(),
            estadoId,
            paisNombre,
            paisId,
            cif.codigoPostal(),
            ref,
            null,
            cif.correoElectronico(),
            cif.regimenFiscal(),
            regimenFiscalId,
            cif.rfc(),
            cif.nombreOLRazonSocial()
        );
    }

    public static class CifParseException extends RuntimeException {
        public CifParseException(String message) { super(message); }
    }

    public static class ParticipanteNoEncontradoException extends RuntimeException {
        public ParticipanteNoEncontradoException(String fid, String tipo, String num) {
            super("No se encontró el participante Fideicomiso=" + fid
                + ", Tipo=" + tipo + ", No.=" + num
                + " en el sistema de Fideicomisos");
        }
    }

    public static class RfcNoCoincideException extends RuntimeException {
        public RfcNoCoincideException(String rfcCif, String rfcEsperado) {
            super("El RFC del CIF (" + rfcCif + ") no coincide con el RFC registrado del participante (" + rfcEsperado + ")");
        }
    }
}
