package com.efisoft.direccionesfiscales.ms_cif_procesamiento.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "catalogo_estado")
public class CatalogoEstado {

    @Id
    @Column(name = "estado_id")
    private Integer estadoId;

    @Column(name = "estado_nombre", nullable = false, length = 100)
    private String estadoNombre;

    @Column(name = "pais_id", nullable = false)
    private Integer paisId;

    public Integer getEstadoId() { return estadoId; }
    public String getEstadoNombre() { return estadoNombre; }
    public Integer getPaisId() { return paisId; }
}
