package com.efisoft.direccionesfiscales.ms_fideicomisos_adapter.repository;

import com.efisoft.direccionesfiscales.ms_fideicomisos_adapter.entity.Benefici;
import com.efisoft.direccionesfiscales.ms_fideicomisos_adapter.entity.BeneficiId;
import org.springframework.data.repository.Repository;

import java.util.Optional;

public interface BeneficiRepository extends Repository<Benefici, BeneficiId> {

    Optional<Benefici> findById(BeneficiId id);
}
