package com.efisoft.direccionesfiscales.ms_fideicomisos_adapter.service;

import com.efisoft.direccionesfiscales.ms_fideicomisos_adapter.service.resolver.BeneficiNombreResolver;
import com.efisoft.direccionesfiscales.ms_fideicomisos_adapter.service.resolver.FideicomNombreResolver;
import com.efisoft.direccionesfiscales.ms_fideicomisos_adapter.service.resolver.TercerosNombreResolver;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class NombreResolverService {

    private final Map<String, NombreResolverStrategy> resolverMap;

    public NombreResolverService(
            FideicomNombreResolver fideicom,
            BeneficiNombreResolver benefici,
            TercerosNombreResolver terceros) {
        this.resolverMap = Map.of(
            "FIDEICOMITENTE", fideicom,
            "FIDEICOMISARIO", benefici,
            "TERCERO", terceros
        );
    }

    public ParticipanteNombre resolveNombre(String tipoParticipante, Integer numContrato, Integer numParticipante) {
        NombreResolverStrategy resolver = resolverMap.get(tipoParticipante);
        if (resolver == null) return null;
        return resolver.resolve(numContrato, numParticipante);
    }
}
