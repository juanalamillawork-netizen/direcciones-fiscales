package com.efisoft.direccionesfiscales.ms_carga_masiva.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class RfcDTO {
    private String rfc;

    public RfcDTO() {}
    public RfcDTO(String rfc) { this.rfc = rfc; }

    public String getRfc() { return rfc; }
    public void setRfc(String rfc) { this.rfc = rfc; }
}
