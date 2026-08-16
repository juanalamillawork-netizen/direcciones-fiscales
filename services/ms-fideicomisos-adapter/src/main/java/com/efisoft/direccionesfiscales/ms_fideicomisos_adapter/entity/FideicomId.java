package com.efisoft.direccionesfiscales.ms_fideicomisos_adapter.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class FideicomId implements Serializable {

    @Column(name = "fid_num_contrato")
    private Integer fidNumContrato;

    @Column(name = "fid_fideicomitente")
    private Integer fidFideicomitente;

    public FideicomId() {}

    public FideicomId(Integer fidNumContrato, Integer fidFideicomitente) {
        this.fidNumContrato = fidNumContrato;
        this.fidFideicomitente = fidFideicomitente;
    }

    public Integer getFidNumContrato() { return fidNumContrato; }
    public Integer getFidFideicomitente() { return fidFideicomitente; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof FideicomId that)) return false;
        return Objects.equals(fidNumContrato, that.fidNumContrato)
            && Objects.equals(fidFideicomitente, that.fidFideicomitente);
    }

    @Override
    public int hashCode() { return Objects.hash(fidNumContrato, fidFideicomitente); }
}
