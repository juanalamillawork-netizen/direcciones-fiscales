package com.efisoft.direccionesfiscales.ms_fideicomisos_adapter.controller;

import com.efisoft.direccionesfiscales.ms_fideicomisos_adapter.dto.DomicilioHeredableDTO;
import com.efisoft.direccionesfiscales.ms_fideicomisos_adapter.dto.FideicomisoDTO;
import com.efisoft.direccionesfiscales.ms_fideicomisos_adapter.dto.NombreDTO;
import com.efisoft.direccionesfiscales.ms_fideicomisos_adapter.dto.RfcDTO;
import com.efisoft.direccionesfiscales.ms_fideicomisos_adapter.service.FideicomisoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/fideicomisos")
public class FideicomisoController {

    private final FideicomisoService service;

    public FideicomisoController(FideicomisoService service) {
        this.service = service;
    }

    @GetMapping("/{numContrato}")
    public ResponseEntity<FideicomisoDTO> getFideicomiso(@PathVariable Integer numContrato) {
        return service.findById(numContrato)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{numContrato}/participantes/{tipoParticipante}/{numParticipante}/rfc")
    public ResponseEntity<RfcDTO> getRfcParticipante(
            @PathVariable Integer numContrato,
            @PathVariable String tipoParticipante,
            @PathVariable Integer numParticipante) {
        return service.findRfc(tipoParticipante, numContrato, numParticipante)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{numContrato}/participantes/{tipoParticipante}/{numParticipante}/nombre")
    public ResponseEntity<NombreDTO> getNombreParticipante(
            @PathVariable Integer numContrato,
            @PathVariable String tipoParticipante,
            @PathVariable Integer numParticipante) {
        return service.findNombre(tipoParticipante, numContrato, numParticipante)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{numContrato}/domicilios-heredables")
    public List<DomicilioHeredableDTO> getDomiciliosHeredables(
            @PathVariable Integer numContrato,
            @RequestParam String tipoParticipante,
            @RequestParam Integer numParticipante) {
        return service.findDomiciliosHeredables(numContrato, tipoParticipante, numParticipante);
    }

}
