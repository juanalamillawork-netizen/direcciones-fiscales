package com.efisoft.direccionesfiscales.ms_carga_masiva.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class NombreDTO {
    private String nombre;

    public NombreDTO() {}
    public NombreDTO(String nombre) { this.nombre = nombre; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
}
