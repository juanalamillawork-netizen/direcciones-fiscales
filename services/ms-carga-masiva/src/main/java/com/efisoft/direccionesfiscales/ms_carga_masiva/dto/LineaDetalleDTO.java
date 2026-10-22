package com.efisoft.direccionesfiscales.ms_carga_masiva.dto;

public class LineaDetalleDTO {

    private int numLinea;
    private String registroVisible;
    private String fideicomiso;
    private String rfcArchivo;
    private String rfcSistema;
    private String estatus;
    private String mensaje;

    public LineaDetalleDTO() {}

    public LineaDetalleDTO(int numLinea, String registroVisible, String fideicomiso,
                           String rfcArchivo, String rfcSistema, String estatus, String mensaje) {
        this.numLinea = numLinea;
        this.registroVisible = registroVisible;
        this.fideicomiso = fideicomiso;
        this.rfcArchivo = rfcArchivo;
        this.rfcSistema = rfcSistema;
        this.estatus = estatus;
        this.mensaje = mensaje;
    }

    public int getNumLinea() { return numLinea; }
    public String getRegistroVisible() { return registroVisible; }
    public String getFideicomiso() { return fideicomiso; }
    public String getRfcArchivo() { return rfcArchivo; }
    public String getRfcSistema() { return rfcSistema; }
    public String getEstatus() { return estatus; }
    public String getMensaje() { return mensaje; }
}