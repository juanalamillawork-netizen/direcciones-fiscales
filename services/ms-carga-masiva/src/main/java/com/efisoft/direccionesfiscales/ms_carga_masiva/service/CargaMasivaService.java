package com.efisoft.direccionesfiscales.ms_carga_masiva.service;

import com.efisoft.direccionesfiscales.ms_carga_masiva.client.FideicomisoClient;
import com.efisoft.direccionesfiscales.ms_carga_masiva.dto.LineaArchivoDTO;
import com.efisoft.direccionesfiscales.ms_carga_masiva.dto.LineaDetalleDTO;
import com.efisoft.direccionesfiscales.ms_carga_masiva.dto.LoteDetalleDTO;
import com.efisoft.direccionesfiscales.ms_carga_masiva.entity.*;
import com.efisoft.direccionesfiscales.ms_carga_masiva.parser.ArchivoParser;
import com.efisoft.direccionesfiscales.ms_carga_masiva.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class CargaMasivaService {

    private static final Logger log = LoggerFactory.getLogger(CargaMasivaService.class);

    private final ArchivoParser archivoParser;
    private final FideicomisoClient fideicomisoClient;
    private final CargaInterfazRepository cargaInterfazRepository;
    private final DomicilioFiscalRepository domicilioFiscalRepository;
    private final CatalogoPaisRepository catalogoPaisRepository;
    private final CatalogoEstadoRepository catalogoEstadoRepository;
    private final UpsertProcessor upsertProcessor;

    public CargaMasivaService(ArchivoParser archivoParser, FideicomisoClient fideicomisoClient,
                              CargaInterfazRepository cargaInterfazRepository,
                              DomicilioFiscalRepository domicilioFiscalRepository,
                              CatalogoPaisRepository catalogoPaisRepository,
                              CatalogoEstadoRepository catalogoEstadoRepository,
                              UpsertProcessor upsertProcessor) {
        this.archivoParser = archivoParser;
        this.fideicomisoClient = fideicomisoClient;
        this.cargaInterfazRepository = cargaInterfazRepository;
        this.domicilioFiscalRepository = domicilioFiscalRepository;
        this.catalogoPaisRepository = catalogoPaisRepository;
        this.catalogoEstadoRepository = catalogoEstadoRepository;
        this.upsertProcessor = upsertProcessor;
    }

    @Transactional
    public LoteDetalleDTO procesarArchivo(String nombreArchivo, InputStream inputStream, String numUsuario) throws IOException {
        var lineas = archivoParser.parse(inputStream);
        var ahora = LocalDateTime.now();
        var loteId = nombreArchivo + "_" + ahora.toString().replace(":", "-").replace(".", "-");
        var resultados = new ArrayList<LineaDetalleDTO>();
        int exitosos = 0, errores = 0;

        for (int i = 0; i < lineas.size(); i++) {
            var linea = lineas.get(i);
            var secuencial = i + 1;
            var result = procesarLinea(linea, secuencial, nombreArchivo, numUsuario, ahora);
            resultados.add(result);
            if ("A".equals(result.getEstatus())) {
                exitosos++;
            } else {
                errores++;
            }
        }

        return new LoteDetalleDTO(loteId, lineas.size(), exitosos, errores, resultados);
    }

    public LoteDetalleDTO consultarDetalle(String loteId) {
        var registros = cargaInterfazRepository.findAll().stream()
            .filter(c -> cargarLoteId(c).equals(loteId))
            .sorted(Comparator.comparing(CargaInterfaz::getCarintSecuencial))
            .toList();

        if (registros.isEmpty()) return null;

        var lineas = registros.stream()
            .map(r -> new LineaDetalleDTO(
                r.getCarintSecuencial(),
                "",
                "",
                "",
                r.getCarintEstatus(),
                r.getCarintMensaje() != null ? r.getCarintMensaje() : ""
            ))
            .toList();

        long exitosos = registros.stream().filter(r -> "A".equals(r.getCarintEstatus())).count();
        long errores = registros.size() - exitosos;

        return new LoteDetalleDTO(loteId, registros.size(), (int) exitosos, (int) errores, lineas);
    }

    private static String cargarLoteId(CargaInterfaz c) {
        return c.getCarintNomArch() + "_"
            + c.getCarintFecha().toString().replace(":", "-").replace(".", "-");
    }

    private LineaDetalleDTO procesarLinea(LineaArchivoDTO linea, int secuencial, String nombreArchivo, String numUsuario, LocalDateTime ahora) {
        var mensajes = new ArrayList<String>();

        // 1. Insertar carga_interfaz
        var carga = new CargaInterfaz();
        carga.setCarintNumUsuario(numUsuario);
        carga.setCarintFecha(ahora);
        carga.setCarintSecuencial(secuencial);
        carga.setCarintNomPath("");
        carga.setCarintNomArch(nombreArchivo);
        carga.setCarintCadena(linea.getCadenaOriginal());
        cargaInterfazRepository.save(carga);

        try {
            // 2. Validar RFC
            String rfcArchivo = linea.getRfcArchivo();
            String rfcSistema = null;
            var fideicomiso = linea.getFideicomiso();
            int numContrato = parseIntSafe(fideicomiso);
            int numParticipante = parseIntSafe(linea.getNumParticipante());
            String tipoParticipante = linea.getTipoParticipante();

            if (rfcArchivo != null && !rfcArchivo.isBlank() && numContrato > 0) {
                rfcSistema = fideicomisoClient.getRfc(tipoParticipante, numContrato, numParticipante).orElse(null);
                if (rfcSistema != null && !rfcSistema.equalsIgnoreCase(rfcArchivo.trim())) {
                    mensajes.add("RFC no coincide: archivo='" + rfcArchivo + "' sistema='" + rfcSistema + "'");
                }
            }

            // 3. Resolver nombre legal
            String nomLegal = null;
            if (numContrato > 0) {
                try {
                    nomLegal = fideicomisoClient.getNombre(tipoParticipante, numContrato, numParticipante).orElse(null);
                } catch (Exception e) {
                    log.warn("Error al resolver nombre legal para línea {}", secuencial, e);
                }
            }

            // 4. Resolver país (acentos y mayúsculas insensible)
            Integer paisId = null;
            if (linea.getPais() != null && !linea.getPais().isBlank()) {
                paisId = catalogoPaisRepository.findByPaisNombre(linea.getPais().trim())
                    .map(CatalogoPais::getPaisId)
                    .orElse(null);
                if (paisId == null) {
                    mensajes.add("País no encontrado en catálogo: '" + linea.getPais() + "'");
                }
            }

            // 5. Resolver estado (acentos y mayúsculas insensible)
            Integer estadoId = null;
            if (linea.getEstado() != null && !linea.getEstado().isBlank() && paisId != null) {
                estadoId = catalogoEstadoRepository.findByPaisIdAndEstadoNombre(paisId, linea.getEstado().trim())
                    .map(CatalogoEstado::getEstadoId)
                    .orElse(null);
                if (estadoId == null) {
                    mensajes.add("Estado no encontrado en catálogo: '" + linea.getEstado() + "'");
                }
            }

            // 6. Teléfono
            String telefono = concatTelefono(linea.getLada(), linea.getTelefono());

            // 7. Validación de longitud de campos antes del upsert (para evitar DataIntegrityViolationException genérico)
            // Se validan las longitudes de los campos que el usuario envía en el archivo antes de intentar el INSERT/UPDATE
            var validacionErrors = new ArrayList<String>();

            // dif_cve_pers: límite 20 (viene de linea.getTipoParticipante())
            if (linea.getTipoParticipante() != null && linea.getTipoParticipante().length() > 20) {
                validacionErrors.add(String.format(
                        "El campo dif_cve_pers excede la longitud máxima permitida (20 caracteres). Valor actual: %d caracteres",
                        linea.getTipoParticipante().length()));
            }

            // dif_num_pers_fid: límite 20 (viene de linea.getNumParticipante())
            if (linea.getNumParticipante() != null && linea.getNumParticipante().length() > 20) {
                validacionErrors.add(String.format(
                        "El campo dif_num_pers_fid excede la longitud máxima permitida (20 caracteres). Valor actual: %d caracteres",
                        linea.getNumParticipante().length()));
            }

            // dif_recep_no_ext: límite 20 (viene de linea.getNoExterior())
            if (linea.getNoExterior() != null && linea.getNoExterior().length() > 20) {
                validacionErrors.add(String.format(
                        "El campo dif_recep_no_ext excede la longitud máxima permitida (20 caracteres). Valor actual: %d caracteres",
                        linea.getNoExterior().length()));
            }

            // dif_recep_no_int: límite 20 (viene de linea.getNoInterior())
            if (linea.getNoInterior() != null && linea.getNoInterior().length() > 20) {
                validacionErrors.add(String.format(
                        "El campo dif_recep_no_int excede la longitud máxima permitida (20 caracteres). Valor actual: %d caracteres",
                        linea.getNoInterior().length()));
            }

            // dif_telefono: límite 20 (viene de linea.getTelefono())
            if (linea.getTelefono() != null && linea.getTelefono().length() > 20) {
                validacionErrors.add(String.format(
                        "El campo dif_telefono excede la longitud máxima permitida (20 caracteres). Valor actual: %d caracteres",
                        linea.getTelefono().length()));
            }

            if (!validacionErrors.isEmpty()) {
                String joiner = String.join("; ", validacionErrors);
                mensajes.add("Validación de longitud fallida: " + joiner);
                String mensajeFinal = truncate(joiner, 500);
                carga.setCarintMensaje(mensajeFinal.isEmpty() ? null : mensajeFinal);
                carga.setCarintEstatus("E");
                cargaInterfazRepository.save(carga);
                return new LineaDetalleDTO(secuencial, fideicomiso, rfcArchivo, rfcSistema, "E", mensajeFinal);
            }

            domicilio.setDifRecepCalle(linea.getCalle());
            domicilio.setDifRecepNoExt(linea.getNoExterior());
            domicilio.setDifRecepNoInt(linea.getNoInterior());
            domicilio.setDifRecepColonia(linea.getColonia());
            domicilio.setDifRecepLocalidad(linea.getLocalidad());
            domicilio.setDifRecepMunicipio(linea.getMunicipio());
            domicilio.setDifNumPais(paisId);
            domicilio.setDifNumEstado(estadoId);
            domicilio.setDifRecepCp(linea.getCp());
            domicilio.setDifRecepReferencia(null);
            domicilio.setDifTelefono(telefono);
            domicilio.setDifFecUltmod(ahora);
            domicilio.setDifRegimenFiscal(linea.getRegimenFiscal());
            domicilio.setDifNomLegal(nomLegal);

            try {
                upsertProcessor.upsert(domicilio);
            } catch (DataIntegrityViolationException e) {
                log.error("Error de integridad en upsert direccif para línea {}", secuencial, e);
                String msg = "Error de integridad en base de datos al guardar dirección fiscal - verifique los campos obligatorios";
                mensajes.add(msg);
                String mensajeFinal = truncate(msg, 500);
                carga.setCarintMensaje(mensajeFinal.isEmpty() ? null : mensajeFinal);
                carga.setCarintEstatus("E");
                cargaInterfazRepository.save(carga);
                return new LineaDetalleDTO(secuencial, fideicomiso, rfcArchivo, rfcSistema, "E", mensajeFinal);
            } catch (Exception e) {
                log.error("Error en upsert direccif para línea {}", secuencial, e);
                mensajes.add("Error al guardar dirección fiscal: " + e.getMessage());
            }

            String mensajeFinal = mensajes.isEmpty() ? "" : truncate(String.join("; ", mensajes), 500);
            carga.setCarintMensaje(mensajeFinal.isEmpty() ? null : mensajeFinal);

            if (!mensajes.isEmpty()) {
                carga.setCarintEstatus("E");
                cargaInterfazRepository.save(carga);
                return new LineaDetalleDTO(secuencial, fideicomiso, rfcArchivo, rfcSistema, "E", mensajeFinal);
            }

            cargaInterfazRepository.save(carga);
            return new LineaDetalleDTO(secuencial, fideicomiso, rfcArchivo, rfcSistema, "A", "");

        } catch (Exception e) {
            log.error("Error procesando línea {}", secuencial, e);
            String errorMsg = "Error interno: " + e.getMessage();
            carga.setCarintEstatus("E");
            String errorTruncado = truncate(errorMsg, 500);
            carga.setCarintMensaje(errorTruncado);
            cargaInterfazRepository.save(carga);
            return new LineaDetalleDTO(secuencial, linea.getFideicomiso(), linea.getRfcArchivo(), null, "E", errorTruncado);
        }
    }

    private static String truncate(String s, int maxLength) {
        if (s == null) return null;
        return s.length() > maxLength ? s.substring(0, maxLength) : s;
    }

    private static String concatTelefono(String lada, String telefono) {
        if ((lada == null || lada.isBlank()) && (telefono == null || telefono.isBlank())) return null;
        var sb = new StringBuilder();
        if (lada != null) sb.append(lada.trim());
        if (telefono != null) sb.append(telefono.trim());
        return sb.toString();
    }

    private static int parseIntSafe(String v) {
        if (v == null || v.isBlank()) return 0;
        try { return Integer.parseInt(v.trim()); } catch (NumberFormatException e) { return 0; }
    }


}
