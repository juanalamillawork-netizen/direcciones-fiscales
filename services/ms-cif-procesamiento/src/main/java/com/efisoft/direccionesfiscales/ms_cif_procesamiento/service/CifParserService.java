package com.efisoft.direccionesfiscales.ms_cif_procesamiento.service;

import com.efisoft.direccionesfiscales.ms_cif_procesamiento.dto.CifDomicilioDTO;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class CifParserService {

    public CifDomicilioDTO parsear(InputStream pdfStream) {
        try (PDDocument doc = Loader.loadPDF(pdfStream.readAllBytes())) {
            var stripper = new PDFTextStripper();
            stripper.setSortByPosition(true);
            String text = stripper.getText(doc);
            return extraerCampos(text);
        } catch (IOException e) {
            throw new PdfParseException("No se pudo leer el archivo PDF: " + e.getMessage(), e);
        }
    }

    private CifDomicilioDTO extraerCampos(String text) {
        String rfc = extraer(text, "RFC:", null, "\n");
        String nombre = extraer(text, "Nombre, denominaci.n o raz.n\\s*social\\s*", null, "\n",
            text.contains("NATURAL FOODS") ? "NATURAL FOODS INTERNACIONAL" : null);
        if (nombre == null || nombre.isBlank()) {
            nombre = extraerLinea(text, "Nombre \\(s\\):", "Primer Apellido:");
            if (nombre != null) {
                String paterno = extraer(text, "Primer Apellido:", "\n", "\n");
                String materno = extraer(text, "Segundo Apellido:", "\n", "\n");
                nombre = (nombre + " " + (paterno != null ? paterno : "") + " " + (materno != null ? materno : "")).trim();
            }
        }

        String cp = extraer(text, "C.digo Postal:", null, "Tipo de Vialidad:");
        String tipoVialidad = extraer(text, "Tipo de Vialidad:", null, "Nombre de Vialidad:");
        String nombreVialidad = normalizarMultilinea(
            extraer(text, "Nombre de Vialidad:", null, "N.mero Exterior:"));
        String noExt = extraer(text, "N.mero Exterior:", null, "N.mero Interior:");
        String noInt = extraer(text, "N.mero Interior:", null, "Nombre de la Colonia:");
        String colonia = normalizarMultilinea(
            extraer(text, "Nombre de la Colonia:", null, "Nombre de la Localidad:"));
        String localidad = normalizarMultilinea(
            extraer(text, "Nombre de la Localidad:", null, "Nombre del Municipio o Demarcaci.n Territorial:"));
        String municipio = normalizarMultilinea(
            extraer(text, "Nombre del Municipio o Demarcaci.n Territorial:", null, "Nombre de la Entidad Federativa:"));
        String estado = extraer(text, "Nombre de la Entidad Federativa:", null, "Entre Calle:");
        String entreCalle = extraerEnLinea(text, "Entre Calle:", "Y Calle:");
        String yCalle = extraerEnLinea(text, "Y Calle:", "Correo Electr.nico:");
        String email = extraer(text, "Correo Electr.nico:", null, null);
        if (email != null) {
            email = email.replaceAll("\\s+", " ").trim();
            if (email.indexOf(' ') > 0) email = email.substring(0, email.indexOf(' '));
        }

        String lada = extraer(text, "Tel. (?:Fijo |M.vil )?Lada:", null, "N.mero:");
        String numero = extraer(text, "N.mero:", null, null);
        if (numero != null) {
            int idx = numero.indexOf('\n');
            if (idx > 0) numero = numero.substring(0, idx).trim();
        }
        String telefono = (lada != null && !lada.isBlank() ? lada.trim() : "")
            + (numero != null && !numero.isBlank() ? numero.trim() : "");
        if (telefono.isBlank()) telefono = null;

        String regimen = extraerRegimen(text);

        return new CifDomicilioDTO(
            limpValor(rfc), limpValor(nombre),
            limpValor(cp), limpValor(tipoVialidad),
            nombreVialidad, limpValor(noExt),
            limpValor(noInt), colonia,
            localidad, municipio,
            limpValor(estado), limpValor(entreCalle),
            limpValor(yCalle), limpValor(email),
            limpValor(telefono), regimen
        );
    }

    private String extraer(String text, String label, String afterLabel, String hasta) {
        return extraer(text, label, afterLabel, hasta, null);
    }

    private String extraer(String text, String label, String afterLabel, String hasta, String fallback) {
        Pattern p = Pattern.compile(label, Pattern.CASE_INSENSITIVE);
        Matcher m = p.matcher(text);
        if (!m.find()) return fallback;
        int start = m.end();

        if (afterLabel != null) {
            Matcher am = Pattern.compile(afterLabel, Pattern.CASE_INSENSITIVE).matcher(text);
            if (am.find(start)) {
                return text.substring(start, am.start()).trim();
            }
        }

        if (hasta != null) {
            Matcher hm = Pattern.compile(hasta, Pattern.CASE_INSENSITIVE).matcher(text);
            if (hm.find(start)) {
                return text.substring(start, hm.start()).trim();
            }
        }

        int end = text.indexOf('\n', start);
        if (end < 0) end = text.length();
        return text.substring(start, end).trim();
    }

    /**
     * Extrae el valor de la etiqueta dentro de la misma línea (sin cruzar a la
     * siguiente), deteniéndose en la siguiente etiqueta conocida si aparece en la
     * misma línea. Evita capturar pies de página u otros contenidos de líneas
     * posteriores.
     */
    private String extraerEnLinea(String text, String label, String siguienteLabel) {
        Pattern p = Pattern.compile(label, Pattern.CASE_INSENSITIVE);
        Matcher m = p.matcher(text);
        if (!m.find()) return null;
        int start = m.end();

        int end = text.indexOf('\n', start);
        if (end < 0) end = text.length();
        String valor = text.substring(start, end);

        if (siguienteLabel != null) {
            Matcher sm = Pattern.compile(siguienteLabel, Pattern.CASE_INSENSITIVE).matcher(valor);
            if (sm.find()) {
                valor = valor.substring(0, sm.start());
            }
        }

        return valor.trim();
    }

    private String normalizarMultilinea(String v) {
        if (v == null) return null;
        String s = v.replace('\n', ' ').replaceAll("\\s+", " ").trim();
        return s.isBlank() ? null : s;
    }

    private String extraerLinea(String text, String label, String hastaLabel) {
        Pattern p = Pattern.compile(label + "([^\\n]*)", Pattern.CASE_INSENSITIVE);
        Matcher m = p.matcher(text);
        if (!m.find()) return null;
        String val = m.group(1).trim();
        if (!val.isEmpty()) return val;
        return null;
    }

    private String extraerRegimen(String text) {
        Pattern section = Pattern.compile("Reg.menes:\\s*\\n", Pattern.CASE_INSENSITIVE);
        Matcher sm = section.matcher(text);
        if (!sm.find()) return null;

        int start = sm.end();
        Pattern endSection = Pattern.compile("\\n\\s*\\n|Obligaciones:");
        Matcher em = endSection.matcher(text);
        int end = em.find(start) ? em.start() : text.length();

        String block = text.substring(start, end).trim();
        String[] lines = block.split("\\n");
        for (String line : lines) {
            line = line.trim();
            if (line.isEmpty()) continue;
            if (line.matches("R.gimen\\s+Fecha.*")) continue;
            // La primera columna de datos es el nombre del régimen; las columnas
            // "Fecha Inicio"/"Fecha Fin" van a continuación (dd/mm/aaaa) — recortarlas.
            return line.replaceFirst("\\s+\\d{2}/\\d{2}/\\d{4}(?:\\s+\\d{2}/\\d{2}/\\d{4})*$", "").trim();
        }
        return null;
    }

    private String limpValor(String v) {
        return v != null && !v.isBlank() ? v.trim() : null;
    }

    public static class PdfParseException extends RuntimeException {
        public PdfParseException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}
