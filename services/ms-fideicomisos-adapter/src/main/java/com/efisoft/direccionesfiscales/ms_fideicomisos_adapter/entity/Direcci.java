package com.efisoft.direccionesfiscales.ms_fideicomisos_adapter.entity;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import org.hibernate.annotations.Immutable;

@Entity
@Immutable
@Table(name = "direcci")
public class Direcci {

    @EmbeddedId
    private DirecciId id;

    @Column(name = "dir_cve_tipo_domic")
    private String dirCveTipoDomic;

    @Column(name = "dir_calle_num")
    private String dirCalleNum;

    @Column(name = "dir_nom_colonia")
    private String dirNomColonia;

    @Column(name = "dir_nom_poblacion")
    private String dirNomPoblacion;

    @Column(name = "dir_nom_mun_alcaldia")
    private String dirNomMunAlcaldia;

    @Column(name = "dir_nom_estado")
    private String dirNomEstado;

    @Column(name = "dir_num_estado")
    private Short dirNumEstado;

    @Column(name = "dir_nom_pais")
    private String dirNomPais;

    @Column(name = "dir_num_pais")
    private Short dirNumPais;

    @Column(name = "dir_codigo_postal")
    private String dirCodigoPostal;

    @Column(name = "dir_nom_atencion")
    private String dirNomAtencion;

    @Column(name = "dir_cve_st_direcc")
    private String dirCveStDirecc;

    public DirecciId getId() { return id; }
    public String getDirCveTipoDomic() { return dirCveTipoDomic; }
    public String getDirCalleNum() { return dirCalleNum; }
    public String getDirNomColonia() { return dirNomColonia; }
    public String getDirNomPoblacion() { return dirNomPoblacion; }
    public String getDirNomMunAlcaldia() { return dirNomMunAlcaldia; }
    public String getDirNomEstado() { return dirNomEstado; }
    public Short getDirNumEstado() { return dirNumEstado; }
    public String getDirNomPais() { return dirNomPais; }
    public Short getDirNumPais() { return dirNumPais; }
    public String getDirCodigoPostal() { return dirCodigoPostal; }
    public String getDirNomAtencion() { return dirNomAtencion; }
    public String getDirCveStDirecc() { return dirCveStDirecc; }
}
