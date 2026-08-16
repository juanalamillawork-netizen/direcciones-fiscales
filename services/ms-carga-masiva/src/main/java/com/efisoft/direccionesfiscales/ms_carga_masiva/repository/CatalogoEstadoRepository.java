package com.efisoft.direccionesfiscales.ms_carga_masiva.repository;

import com.efisoft.direccionesfiscales.ms_carga_masiva.entity.CatalogoEstado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface CatalogoEstadoRepository extends JpaRepository<CatalogoEstado, Integer> {

    @Query(nativeQuery = true,
           value = "SELECT * FROM catalogo_estado WHERE pais_id = :paisId AND unaccent(upper(estado_nombre)) = unaccent(upper(:nombre))")
    Optional<CatalogoEstado> findByPaisIdAndEstadoNombre(@Param("paisId") Integer paisId, @Param("nombre") String estadoNombre);
}
