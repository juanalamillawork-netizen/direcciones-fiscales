package com.efisoft.direccionesfiscales.ms_carga_masiva.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "catalogo_regimen_fiscal")
public class CatalogoRegimenFiscal {

    @Id
    @Column(name = "reg_clave")
    private Integer regClave;

    @Column(name = "reg_descripcion")
    private String regDescripcion;

    @Column(name = "reg_aplica_fisica")
    private Boolean regAplicaFisica;

    @Column(name = "reg_aplica_moral")
    private Boolean regAplicaMoral;

    public Integer getRegClave() {
        return regClave;
    }

    public void setRegClave(Integer regClave) {
        this.regClave = regClave;
    }

    public String getRegDescripcion() {
        return regDescripcion;
    }

    public void setRegDescripcion(String regDescripcion) {
        this.regDescripcion = regDescripcion;
    }

    public Boolean getRegAplicaFisica() {
        return regAplicaFisica;
    }

    public void setRegAplicaFisica(Boolean regAplicaFisica) {
        this.regAplicaFisica = regAplicaFisica;
    }

    public Boolean getRegAplicaMoral() {
        return regAplicaMoral;
    }

    public void setRegAplicaMoral(Boolean regAplicaMoral) {
        this.regAplicaMoral = regAplicaMoral;
    }
}