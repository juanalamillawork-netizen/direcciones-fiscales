package com.efisoft.direccionesfiscales.ms_direcciones_fiscales.dto;

import com.efisoft.direccionesfiscales.ms_direcciones_fiscales.entity.CatalogoEstado;

public record EstadoDTO(
    Integer id,
    String nombre,
    Integer paisId
) {
    public static EstadoDTO fromEntity(CatalogoEstado e) {
        return new EstadoDTO(e.getEstadoId(), e.getEstadoNombre(), e.getPaisId());
    }
}
