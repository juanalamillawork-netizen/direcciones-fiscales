package com.efisoft.direccionesfiscales.ms_fideicomisos_adapter.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class DirecciId implements Serializable {

    @Column(name = "dir_num_contrato")
    private Integer dirNumContrato;

    @Column(name = "dir_cve_pers_fid")
    private String dirCvePersFid;

    @Column(name = "dir_num_pers_fid")
    private Integer dirNumPersFid;

    @Column(name = "dir_num_sec_direcc")
    private Short dirNumSecDirecc;

    public DirecciId() {}

    public DirecciId(Integer dirNumContrato, String dirCvePersFid, Integer dirNumPersFid, Short dirNumSecDirecc) {
        this.dirNumContrato = dirNumContrato;
        this.dirCvePersFid = dirCvePersFid;
        this.dirNumPersFid = dirNumPersFid;
        this.dirNumSecDirecc = dirNumSecDirecc;
    }

    public Integer getDirNumContrato() { return dirNumContrato; }
    public String getDirCvePersFid() { return dirCvePersFid; }
    public Integer getDirNumPersFid() { return dirNumPersFid; }
    public Short getDirNumSecDirecc() { return dirNumSecDirecc; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof DirecciId that)) return false;
        return Objects.equals(dirNumContrato, that.dirNumContrato)
            && Objects.equals(dirCvePersFid, that.dirCvePersFid)
            && Objects.equals(dirNumPersFid, that.dirNumPersFid)
            && Objects.equals(dirNumSecDirecc, that.dirNumSecDirecc);
    }

    @Override
    public int hashCode() {
        return Objects.hash(dirNumContrato, dirCvePersFid, dirNumPersFid, dirNumSecDirecc);
    }
}
