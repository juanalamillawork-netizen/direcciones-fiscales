package com.efisoft.direccionesfiscales.ms_cif_procesamiento.repository;

import com.efisoft.direccionesfiscales.ms_cif_procesamiento.entity.CatalogoPais;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface CatalogoPaisRepository extends Repository<CatalogoPais, Integer> {

    @Query("SELECT p FROM CatalogoPais p WHERE LOWER(p.paisNombre) = LOWER(:nombre)")
    Optional<CatalogoPais> findByNombreNormalizado(@Param("nombre") String nombre);
}
