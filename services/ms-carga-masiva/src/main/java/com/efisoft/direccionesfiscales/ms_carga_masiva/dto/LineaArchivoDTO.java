package com.efisoft.direccionesfiscales.ms_carga_masiva.dto;

import java.util.List;

public class LineaArchivoDTO {

    private final List<String> columnas;

    public LineaArchivoDTO(List<String> columnas) {
        this.columnas = columnas;
    }

    public String getFideicomiso() { 
        return col(0); 
    }

    public String getTipoParticipante() {
        return col(1);
    }

    public String getNumParticipante() {
        return col(2);
    }

    public String getRfcArchivo() {
        return col(3);
    }

    public String getTelefono() {
        return col(4);
    }

    public String getCorreoElectronico() {
        return col(5);
    }

    public String getCalle() {
        return col(6);
    }

    public String getNoExterior() {
        return col(7);
    }

    public String getNoInterior() {
        return col(8);
    }

    public String getColonia() {
        return col(9);
    }

    public String getMunicipio() {
        return col(10);
    }

    public String getLocalidad() {
        return col(11);
    }

    public String getCp() {
        return col(12);
    }

    public String getPais() {
        return col(13);
    }

    public String getEstado() {
        return col(14);
    }

    public String getRegimenFiscal() {
        return col(15);
    }

    public String getReferencia() {
        return col(16);
    }

    public String getNombreLegal() {
        return col(17);
    }

    public String getCadenaOriginal() {
        return String.join("|", columnas);
    }

    private String col(int idx) {
        return idx < columnas.size() ? columnas.get(idx) : null;
    }
}
