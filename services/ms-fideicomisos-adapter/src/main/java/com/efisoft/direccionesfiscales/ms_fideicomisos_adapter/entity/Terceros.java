package com.efisoft.direccionesfiscales.ms_fideicomisos_adapter.entity;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import org.hibernate.annotations.Immutable;

@Entity
@Immutable
@Table(name = "terceros")
public class Terceros {

    @EmbeddedId
    private TercerosId id;

    @Column(name = "ter_rfc")
    private String terRfc;

    @Column(name = "ter_nom_tercero")
    private String terNomTercero;

    @Column(name = "ter_cve_st_tercero")
    private String terCveStTercero;

    @Column(name = "ter_cve_tipo_pers")
    private String terCveTipoPers;

    public TercerosId getId() { return id; }
    public String getTerRfc() { return terRfc; }
    public String getTerNomTercero() { return terNomTercero; }
    public String getTerCveStTercero() { return terCveStTercero; }
    public String getTerCveTipoPers() { return terCveTipoPers; }
}
