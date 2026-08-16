package com.efisoft.direccionesfiscales.ms_carga_masiva.parser;

import com.efisoft.direccionesfiscales.ms_carga_masiva.dto.LineaArchivoDTO;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class ArchivoParser {

    public List<LineaArchivoDTO> parse(InputStream inputStream) throws IOException {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream, StandardCharsets.UTF_8))) {
            return reader.lines()
                .filter(line -> !line.isBlank())
                .map(line -> {
                    List<String> cols = Arrays.stream(line.split("\t", -1))
                        .map(String::trim)
                        .collect(Collectors.toList());
                    return new LineaArchivoDTO(cols);
                })
                .collect(Collectors.toList());
        }
    }
}
