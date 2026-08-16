package com.efisoft.direccionesfiscales.ms_direcciones_fiscales.dto;

import com.efisoft.direccionesfiscales.ms_direcciones_fiscales.entity.CatalogoPais;

public record PaisDTO(
    Integer id,
    String nombre
) {
    public static PaisDTO fromEntity(CatalogoPais p) {
        return new PaisDTO(p.getPaisId(), p.getPaisNombre());
    }
}
