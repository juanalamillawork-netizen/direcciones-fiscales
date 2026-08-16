package com.efisoft.direccionesfiscales.ms_direcciones_fiscales.controller;

import com.efisoft.direccionesfiscales.ms_direcciones_fiscales.dto.EstadoDTO;
import com.efisoft.direccionesfiscales.ms_direcciones_fiscales.dto.PaisDTO;
import com.efisoft.direccionesfiscales.ms_direcciones_fiscales.dto.RegimenFiscalDTO;
import com.efisoft.direccionesfiscales.ms_direcciones_fiscales.service.CatalogosService;
import com.efisoft.direccionesfiscales.ms_direcciones_fiscales.service.CatalogosService.TipoPersonaInvalidaException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/catalogos")
public class CatalogosController {

    private final CatalogosService service;

    public CatalogosController(CatalogosService service) {
        this.service = service;
    }

    @GetMapping("/paises")
    public ResponseEntity<List<PaisDTO>> listarPaises() {
        return ResponseEntity.ok(service.listarPaises());
    }

    @GetMapping("/estados")
    public ResponseEntity<List<EstadoDTO>> listarEstados(
            @RequestParam(name = "paisId", required = false) Integer paisId) {
        return ResponseEntity.ok(service.listarEstados(paisId));
    }

    @GetMapping("/regimenes-fiscales")
    public ResponseEntity<List<RegimenFiscalDTO>> listarRegimenesFiscales(
            @RequestParam(name = "tipoPersona", required = false) String tipoPersona) {
        return ResponseEntity.ok(service.listarRegimenesFiscales(tipoPersona));
    }

    @ExceptionHandler(TipoPersonaInvalidaException.class)
    public ResponseEntity<String> handleTipoPersonaInvalida(TipoPersonaInvalidaException e) {
        return ResponseEntity.badRequest().body(e.getMessage());
    }
}
