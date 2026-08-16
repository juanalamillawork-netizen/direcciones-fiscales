package com.efisoft.direccionesfiscales.ms_carga_masiva.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "catalogo_pais")
public class CatalogoPais {

    @Id
    @Column(name = "pais_id")
    private Integer paisId;

    @Column(name = "pais_nombre", nullable = false, length = 100)
    private String paisNombre;

    public Integer getPaisId() { return paisId; }
    public String getPaisNombre() { return paisNombre; }

    public void setPaisId(Integer paisId) { this.paisId = paisId; }
    public void setPaisNombre(String paisNombre) { this.paisNombre = paisNombre; }
}
