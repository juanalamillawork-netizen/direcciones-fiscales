package com.efisoft.direccionesfiscales.ms_direcciones_fiscales.repository;

import com.efisoft.direccionesfiscales.ms_direcciones_fiscales.entity.CatalogoRegimenFiscal;
import org.springframework.data.repository.Repository;

import java.util.List;

public interface CatalogoRegimenFiscalRepository extends Repository<CatalogoRegimenFiscal, Integer> {
    List<CatalogoRegimenFiscal> findAllByOrderByRegClaveAsc();
    List<CatalogoRegimenFiscal> findByRegAplicaFisicaTrueOrderByRegClaveAsc();
    List<CatalogoRegimenFiscal> findByRegAplicaMoralTrueOrderByRegClaveAsc();
}
