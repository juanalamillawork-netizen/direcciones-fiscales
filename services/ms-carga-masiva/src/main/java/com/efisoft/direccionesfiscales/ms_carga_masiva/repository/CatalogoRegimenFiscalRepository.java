package com.efisoft.direccionesfiscales.ms_carga_masiva.repository;

import com.efisoft.direccionesfiscales.ms_carga_masiva.entity.CatalogoRegimenFiscal;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CatalogoRegimenFiscalRepository
        extends JpaRepository<CatalogoRegimenFiscal, Integer> {
}