package com.efisoft.direccionesfiscales.ms_fideicomisos_adapter.service;

@FunctionalInterface
public interface RfcResolverStrategy {

    String resolve(Integer numContrato, Integer numParticipante);
}
