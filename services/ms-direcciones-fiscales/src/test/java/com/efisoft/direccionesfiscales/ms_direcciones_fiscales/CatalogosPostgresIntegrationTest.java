package com.efisoft.direccionesfiscales.ms_direcciones_fiscales;

import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.everyItem;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureMockMvc
@ActiveProfiles("postgres")
class CatalogosPostgresIntegrationTest {

    @Autowired
    private MockMvc mvc;

    @Nested
    class Paises {
        @Test
        void paises_devuelveMexicoSembrado() throws Exception {
            mvc.perform(get("/api/v1/catalogos/paises"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id == 1)].nombre").value("México"));
        }
    }

    @Nested
    class Estados {
        @Test
        void estados_filtradosPorPaisId_devuelveSembrados() throws Exception {
            mvc.perform(get("/api/v1/catalogos/estados?paisId=1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(3))
                .andExpect(jsonPath("$[*].paisId").value(everyItem(is(1))))
                .andExpect(jsonPath("$[?(@.id == 9)].nombre").value("Ciudad de México"))
                .andExpect(jsonPath("$[?(@.id == 15)].nombre").value("México (Estado de)"))
                .andExpect(jsonPath("$[?(@.id == 19)].nombre").value("Nuevo León"));
        }

        @Test
        void estados_sinPaisId_devuelveTodos() throws Exception {
            mvc.perform(get("/api/v1/catalogos/estados"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(3));
        }

        @Test
        void estados_paisSinCoincidencias_devuelveVacio() throws Exception {
            mvc.perform(get("/api/v1/catalogos/estados?paisId=999"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));
        }
    }

    @Nested
    class RegimenesFiscales {
        @Test
        void regimenes_sinFiltro_devuelveLos19Sembrados() throws Exception {
            mvc.perform(get("/api/v1/catalogos/regimenes-fiscales"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(19))
                .andExpect(jsonPath("$[?(@.clave == 601)].descripcion").value("General de Ley Personas Morales"))
                .andExpect(jsonPath("$[?(@.clave == 626)].descripcion").value("Régimen Simplificado de Confianza"));
        }

        @Test
        void regimenes_filtroFisica_devuelveSoloAplicablesAFisica() throws Exception {
            mvc.perform(get("/api/v1/catalogos/regimenes-fiscales?tipoPersona=FISICA"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(13))
                .andExpect(jsonPath("$[?(@.clave == 605)]").value(hasSize(1)))
                .andExpect(jsonPath("$[?(@.clave == 601)]").isEmpty())
                .andExpect(jsonPath("$[?(@.clave == 620)]").isEmpty());
        }

        @Test
        void regimenes_filtroMoral_devuelveSoloAplicablesAMoral() throws Exception {
            mvc.perform(get("/api/v1/catalogos/regimenes-fiscales?tipoPersona=MORAL"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(8))
                .andExpect(jsonPath("$[?(@.clave == 601)]").value(hasSize(1)))
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
