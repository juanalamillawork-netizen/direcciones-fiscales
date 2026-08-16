package com.efisoft.direccionesfiscales.ms_fideicomisos_adapter.entity;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import org.hibernate.annotations.Immutable;

@Entity
@Immutable
@Table(name = "fideicom")
public class Fideicom {

    @EmbeddedId
    private FideicomId id;

    @Column(name = "fid_rfc")
    private String fidRfc;

    @Column(name = "fid_nom_fideicom")
    private String fidNomFideicom;

    @Column(name = "fid_cve_st_fideico")
    private String fidCveStFideico;

    @Column(name = "fid_cve_tipo_per")
    private String fidCveTipoPer;

    public FideicomId getId() { return id; }
    public String getFidRfc() { return fidRfc; }
    public String getFidNomFideicom() { return fidNomFideicom; }
    public String getFidCveStFideico() { return fidCveStFideico; }
    public String getFidCveTipoPer() { return fidCveTipoPer; }
}
