package com.efisoft.direccionesfiscales.ms_fideicomisos_adapter.service;

@FunctionalInterface
public interface NombreResolverStrategy {
    ParticipanteNombre resolve(Integer numContrato, Integer numParticipante);
}
