package com.efisoft.direccionesfiscales.ms_fideicomisos_adapter.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class BeneficiId implements Serializable {

    @Column(name = "ben_num_contrato")
    private Integer benNumContrato;

    @Column(name = "ben_beneficiario")
    private Integer benBeneficiario;

    public BeneficiId() {}

    public BeneficiId(Integer benNumContrato, Integer benBeneficiario) {
        this.benNumContrato = benNumContrato;
        this.benBeneficiario = benBeneficiario;
    }

    public Integer getBenNumContrato() { return benNumContrato; }
    public Integer getBenBeneficiario() { return benBeneficiario; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof BeneficiId that)) return false;
        return Objects.equals(benNumContrato, that.benNumContrato)
            && Objects.equals(benBeneficiario, that.benBeneficiario);
    }

    @Override
    public int hashCode() { return Objects.hash(benNumContrato, benBeneficiario); }
}
