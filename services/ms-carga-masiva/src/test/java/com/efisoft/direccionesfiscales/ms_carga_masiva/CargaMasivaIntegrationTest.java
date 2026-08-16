package com.efisoft.direccionesfiscales.ms_carga_masiva;

import com.efisoft.direccionesfiscales.ms_carga_masiva.client.FideicomisoClient;
import com.efisoft.direccionesfiscales.ms_carga_masiva.entity.CatalogoEstado;
import com.efisoft.direccionesfiscales.ms_carga_masiva.entity.CatalogoPais;
import com.efisoft.direccionesfiscales.ms_carga_masiva.repository.CatalogoEstadoRepository;
import com.efisoft.direccionesfiscales.ms_carga_masiva.repository.CatalogoPaisRepository;
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

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private CatalogoPaisRepository catalogoPaisRepository;

    @Autowired
    private CatalogoEstadoRepository catalogoEstadoRepository;

    @MockitoBean
    private FideicomisoClient fideicomisoClient;

    private byte[] testFileContent;

    @BeforeEach
    void setUp() {
        catalogoPaisRepository.deleteAll();
        catalogoEstadoRepository.deleteAll();

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

        testFileContent = """
            1\t\t1850084029\tFIDEICOMITENTE\t1\t\tCABF860205560\t\tMEXICANA\t\t\t\t5555555555\t52\tjfelix@scotiabank.com.mx\t\t\t\tALMARCIGO SUR\tECATEPEC DE MORELOS\t\t55415\tMEXICO\tMEXICO\tZACAZONAPAN\tL1 MZ 34\tALMARCIGO SUR\tRégimen de Sueldos y Salarios e Ingresos Asimilados a Salarios
            2\t\t1850084029\tFIDEICOMISARIO\t2\t\tGAMG920223318\t\tMEXICANA\t\t\t\t5555555555\t53\tgaby@scotiabank.com.mx\t\t\t\tSANTA MARTHA DEL SUR\tCOYOACAN\t\t4270\tMEXICO\tCIUDAD DE MEXICO\tTASQUEÑA\t106\t1594\tRégimen de Sueldos y Salarios e Ingresos Asimilados a Salarios
            3\t\t1850084029\tFIDEICOMISARIO\t3\t\tFCM950703D3A\t\tMEXICANA\t\t\t\t5555555555\t54\tford@scotiabank.com.mx\t\t\t\tOTRA NO ESPECIFICADA EN EL CATALOGO\tNAUCALPAN DE JUAREZ\t\t53126\tMEXICO\tMEXICO\tHENRY FORD\t100\tPISO 1\tRégimen General de Ley Personas Morales
            """.replace("            ", "").getBytes();
    }

    @Test
    void uploadAndDetail() throws Exception {
        when(fideicomisoClient.getRfc(anyString(), anyInt(), anyInt()))
            .thenAnswer(inv -> {
                int numParticipante = inv.getArgument(2, Integer.class);
                return switch (numParticipante) {
                    case 1 -> Optional.of("CABF860205560");
                    case 2 -> Optional.of("GAMG920223318");
                    case 3 -> Optional.of("FCM950703D3A");
                    default -> Optional.empty();
                };
            });
        when(fideicomisoClient.getNombre(anyString(), anyInt(), anyInt()))
            .thenReturn(Optional.of("JUAN PEREZ"));

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
        when(fideicomisoClient.getRfc(anyString(), anyInt(), anyInt()))
            .thenAnswer(inv -> {
                int numParticipante = inv.getArgument(2, Integer.class);
                return switch (numParticipante) {
                    case 1 -> Optional.of("CABF860205560");
                    case 2 -> Optional.of("GAMG920223318");
                    case 3 -> Optional.of("FCM950703D3A");
                    default -> Optional.empty();
                };
            });
        when(fideicomisoClient.getNombre(anyString(), anyInt(), anyInt()))
            .thenReturn(Optional.of("JUAN PEREZ"));

        // Line 1: país "MARTE" no existe en catálogo → error
        // Lines 2-3: normales → éxito
        var content = ("""
            1\t\t1850084029\tFIDEICOMITENTE\t1\t\tCABF860205560\t\tMEXICANA\t\t\t\t5555555555\t52\tjfelix@scotiabank.com.mx\t\t\t\tALMARCIGO SUR\tECATEPEC DE MORELOS\t\t55415\tMARTE\tMEXICO\tZACAZONAPAN\tL1 MZ 34\tALMARCIGO SUR\tRégimen de Sueldos y Salarios e Ingresos Asimilados a Salarios
            2\t\t1850084029\tFIDEICOMISARIO\t2\t\tGAMG920223318\t\tMEXICANA\t\t\t\t5555555555\t53\tgaby@scotiabank.com.mx\t\t\t\tSANTA MARTHA DEL SUR\tCOYOACAN\t\t4270\tMEXICO\tMEXICO\tTASQUEÑA\t106\t1594\tRégimen de Sueldos y Salarios e Ingresos Asimilados a Salarios
            3\t\t1850084029\tFIDEICOMISARIO\t3\t\tFCM950703D3A\t\tMEXICANA\t\t\t\t5555555555\t54\tford@scotiabank.com.mx\t\t\t\tOTRA NO ESPECIFICADA EN EL CATALOGO\tNAUCALPAN DE JUAREZ\t\t53126\tMEXICO\tMEXICO\tHENRY FORD\t100\tPISO 1\tRégimen General de Ley Personas Morales
            """).replace("            ", "").getBytes();

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
            .andExpect(jsonPath("$.lineas[0].mensaje").value("País no encontrado en catálogo: 'MARTE'"))
            .andExpect(jsonPath("$.lineas[1].estatus").value("A"))
            .andExpect(jsonPath("$.lineas[2].estatus").value("A"));
    }

    @Test
    void uploadWithLongErrorMessage_truncatesTo500Chars() throws Exception {
        var longRfc = "A".repeat(600);
        when(fideicomisoClient.getRfc(anyString(), anyInt(), anyInt()))
            .thenThrow(new RuntimeException(longRfc));
        when(fideicomisoClient.getNombre(anyString(), anyInt(), anyInt()))
            .thenReturn(Optional.of("JUAN PEREZ"));

        var content = ("1\t\t1850084029\tFIDEICOMITENTE\t1\t\tCABF860205560\t\tMEXICANA\t\t\t\t5555555555\t52\tjfelix@scotiabank.com.mx\t\t\t\tALMARCIGO SUR\tECATEPEC DE MORELOS\t\t55415\tMEXICO\tMEXICO\tZACAZONAPAN\tL1 MZ 34\tALMARCIGO SUR\tRégimen de Sueldos y Salarios e Ingresos Asimilados a Salarios").getBytes();

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
        when(fideicomisoClient.getRfc(anyString(), anyInt(), anyInt()))
            .thenReturn(Optional.of("XXXX000000000"));
        when(fideicomisoClient.getNombre(anyString(), anyInt(), anyInt()))
            .thenReturn(Optional.of("JUAN PEREZ"));

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
}
