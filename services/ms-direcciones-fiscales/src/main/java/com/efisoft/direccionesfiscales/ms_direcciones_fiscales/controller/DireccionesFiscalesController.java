package com.efisoft.direccionesfiscales.ms_direcciones_fiscales.controller;

import com.efisoft.direccionesfiscales.ms_direcciones_fiscales.dto.ActualizarDomicilioFiscalRequest;
import com.efisoft.direccionesfiscales.ms_direcciones_fiscales.dto.CrearDomicilioFiscalRequest;
import com.efisoft.direccionesfiscales.ms_direcciones_fiscales.dto.DomicilioFiscalDTO;
import com.efisoft.direccionesfiscales.ms_direcciones_fiscales.service.DireccionesFiscalesService;
import com.efisoft.direccionesfiscales.ms_direcciones_fiscales.service.DireccionesFiscalesService.CatalogoNotFoundException;
import com.efisoft.direccionesfiscales.ms_direcciones_fiscales.service.DireccionesFiscalesService.DuplicateKeyException;
import com.efisoft.direccionesfiscales.ms_direcciones_fiscales.service.DireccionesFiscalesService.ResourceNotFoundException;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/direcciones-fiscales")
public class DireccionesFiscalesController {

    private final DireccionesFiscalesService service;

    public DireccionesFiscalesController(DireccionesFiscalesService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<DomicilioFiscalDTO>> buscar(
            @RequestParam(name = "fideicomisoId", required = false) String fideicomisoId,
            @RequestParam(name = "tipoPersona", required = false) String tipoPersona) {
        var resultados = service.buscarPorCriterios(fideicomisoId, tipoPersona);
        return ResponseEntity.ok(resultados != null ? resultados : List.of());
    }

    @GetMapping("/{numContrato}/{cvePers}/{numPersFid}")
    public ResponseEntity<DomicilioFiscalDTO> detalle(
            @PathVariable String numContrato,
            @PathVariable String cvePers,
            @PathVariable String numPersFid) {
        return service.findById(numContrato, cvePers, numPersFid)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<DomicilioFiscalDTO> crear(
            @Valid @RequestBody CrearDomicilioFiscalRequest request) {
        var dto = service.crear(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    @PutMapping("/{numContrato}/{cvePers}/{numPersFid}")
    public ResponseEntity<DomicilioFiscalDTO> actualizar(
            @PathVariable String numContrato,
            @PathVariable String cvePers,
            @PathVariable String numPersFid,
            @Valid @RequestBody ActualizarDomicilioFiscalRequest request) {
        var dto = service.actualizar(numContrato, cvePers, numPersFid, request);
        return ResponseEntity.ok(dto);
    }

    @DeleteMapping("/{numContrato}/{cvePers}/{numPersFid}")
    public ResponseEntity<Void> eliminar(
            @PathVariable String numContrato,
            @PathVariable String cvePers,
            @PathVariable String numPersFid) {
        service.eliminar(numContrato, cvePers, numPersFid);
        return ResponseEntity.noContent().build();
    }

    @ExceptionHandler(DuplicateKeyException.class)
    public ResponseEntity<String> handleDuplicateKey(DuplicateKeyException e) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<String> handleNotFound(ResourceNotFoundException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
    }

    @ExceptionHandler(CatalogoNotFoundException.class)
    public ResponseEntity<String> handleCatalogoNotFound(CatalogoNotFoundException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
    }
}
