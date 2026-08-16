package com.efisoft.direccionesfiscales.ms_carga_masiva.service;

import com.efisoft.direccionesfiscales.ms_carga_masiva.entity.DomicilioFiscal;
import com.efisoft.direccionesfiscales.ms_carga_masiva.repository.DomicilioFiscalRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Component
public class UpsertProcessor {

    private static final Logger log = LoggerFactory.getLogger(UpsertProcessor.class);

    private final DomicilioFiscalRepository domicilioFiscalRepository;

    public UpsertProcessor(DomicilioFiscalRepository domicilioFiscalRepository) {
        this.domicilioFiscalRepository = domicilioFiscalRepository;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void upsert(DomicilioFiscal domicilio) {
        domicilioFiscalRepository.save(domicilio);
    }
}
