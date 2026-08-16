package com.efisoft.direccionesfiscales.ms_direcciones_fiscales.entity;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "direccif")
public class DomicilioFiscal {

    @EmbeddedId
    private DomicilioFiscalId id;

    @Column(name = "dif_recep_calle", length = 150, nullable = false)
    private String difRecepCalle;

    @Column(name = "dif_recep_no_ext", length = 20, nullable = false)
    private String difRecepNoExt;

    @Column(name = "dif_recep_no_int", length = 20)
    private String difRecepNoInt;

    @Column(name = "dif_recep_colonia", length = 150, nullable = false)
    private String difRecepColonia;

    @Column(name = "dif_recep_localidad", length = 150)
    private String difRecepLocalidad;

    @Column(name = "dif_recep_municipio", length = 150, nullable = false)
    private String difRecepMunicipio;

    @Column(name = "dif_num_pais", nullable = false)
    private Integer difNumPais;

    @Column(name = "dif_num_estado", nullable = false)
    private Integer difNumEstado;

    @Column(name = "dif_recep_cp", length = 5, nullable = false)
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

    @Column(name = "dif_mail", length = 150)
    private String difMail;

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
    public String getDifMail() { return difMail; }
    public String getDifNomLegal() { return difNomLegal; }

    public void setId(DomicilioFiscalId id) { this.id = id; }
    public void setDifRecepCalle(String difRecepCalle) { this.difRecepCalle = difRecepCalle; }
    public void setDifRecepNoExt(String difRecepNoExt) { this.difRecepNoExt = difRecepNoExt; }
    public void setDifRecepNoInt(String difRecepNoInt) { this.difRecepNoInt = difRecepNoInt; }
    public void setDifRecepColonia(String difRecepColonia) { this.difRecepColonia = difRecepColonia; }
    public void setDifRecepLocalidad(String difRecepLocalidad) { this.difRecepLocalidad = difRecepLocalidad; }
    public void setDifRecepMunicipio(String difRecepMunicipio) { this.difRecepMunicipio = difRecepMunicipio; }
    public void setDifNumPais(Integer difNumPais) { this.difNumPais = difNumPais; }
    public void setDifNumEstado(Integer difNumEstado) { this.difNumEstado = difNumEstado; }
    public void setDifRecepCp(String difRecepCp) { this.difRecepCp = difRecepCp; }
    public void setDifRecepReferencia(String difRecepReferencia) { this.difRecepReferencia = difRecepReferencia; }
    public void setDifTelefono(String difTelefono) { this.difTelefono = difTelefono; }
    public void setDifFecAlta(LocalDateTime difFecAlta) { this.difFecAlta = difFecAlta; }
    public void setDifFecUltmod(LocalDateTime difFecUltmod) { this.difFecUltmod = difFecUltmod; }
    public void setDifRegimenFiscal(String difRegimenFiscal) { this.difRegimenFiscal = difRegimenFiscal; }
    public void setDifMail(String difMail) { this.difMail = difMail; }
    public void setDifNomLegal(String difNomLegal) { this.difNomLegal = difNomLegal; }
}
