package com.efisoft.direccionesfiscales.ms_cif_procesamiento.repository;

import com.efisoft.direccionesfiscales.ms_cif_procesamiento.entity.CatalogoRegimenFiscal;
import org.springframework.data.repository.Repository;

import java.util.List;

public interface CatalogoRegimenFiscalRepository extends Repository<CatalogoRegimenFiscal, Integer> {

    List<CatalogoRegimenFiscal> findAll();
}
