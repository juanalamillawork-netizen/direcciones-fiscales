package com.efisoft.direccionesfiscales.ms_direcciones_fiscales;

import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.context.jdbc.Sql.ExecutionPhase;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureMockMvc
@Sql(scripts = "classpath:direcciones-test-data.sql", executionPhase = ExecutionPhase.BEFORE_TEST_CLASS)
class CatalogosIntegrationTest {

    @Autowired
    private MockMvc mvc;

    @Nested
    class Paises {
        @Test
        void paises_returnsCatalogo() throws Exception {
            mvc.perform(get("/api/v1/catalogos/paises"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].nombre").value("México"));
        }
    }

    @Nested
    class Estados {
        @Test
        void estados_filtradosPorPaisId() throws Exception {
            mvc.perform(get("/api/v1/catalogos/estados?paisId=1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(3))
                .andExpect(jsonPath("$[0].paisId").value(1));
        }

        @Test
        void estados_sinPaisId_devuelveTodos() throws Exception {
            mvc.perform(get("/api/v1/catalogos/estados"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(3));
        }

        @Test
        void estados_sinCoincidencias_devuelveVacio() throws Exception {
            mvc.perform(get("/api/v1/catalogos/estados?paisId=999"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));
        }
    }

    @Nested
    class RegimenesFiscales {
        @Test
        void regimenes_sinFiltro_devuelveTodos() throws Exception {
            mvc.perform(get("/api/v1/catalogos/regimenes-fiscales"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(19))
                .andExpect(jsonPath("$[0].clave").value(601))
                .andExpect(jsonPath("$[?(@.clave == 601)].descripcion").value("General de Ley Personas Morales"));
        }

        @Test
        void regimenes_filtroFisica_devuelveSoloAplicablesAFisica() throws Exception {
            mvc.perform(get("/api/v1/catalogos/regimenes-fiscales?tipoPersona=FISICA"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(13))
                .andExpect(jsonPath("$[0].clave").value(605))
                .andExpect(jsonPath("$[?(@.clave == 605)].descripcion").value("Sueldos y Salarios e Ingresos Asimilados a Salarios"))
                .andExpect(jsonPath("$[?(@.clave == 601)]").isEmpty());
        }

        @Test
        void regimenes_filtroMoral_devuelveSoloAplicablesAMoral() throws Exception {
            mvc.perform(get("/api/v1/catalogos/regimenes-fiscales?tipoPersona=MORAL"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(8))
                .andExpect(jsonPath("$[0].clave").value(601))
                .andExpect(jsonPath("$[?(@.clave == 605)]").isEmpty());
        }

        @Test
        void regimenes_tipoPersonaInvalida_400() throws Exception {
            mvc.perform(get("/api/v1/catalogos/regimenes-fiscales?tipoPersona=INVALIDO"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$").value(org.hamcrest.Matchers.containsString("Tipo de persona inválido")));
        }
    }
}
