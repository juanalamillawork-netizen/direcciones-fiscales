package com.efisoft.direccionesfiscales.ms_fideicomisos_adapter.service.resolver;

import com.efisoft.direccionesfiscales.ms_fideicomisos_adapter.entity.Fideicom;
import com.efisoft.direccionesfiscales.ms_fideicomisos_adapter.entity.FideicomId;
import com.efisoft.direccionesfiscales.ms_fideicomisos_adapter.repository.FideicomRepository;
import com.efisoft.direccionesfiscales.ms_fideicomisos_adapter.service.NombreResolverStrategy;
import com.efisoft.direccionesfiscales.ms_fideicomisos_adapter.service.ParticipanteNombre;
import com.efisoft.direccionesfiscales.ms_fideicomisos_adapter.service.TipoPersonaNormalizer;
import org.springframework.stereotype.Component;

@Component
public class FideicomNombreResolver implements NombreResolverStrategy {

    private final FideicomRepository repository;

    public FideicomNombreResolver(FideicomRepository repository) {
        this.repository = repository;
    }

    @Override
    public ParticipanteNombre resolve(Integer numContrato, Integer numParticipante) {
        return repository.findById(new FideicomId(numContrato, numParticipante))
            .map(f -> new ParticipanteNombre(
                f.getFidNomFideicom(),
                TipoPersonaNormalizer.normalizar(f.getFidCveTipoPer())))
            .orElse(null);
    }
}
