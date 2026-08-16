package com.efisoft.direccionesfiscales.ms_cif_procesamiento.repository;

import com.efisoft.direccionesfiscales.ms_cif_procesamiento.entity.CatalogoEstado;
import org.springframework.data.repository.Repository;

import java.util.List;

public interface CatalogoEstadoRepository extends Repository<CatalogoEstado, Integer> {

    List<CatalogoEstado> findAll();
}
