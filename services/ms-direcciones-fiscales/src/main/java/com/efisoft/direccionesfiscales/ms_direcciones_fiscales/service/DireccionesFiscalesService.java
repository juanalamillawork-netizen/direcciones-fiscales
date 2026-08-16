package com.efisoft.direccionesfiscales.ms_direcciones_fiscales.service;

import com.efisoft.direccionesfiscales.ms_direcciones_fiscales.client.FideicomisoClient;
import com.efisoft.direccionesfiscales.ms_direcciones_fiscales.dto.ActualizarDomicilioFiscalRequest;
import com.efisoft.direccionesfiscales.ms_direcciones_fiscales.dto.CrearDomicilioFiscalRequest;
import com.efisoft.direccionesfiscales.ms_direcciones_fiscales.dto.DomicilioFiscalDTO;
import com.efisoft.direccionesfiscales.ms_direcciones_fiscales.entity.DomicilioFiscal;
import com.efisoft.direccionesfiscales.ms_direcciones_fiscales.entity.DomicilioFiscalId;
import com.efisoft.direccionesfiscales.ms_direcciones_fiscales.repository.CatalogoEstadoRepository;
import com.efisoft.direccionesfiscales.ms_direcciones_fiscales.repository.CatalogoPaisRepository;
import com.efisoft.direccionesfiscales.ms_direcciones_fiscales.repository.DomicilioFiscalRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class DireccionesFiscalesService {

    private final DomicilioFiscalRepository repository;
    private final CatalogoPaisRepository catalogoPaisRepository;
    private final CatalogoEstadoRepository catalogoEstadoRepository;
    private final FideicomisoClient fideicomisoClient;

    public DireccionesFiscalesService(DomicilioFiscalRepository repository,
                                      CatalogoPaisRepository catalogoPaisRepository,
                                      CatalogoEstadoRepository catalogoEstadoRepository,
                                      FideicomisoClient fideicomisoClient) {
        this.repository = repository;
        this.catalogoPaisRepository = catalogoPaisRepository;
        this.catalogoEstadoRepository = catalogoEstadoRepository;
        this.fideicomisoClient = fideicomisoClient;
    }

    public List<DomicilioFiscalDTO> buscarPorCriterios(String fideicomisoId, String tipoPersona) {
        var fid = (fideicomisoId == null || fideicomisoId.isBlank()) ? null : fideicomisoId;
        var tp = (tipoPersona == null || tipoPersona.isBlank()) ? null : tipoPersona;
        return repository.buscarPorCriterios(fid, tp)
            .stream()
            .map(DomicilioFiscalDTO::fromEntity)
            .toList();
    }

    public Optional<DomicilioFiscalDTO> findById(String numContrato, String cvePers, String numPersFid) {
        return repository.findById(new DomicilioFiscalId(numContrato, cvePers, numPersFid))
            .map(DomicilioFiscalDTO::fromEntity);
    }

    public DomicilioFiscalDTO crear(CrearDomicilioFiscalRequest request) {
        var id = new DomicilioFiscalId(
            request.fideicomisoId(), request.tipoPersona().name(), request.numeroParticipante());

        if (repository.existsById(id)) {
            throw new DuplicateKeyException(id);
        }

        validarCatalogos(request.paisId(), request.estadoId());

        var nombreLegal = fideicomisoClient.getNombre(
            request.tipoPersona().name(), request.fideicomisoId(), request.numeroParticipante())
            .orElse(null);

        var entity = new DomicilioFiscal();
        entity.setId(id);
        aplicarCamposEditables(entity, nombreLegal, request.calle(),
            request.numeroExterior(), request.numeroInterior(), request.colonia(),
            request.municipio(), request.localidad(), request.paisId(), request.estadoId(),
            request.codigoPostal(), request.referencia(), request.telefono(), request.regimenFiscal(),
            request.correoElectronico());

        var now = LocalDateTime.now();
        entity.setDifFecAlta(now);
        entity.setDifFecUltmod(now);

        return DomicilioFiscalDTO.fromEntity(repository.save(entity));
    }

    public void eliminar(String numContrato, String cvePers, String numPersFid) {
        var id = new DomicilioFiscalId(numContrato, cvePers, numPersFid);

        var entity = repository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(id));

        repository.delete(entity);
    }

    public DomicilioFiscalDTO actualizar(String numContrato, String cvePers, String numPersFid,
                                          ActualizarDomicilioFiscalRequest request) {
        var id = new DomicilioFiscalId(numContrato, cvePers, numPersFid);

        var entity = repository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(id));

        validarCatalogos(request.paisId(), request.estadoId());

        var nombreLegal = fideicomisoClient.getNombre(cvePers, numContrato, numPersFid)
            .orElse(null);

        aplicarCamposEditables(entity, nombreLegal, request.calle(),
            request.numeroExterior(), request.numeroInterior(), request.colonia(),
            request.municipio(), request.localidad(), request.paisId(), request.estadoId(),
            request.codigoPostal(), request.referencia(), request.telefono(), request.regimenFiscal(),
            request.correoElectronico());

        entity.setDifFecUltmod(LocalDateTime.now());

        return DomicilioFiscalDTO.fromEntity(repository.save(entity));
    }

    private void validarCatalogos(Integer paisId, Integer estadoId) {
        if (!catalogoPaisRepository.existsById(paisId)) {
            throw new CatalogoNotFoundException("pais", paisId);
        }
        if (!catalogoEstadoRepository.existsById(estadoId)) {
            throw new CatalogoNotFoundException("estado", estadoId);
        }
    }

    private void aplicarCamposEditables(DomicilioFiscal entity, String nombreLegal,
                                         String calle, String noExt, String noInt,
                                         String colonia, String municipio, String localidad,
                                         Integer paisId, Integer estadoId, String cp,
                                         String referencia, String telefono, String regimenFiscal,
                                         String correoElectronico) {
        entity.setDifNomLegal(nombreLegal);
        entity.setDifRecepCalle(calle);
        entity.setDifRecepNoExt(noExt);
        entity.setDifRecepNoInt(noInt);
        entity.setDifRecepColonia(colonia);
        entity.setDifRecepMunicipio(municipio);
        entity.setDifRecepLocalidad(localidad);
        entity.setDifNumPais(paisId);
        entity.setDifNumEstado(estadoId);
        entity.setDifRecepCp(cp);
        entity.setDifRecepReferencia(referencia);
        entity.setDifTelefono(telefono);
        entity.setDifRegimenFiscal(regimenFiscal);
        entity.setDifMail(correoElectronico);
    }

    public static class DuplicateKeyException extends RuntimeException {
        private final DomicilioFiscalId id;
        public DuplicateKeyException(DomicilioFiscalId id) {
            super("Ya existe un domicilio fiscal con la llave Fideicomiso=" + id.getDifNumContrato()
                + ", Tipo de Participante=" + id.getDifCvePers()
                + ", No. Participante=" + id.getDifNumPersFid());
            this.id = id;
        }
        public DomicilioFiscalId getId() { return id; }
    }

    public static class ResourceNotFoundException extends RuntimeException {
        private final DomicilioFiscalId id;
        public ResourceNotFoundException(DomicilioFiscalId id) {
            super("No se encontró el domicilio fiscal con la llave Fideicomiso=" + id.getDifNumContrato()
                + ", Tipo de Participante=" + id.getDifCvePers()
                + ", No. Participante=" + id.getDifNumPersFid());
            this.id = id;
        }
        public DomicilioFiscalId getId() { return id; }
    }

    public static class CatalogoNotFoundException extends RuntimeException {
        public CatalogoNotFoundException(String catalogo, Integer id) {
            super("El valor " + id + " no existe en el catálogo de " + catalogo);
        }
    }
}
