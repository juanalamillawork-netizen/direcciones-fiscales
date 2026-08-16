package com.efisoft.direccionesfiscales.ms_direcciones_fiscales;

import com.efisoft.direccionesfiscales.ms_direcciones_fiscales.client.FideicomisoClient;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.context.jdbc.Sql.ExecutionPhase;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureMockMvc
@Sql(scripts = "classpath:direcciones-test-data.sql", executionPhase = ExecutionPhase.BEFORE_TEST_CLASS)
class DireccionesFiscalesIntegrationTest {

    @Autowired
    private MockMvc mvc;

    @MockitoBean
    private FideicomisoClient fideicomisoClient;

    @Nested
    class Busqueda {
        @Test
        void buscar_sinCriterios_devuelveTodos() throws Exception {
            mvc.perform(get("/api/v1/direcciones-fiscales"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(3));
        }

        @Test
        void buscar_returnsResults_byFideicomisoId() throws Exception {
            mvc.perform(get("/api/v1/direcciones-fiscales?fideicomisoId={id}", "1234567890"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
        }

        @Test
        void buscar_returnsResults_byTipoPersona() throws Exception {
            mvc.perform(get("/api/v1/direcciones-fiscales?tipoPersona={tipo}", "FIDEICOMITENTE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
        }

        @Test
        void buscar_returnsResults_byBoth() throws Exception {
            mvc.perform(get("/api/v1/direcciones-fiscales?fideicomisoId={id}&tipoPersona={tipo}",
                    "1234567890", "FIDEICOMITENTE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].calle").value("Calle Principal"));
        }

        @Test
        void buscar_returnsEmpty_whenNoMatch() throws Exception {
            mvc.perform(get("/api/v1/direcciones-fiscales?fideicomisoId={id}", "999999999"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));
        }

        @Test
        void detalle_returns200_whenExists() throws Exception {
            mvc.perform(get("/api/v1/direcciones-fiscales/{numContrato}/{cvePers}/{numPersFid}",
                    "1234567890", "FIDEICOMITENTE", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fideicomisoId").value("1234567890"))
                .andExpect(jsonPath("$.tipoPersona").value("FIDEICOMITENTE"))
                .andExpect(jsonPath("$.numeroParticipante").value("1"))
                .andExpect(jsonPath("$.calle").value("Calle Principal"))
                .andExpect(jsonPath("$.numeroExterior").value("123"))
                .andExpect(jsonPath("$.codigoPostal").value("06600"))
                .andExpect(jsonPath("$.correoElectronico").value("contacto@empresauno.com"));
        }

        @Test
        void detalle_returns404_whenNotFound() throws Exception {
            mvc.perform(get("/api/v1/direcciones-fiscales/{numContrato}/{cvePers}/{numPersFid}",
                    "999999999", "FIDEICOMITENTE", "1"))
                .andExpect(status().isNotFound());
        }
    }

    @Nested
    class Alta {
        @Test
        void altaExitosa() throws Exception {
            when(fideicomisoClient.getNombre("FIDEICOMITENTE", "111111111", "1"))
                .thenReturn(Optional.of("Nueva Empresa S.A. de C.V."));

            var json = """
                {
                    "fideicomisoId": "111111111",
                    "tipoPersona": "FIDEICOMITENTE",
                    "numeroParticipante": "1",
                    "calle": "Av. Siempre Viva",
                    "numeroExterior": "742",
                    "numeroInterior": "B",
                    "colonia": "Colonia Nueva",
                    "municipio": "Monterrey",
                    "localidad": "Centro",
                    "paisId": 1,
                    "estadoId": 19,
                    "codigoPostal": "64000",
                    "referencia": "Junto al parque",
                    "telefono": "5550001111",
                    "regimenFiscal": "601",
                    "correoElectronico": "nueva.empresa@correo.com"
                }
                """;

            mvc.perform(post("/api/v1/direcciones-fiscales")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(json))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.fideicomisoId").value("111111111"))
                .andExpect(jsonPath("$.tipoPersona").value("FIDEICOMITENTE"))
                .andExpect(jsonPath("$.numeroParticipante").value("1"))
                .andExpect(jsonPath("$.calle").value("Av. Siempre Viva"))
                .andExpect(jsonPath("$.numeroExterior").value("742"))
                .andExpect(jsonPath("$.codigoPostal").value("64000"))
                .andExpect(jsonPath("$.correoElectronico").value("nueva.empresa@correo.com"))
                .andExpect(jsonPath("$.nombreLegal").value("Nueva Empresa S.A. de C.V."));
        }

        @Test
        void altaPersisteCorreoElectronico_cuandoSeConsultaDespues() throws Exception {
            when(fideicomisoClient.getNombre("FIDEICOMITENTE", "666666666", "1"))
                .thenReturn(Optional.of("Nueva Empresa S.A. de C.V."));

            var json = """
                {
                    "fideicomisoId": "666666666",
                    "tipoPersona": "FIDEICOMITENTE",
                    "numeroParticipante": "1",
                    "calle": "Av. Siempre Viva",
                    "numeroExterior": "742",
                    "colonia": "Colonia Nueva",
                    "municipio": "Monterrey",
                    "paisId": 1,
                    "estadoId": 19,
                    "codigoPostal": "64000",
                    "correoElectronico": "guardado.permanente@correo.com"
                }
                """;

            mvc.perform(post("/api/v1/direcciones-fiscales")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(json))
                .andExpect(status().isCreated());

            mvc.perform(get("/api/v1/direcciones-fiscales/{numContrato}/{cvePers}/{numPersFid}",
                    "666666666", "FIDEICOMITENTE", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.correoElectronico").value("guardado.permanente@correo.com"));
        }

        @Test
        void altaRechazada_porCorreoInvalido() throws Exception {
            var json = """
                {
                    "fideicomisoId": "444444444",
                    "tipoPersona": "FIDEICOMITENTE",
                    "numeroParticipante": "1",
                    "calle": "Calle del Correo",
                    "numeroExterior": "123",
                    "colonia": "Colonia Test",
                    "municipio": "CDMX",
                    "paisId": 1,
                    "estadoId": 9,
                    "codigoPostal": "06600",
                    "correoElectronico": "correo-invalido"
                }
                """;

            mvc.perform(post("/api/v1/direcciones-fiscales")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(json))
                .andExpect(status().isBadRequest());
        }

        @Test
        void altaExitosa_sinNombreLegal_cuandoAdapterNoDisponible() throws Exception {
            when(fideicomisoClient.getNombre(anyString(), anyString(), anyString()))
                .thenReturn(Optional.empty());

            var json = """
                {
                    "fideicomisoId": "222222222",
                    "tipoPersona": "FIDEICOMISARIO",
                    "numeroParticipante": "2",
                    "calle": "Calle del Adapter Caido",
                    "numeroExterior": "999",
                    "colonia": "Colonia Fallback",
                    "municipio": "CDMX",
                    "paisId": 1,
                    "estadoId": 9,
                    "codigoPostal": "06600",
                    "regimenFiscal": "605"
                }
                """;

            mvc.perform(post("/api/v1/direcciones-fiscales")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(json))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.nombreLegal").doesNotExist());
        }

        @Test
        void altaRechazada_porCpInvalido() throws Exception {
            var json = """
                {
                    "fideicomisoId": "333333333",
                    "tipoPersona": "FIDEICOMITENTE",
                    "numeroParticipante": "1",
                    "calle": "Calle Falsa",
                    "numeroExterior": "123",
                    "colonia": "Colonia Test",
                    "municipio": "CDMX",
                    "paisId": 1,
                    "estadoId": 9,
                    "codigoPostal": "abcdef"
                }
                """;

            mvc.perform(post("/api/v1/direcciones-fiscales")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(json))
                .andExpect(status().isBadRequest());
        }

        @Test
        void altaRechazada_porFideicomisoIdNoNumerico() throws Exception {
            var json = """
                {
                    "fideicomisoId": "ABC123",
                    "tipoPersona": "FIDEICOMITENTE",
                    "numeroParticipante": "1",
                    "calle": "Calle",
                    "numeroExterior": "123",
                    "colonia": "Colonia",
                    "municipio": "CDMX",
                    "paisId": 1,
                    "estadoId": 9,
                    "codigoPostal": "06600"
                }
                """;

            mvc.perform(post("/api/v1/direcciones-fiscales")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(json))
                .andExpect(status().isBadRequest());
        }

        @Test
        void altaRechazada_porFideicomisoIdExcede10Digitos() throws Exception {
            var json = """
                {
                    "fideicomisoId": "12345678901",
                    "tipoPersona": "FIDEICOMITENTE",
                    "numeroParticipante": "1",
                    "calle": "Calle",
                    "numeroExterior": "123",
                    "colonia": "Colonia",
                    "municipio": "CDMX",
                    "paisId": 1,
                    "estadoId": 9,
                    "codigoPostal": "06600"
                }
                """;

            mvc.perform(post("/api/v1/direcciones-fiscales")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(json))
                .andExpect(status().isBadRequest());
        }

        @Test
        void altaRechazada_porTipoPersonaInvalido() throws Exception {
            var json = """
                {
                    "fideicomisoId": "111111111",
                    "tipoPersona": "INVALIDO",
                    "numeroParticipante": "1",
                    "calle": "Calle",
                    "numeroExterior": "123",
                    "colonia": "Colonia",
                    "municipio": "CDMX",
                    "paisId": 1,
                    "estadoId": 9,
                    "codigoPostal": "06600"
                }
                """;

            mvc.perform(post("/api/v1/direcciones-fiscales")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(json))
                .andExpect(status().isBadRequest());
        }

        @Test
        void altaRechazada_porDuplicado() throws Exception {
            var json = """
                {
                    "fideicomisoId": "1234567890",
                    "tipoPersona": "FIDEICOMITENTE",
                    "numeroParticipante": "1",
                    "calle": "Otra Calle",
                    "numeroExterior": "999",
                    "colonia": "Colonia X",
                    "municipio": "CDMX",
                    "paisId": 1,
                    "estadoId": 9,
                    "codigoPostal": "06600"
                }
                """;

            mvc.perform(post("/api/v1/direcciones-fiscales")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(json))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$").value(org.hamcrest.Matchers.containsString("Ya existe")));
        }
    }

    @Nested
    class Edicion {
        @Test
        void edicionExitosa_modificaCalleCpTelefono() throws Exception {
            when(fideicomisoClient.getNombre("FIDEICOMITENTE", "1234567890", "1"))
                .thenReturn(Optional.of("Empresa Uno S.A. de C.V."));

            var json = """
                {
                    "calle": "Calle Modificada",
                    "numeroExterior": "456",
                    "colonia": "Colonia Centro",
                    "municipio": "Ciudad de México",
                    "localidad": "Centro",
                    "paisId": 1,
                    "estadoId": 9,
                    "codigoPostal": "06601",
                    "telefono": "5559998888",
                    "regimenFiscal": "601",
                    "correoElectronico": "nuevo.correo@empresauno.com"
                }
                """;

            mvc.perform(put("/api/v1/direcciones-fiscales/{numContrato}/{cvePers}/{numPersFid}",
                    "1234567890", "FIDEICOMITENTE", "1")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.calle").value("Calle Modificada"))
                .andExpect(jsonPath("$.numeroExterior").value("456"))
                .andExpect(jsonPath("$.codigoPostal").value("06601"))
                .andExpect(jsonPath("$.telefono").value("5559998888"))
                .andExpect(jsonPath("$.correoElectronico").value("nuevo.correo@empresauno.com"))
                .andExpect(jsonPath("$.nombreLegal").value("Empresa Uno S.A. de C.V."))
                .andExpect(jsonPath("$.fideicomisoId").value("1234567890"))
                .andExpect(jsonPath("$.tipoPersona").value("FIDEICOMITENTE"))
                .andExpect(jsonPath("$.numeroParticipante").value("1"));
        }

        @Test
        void edicionRechazada_404_llaveNoExiste() throws Exception {
            var json = """
                {
                    "calle": "Sin registro",
                    "numeroExterior": "1",
                    "colonia": "X",
                    "municipio": "Y",
                    "paisId": 1,
                    "estadoId": 9,
                    "codigoPostal": "06600"
                }
                """;

            mvc.perform(put("/api/v1/direcciones-fiscales/{numContrato}/{cvePers}/{numPersFid}",
                    "999999999", "FIDEICOMITENTE", "99")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(json))
                .andExpect(status().isNotFound());
        }
    }

    @Nested
    class Baja {
        @Test
        void bajaExitosa_borraRegistroYResponde204() throws Exception {
            when(fideicomisoClient.getNombre("FIDEICOMITENTE", "777777777", "1"))
                .thenReturn(Optional.of("Empresa a Borrar S.A. de C.V."));

            var json = """
                {
                    "fideicomisoId": "777777777",
                    "tipoPersona": "FIDEICOMITENTE",
                    "numeroParticipante": "1",
                    "calle": "Calle por Borrar",
                    "numeroExterior": "1",
                    "colonia": "Colonia Test",
                    "municipio": "CDMX",
                    "paisId": 1,
                    "estadoId": 9,
                    "codigoPostal": "06600"
                }
                """;

            mvc.perform(post("/api/v1/direcciones-fiscales")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(json))
                .andExpect(status().isCreated());

            mvc.perform(delete("/api/v1/direcciones-fiscales/{numContrato}/{cvePers}/{numPersFid}",
                    "777777777", "FIDEICOMITENTE", "1"))
                .andExpect(status().isNoContent());

            mvc.perform(get("/api/v1/direcciones-fiscales/{numContrato}/{cvePers}/{numPersFid}",
                    "777777777", "FIDEICOMITENTE", "1"))
                .andExpect(status().isNotFound());
        }

        @Test
        void bajaRechazada_404_llaveNoExiste() throws Exception {
            mvc.perform(delete("/api/v1/direcciones-fiscales/{numContrato}/{cvePers}/{numPersFid}",
                    "999999999", "FIDEICOMITENTE", "99"))
                .andExpect(status().isNotFound());
        }
    }
}
