package com.efisoft.direccionesfiscales.ms_carga_masiva.dto;

import java.util.List;

public class LoteDetalleDTO {

    private String loteId;
    private int totalRegistros;
    private int registrosExitosos;
    private int registrosConError;
    private List<LineaDetalleDTO> lineas;

    public LoteDetalleDTO() {}

    public LoteDetalleDTO(String loteId, int totalRegistros, int registrosExitosos, int registrosConError, List<LineaDetalleDTO> lineas) {
        this.loteId = loteId;
        this.totalRegistros = totalRegistros;
        this.registrosExitosos = registrosExitosos;
        this.registrosConError = registrosConError;
        this.lineas = lineas;
    }

    public String getLoteId() { return loteId; }
    public int getTotalRegistros() { return totalRegistros; }
    public int getRegistrosExitosos() { return registrosExitosos; }
    public int getRegistrosConError() { return registrosConError; }
    public List<LineaDetalleDTO> getLineas() { return lineas; }
}
