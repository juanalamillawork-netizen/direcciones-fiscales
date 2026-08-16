package com.efisoft.direccionesfiscales.ms_fideicomisos_adapter.service.resolver;

import com.efisoft.direccionesfiscales.ms_fideicomisos_adapter.entity.Fideicom;
import com.efisoft.direccionesfiscales.ms_fideicomisos_adapter.entity.FideicomId;
import com.efisoft.direccionesfiscales.ms_fideicomisos_adapter.repository.FideicomRepository;
import com.efisoft.direccionesfiscales.ms_fideicomisos_adapter.service.RfcResolverStrategy;
import org.springframework.stereotype.Component;

@Component
public class FideicomRfcResolver implements RfcResolverStrategy {

    private final FideicomRepository repository;

    public FideicomRfcResolver(FideicomRepository repository) {
        this.repository = repository;
    }

    @Override
    public String resolve(Integer numContrato, Integer numParticipante) {
        return repository.findById(new FideicomId(numContrato, numParticipante))
            .map(Fideicom::getFidRfc)
            .orElse(null);
    }
}
