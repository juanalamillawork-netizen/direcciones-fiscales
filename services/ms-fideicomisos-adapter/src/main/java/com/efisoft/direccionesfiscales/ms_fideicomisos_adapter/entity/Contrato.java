package com.efisoft.direccionesfiscales.ms_fideicomisos_adapter.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.Immutable;

@Entity
@Immutable
@Table(name = "contrato")
public class Contrato {

    @Id
    @Column(name = "cto_num_contrato")
    private Integer ctoNumContrato;

    @Column(name = "cto_nom_contrato")
    private String ctoNomContrato;

    @Column(name = "cto_rfc")
    private String ctoRfc;

    @Column(name = "cto_cve_st_contrat")
    private String ctoCveStContrat;

    @Column(name = "cto_cve_tipo_per")
    private String ctoCveTipoPer;

    public Integer getCtoNumContrato() { return ctoNumContrato; }
    public String getCtoNomContrato() { return ctoNomContrato; }
    public String getCtoRfc() { return ctoRfc; }
    public String getCtoCveStContrat() { return ctoCveStContrat; }
    public String getCtoCveTipoPer() { return ctoCveTipoPer; }
}
