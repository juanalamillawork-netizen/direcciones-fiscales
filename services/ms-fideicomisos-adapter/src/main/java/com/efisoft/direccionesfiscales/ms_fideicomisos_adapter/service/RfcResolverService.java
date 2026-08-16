package com.efisoft.direccionesfiscales.ms_fideicomisos_adapter.service;

import com.efisoft.direccionesfiscales.ms_fideicomisos_adapter.service.resolver.BeneficiRfcResolver;
import com.efisoft.direccionesfiscales.ms_fideicomisos_adapter.service.resolver.FideicomRfcResolver;
import com.efisoft.direccionesfiscales.ms_fideicomisos_adapter.service.resolver.TercerosRfcResolver;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class RfcResolverService {

    private final Map<String, RfcResolverStrategy> resolverMap;

    public RfcResolverService(
            FideicomRfcResolver fideicom,
            BeneficiRfcResolver benefici,
            TercerosRfcResolver terceros) {
        this.resolverMap = Map.of(
            "FIDEICOMITENTE", fideicom,
            "FIDEICOMISARIO", benefici,
            "TERCERO", terceros
        );
    }

    public String resolveRfc(String tipoParticipante, Integer numContrato, Integer numParticipante) {
        RfcResolverStrategy resolver = resolverMap.get(tipoParticipante);
        if (resolver == null) {
            throw new IllegalArgumentException("Tipo de participante inválido: " + tipoParticipante);
        }
        return resolver.resolve(numContrato, numParticipante);
    }
}
