package com.efisoft.direccionesfiscales.ms_fideicomisos_adapter.service.resolver;

import com.efisoft.direccionesfiscales.ms_fideicomisos_adapter.entity.Benefici;
import com.efisoft.direccionesfiscales.ms_fideicomisos_adapter.entity.BeneficiId;
import com.efisoft.direccionesfiscales.ms_fideicomisos_adapter.repository.BeneficiRepository;
import com.efisoft.direccionesfiscales.ms_fideicomisos_adapter.service.NombreResolverStrategy;
import com.efisoft.direccionesfiscales.ms_fideicomisos_adapter.service.ParticipanteNombre;
import com.efisoft.direccionesfiscales.ms_fideicomisos_adapter.service.TipoPersonaNormalizer;
import org.springframework.stereotype.Component;

@Component
public class BeneficiNombreResolver implements NombreResolverStrategy {

    private final BeneficiRepository repository;

    public BeneficiNombreResolver(BeneficiRepository repository) {
        this.repository = repository;
    }

    @Override
    public ParticipanteNombre resolve(Integer numContrato, Integer numParticipante) {
        return repository.findById(new BeneficiId(numContrato, numParticipante))
            .map(b -> new ParticipanteNombre(
                b.getBenNomBenef(),
                TipoPersonaNormalizer.normalizar(b.getBenCveTipoPer())))
            .orElse(null);
    }
}
