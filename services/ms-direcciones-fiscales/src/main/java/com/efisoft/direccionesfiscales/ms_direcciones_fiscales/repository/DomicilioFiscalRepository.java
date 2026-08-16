package com.efisoft.direccionesfiscales.ms_direcciones_fiscales.repository;

import com.efisoft.direccionesfiscales.ms_direcciones_fiscales.entity.DomicilioFiscal;
import com.efisoft.direccionesfiscales.ms_direcciones_fiscales.entity.DomicilioFiscalId;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface DomicilioFiscalRepository extends Repository<DomicilioFiscal, DomicilioFiscalId> {

    Optional<DomicilioFiscal> findById(DomicilioFiscalId id);
    DomicilioFiscal save(DomicilioFiscal entity);
    boolean existsById(DomicilioFiscalId id);
    void delete(DomicilioFiscal entity);

    @Query("""
        SELECT d FROM DomicilioFiscal d
        WHERE (:fideicomisoId IS NULL OR d.id.difNumContrato = :fideicomisoId)
          AND (:tipoPersona IS NULL OR d.id.difCvePers = :tipoPersona)
        ORDER BY d.id.difNumContrato, d.id.difCvePers, d.id.difNumPersFid
        """)
    List<DomicilioFiscal> buscarPorCriterios(
        @Param("fideicomisoId") String fideicomisoId,
        @Param("tipoPersona") String tipoPersona);
}
