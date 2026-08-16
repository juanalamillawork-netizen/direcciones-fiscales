package com.efisoft.direccionesfiscales.ms_fideicomisos_adapter.repository;

import com.efisoft.direccionesfiscales.ms_fideicomisos_adapter.entity.Contrato;
import org.springframework.data.repository.Repository;

import java.util.Optional;

public interface ContratoRepository extends Repository<Contrato, Integer> {

    Optional<Contrato> findById(Integer ctoNumContrato);
}
