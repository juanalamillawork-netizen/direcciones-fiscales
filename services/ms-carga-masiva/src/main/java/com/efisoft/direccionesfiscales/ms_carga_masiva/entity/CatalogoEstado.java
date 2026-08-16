package com.efisoft.direccionesfiscales.ms_carga_masiva.entity;

import jakarta.persistence.*;

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

    public void setEstadoId(Integer estadoId) { this.estadoId = estadoId; }
    public void setEstadoNombre(String estadoNombre) { this.estadoNombre = estadoNombre; }
    public void setPaisId(Integer paisId) { this.paisId = paisId; }
}
