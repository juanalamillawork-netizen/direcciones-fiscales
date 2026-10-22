package com.efisoft.direccionesfiscales.ms_carga_masiva.parser;

import com.efisoft.direccionesfiscales.ms_carga_masiva.dto.LineaArchivoDTO;
import com.efisoft.direccionesfiscales.ms_carga_masiva.exception.EncabezadoInvalidoException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Component
public class ArchivoParser {

    private static final String ENCABEZADO_DEFAULT =
            "fideicomiso|tipoParticipante|numeroParticipante|rfc|telefono|correoElectronico|"
            + "calle|numeroExterior|numeroInterior|colonia|municipio|localidad|codigoPostal|"
            + "pais|estado|regimenFiscal|referencia|nombreLegal";

    private final String encabezadoEsperado;

    public ArchivoParser(
            @Value("${app.carga-masiva.encabezado-esperado:" + ENCABEZADO_DEFAULT + "}")
            String encabezadoEsperado) {
        this.encabezadoEsperado = encabezadoEsperado;
    }

    public List<LineaArchivoDTO> parse(InputStream inputStream) throws IOException {
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(inputStream, StandardCharsets.UTF_8))) {

            List<String> lineas = reader.lines()
                    .filter(line -> !line.isBlank())
                    .toList();

            if (lineas.isEmpty()) {
                throw new EncabezadoInvalidoException("El archivo está vacío.");
            }

            validarEncabezado(lineas.get(0));

            return lineas.stream()
                    .skip(1)
                    .map(this::parsearLinea)
                    .collect(Collectors.toList());
        }
    }

    private void validarEncabezado(String linea) {
        String recibido = normalizar(linea);
        String esperado = normalizar(encabezadoEsperado);

        if (!recibido.equals(esperado)) {
            throw new EncabezadoInvalidoException(
                    "El encabezado del archivo no coincide con el esperado.");
        }
    }

    private LineaArchivoDTO parsearLinea(String line) {
        List<String> cols = Arrays.stream(line.split("\\|", -1))
                .map(String::trim)
                .collect(Collectors.toList());
        return new LineaArchivoDTO(cols);
    }

    private static String normalizar(String s) {
        return s.trim().toLowerCase(Locale.ROOT);
    }
}