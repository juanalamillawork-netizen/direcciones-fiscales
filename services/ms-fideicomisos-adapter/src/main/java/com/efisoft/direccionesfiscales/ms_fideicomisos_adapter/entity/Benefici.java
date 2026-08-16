package com.efisoft.direccionesfiscales.ms_fideicomisos_adapter.entity;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import org.hibernate.annotations.Immutable;

@Entity
@Immutable
@Table(name = "benefici")
public class Benefici {

    @EmbeddedId
    private BeneficiId id;

    @Column(name = "ben_rfc")
    private String benRfc;

    @Column(name = "ben_nom_benef")
    private String benNomBenef;

    @Column(name = "ben_cve_st_benefic")
    private String benCveStBenefic;

    @Column(name = "ben_cve_tipo_per")
    private String benCveTipoPer;

    public BeneficiId getId() { return id; }
    public String getBenRfc() { return benRfc; }
    public String getBenNomBenef() { return benNomBenef; }
    public String getBenCveStBenefic() { return benCveStBenefic; }
    public String getBenCveTipoPer() { return benCveTipoPer; }
}
