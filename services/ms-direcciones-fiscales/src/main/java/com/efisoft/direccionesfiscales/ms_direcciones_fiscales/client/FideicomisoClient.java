package com.efisoft.direccionesfiscales.ms_direcciones_fiscales.client;

import com.efisoft.direccionesfiscales.ms_direcciones_fiscales.dto.NombreDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.util.Optional;

@Component
public class FideicomisoClient {

    private static final Logger log = LoggerFactory.getLogger(FideicomisoClient.class);

    private final RestClient restClient;

    public FideicomisoClient(@Value("${fideicomisos-adapter.base-url}") String baseUrl) {
        this.restClient = RestClient.builder()
            .baseUrl(baseUrl)
            .build();
    }

    public Optional<String> getNombre(String tipoParticipante, String numContrato, String numParticipante) {
        try {
            var dto = restClient.get()
                .uri("/api/v1/fideicomisos/{numContrato}/participantes/{tipoParticipante}/{numParticipante}/nombre",
                    numContrato, tipoParticipante, numParticipante)
                .retrieve()
                .body(NombreDTO.class);
            return dto != null ? Optional.ofNullable(dto.getNombre()) : Optional.empty();
        } catch (RestClientResponseException e) {
            log.warn("Nombre lookup failed for contrato={} tipo={} participante={}: HTTP {}",
                numContrato, tipoParticipante, numParticipante, e.getStatusCode());
            return Optional.empty();
        } catch (ResourceAccessException e) {
            log.error("Nombre lookup connection error for contrato={} tipo={} participante={}: {}",
                numContrato, tipoParticipante, numParticipante, e.getMessage());
            return Optional.empty();
        }
    }
}
