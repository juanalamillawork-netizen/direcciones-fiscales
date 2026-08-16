package com.efisoft.direccionesfiscales.ms_carga_masiva.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class DomicilioFiscalId implements Serializable {

    @Column(name = "dif_num_contrato", length = 10)
    private String difNumContrato;

    @Column(name = "dif_cve_pers", length = 20)
    private String difCvePers;

    @Column(name = "dif_num_pers_fid", length = 20)
    private String difNumPersFid;

    public DomicilioFiscalId() {}

    public DomicilioFiscalId(String difNumContrato, String difCvePers, String difNumPersFid) {
        this.difNumContrato = difNumContrato;
        this.difCvePers = difCvePers;
        this.difNumPersFid = difNumPersFid;
    }

    public String getDifNumContrato() { return difNumContrato; }
    public String getDifCvePers() { return difCvePers; }
    public String getDifNumPersFid() { return difNumPersFid; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof DomicilioFiscalId that)) return false;
        return Objects.equals(difNumContrato, that.difNumContrato)
            && Objects.equals(difCvePers, that.difCvePers)
            && Objects.equals(difNumPersFid, that.difNumPersFid);
    }

    @Override
    public int hashCode() { return Objects.hash(difNumContrato, difCvePers, difNumPersFid); }
}
