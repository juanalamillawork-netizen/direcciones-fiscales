package com.efisoft.direccionesfiscales.ms_cif_procesamiento;

import com.efisoft.direccionesfiscales.ms_cif_procesamiento.service.FideicomisoClient;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.context.jdbc.Sql.ExecutionPhase;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.nullValue;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureMockMvc
@Sql(scripts = "classpath:cif-test-data.sql", executionPhase = ExecutionPhase.BEFORE_TEST_CLASS)
class CifProcesamientoIntegrationTest {

    @Autowired
    private MockMvc mvc;

    @MockitoBean
    private FideicomisoClient fideicomisoClient;

    @Test
    void procesar_conPdfAlejandra_rfcCoincide() throws Exception {
        when(fideicomisoClient.obtenerRfc("1234567890", "FIDEICOMITENTE", "1"))
            .thenReturn("TOVA700409ID8");

        var pdf = loadPdf("ALEJANDRA DE LA TORRE VERDUZCO CSF.pdf");

        mvc.perform(multipart("/api/v1/cif/procesar")
                .file(pdf)
                .param("fideicomisoId", "1234567890")
                .param("tipoParticipante", "FIDEICOMITENTE")
                .param("numeroParticipante", "1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.rfc").value("TOVA700409ID8"))
            .andExpect(jsonPath("$.codigoPostal").value("54730"))
            // Bug 1 — la calle no debe incluir la palabra "Nombre" de la etiqueta
            .andExpect(jsonPath("$.calle").value("AUTOPISTA MEXICO QUERETARO KM 37.50"))
            .andExpect(jsonPath("$.numeroExterior").value("SN"))
            .andExpect(jsonPath("$.colonia").value("PARQUE INDUSTRIAL CUAMATLA"))
            // Bug 2 — el municipio cruza un salto de línea: se normaliza con espacio
            .andExpect(jsonPath("$.municipio").value("CUAUTITLAN IZCALLI"))
            // Bug 3 — el estado se extrae y resuelve contra el catálogo (acentos)
            .andExpect(jsonPath("$.estado").value("MEXICO"))
            .andExpect(jsonPath("$.estadoId").value(15))
            // Bug 4 — la referencia no debe arrastrar el pie de página "Página [1] de [3]"
            .andExpect(jsonPath("$.referencia").value(nullValue()))
            // Bug 5 — el régimen se toma sin las columnas de fecha pegadas
            .andExpect(jsonPath("$.regimenFiscal").value("Régimen de Ingresos por Dividendos (socios y accionistas)"))
            // Bug 6 — el régimen se resuelve contra el catálogo quitando el prefijo "Régimen de "
            .andExpect(jsonPath("$.regimenFiscalId").value(611))
            .andExpect(jsonPath("$.nombreOLRazonSocial").value("ALEJANDRA DE LA TORRE VERDUZCO"));
    }

    @Test
    void procesar_conPdfNaturalfoods_rfcCoincide() throws Exception {
        when(fideicomisoClient.obtenerRfc("555555555", "FIDEICOMISARIO", "1"))
            .thenReturn("NFI140728K35");

        var pdf = loadPdf("cedula fiscal Naturalfoods.pdf");

        mvc.perform(multipart("/api/v1/cif/procesar")
                .file(pdf)
                .param("fideicomisoId", "555555555")
                .param("tipoParticipante", "FIDEICOMISARIO")
                .param("numeroParticipante", "1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.rfc").value("NFI140728K35"))
            .andExpect(jsonPath("$.codigoPostal").value("36100"))
            // Bug 1 — calle = tipo de vialidad + nombre de vialidad (con salto de línea normalizado)
            .andExpect(jsonPath("$.calle").value("CARRETERA (CARR.) CARRETERA FEDERAL LIBRE IRAPUATO-GUANAJUATO"))
            .andExpect(jsonPath("$.numeroExterior").value("3.18 KM"))
            .andExpect(jsonPath("$.colonia").value("SAN ISIDRO"))
            // Bug 2 — municipio con salto de línea normalizado a espacio
            .andExpect(jsonPath("$.municipio").value("SILAO DE LA VICTORIA"))
            // Bug 3 — estado extraído y resuelto contra el catálogo
            .andExpect(jsonPath("$.estado").value("GUANAJUATO"))
            .andExpect(jsonPath("$.estadoId").value(11))
            // Bug 4 — referencia se detiene en el delimitador correcto (sin pie de página)
            .andExpect(jsonPath("$.referencia").value("Entre Calle: CALLE SIN NOMBRE, Y Calle: CALLE SIN NOMBRE"))
            // Lada "044" de "Tel. Móvil Lada:" debe concatenarse con el número
            .andExpect(jsonPath("$.telefono").value("0444776561420"))
            // Bug 5 — régimen sin fechas pegadas
            .andExpect(jsonPath("$.regimenFiscal").value("Régimen General de Ley Personas Morales"))
            // Bug 6 — régimen resuelto contra el catálogo (prefijo "Régimen " + descripción)
            .andExpect(jsonPath("$.regimenFiscalId").value(601))
            .andExpect(jsonPath("$.nombreOLRazonSocial").value("NATURAL FOODS INTERNACIONAL"));
    }

    @Test
    void procesar_rfcNoCoincide_returns409() throws Exception {
        when(fideicomisoClient.obtenerRfc("555555555", "FIDEICOMITENTE", "1"))
            .thenReturn("XXXXXX");

        var pdf = loadPdf("ALEJANDRA DE LA TORRE VERDUZCO CSF.pdf");

        mvc.perform(multipart("/api/v1/cif/procesar")
                .file(pdf)
                .param("fideicomisoId", "555555555")
                .param("tipoParticipante", "FIDEICOMITENTE")
                .param("numeroParticipante", "1"))
            .andExpect(status().isConflict());
    }

    @Test
    void procesar_pdfVacio_returns400() throws Exception {
        var pdf = new MockMultipartFile("file", "empty.pdf",
            MediaType.APPLICATION_PDF_VALUE, new byte[0]);

        mvc.perform(multipart("/api/v1/cif/procesar")
                .file(pdf)
                .param("fideicomisoId", "1234567890")
                .param("tipoParticipante", "FIDEICOMITENTE")
                .param("numeroParticipante", "1"))
            .andExpect(status().isBadRequest());
    }

    @Test
    void procesar_noEsPdf_returns400() throws Exception {
        var pdf = new MockMultipartFile("file", "notapdf.txt",
            MediaType.TEXT_PLAIN_VALUE, "not a pdf".getBytes());

        mvc.perform(multipart("/api/v1/cif/procesar")
                .file(pdf)
                .param("fideicomisoId", "1234567890")
                .param("tipoParticipante", "FIDEICOMITENTE")
                .param("numeroParticipante", "1"))
            .andExpect(status().isBadRequest());
    }

    private MockMultipartFile loadPdf(String name) {
        var is = getClass().getClassLoader().getResourceAsStream(name);
        if (is == null) throw new RuntimeException("PDF not found: " + name);
        try {
            return new MockMultipartFile("file", name, MediaType.APPLICATION_PDF_VALUE, is.readAllBytes());
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
