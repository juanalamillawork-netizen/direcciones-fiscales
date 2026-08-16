package com.efisoft.direccionesfiscales.ms_cif_procesamiento.dto;

public record CifProcesarResponse(
    String calle,
    String numeroExterior,
    String numeroInterior,
    String colonia,
    String localidad,
    String municipio,
    String estado,
    Integer estadoId,
    String pais,
    Integer paisId,
    String codigoPostal,
    String referencia,
    String telefono,
    String correoElectronico,
    String regimenFiscal,
    Integer regimenFiscalId,
    String rfc,
    String nombreOLRazonSocial
) {}
