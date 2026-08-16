package com.efisoft.direccionesfiscales.ms_carga_masiva.controller;

import com.efisoft.direccionesfiscales.ms_carga_masiva.dto.LoteDetalleDTO;
import com.efisoft.direccionesfiscales.ms_carga_masiva.service.CargaMasivaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/carga-masiva")
public class CargaMasivaController {

    private final CargaMasivaService service;

    public CargaMasivaController(CargaMasivaService service) {
        this.service = service;
    }

    @PostMapping("/direcciones-fiscales")
    public ResponseEntity<LoteDetalleDTO> cargarArchivo(
            @RequestParam("archivo") MultipartFile archivo,
            @RequestParam(value = "usuario", defaultValue = "SISTEMA") String usuario) throws IOException {

        if (archivo.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        var resultado = service.procesarArchivo(archivo.getOriginalFilename(), archivo.getInputStream(), usuario);
        return ResponseEntity.ok(resultado);
    }

    @GetMapping("/{loteId}/detalle")
    public ResponseEntity<LoteDetalleDTO> obtenerDetalle(@PathVariable String loteId) {
        var detalle = service.consultarDetalle(loteId);
        if (detalle == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(detalle);
    }
}
