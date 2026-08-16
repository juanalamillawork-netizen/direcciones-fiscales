package com.efisoft.direccionesfiscales.ms_direcciones_fiscales.repository;

import com.efisoft.direccionesfiscales.ms_direcciones_fiscales.entity.CatalogoPais;
import org.springframework.data.repository.Repository;

import java.util.List;

public interface CatalogoPaisRepository extends Repository<CatalogoPais, Integer> {
    boolean existsById(Integer id);
    List<CatalogoPais> findAllByOrderByPaisNombreAsc();
}
