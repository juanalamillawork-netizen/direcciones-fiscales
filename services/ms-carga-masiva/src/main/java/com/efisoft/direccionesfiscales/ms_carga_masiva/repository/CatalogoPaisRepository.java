package com.efisoft.direccionesfiscales.ms_carga_masiva.repository;

import com.efisoft.direccionesfiscales.ms_carga_masiva.entity.CatalogoPais;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface CatalogoPaisRepository extends JpaRepository<CatalogoPais, Integer> {

    @Query(nativeQuery = true,
           value = "SELECT * FROM catalogo_pais WHERE unaccent(upper(pais_nombre)) = unaccent(upper(:nombre))")
    Optional<CatalogoPais> findByPaisNombre(@Param("nombre") String paisNombre);
}
