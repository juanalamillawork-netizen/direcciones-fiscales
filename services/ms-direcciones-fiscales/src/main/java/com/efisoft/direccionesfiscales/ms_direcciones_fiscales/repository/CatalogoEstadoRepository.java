package com.efisoft.direccionesfiscales.ms_direcciones_fiscales.repository;

import com.efisoft.direccionesfiscales.ms_direcciones_fiscales.entity.CatalogoEstado;
import org.springframework.data.repository.Repository;

import java.util.List;

public interface CatalogoEstadoRepository extends Repository<CatalogoEstado, Integer> {
    boolean existsById(Integer id);
    List<CatalogoEstado> findAllByOrderByEstadoNombreAsc();
    List<CatalogoEstado> findByPaisIdOrderByEstadoNombreAsc(Integer paisId);
}
