package com.efisoft.direccionesfiscales.ms_cif_procesamiento.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Component
public class FideicomisoClient {

    private final RestClient rest;

    public FideicomisoClient(@Value("${fideicomisos-adapter.url}") String baseUrl) {
        this.rest = RestClient.builder()
            .baseUrl(baseUrl)
            .build();
    }

    public String obtenerRfc(String numContrato, String tipoParticipante, String numParticipante) {
        var path = String.format("/api/v1/fideicomisos/%s/participantes/%s/%s/rfc",
            numContrato, tipoParticipante, numParticipante);
        var dto = rest.get()
            .uri(path)
            .retrieve()
            .body(Map.class);
        return dto != null ? (String) dto.get("rfc") : null;
    }
}
