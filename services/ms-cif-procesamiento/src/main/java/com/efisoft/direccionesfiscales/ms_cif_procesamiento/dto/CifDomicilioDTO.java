package com.efisoft.direccionesfiscales.ms_cif_procesamiento.dto;

public record CifDomicilioDTO(
    String rfc,
    String nombreOLRazonSocial,
    String codigoPostal,
    String tipoVialidad,
    String nombreVialidad,
    String numeroExterior,
    String numeroInterior,
    String colonia,
    String localidad,
    String municipio,
    String estado,
    String entreCalle,
    String yCalle,
    String correoElectronico,
    String telefono,
    String regimenFiscal
) {}
