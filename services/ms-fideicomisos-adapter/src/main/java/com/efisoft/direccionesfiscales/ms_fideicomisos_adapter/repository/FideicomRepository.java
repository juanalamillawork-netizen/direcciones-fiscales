package com.efisoft.direccionesfiscales.ms_fideicomisos_adapter.repository;

import com.efisoft.direccionesfiscales.ms_fideicomisos_adapter.entity.Fideicom;
import com.efisoft.direccionesfiscales.ms_fideicomisos_adapter.entity.FideicomId;
import org.springframework.data.repository.Repository;

import java.util.Optional;

public interface FideicomRepository extends Repository<Fideicom, FideicomId> {

    Optional<Fideicom> findById(FideicomId id);
}
