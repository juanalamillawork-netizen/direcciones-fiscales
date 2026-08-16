package com.efisoft.direccionesfiscales.ms_fideicomisos_adapter.service.resolver;

import com.efisoft.direccionesfiscales.ms_fideicomisos_adapter.entity.Terceros;
import com.efisoft.direccionesfiscales.ms_fideicomisos_adapter.entity.TercerosId;
import com.efisoft.direccionesfiscales.ms_fideicomisos_adapter.repository.TercerosRepository;
import com.efisoft.direccionesfiscales.ms_fideicomisos_adapter.service.RfcResolverStrategy;
import org.springframework.stereotype.Component;

@Component
public class TercerosRfcResolver implements RfcResolverStrategy {

    private final TercerosRepository repository;

    public TercerosRfcResolver(TercerosRepository repository) {
        this.repository = repository;
    }

    @Override
    public String resolve(Integer numContrato, Integer numParticipante) {
        return repository.findById(new TercerosId(numContrato, numParticipante))
            .map(Terceros::getTerRfc)
            .orElse(null);
    }
}
