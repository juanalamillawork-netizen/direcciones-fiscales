package com.efisoft.direccionesfiscales.ms_fideicomisos_adapter.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class TercerosId implements Serializable {

    @Column(name = "ter_num_contrato")
    private Integer terNumContrato;

    @Column(name = "ter_num_tercero")
    private Integer terNumTercero;

    public TercerosId() {}

    public TercerosId(Integer terNumContrato, Integer terNumTercero) {
        this.terNumContrato = terNumContrato;
        this.terNumTercero = terNumTercero;
    }

    public Integer getTerNumContrato() { return terNumContrato; }
    public Integer getTerNumTercero() { return terNumTercero; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof TercerosId that)) return false;
        return Objects.equals(terNumContrato, that.terNumContrato)
            && Objects.equals(terNumTercero, that.terNumTercero);
    }

    @Override
    public int hashCode() { return Objects.hash(terNumContrato, terNumTercero); }
}
