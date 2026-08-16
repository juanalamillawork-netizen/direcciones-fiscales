package com.efisoft.direccionesfiscales.ms_cif_procesamiento.controller;

import com.efisoft.direccionesfiscales.ms_cif_procesamiento.dto.CifProcesarResponse;
import com.efisoft.direccionesfiscales.ms_cif_procesamiento.service.CifParserService.PdfParseException;
import com.efisoft.direccionesfiscales.ms_cif_procesamiento.service.CifProcesamientoService;
import com.efisoft.direccionesfiscales.ms_cif_procesamiento.service.CifProcesamientoService.CifParseException;
import com.efisoft.direccionesfiscales.ms_cif_procesamiento.service.CifProcesamientoService.ParticipanteNoEncontradoException;
import com.efisoft.direccionesfiscales.ms_cif_procesamiento.service.CifProcesamientoService.RfcNoCoincideException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/v1/cif")
public class CifProcesamientoController {

    private final CifProcesamientoService service;

    public CifProcesamientoController(CifProcesamientoService service) {
        this.service = service;
    }

    @PostMapping("/procesar")
    public ResponseEntity<?> procesar(
            @RequestParam("file") MultipartFile file,
            @RequestParam("fideicomisoId") String fideicomisoId,
            @RequestParam("tipoParticipante") String tipoParticipante,
            @RequestParam("numeroParticipante") String numeroParticipante) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("El archivo PDF está vacío");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.equalsIgnoreCase("application/pdf")) {
            return ResponseEntity.badRequest().body("El archivo debe ser un PDF");
        }

        if (file.getSize() > 5 * 1024 * 1024) {
            return ResponseEntity.badRequest().body("El archivo excede el tamaño máximo de 5MB");
        }

        try (var is = file.getInputStream()) {
            CifProcesarResponse response = service.procesar(is, fideicomisoId, tipoParticipante, numeroParticipante);
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
                .body("No se pudo leer el archivo PDF: " + e.getMessage());
        }
    }

    @ExceptionHandler(PdfParseException.class)
    public ResponseEntity<String> handlePdfParse(PdfParseException e) {
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(e.getMessage());
    }

    @ExceptionHandler(CifParseException.class)
    public ResponseEntity<String> handleCifParse(CifParseException e) {
        return ResponseEntity.badRequest().body(e.getMessage());
    }

    @ExceptionHandler(ParticipanteNoEncontradoException.class)
    public ResponseEntity<String> handleParticipanteNoEncontrado(ParticipanteNoEncontradoException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
    }

    @ExceptionHandler(RfcNoCoincideException.class)
    public ResponseEntity<String> handleRfcNoCoincide(RfcNoCoincideException e) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
    }
}
