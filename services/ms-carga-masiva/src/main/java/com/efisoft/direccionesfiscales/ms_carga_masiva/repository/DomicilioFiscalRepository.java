package com.efisoft.direccionesfiscales.ms_carga_masiva.repository;

import com.efisoft.direccionesfiscales.ms_carga_masiva.entity.DomicilioFiscal;
import com.efisoft.direccionesfiscales.ms_carga_masiva.entity.DomicilioFiscalId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DomicilioFiscalRepository extends JpaRepository<DomicilioFiscal, DomicilioFiscalId> {
}
