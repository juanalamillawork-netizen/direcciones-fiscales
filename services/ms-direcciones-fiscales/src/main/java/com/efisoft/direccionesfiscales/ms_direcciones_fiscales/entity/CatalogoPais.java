package com.efisoft.direccionesfiscales.ms_direcciones_fiscales.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

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
}
