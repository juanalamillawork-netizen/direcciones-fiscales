package com.efisoft.direccionesfiscales.ms_direcciones_fiscales.dto;

import com.efisoft.direccionesfiscales.ms_direcciones_fiscales.entity.CatalogoRegimenFiscal;

public record RegimenFiscalDTO(
    Integer clave,
    String descripcion,
    Boolean aplicaFisica,
    Boolean aplicaMoral
) {
    public static RegimenFiscalDTO fromEntity(CatalogoRegimenFiscal r) {
        return new RegimenFiscalDTO(r.getRegClave(), r.getRegDescripcion(),
            r.getRegAplicaFisica(), r.getRegAplicaMoral());
    }
}
