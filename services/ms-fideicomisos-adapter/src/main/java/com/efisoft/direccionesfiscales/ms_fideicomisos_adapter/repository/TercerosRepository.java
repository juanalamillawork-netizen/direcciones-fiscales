package com.efisoft.direccionesfiscales.ms_fideicomisos_adapter.repository;

import com.efisoft.direccionesfiscales.ms_fideicomisos_adapter.entity.Terceros;
import com.efisoft.direccionesfiscales.ms_fideicomisos_adapter.entity.TercerosId;
import org.springframework.data.repository.Repository;

import java.util.Optional;

public interface TercerosRepository extends Repository<Terceros, TercerosId> {

    Optional<Terceros> findById(TercerosId id);
}
