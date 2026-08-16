package com.efisoft.direccionesfiscales.ms_direcciones_fiscales.service;

import com.efisoft.direccionesfiscales.ms_direcciones_fiscales.dto.EstadoDTO;
import com.efisoft.direccionesfiscales.ms_direcciones_fiscales.dto.PaisDTO;
import com.efisoft.direccionesfiscales.ms_direcciones_fiscales.dto.RegimenFiscalDTO;
import com.efisoft.direccionesfiscales.ms_direcciones_fiscales.repository.CatalogoEstadoRepository;
import com.efisoft.direccionesfiscales.ms_direcciones_fiscales.repository.CatalogoPaisRepository;
import com.efisoft.direccionesfiscales.ms_direcciones_fiscales.repository.CatalogoRegimenFiscalRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class CatalogosService {

    private final CatalogoPaisRepository catalogoPaisRepository;
    private final CatalogoEstadoRepository catalogoEstadoRepository;
    private final CatalogoRegimenFiscalRepository catalogoRegimenFiscalRepository;

    public CatalogosService(CatalogoPaisRepository catalogoPaisRepository,
                            CatalogoEstadoRepository catalogoEstadoRepository,
                            CatalogoRegimenFiscalRepository catalogoRegimenFiscalRepository) {
        this.catalogoPaisRepository = catalogoPaisRepository;
        this.catalogoEstadoRepository = catalogoEstadoRepository;
        this.catalogoRegimenFiscalRepository = catalogoRegimenFiscalRepository;
    }

    public List<PaisDTO> listarPaises() {
        return catalogoPaisRepository.findAllByOrderByPaisNombreAsc()
            .stream()
            .map(PaisDTO::fromEntity)
            .toList();
    }

    public List<EstadoDTO> listarEstados(Integer paisId) {
        var estados = (paisId != null)
            ? catalogoEstadoRepository.findByPaisIdOrderByEstadoNombreAsc(paisId)
            : catalogoEstadoRepository.findAllByOrderByEstadoNombreAsc();
        return estados.stream()
            .map(EstadoDTO::fromEntity)
            .toList();
    }

    public List<RegimenFiscalDTO> listarRegimenesFiscales(String tipoPersona) {
        var tipo = (tipoPersona == null || tipoPersona.isBlank()) ? null : tipoPersona.trim().toUpperCase();
        if (tipo == null) {
            return catalogoRegimenFiscalRepository.findAllByOrderByRegClaveAsc()
                .stream()
                .map(RegimenFiscalDTO::fromEntity)
                .toList();
        }
        return switch (tipo) {
            case "FISICA" -> catalogoRegimenFiscalRepository.findByRegAplicaFisicaTrueOrderByRegClaveAsc()
                .stream()
                .map(RegimenFiscalDTO::fromEntity)
                .toList();
            case "MORAL" -> catalogoRegimenFiscalRepository.findByRegAplicaMoralTrueOrderByRegClaveAsc()
                .stream()
                .map(RegimenFiscalDTO::fromEntity)
                .toList();
            default -> throw new TipoPersonaInvalidaException(tipoPersona);
        };
    }

    public static class TipoPersonaInvalidaException extends RuntimeException {
        public TipoPersonaInvalidaException(String tipoPersona) {
            super("Tipo de persona inválido: '" + tipoPersona
                + "'. Valores permitidos: FISICA, MORAL");
        }
    }
}
