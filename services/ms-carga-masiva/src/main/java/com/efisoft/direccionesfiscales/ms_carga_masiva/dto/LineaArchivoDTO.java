package com.efisoft.direccionesfiscales.ms_carga_masiva.dto;

import java.util.List;

public class LineaArchivoDTO {

    private final List<String> columnas;

    public LineaArchivoDTO(List<String> columnas) {
        this.columnas = columnas;
    }

    public int getNumLinea() { return colInt(0); }
    public String getFideicomiso() { return col(2); }
    public String getTipoParticipante() { return col(3); }
    public String getNumParticipante() { return col(4); }
    public String getRfcArchivo() { return col(6); }
    public String getCalle() { return col(18); }
    public String getMunicipio() { return col(19); }
    public String getLocalidad() { return col(20); }
    public String getCp() { return col(21); }
    public String getPais() { return col(22); }
    public String getEstado() { return col(23); }
    public String getColonia() { return col(24); }
    public String getNoExterior() { return col(25); }
    public String getNoInterior() { return col(26); }
    public String getRegimenFiscal() { return col(27); }
    public String getLada() { return col(13); }
    public String getTelefono() { return col(12); }
    public String getRazonSocial() { return col(8); }

    public String getCadenaOriginal() {
        return String.join("\t", columnas);
    }

    private String col(int idx) {
        return idx < columnas.size() ? columnas.get(idx) : null;
    }

    private int colInt(int idx) {
        String v = col(idx);
        if (v == null || v.isBlank()) return 0;
        try { return Integer.parseInt(v.trim()); } catch (NumberFormatException e) { return 0; }
    }
}
