package com.efisoft.direccionesfiscales.ms_fideicomisos_adapter.service.resolver;

import com.efisoft.direccionesfiscales.ms_fideicomisos_adapter.entity.Benefici;
import com.efisoft.direccionesfiscales.ms_fideicomisos_adapter.entity.BeneficiId;
import com.efisoft.direccionesfiscales.ms_fideicomisos_adapter.repository.BeneficiRepository;
import com.efisoft.direccionesfiscales.ms_fideicomisos_adapter.service.RfcResolverStrategy;
import org.springframework.stereotype.Component;

@Component
public class BeneficiRfcResolver implements RfcResolverStrategy {

    private final BeneficiRepository repository;

    public BeneficiRfcResolver(BeneficiRepository repository) {
        this.repository = repository;
    }

    @Override
    public String resolve(Integer numContrato, Integer numParticipante) {
        return repository.findById(new BeneficiId(numContrato, numParticipante))
            .map(Benefici::getBenRfc)
            .orElse(null);
    }
}
