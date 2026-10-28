package com.efisoft.direccionesfiscales.ms_carga_masiva.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class NombreDTO {

    private String nombre;
    private String tipoPersona;

    public NombreDTO() {
    }

    public NombreDTO(String nombre) {
        this.nombre = nombre;
    }

    public NombreDTO(String nombre, String tipoPersona) {
        this.nombre = nombre;
        this.tipoPersona = tipoPersona;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getTipoPersona() {
        return tipoPersona;
    }

    public void setTipoPersona(String tipoPersona) {
        this.tipoPersona = tipoPersona;
    }
}