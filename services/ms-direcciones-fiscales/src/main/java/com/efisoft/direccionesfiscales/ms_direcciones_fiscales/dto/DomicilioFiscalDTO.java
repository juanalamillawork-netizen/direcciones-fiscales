package com.efisoft.direccionesfiscales.ms_direcciones_fiscales.dto;

import com.efisoft.direccionesfiscales.ms_direcciones_fiscales.entity.DomicilioFiscal;
import java.time.LocalDateTime;

public record DomicilioFiscalDTO(
    String fideicomisoId,
    String tipoPersona,
    String numeroParticipante,
    String calle,
    String numeroExterior,
    String numeroInterior,
    String colonia,
    String localidad,
    String municipio,
    Integer paisId,
    Integer estadoId,
    String codigoPostal,
    String referencia,
    String telefono,
    String regimenFiscal,
    String correoElectronico,
    String nombreLegal,
    LocalDateTime fechaAlta,
    LocalDateTime fechaUltMod
) {
    public static DomicilioFiscalDTO fromEntity(DomicilioFiscal e) {
        return new DomicilioFiscalDTO(
            e.getId().getDifNumContrato(),
            e.getId().getDifCvePers(),
            e.getId().getDifNumPersFid(),
            e.getDifRecepCalle(),
            e.getDifRecepNoExt(),
            e.getDifRecepNoInt(),
            e.getDifRecepColonia(),
            e.getDifRecepLocalidad(),
            e.getDifRecepMunicipio(),
            e.getDifNumPais(),
            e.getDifNumEstado(),
            e.getDifRecepCp(),
            e.getDifRecepReferencia(),
            e.getDifTelefono(),
            e.getDifRegimenFiscal(),
            e.getDifMail(),
            e.getDifNomLegal(),
            e.getDifFecAlta(),
            e.getDifFecUltmod()
        );
    }
}
