package com.efisoft.direccionesfiscales.ms_fideicomisos_adapter.service;

public final class TipoPersonaNormalizer {

    private TipoPersonaNormalizer() {}

    public static String normalizar(String valor) {
        if (valor == null) return null;
        return switch (valor.trim().toUpperCase()) {
            case "F", "FISICA", "PERSONA FISICA" -> "FISICA";
            case "M", "MORAL", "PERSONA MORAL" -> "MORAL";
            default -> null;
        };
    }
}
