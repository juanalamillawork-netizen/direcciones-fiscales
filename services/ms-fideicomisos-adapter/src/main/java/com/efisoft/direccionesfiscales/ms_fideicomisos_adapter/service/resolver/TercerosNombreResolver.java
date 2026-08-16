package com.efisoft.direccionesfiscales.ms_fideicomisos_adapter.service.resolver;

import com.efisoft.direccionesfiscales.ms_fideicomisos_adapter.entity.Terceros;
import com.efisoft.direccionesfiscales.ms_fideicomisos_adapter.entity.TercerosId;
import com.efisoft.direccionesfiscales.ms_fideicomisos_adapter.repository.TercerosRepository;
import com.efisoft.direccionesfiscales.ms_fideicomisos_adapter.service.NombreResolverStrategy;
import com.efisoft.direccionesfiscales.ms_fideicomisos_adapter.service.ParticipanteNombre;
import com.efisoft.direccionesfiscales.ms_fideicomisos_adapter.service.TipoPersonaNormalizer;
import org.springframework.stereotype.Component;

@Component
public class TercerosNombreResolver implements NombreResolverStrategy {

    private final TercerosRepository repository;

    public TercerosNombreResolver(TercerosRepository repository) {
        this.repository = repository;
    }

    @Override
    public ParticipanteNombre resolve(Integer numContrato, Integer numParticipante) {
        return repository.findById(new TercerosId(numContrato, numParticipante))
            .map(t -> new ParticipanteNombre(
                t.getTerNomTercero(),
                TipoPersonaNormalizer.normalizar(t.getTerCveTipoPers())))
            .orElse(null);
    }
}
