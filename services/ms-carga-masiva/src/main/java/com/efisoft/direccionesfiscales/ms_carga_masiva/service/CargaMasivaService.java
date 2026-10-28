package com.efisoft.direccionesfiscales.ms_carga_masiva.service;

import com.efisoft.direccionesfiscales.ms_carga_masiva.client.FideicomisoClient;
import com.efisoft.direccionesfiscales.ms_carga_masiva.dto.LineaArchivoDTO;
import com.efisoft.direccionesfiscales.ms_carga_masiva.dto.LineaDetalleDTO;
import com.efisoft.direccionesfiscales.ms_carga_masiva.dto.LoteDetalleDTO;
import com.efisoft.direccionesfiscales.ms_carga_masiva.dto.NombreDTO;
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
import java.util.UUID;

@Service
public class CargaMasivaService {

    private static final Logger log = LoggerFactory.getLogger(CargaMasivaService.class);

    private static final Map<String, String> ETIQUETAS = Map.ofEntries(
            Map.entry("fideicomiso", "Fideicomiso"),
            Map.entry("tipoParticipante", "Tipo de participante"),
            Map.entry("numeroParticipante", "Número de participante"),
            Map.entry("rfc", "RFC"),
            Map.entry("telefono", "Teléfono"),
            Map.entry("correoElectronico", "Correo electrónico"),
            Map.entry("calle", "Calle"),
            Map.entry("numeroExterior", "Número exterior"),
            Map.entry("numeroInterior", "Número interior"),
            Map.entry("colonia", "Colonia"),
            Map.entry("municipio", "Municipio"),
            Map.entry("localidad", "Localidad"),
            Map.entry("codigoPostal", "Código Postal"),
            Map.entry("pais", "País"),
            Map.entry("estado", "Estado"),
            Map.entry("regimenFiscal", "Régimen Fiscal"),
            Map.entry("referencia", "Referencia"),
            Map.entry("nombreLegal", "Nombre legal")
    );

    private final ArchivoParser archivoParser;
    private final FideicomisoClient fideicomisoClient;
    private final CargaInterfazRepository cargaInterfazRepository;
    private final DomicilioFiscalRepository domicilioFiscalRepository;
    private final CatalogoPaisRepository catalogoPaisRepository;
    private final CatalogoEstadoRepository catalogoEstadoRepository;
    private final CatalogoRegimenFiscalRepository catalogoRegimenFiscalRepository;
    private final UpsertProcessor upsertProcessor;

    public CargaMasivaService(ArchivoParser archivoParser, FideicomisoClient fideicomisoClient,
                              CargaInterfazRepository cargaInterfazRepository,
                              DomicilioFiscalRepository domicilioFiscalRepository,
                              CatalogoPaisRepository catalogoPaisRepository,
                              CatalogoEstadoRepository catalogoEstadoRepository,
                              CatalogoRegimenFiscalRepository catalogoRegimenFiscalRepository,
                              UpsertProcessor upsertProcessor) {
        this.archivoParser = archivoParser;
        this.fideicomisoClient = fideicomisoClient;
        this.cargaInterfazRepository = cargaInterfazRepository;
        this.domicilioFiscalRepository = domicilioFiscalRepository;
        this.catalogoPaisRepository = catalogoPaisRepository;
        this.catalogoEstadoRepository = catalogoEstadoRepository;
        this.catalogoRegimenFiscalRepository = catalogoRegimenFiscalRepository;
        this.upsertProcessor = upsertProcessor;
    }

    @Transactional
    public LoteDetalleDTO procesarArchivo(String nombreArchivo, InputStream inputStream, String numUsuario) throws IOException {
        var lineas = archivoParser.parse(inputStream);
        var ahora = LocalDateTime.now();
        var loteId = "LOTE-" + UUID.randomUUID();
        var resultados = new ArrayList<LineaDetalleDTO>();
        int exitosos = 0, errores = 0;

        for (int i = 0; i < lineas.size(); i++) {
            var linea = lineas.get(i);
            var secuencial = i + 1;
            var result = procesarLinea(linea, secuencial, loteId, nombreArchivo, numUsuario, ahora);
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
                .map(CargaMasivaService::fromCarga)
                .collect(Collectors.toList());

        long exitosos = registros.stream().filter(r -> "A".equals(r.getCarintEstatus())).count();
        long errores = registros.size() - exitosos;

        return new LoteDetalleDTO(loteId, registros.size(), (int) exitosos, (int) errores, lineas);
    }

    private static LineaDetalleDTO fromCarga(CargaInterfaz c) {
        String[] p = c.getCarintCadena() != null
                ? c.getCarintCadena().split("\\|", -1)
                : new String[0];
        String fideicomiso = p.length > 0 ? trimToNull(p[0]) : null;
        String rfc         = p.length > 3 ? trimToNull(p[3]) : null;
        String calle       = p.length > 6 ? trimToNull(p[6]) : null;
        String noExt       = p.length > 7 ? trimToNull(p[7]) : null;
        String nombreLegal = p.length > 17 ? trimToNull(p[17]) : null;

        String visible = calcularRegistroVisible(rfc, nombreLegal, calle, noExt);
        String mensaje = c.getCarintMensaje() != null ? c.getCarintMensaje() : "";

        return new LineaDetalleDTO(
                c.getCarintSecuencial(), visible, fideicomiso, rfc,
                null, c.getCarintEstatus(), mensaje);
    }

    private static String trimToNull(String s) {
        if (s == null) return null;
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }

    private static String cargarLoteId(CargaInterfaz c) {
        // Nuevo formato: UUID guardado en carint_nom_path
        if (c.getCarintNomPath() != null && !c.getCarintNomPath().isBlank()) {
           return c.getCarintNomPath();
        }

        return c.getCarintNomArch() + "_"
                + c.getCarintFecha().toString().replace(":", "-").replace(".", "-");
    }

    private LineaDetalleDTO procesarLinea(LineaArchivoDTO linea, int secuencial, String loteId, String nombreArchivo,
                                          String numUsuario, LocalDateTime ahora) {

        // 1. Insertar carga_interfaz
        var carga = new CargaInterfaz();
        carga.setCarintNumUsuario(numUsuario);
        carga.setCarintFecha(ahora);
        carga.setCarintSecuencial(secuencial);
        carga.setCarintNomPath(loteId);
        carga.setCarintNomArch(nombreArchivo);
        carga.setCarintCadena(linea.getCadenaOriginal());
        cargaInterfazRepository.save(carga);

        try {
            String rfcArchivo = linea.getRfcArchivo();
            String rfcSistema = null;
            var fideicomiso = linea.getFideicomiso();
            String numContrato = fideicomiso;
            int numParticipante = parseIntSafe(linea.getNumParticipante());
            String tipoParticipante = linea.getTipoParticipante();

            // 2. Validar campos obligatorios
            var erroresObligatorios = validarCamposObligatorios(linea);
            if (!erroresObligatorios.isEmpty()) {
                String mensajeFinal = truncate(String.join("; ", erroresObligatorios), 500);
                carga.setCarintMensaje(mensajeFinal);
                carga.setCarintEstatus("E");
                cargaInterfazRepository.save(carga);
                return linea(secuencial, linea, null, "E", mensajeFinal);
            }

            // 3. Validación de longitudes y formatos
            var validacionErrors = new ArrayList<String>();

            if (linea.getFideicomiso() != null && linea.getFideicomiso().length() > 10) {
                validacionErrors.add(String.format(
                        "El campo dif_num_contrato excede la longitud máxima permitida (10 caracteres). Valor actual: %d caracteres",
                        linea.getFideicomiso().length()));
            }

            if (fideicomiso == null || !fideicomiso.matches("^[1-9]\\d{0,9}$")) {
                validacionErrors.add("El número de contrato debe tener entre 1 y 10 dígitos y no comenzar con cero.");
            }

            if (linea.getTipoParticipante() != null && linea.getTipoParticipante().length() > 20) {
                validacionErrors.add(String.format(
                        "El campo dif_cve_pers excede la longitud máxima permitida (20 caracteres). Valor actual: %d caracteres",
                        linea.getTipoParticipante().length()));
            }

            if (linea.getNumParticipante() != null && linea.getNumParticipante().length() > 20) {
                validacionErrors.add(String.format(
                        "El campo dif_num_pers_fid excede la longitud máxima permitida (20 caracteres). Valor actual: %d caracteres",
                        linea.getNumParticipante().length()));
            }

            if (linea.getTelefono() == null || !linea.getTelefono().matches("^\\d{10}$")) {
                validacionErrors.add("El teléfono debe contener exactamente 10 dígitos consecutivos. Valor actual: '"
                        + linea.getTelefono() + "'");
            }

            if (linea.getCalle() != null && linea.getCalle().length() > 150) {
                validacionErrors.add(String.format(
                        "El campo dif_recep_calle excede la longitud máxima permitida (150 caracteres). Valor actual: %d caracteres",
                        linea.getCalle().length()));
            }

            if (linea.getNoExterior() != null && linea.getNoExterior().length() > 20) {
                validacionErrors.add(String.format(
                        "El campo dif_recep_no_ext excede la longitud máxima permitida (20 caracteres). Valor actual: %d caracteres",
                        linea.getNoExterior().length()));
            }

            if (linea.getNoInterior() != null && linea.getNoInterior().length() > 20) {
                validacionErrors.add(String.format(
                        "El campo dif_recep_no_int excede la longitud máxima permitida (20 caracteres). Valor actual: %d caracteres",
                        linea.getNoInterior().length()));
            }

            if (linea.getColonia() != null && linea.getColonia().length() > 150) {
                validacionErrors.add(String.format(
                        "El campo dif_recep_colonia excede la longitud máxima permitida (150 caracteres). Valor actual: %d caracteres",
                        linea.getColonia().length()));
            }

            if (linea.getMunicipio() != null && linea.getMunicipio().length() > 150) {
                validacionErrors.add(String.format(
                        "El campo dif_recep_municipio excede la longitud máxima permitida (150 caracteres). Valor actual: %d caracteres",
                        linea.getMunicipio().length()));
            }

            if (linea.getLocalidad() != null && linea.getLocalidad().length() > 150) {
                validacionErrors.add(String.format(
                        "El campo dif_recep_localidad excede la longitud máxima permitida (150 caracteres). Valor actual: %d caracteres",
                        linea.getLocalidad().length()));
            }

            if (linea.getCp() == null || !linea.getCp().matches("^\\d{5}$")) {
                validacionErrors.add("El código postal debe tener exactamente 5 dígitos. Valor actual: '"
                        + linea.getCp() + "'");
            } else {
                int cp = Integer.parseInt(linea.getCp());
                if (cp < 1000 || cp > 99999) {
                    validacionErrors.add("El código postal debe estar entre 01000 y 99999. Valor actual: '"
                            + linea.getCp() + "'");
                }
            }

            if (linea.getCorreoElectronico() != null && !linea.getCorreoElectronico().isBlank()) {
                if (!linea.getCorreoElectronico().matches(
                        "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")) {
                    validacionErrors.add("El correo electrónico no tiene un formato válido. Valor actual: '"
                            + linea.getCorreoElectronico() + "'");
                }
            }

            if (linea.getRegimenFiscal() != null && !linea.getRegimenFiscal().matches("^\\d{3}$")) {
                validacionErrors.add("El régimen fiscal debe tener exactamente 3 dígitos. Valor actual: '"
                        + linea.getRegimenFiscal() + "'");
            }

            if (linea.getReferencia() != null && linea.getReferencia().length() > 250) {
                validacionErrors.add(String.format(
                        "El campo dif_recep_referencia excede la longitud máxima permitida (250 caracteres). Valor actual: %d caracteres",
                        linea.getReferencia().length()));
            }

            if (linea.getNombreLegal() != null && linea.getNombreLegal().length() > 250) {
                validacionErrors.add(String.format(
                        "El campo dif_nom_legal excede la longitud máxima permitida (250 caracteres). Valor actual: %d caracteres",
                        linea.getNombreLegal().length()));
            }

            if (!validacionErrors.isEmpty()) {
                String mensajeFinal = truncate(String.join("; ", validacionErrors), 500);
                carga.setCarintMensaje(mensajeFinal.isEmpty() ? null : mensajeFinal);
                carga.setCarintEstatus("E");
                cargaInterfazRepository.save(carga);
                return linea(secuencial, linea, null, "E", mensajeFinal);
            }

            // 4. Validar RFC contra fideicomisos-adapter
            if (rfcArchivo != null && !rfcArchivo.isBlank()) {
                rfcSistema = fideicomisoClient.getRfc(tipoParticipante, numContrato, numParticipante).orElse(null);
                log.info("DEBUG_RFC_VALIDACION - Campo5_RFC: '{}', rfcSistema: '{}', es_null: {}",
                        rfcArchivo, rfcSistema, rfcSistema == null);
                if (rfcSistema == null) {
                    validacionErrors.add("Participante no encontrado para el Fideicomiso especificado.");
                } else if (!rfcSistema.equalsIgnoreCase(rfcArchivo.trim())) {
                    validacionErrors.add("RFC no coincide: archivo='" + rfcArchivo + "' sistema='" + rfcSistema + "'.");
                }
            }

            if (!validacionErrors.isEmpty()) {
                String mensajeFinal = truncate(String.join("; ", validacionErrors), 500);
                carga.setCarintMensaje(mensajeFinal);
                carga.setCarintEstatus("E");
                cargaInterfazRepository.save(carga);
                return linea(secuencial, linea, rfcSistema, "E", mensajeFinal);
            }

            // 5. Resolver nombre legal y tipo de persona
            String nomLegal = null;
            String tipoPersona = null;

            if (numContrato != null && !numContrato.isBlank()) {
                try {
                    NombreDTO nombreDTO = fideicomisoClient.getNombre(
                            tipoParticipante, fideicomiso, numParticipante).orElse(null);

                    if (nombreDTO != null) {
                        nomLegal = nombreDTO.getNombre();
                        tipoPersona = nombreDTO.getTipoPersona();
                        log.info("Participante resuelto - contrato={}, tipoParticipante={}, participante={}, nombre={}, tipoPersona={}",
                                fideicomiso, tipoParticipante, numParticipante, nomLegal, tipoPersona);
                    }
                } catch (Exception e) {
                    log.warn("Error al resolver nombre legal para línea {}", secuencial, e);
                    validacionErrors.add("Error al resolver nombre legal del participante.");
                }
            }

            // 6. Validar país
            Integer paisId = parseIntSafe(linea.getPais());
            if (paisId <= 0 || !catalogoPaisRepository.existsById(paisId)) {
                validacionErrors.add("País no encontrado en catálogo: '" + linea.getPais() + "'.");
                paisId = null;
            }

            // 7. Validar estado
            Integer estadoId = parseIntSafe(linea.getEstado());
            if (paisId != null) {
                if (estadoId <= 0 || catalogoEstadoRepository
                        .findByPaisIdAndEstadoId(paisId, estadoId).isEmpty()) {
                    validacionErrors.add("Estado no encontrado en catálogo para el país indicado: '"
                            + linea.getEstado() + "'.");
                    estadoId = null;
                }
            } else {
                estadoId = null;
            }

            // 8. Validar régimen fiscal
            Integer regimenFiscalId = parseIntSafe(linea.getRegimenFiscal());
            if (regimenFiscalId <= 0 || !catalogoRegimenFiscalRepository.existsById(regimenFiscalId)) {
                validacionErrors.add("Régimen fiscal no encontrado en catálogo: '"
                        + linea.getRegimenFiscal() + "'.");
            }

            if (!validacionErrors.isEmpty()) {
                String mensajeFinal = truncate(String.join("; ", validacionErrors), 500);
                carga.setCarintMensaje(mensajeFinal.isEmpty() ? null : mensajeFinal);
                carga.setCarintEstatus("E");
                cargaInterfazRepository.save(carga);
                return linea(secuencial, linea, rfcSistema, "E", mensajeFinal);
            }

            // 9. Detección de duplicado
            String telefono = linea.getTelefono();
            var id = new DomicilioFiscalId(fideicomiso, tipoParticipante, linea.getNumParticipante());

            if (domicilioFiscalRepository.findById(id).isPresent()) {
                String msg = "La dirección ya se encuentra registrada para el participante.";
                carga.setCarintMensaje(msg);
                carga.setCarintEstatus("E");
                cargaInterfazRepository.save(carga);
                return linea(secuencial, linea, rfcSistema, "E", msg);
            }

            // 10. Construir domicilio nuevo y hacer upsert
            var domicilio = new DomicilioFiscal();
            domicilio.setId(id);
            domicilio.setDifFecAlta(ahora);
            domicilio.setDifRecepCalle(linea.getCalle());
            domicilio.setDifRecepNoExt(linea.getNoExterior());
            domicilio.setDifRecepNoInt(linea.getNoInterior());
            domicilio.setDifRecepColonia(linea.getColonia());
            domicilio.setDifRecepLocalidad(linea.getLocalidad());
            domicilio.setDifRecepMunicipio(linea.getMunicipio());
            domicilio.setDifNumPais(paisId);
            domicilio.setDifNumEstado(estadoId);
            domicilio.setDifRecepCp(linea.getCp());
            domicilio.setDifRecepReferencia(linea.getReferencia());
            domicilio.setDifTelefono(telefono);
            domicilio.setDifFecUltmod(ahora);
            domicilio.setDifRegimenFiscal(linea.getRegimenFiscal());
            domicilio.setDifNomLegal((nomLegal != null && !nomLegal.isBlank()) ? nomLegal : linea.getNombreLegal());

            try {
                upsertProcessor.upsert(domicilio);
            } catch (DataIntegrityViolationException e) {
                log.error("Error de integridad en upsert direccif para línea {}", secuencial, e);
                String msg = "Error de integridad en base de datos al guardar dirección fiscal - verifique los campos obligatorios.";
                carga.setCarintMensaje(truncate(msg, 500));
                carga.setCarintEstatus("E");
                cargaInterfazRepository.save(carga);
                return linea(secuencial, linea, rfcSistema, "E", msg);
            } catch (Exception e) {
                log.error("Error en upsert direccif para línea {}", secuencial, e);
                String msg = "Error al guardar dirección fiscal: " + e.getMessage();
                carga.setCarintMensaje(truncate(msg, 500));
                carga.setCarintEstatus("E");
                cargaInterfazRepository.save(carga);
                return linea(secuencial, linea, rfcSistema, "E", msg);
            }

            carga.setCarintMensaje(null);
            carga.setCarintEstatus("A");
            cargaInterfazRepository.save(carga);
            return linea(secuencial, linea, rfcSistema, "A", "");

        } catch (Exception e) {
            log.error("Error procesando línea {}", secuencial, e);
            String errorTruncado = truncate("Error interno: " + e.getMessage(), 500);
            carga.setCarintEstatus("E");
            carga.setCarintMensaje(errorTruncado);
            cargaInterfazRepository.save(carga);
            return linea(secuencial, linea, null, "E", errorTruncado);
        }
    }

    private List<String> validarCamposObligatorios(LineaArchivoDTO linea) {
        var errores = new ArrayList<String>();
        validarCampo(errores, "fideicomiso", linea.getFideicomiso());
        validarCampo(errores, "tipoParticipante", linea.getTipoParticipante());
        validarCampo(errores, "numeroParticipante", linea.getNumParticipante());
        validarCampo(errores, "rfc", linea.getRfcArchivo());
        validarCampo(errores, "telefono", linea.getTelefono());
        validarCampo(errores, "calle", linea.getCalle());
        validarCampo(errores, "numeroExterior", linea.getNoExterior());
        validarCampo(errores, "colonia", linea.getColonia());
        validarCampo(errores, "municipio", linea.getMunicipio());
        validarCampo(errores, "codigoPostal", linea.getCp());
        validarCampo(errores, "pais", linea.getPais());
        validarCampo(errores, "estado", linea.getEstado());
        validarCampo(errores, "regimenFiscal", linea.getRegimenFiscal());
        return errores;
    }

    private void validarCampo(List<String> errores, String nombreCampo, String valor) {
        if (valor == null || valor.isBlank()) {
            errores.add("El campo '" + ETIQUETAS.getOrDefault(nombreCampo, nombreCampo)
                    + "' es obligatorio.");
        }
    }

    private static String calcularRegistroVisible(String rfc, String nombreLegal,
                                                  String calle, String noExterior) {
        if (rfc != null && !rfc.isBlank()) return "RFC: " + rfc.trim();
        if (nombreLegal != null && !nombreLegal.isBlank()) return nombreLegal.trim();
        if (calle != null && !calle.isBlank()) {
            return (noExterior != null && !noExterior.isBlank())
                    ? calle.trim() + " " + noExterior.trim()
                    : calle.trim();
        }
        return "(sin datos)";
    }

    /** Construye un LineaDetalleDTO calculando registroVisible a partir de la línea del archivo. */
    private static LineaDetalleDTO linea(int numLinea, LineaArchivoDTO l,
                                         String rfcSistema, String estatus, String mensaje) {
        String visible = calcularRegistroVisible(
                l.getRfcArchivo(), l.getNombreLegal(), l.getCalle(), l.getNoExterior());
        return new LineaDetalleDTO(
                numLinea, visible,
                l.getFideicomiso(), l.getRfcArchivo(), rfcSistema,
                estatus, mensaje);
    }

    private static String truncate(String s, int maxLength) {
        if (s == null) return null;
        return s.length() > maxLength ? s.substring(0, maxLength) : s;
    }

    private static int parseIntSafe(String v) {
        if (v == null || v.isBlank()) return 0;
        try { return Integer.parseInt(v.trim()); } catch (NumberFormatException e) { return 0; }
    }
}