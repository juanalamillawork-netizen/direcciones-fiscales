package com.efisoft.direccionesfiscales.ms_carga_masiva.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "direccif")
public class DomicilioFiscal {

    @EmbeddedId
    private DomicilioFiscalId id;

    @Column(name = "dif_recep_calle", length = 150)
    private String difRecepCalle;

    @Column(name = "dif_recep_no_ext", length = 20)
    private String difRecepNoExt;

    @Column(name = "dif_recep_no_int", length = 20)
    private String difRecepNoInt;

    @Column(name = "dif_recep_colonia", length = 150)
    private String difRecepColonia;

    @Column(name = "dif_recep_localidad", length = 150)
    private String difRecepLocalidad;

    @Column(name = "dif_recep_municipio", length = 150)
    private String difRecepMunicipio;

    @Column(name = "dif_num_pais")
    private Integer difNumPais;

    @Column(name = "dif_num_estado")
    private Integer difNumEstado;

    @Column(name = "dif_recep_cp", length = 5)
    private String difRecepCp;

    @Column(name = "dif_recep_referencia", length = 250)
    private String difRecepReferencia;

    @Column(name = "dif_telefono", length = 20)
    private String difTelefono;

    @Column(name = "dif_fec_alta", nullable = false)
    private LocalDateTime difFecAlta;

    @Column(name = "dif_fec_ultmod", nullable = false)
    private LocalDateTime difFecUltmod;

    @Column(name = "dif_regimen_fiscal", length = 100)
    private String difRegimenFiscal;

    @Column(name = "dif_nom_legal", length = 250)
    private String difNomLegal;

    public DomicilioFiscalId getId() { return id; }
    public String getDifRecepCalle() { return difRecepCalle; }
    public String getDifRecepNoExt() { return difRecepNoExt; }
    public String getDifRecepNoInt() { return difRecepNoInt; }
    public String getDifRecepColonia() { return difRecepColonia; }
    public String getDifRecepLocalidad() { return difRecepLocalidad; }
    public String getDifRecepMunicipio() { return difRecepMunicipio; }
    public Integer getDifNumPais() { return difNumPais; }
    public Integer getDifNumEstado() { return difNumEstado; }
    public String getDifRecepCp() { return difRecepCp; }
    public String getDifRecepReferencia() { return difRecepReferencia; }
    public String getDifTelefono() { return difTelefono; }
    public LocalDateTime getDifFecAlta() { return difFecAlta; }
    public LocalDateTime getDifFecUltmod() { return difFecUltmod; }
    public String getDifRegimenFiscal() { return difRegimenFiscal; }
    public String getDifNomLegal() { return difNomLegal; }

    public void setId(DomicilioFiscalId id) { this.id = id; }
    public void setDifRecepCalle(String v) { this.difRecepCalle = v; }
    public void setDifRecepNoExt(String v) { this.difRecepNoExt = v; }
    public void setDifRecepNoInt(String v) { this.difRecepNoInt = v; }
    public void setDifRecepColonia(String v) { this.difRecepColonia = v; }
    public void setDifRecepLocalidad(String v) { this.difRecepLocalidad = v; }
    public void setDifRecepMunicipio(String v) { this.difRecepMunicipio = v; }
    public void setDifNumPais(Integer v) { this.difNumPais = v; }
    public void setDifNumEstado(Integer v) { this.difNumEstado = v; }
    public void setDifRecepCp(String v) { this.difRecepCp = v; }
    public void setDifRecepReferencia(String v) { this.difRecepReferencia = v; }
    public void setDifTelefono(String v) { this.difTelefono = v; }
    public void setDifFecAlta(LocalDateTime v) { this.difFecAlta = v; }
    public void setDifFecUltmod(LocalDateTime v) { this.difFecUltmod = v; }
    public void setDifRegimenFiscal(String v) { this.difRegimenFiscal = v; }
    public void setDifNomLegal(String v) { this.difNomLegal = v; }
}
