package com.efisoft.direccionesfiscales.ms_carga_masiva;

import com.efisoft.direccionesfiscales.ms_carga_masiva.client.FideicomisoClient;
import com.efisoft.direccionesfiscales.ms_carga_masiva.dto.NombreDTO;
import com.efisoft.direccionesfiscales.ms_carga_masiva.entity.CatalogoEstado;
import com.efisoft.direccionesfiscales.ms_carga_masiva.entity.CatalogoPais;
import com.efisoft.direccionesfiscales.ms_carga_masiva.repository.CatalogoEstadoRepository;
import com.efisoft.direccionesfiscales.ms_carga_masiva.repository.CatalogoPaisRepository;
import com.efisoft.direccionesfiscales.ms_carga_masiva.entity.DomicilioFiscalId;
import com.efisoft.direccionesfiscales.ms_carga_masiva.repository.DomicilioFiscalRepository;
import com.efisoft.direccionesfiscales.ms_carga_masiva.entity.CatalogoRegimenFiscal;
import com.efisoft.direccionesfiscales.ms_carga_masiva.repository.CatalogoRegimenFiscalRepository;

import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.context.jdbc.Sql.ExecutionPhase;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureMockMvc
@Sql(scripts = "classpath:unaccent-h2.sql", executionPhase = ExecutionPhase.BEFORE_TEST_CLASS)
class CargaMasivaIntegrationTest {

    private static final String ENCABEZADO =
    "fideicomiso|tipoParticipante|numeroParticipante|rfc|telefono|correoElectronico|" +
    "calle|numeroExterior|numeroInterior|colonia|municipio|localidad|codigoPostal|" +
    "pais|estado|regimenFiscal|referencia|nombreLegal\n";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private CatalogoPaisRepository catalogoPaisRepository;

    @Autowired
    private CatalogoEstadoRepository catalogoEstadoRepository;

    @Autowired
    private DomicilioFiscalRepository domicilioFiscalRepository;

    @Autowired
    private CatalogoRegimenFiscalRepository catalogoRegimenFiscalRepository;

    @MockitoBean
    private FideicomisoClient fideicomisoClient;

    private byte[] testFileContent;

    @BeforeEach
    void setUp() {
        catalogoPaisRepository.deleteAll();
        catalogoEstadoRepository.deleteAll();
        domicilioFiscalRepository.deleteAll();
        catalogoRegimenFiscalRepository.deleteAll();

        // Catálogos con acentos para probar búsqueda insensible a acentos
        var mexico = new CatalogoPais();
        mexico.setPaisId(1);
        mexico.setPaisNombre("MÉXICO");
        catalogoPaisRepository.save(mexico);

        var edoMex = new CatalogoEstado();
        edoMex.setEstadoId(1);
        edoMex.setEstadoNombre("MÉXICO");
        edoMex.setPaisId(1);
        catalogoEstadoRepository.save(edoMex);

        var cdmx = new CatalogoEstado();
        cdmx.setEstadoId(2);
        cdmx.setEstadoNombre("CIUDAD DE MÉXICO");
        cdmx.setPaisId(1);
        catalogoEstadoRepository.save(cdmx);

        var reg605 = new CatalogoRegimenFiscal();
        reg605.setRegClave(605);
        reg605.setRegDescripcion("Sueldos y Salarios e Ingresos Asimilados a Salarios");
        reg605.setRegAplicaFisica(true);
        reg605.setRegAplicaMoral(true);
        catalogoRegimenFiscalRepository.save(reg605);

        var reg601 = new CatalogoRegimenFiscal();
        reg601.setRegClave(601);
        reg601.setRegDescripcion("General de Ley Personas Morales");
        reg601.setRegAplicaFisica(false);
        reg601.setRegAplicaMoral(true);
        catalogoRegimenFiscalRepository.save(reg601);

        testFileContent = (ENCABEZADO + """
            1850084029|FIDEICOMITENTE|1|CABF860205560|5555555555|jfelix@scotiabank.com.mx|ALMARCIGO SUR|L1 MZ 34||ZACAZONAPAN|ECATEPEC DE MORELOS||55415|1|1|605||
            1850084029|FIDEICOMISARIO|2|GAMG920223318|5555555555|gaby@scotiabank.com.mx|SANTA MARTHA DEL SUR|106||TASQUEÑA|COYOACAN||04270|1|2|605|1594|
            1850084029|FIDEICOMISARIO|3|FCM950703D3A|5555555555|ford@scotiabank.com.mx|HENRY FORD|100|PISO 1|OTRA NO ESPECIFICADA EN EL CATALOGO|NAUCALPAN DE JUAREZ||53126|1|1|601||
         """).replace("            ", "").getBytes();
    }

    @Test
    void uploadAndDetail() throws Exception {
        when(fideicomisoClient.getRfc(anyString(), anyString(), anyInt()))
            .thenAnswer(inv -> {
                int numParticipante = inv.getArgument(2, Integer.class);
                return switch (numParticipante) {
                    case 1 -> Optional.of("CABF860205560");
                    case 2 -> Optional.of("GAMG920223318");
                    case 3 -> Optional.of("FCM950703D3A");
                    default -> Optional.empty();
                };
            });
        when(fideicomisoClient.getNombre(anyString(), anyString(), anyInt()))
            .thenReturn(Optional.of(new NombreDTO("JUAN PEREZ", "FISICA")));

        var multipartFile = new MockMultipartFile(
            "archivo", "test.txt", MediaType.TEXT_PLAIN_VALUE, testFileContent);

        var result = mockMvc.perform(multipart("/api/v1/carga-masiva/direcciones-fiscales")
                .file(multipartFile)
                .param("usuario", "TEST"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.totalRegistros").value(3))
            .andExpect(jsonPath("$.registrosExitosos").value(3))
            .andExpect(jsonPath("$.registrosConError").value(0))
            .andReturn();

        String loteId = JsonPath.read(result.getResponse().getContentAsString(), "$.loteId");

        mockMvc.perform(get("/api/v1/carga-masiva/{loteId}/detalle", loteId))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.totalRegistros").value(3));
    }

    @Test
    void uploadWithCatalogNotFound_continuesProcessing() throws Exception {
        when(fideicomisoClient.getRfc(anyString(), anyString(), anyInt()))
                .thenAnswer(inv -> {
                    int numParticipante = inv.getArgument(2, Integer.class);
                    return switch (numParticipante) {
                        case 1 -> Optional.of("CABF860205560");
                        case 2 -> Optional.of("GAMG920223318");
                        case 3 -> Optional.of("FCM950703D3A");
                        default -> Optional.empty();
                    };
                });
        when(fideicomisoClient.getNombre(anyString(), anyString(), anyInt()))
                .thenReturn(Optional.of(new NombreDTO("JUAN PEREZ", "FISICA")));

        var content = (ENCABEZADO
                + """
                        1850084029|FIDEICOMITENTE|1|CABF860205560|5555555555|jfelix@scotiabank.com.mx|ALMARCIGO SUR|L1 MZ 34||ZACAZONAPAN|ECATEPEC DE MORELOS||55415|999|1|605||
                        1850084029|FIDEICOMISARIO|2|GAMG920223318|5555555555|gaby@scotiabank.com.mx|SANTA MARTHA DEL SUR|106||TASQUEÑA|COYOACAN||04270|1|2|605|1594|
                        1850084029|FIDEICOMISARIO|3|FCM950703D3A|5555555555|ford@scotiabank.com.mx|HENRY FORD|100|PISO 1|OTRA NO ESPECIFICADA EN EL CATALOGO|NAUCALPAN DE JUAREZ||53126|1|1|601||
                                  """)
                .replace("            ", "").getBytes();

        var multipartFile = new MockMultipartFile(
                "archivo", "test.txt", MediaType.TEXT_PLAIN_VALUE, content);

        mockMvc.perform(multipart("/api/v1/carga-masiva/direcciones-fiscales")
                .file(multipartFile)
                .param("usuario", "TEST"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalRegistros").value(3))
                .andExpect(jsonPath("$.registrosExitosos").value(2))
                .andExpect(jsonPath("$.registrosConError").value(1))
                .andExpect(jsonPath("$.lineas[0].estatus").value("E"))
                .andExpect(jsonPath("$.lineas[0].mensaje").value("País no encontrado en catálogo: '999'."))
                .andExpect(jsonPath("$.lineas[1].estatus").value("A"))
                .andExpect(jsonPath("$.lineas[2].estatus").value("A"));
    }

   @Test
   void uploadWithLongErrorMessage_truncatesTo500Chars() throws Exception {
       var longRfc = "A".repeat(600);
       when(fideicomisoClient.getRfc(anyString(), anyString(), anyInt()))
               .thenThrow(new RuntimeException(longRfc));
       when(fideicomisoClient.getNombre(anyString(), anyString(), anyInt()))
               .thenReturn(Optional.of(new NombreDTO("JUAN PEREZ", "FISICA")));

       var content = (ENCABEZADO +
               "1850084029|FIDEICOMITENTE|1|CABF860205560|5555555555|jfelix@scotiabank.com.mx|ALMARCIGO SUR|L1 MZ 34||ZACAZONAPAN|ECATEPEC DE MORELOS||55415|1|1|605||")
               .getBytes();

       var multipartFile = new MockMultipartFile(
               "archivo", "test.txt", MediaType.TEXT_PLAIN_VALUE, content);

       var result = mockMvc.perform(multipart("/api/v1/carga-masiva/direcciones-fiscales")
               .file(multipartFile)
               .param("usuario", "TEST"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.totalRegistros").value(1))
               .andExpect(jsonPath("$.registrosConError").value(1))
               .andExpect(jsonPath("$.lineas[0].estatus").value("E"))
               .andReturn();

       String mensaje = JsonPath.read(result.getResponse().getContentAsString(), "$.lineas[0].mensaje");
       assert mensaje.length() == 500 : "Expected 500 chars but got " + mensaje.length();
   }

    @Test
    void uploadWithRfcMismatch() throws Exception {
        when(fideicomisoClient.getRfc(anyString(), anyString(), anyInt()))
            .thenReturn(Optional.of("XXXX000000000"));
        when(fideicomisoClient.getNombre(anyString(), anyString(), anyInt()))
            .thenReturn(Optional.of(new NombreDTO("JUAN PEREZ", "FISICA")));

        var multipartFile = new MockMultipartFile(
            "archivo", "test.txt", MediaType.TEXT_PLAIN_VALUE, testFileContent);

        mockMvc.perform(multipart("/api/v1/carga-masiva/direcciones-fiscales")
                .file(multipartFile)
                .param("usuario", "TEST"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.totalRegistros").value(3))
            .andExpect(jsonPath("$.registrosExitosos").value(0))
            .andExpect(jsonPath("$.registrosConError").value(3));
    }

    @Test
    void uploadAndVerifyNombreLegalPersisted() throws Exception {

        when(fideicomisoClient.getRfc(anyString(), anyString(), anyInt()))
                .thenAnswer(inv -> {
                    int numParticipante = inv.getArgument(2, Integer.class);

                    return switch (numParticipante) {
                        case 1 -> Optional.of("CABF860205560");
                        case 2 -> Optional.of("GAMG920223318");
                        case 3 -> Optional.of("FCM950703D3A");
                        default -> Optional.empty();
                    };
                });

        when(fideicomisoClient.getNombre(anyString(), anyString(), anyInt()))
                .thenReturn(Optional.of(
                        new NombreDTO("EMPRESA EJEMPLO SA DE CV", "MORAL")));

        var multipartFile = new MockMultipartFile(
                "archivo",
                "test.txt",
                MediaType.TEXT_PLAIN_VALUE,
                testFileContent);

        mockMvc.perform(multipart("/api/v1/carga-masiva/direcciones-fiscales")
                .file(multipartFile)
                .param("usuario", "TEST"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalRegistros").value(3))
                .andExpect(jsonPath("$.registrosExitosos").value(3))
                .andExpect(jsonPath("$.registrosConError").value(0));

        var id = new DomicilioFiscalId(
                "1850084029",
                "FIDEICOMITENTE",
                "1");

        var domicilio = domicilioFiscalRepository.findById(id)
                .orElseThrow(() -> new AssertionError("No se encontró el domicilio fiscal"));

        assertNotNull(domicilio.getDifNomLegal());

        assertEquals(
                "EMPRESA EJEMPLO SA DE CV",
                domicilio.getDifNomLegal());
    }

    @Test
    void uploadWithInvalidHeader_returns400() throws Exception {
        var content = ("encabezado|incorrecto\n" +
                "1850084029|FIDEICOMITENTE|1|CABF860205560|5555555555|a@b.com|" +
                "CALLE|1||COL|MUN||12345|1|1|605||\n").getBytes();

        var file = new MockMultipartFile("archivo", "test.txt",
                MediaType.TEXT_PLAIN_VALUE, content);

        mockMvc.perform(multipart("/api/v1/carga-masiva/direcciones-fiscales")
                .file(file).param("usuario", "TEST"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("ENCABEZADO_INVALIDO"));
    }

    @Test
    void uploadWithEmptyFile_returns400() throws Exception {
        var file = new MockMultipartFile("archivo", "test.txt",
                MediaType.TEXT_PLAIN_VALUE, new byte[0]);

        mockMvc.perform(multipart("/api/v1/carga-masiva/direcciones-fiscales")
                .file(file).param("usuario", "TEST"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("ARCHIVO_VACIO"));
    }

    @Test
    void uploadWithOnlyHeader_returnsZeroRegistros() throws Exception {
        var file = new MockMultipartFile("archivo", "test.txt",
                MediaType.TEXT_PLAIN_VALUE, ENCABEZADO.getBytes());

        mockMvc.perform(multipart("/api/v1/carga-masiva/direcciones-fiscales")
                .file(file).param("usuario", "TEST"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalRegistros").value(0))
                .andExpect(jsonPath("$.registrosExitosos").value(0));
    }

    @Test
    void uploadDuplicateDireccion_marksAsError() throws Exception {
        when(fideicomisoClient.getRfc(anyString(), anyString(), anyInt()))
                .thenAnswer(inv -> {
                    int n = inv.getArgument(2, Integer.class);
                    return switch (n) {
                        case 1 -> Optional.of("CABF860205560");
                        case 2 -> Optional.of("GAMG920223318");
                        case 3 -> Optional.of("FCM950703D3A");
                        default -> Optional.empty();
                    };
                });
        when(fideicomisoClient.getNombre(anyString(), anyString(), anyInt()))
                .thenReturn(Optional.of(new NombreDTO("JUAN PEREZ", "FISICA")));

        var file = new MockMultipartFile("archivo", "test.txt",
                MediaType.TEXT_PLAIN_VALUE, testFileContent);

        // 1er upload: 3 OK
        mockMvc.perform(multipart("/api/v1/carga-masiva/direcciones-fiscales")
                .file(file).param("usuario", "TEST"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.registrosExitosos").value(3));

        // 2do upload: 3 errores por duplicado
        mockMvc.perform(multipart("/api/v1/carga-masiva/direcciones-fiscales")
                .file(file).param("usuario", "TEST"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.registrosExitosos").value(0))
                .andExpect(jsonPath("$.registrosConError").value(3))
                .andExpect(jsonPath("$.lineas[0].mensaje")
                        .value("La dirección ya se encuentra registrada para el participante."));
    }

    @Test
    void uploadAndVerifyRegistroVisible() throws Exception {
        when(fideicomisoClient.getRfc(anyString(), anyString(), anyInt()))
                .thenAnswer(inv -> {
                    int n = inv.getArgument(2, Integer.class);
                    return switch (n) {
                        case 1 -> Optional.of("CABF860205560");
                        case 2 -> Optional.of("GAMG920223318");
                        case 3 -> Optional.of("FCM950703D3A");
                        default -> Optional.empty();
                    };
                });
        when(fideicomisoClient.getNombre(anyString(), anyString(), anyInt()))
                .thenReturn(Optional.of(new NombreDTO("JUAN PEREZ", "FISICA")));

        var file = new MockMultipartFile("archivo", "test.txt",
                MediaType.TEXT_PLAIN_VALUE, testFileContent);

        mockMvc.perform(multipart("/api/v1/carga-masiva/direcciones-fiscales")
                .file(file).param("usuario", "TEST"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.lineas[0].registroVisible")
                        .value("RFC: CABF860205560"));
    }

    @Test
    void uploadAndVerifyMensajeAmigable() throws Exception {
        // Línea sin CP → mensaje humanizado
        var content = (ENCABEZADO +
                "1850084029|FIDEICOMITENTE|1|CABF860205560|5555555555|a@b.com|" +
                "CALLE|1||COL|MUN|||1|1|605||\n").getBytes();

        var file = new MockMultipartFile("archivo", "test.txt",
                MediaType.TEXT_PLAIN_VALUE, content);

        mockMvc.perform(multipart("/api/v1/carga-masiva/direcciones-fiscales")
                .file(file).param("usuario", "TEST"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.lineas[0].mensaje")
                        .value(org.hamcrest.Matchers.containsString(
                                "El campo 'Código Postal' es obligatorio.")));
    }

    @Test
    void uploadReturnsLoteIdWithUuidFormat() throws Exception {
            when(fideicomisoClient.getRfc(anyString(), anyString(), anyInt()))
                            .thenAnswer(inv -> {
                                    int n = inv.getArgument(2, Integer.class);
                                    return switch (n) {
                                            case 1 -> Optional.of("CABF860205560");
                                            case 2 -> Optional.of("GAMG920223318");
                                            case 3 -> Optional.of("FCM950703D3A");
                                            default -> Optional.empty();
                                    };
                            });
            when(fideicomisoClient.getNombre(anyString(), anyString(), anyInt()))
                            .thenReturn(Optional.of(new NombreDTO("JUAN PEREZ", "FISICA")));

            var multipartFile = new MockMultipartFile(
                            "archivo", "test.txt", MediaType.TEXT_PLAIN_VALUE, testFileContent);

            mockMvc.perform(multipart("/api/v1/carga-masiva/direcciones-fiscales")
                            .file(multipartFile)
                            .param("usuario", "TEST"))
                            .andExpect(status().isOk())
                            .andExpect(jsonPath("$.loteId").value(org.hamcrest.Matchers.startsWith("LOTE-")))
                            .andExpect(jsonPath("$.loteId").value(org.hamcrest.Matchers.hasLength(41))); // "LOTE-" (5)
                                                                                                         // + UUID (36)
    }

    @Test
    void uploadTwoFilesSameName_generatesDifferentLoteIds() throws Exception {
            when(fideicomisoClient.getRfc(anyString(), anyString(), anyInt()))
                            .thenAnswer(inv -> {
                                    int n = inv.getArgument(2, Integer.class);
                                    return switch (n) {
                                            case 1 -> Optional.of("CABF860205560");
                                            case 2 -> Optional.of("GAMG920223318");
                                            case 3 -> Optional.of("FCM950703D3A");
                                            default -> Optional.empty();
                                    };
                            });
            when(fideicomisoClient.getNombre(anyString(), anyString(), anyInt()))
                            .thenReturn(Optional.of(new NombreDTO("JUAN PEREZ", "FISICA")));

            var file1 = new MockMultipartFile(
                            "archivo", "test.txt", MediaType.TEXT_PLAIN_VALUE, testFileContent);
            var file2 = new MockMultipartFile(
                            "archivo", "test.txt", MediaType.TEXT_PLAIN_VALUE, testFileContent);

            // Primer upload
            var r1 = mockMvc.perform(multipart("/api/v1/carga-masiva/direcciones-fiscales")
                            .file(file1).param("usuario", "TEST"))
                            .andExpect(status().isOk())
                            .andReturn();
            String loteId1 = JsonPath.read(r1.getResponse().getContentAsString(), "$.loteId");

            // Segundo upload, mismo nombre de archivo
            var r2 = mockMvc.perform(multipart("/api/v1/carga-masiva/direcciones-fiscales")
                            .file(file2).param("usuario", "TEST"))
                            .andExpect(status().isOk())
                            .andReturn();
            String loteId2 = JsonPath.read(r2.getResponse().getContentAsString(), "$.loteId");

            // Los lotes deben ser distintos
            org.junit.jupiter.api.Assertions.assertNotEquals(loteId1, loteId2);

            // Y el detalle de cada lote debe devolver 3 registros (no 6 mezclados)
            mockMvc.perform(get("/api/v1/carga-masiva/{loteId}/detalle", loteId1))
                            .andExpect(status().isOk())
                            .andExpect(jsonPath("$.totalRegistros").value(3));

            mockMvc.perform(get("/api/v1/carga-masiva/{loteId}/detalle", loteId2))
                            .andExpect(status().isOk())
                            .andExpect(jsonPath("$.totalRegistros").value(3));
    }
}
