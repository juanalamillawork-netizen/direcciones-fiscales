package com.efisoft.direccionesfiscales.ms_direcciones_fiscales.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record CrearDomicilioFiscalRequest(
    @NotBlank @Pattern(regexp = "^[0-9]{1,10}$", message = "El No. de Fideicomiso debe ser numérico, máximo 10 dígitos") String fideicomisoId,
    @NotNull TipoParticipante tipoPersona,
    @NotBlank @Pattern(regexp = "^[0-9]{1,20}$", message = "El No. de Participante debe ser numérico, máximo 20 dígitos") String numeroParticipante,
    @NotBlank String calle,
    @NotBlank String numeroExterior,
    String numeroInterior,
    @NotBlank String colonia,
    @NotBlank String municipio,
    String localidad,
    @NotNull Integer paisId,
    @NotNull Integer estadoId,
    @NotBlank @Pattern(regexp = "^[0-9]{5}$") String codigoPostal,
    String referencia,
    String telefono,
    String regimenFiscal,
    @Email(message = "El correo electrónico no tiene un formato válido") String correoElectronico
) {}
