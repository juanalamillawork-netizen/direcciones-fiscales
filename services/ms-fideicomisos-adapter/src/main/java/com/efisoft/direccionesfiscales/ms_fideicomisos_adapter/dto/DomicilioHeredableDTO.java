package com.efisoft.direccionesfiscales.ms_fideicomisos_adapter.dto;

public record DomicilioHeredableDTO(
    String calle,
    String numeroExterior,
    String colonia,
    String poblacion,
    String municipio,
    String estado,
    Integer estadoId,
    String pais,
    Integer paisId,
    String codigoPostal,
    String nombreLegal,
    String tipoDomicilio,
    Integer numSecDirecc
) {}