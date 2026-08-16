package com.efisoft.direccionesfiscales.ms_cif_procesamiento.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "catalogo_regimen_fiscal")
public class CatalogoRegimenFiscal {

    @Id
    @Column(name = "reg_clave")
    private Integer regClave;

    @Column(name = "reg_descripcion", nullable = false, length = 150)
    private String regDescripcion;

    @Column(name = "reg_aplica_fisica", nullable = false)
    private Boolean regAplicaFisica;

    @Column(name = "reg_aplica_moral", nullable = false)
    private Boolean regAplicaMoral;

    public Integer getRegClave() { return regClave; }
    public String getRegDescripcion() { return regDescripcion; }
    public Boolean getRegAplicaFisica() { return regAplicaFisica; }
    public Boolean getRegAplicaMoral() { return regAplicaMoral; }
}
