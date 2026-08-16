package com.efisoft.direccionesfiscales.ms_fideicomisos_adapter;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.context.jdbc.Sql.ExecutionPhase;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureMockMvc
@Sql(scripts = "classpath:fideicomisos-test-data.sql", executionPhase = ExecutionPhase.BEFORE_TEST_CLASS)
class FideicomisoIntegrationTest {

    @Autowired
    private MockMvc mvc;

    @Test
    void getFideicomiso_returns200_whenExists() throws Exception {
        mvc.perform(get("/api/v1/fideicomisos/{numContrato}", 1234567890))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.numContrato").value(1234567890))
            .andExpect(jsonPath("$.nombre").value("Fideicomiso Test Uno"));
    }

    @Test
    void getFideicomiso_returns404_whenNotFound() throws Exception {
        mvc.perform(get("/api/v1/fideicomisos/{numContrato}", 999999999))
            .andExpect(status().isNotFound());
    }

    @Test
    void getRfcParticipante_returns200_forFideicomitente() throws Exception {
        mvc.perform(get("/api/v1/fideicomisos/{numContrato}/participantes/{tipo}/{num}/rfc",
                1234567890, "FIDEICOMITENTE", 1))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.rfc").value("FID123456XXX"));
    }

    @Test
    void getRfcParticipante_returns200_forBeneficiario() throws Exception {
        mvc.perform(get("/api/v1/fideicomisos/{numContrato}/participantes/{tipo}/{num}/rfc",
                1234567890, "FIDEICOMISARIO", 1))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.rfc").value("BEN123456XXX"));
    }

    @Test
    void getRfcParticipante_returns200_forTercero() throws Exception {
        mvc.perform(get("/api/v1/fideicomisos/{numContrato}/participantes/{tipo}/{num}/rfc",
                1234567890, "TERCERO", 1))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.rfc").value("TER123456XXX"));
    }

    @Test
    void getRfcParticipante_returns404_whenNotFound() throws Exception {
        mvc.perform(get("/api/v1/fideicomisos/{numContrato}/participantes/{tipo}/{num}/rfc",
                1234567890, "FIDEICOMITENTE", 99))
            .andExpect(status().isNotFound());
    }

    @Test
    void getNombreParticipante_returns200_forFideicomitente() throws Exception {
        mvc.perform(get("/api/v1/fideicomisos/{numContrato}/participantes/{tipo}/{num}/nombre",
                1234567890, "FIDEICOMITENTE", 1))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.nombre").value("Fideicomitente Uno"))
            .andExpect(jsonPath("$.tipoPersona").value("FISICA"));
    }

    @Test
    void getNombreParticipante_returns200_forBeneficiario() throws Exception {
        mvc.perform(get("/api/v1/fideicomisos/{numContrato}/participantes/{tipo}/{num}/nombre",
                1234567890, "FIDEICOMISARIO", 1))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.nombre").value("Beneficiario Uno"))
            .andExpect(jsonPath("$.tipoPersona").value("FISICA"));
    }

    @Test
    void getNombreParticipante_returns200_forTercero() throws Exception {
        mvc.perform(get("/api/v1/fideicomisos/{numContrato}/participantes/{tipo}/{num}/nombre",
                1234567890, "TERCERO", 1))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.nombre").value("Tercero Uno"))
            .andExpect(jsonPath("$.tipoPersona").value("MORAL"));
    }

    @Test
    void getNombreParticipante_returns404_whenNotFound() throws Exception {
        mvc.perform(get("/api/v1/fideicomisos/{numContrato}/participantes/{tipo}/{num}/nombre",
                1234567890, "FIDEICOMITENTE", 99))
            .andExpect(status().isNotFound());
    }

    @Test
    void getDomiciliosHeredables_returnsList() throws Exception {
        mvc.perform(get("/api/v1/fideicomisos/{numContrato}/domicilios-heredables?tipoParticipante={tipo}&numParticipante={num}",
                1234567890, "FIDEICOMITENTE", 1))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    void getDomiciliosHeredables_returnsEachRowWithItsOwnData_whenMultipleSequences() throws Exception {
        mvc.perform(get("/api/v1/fideicomisos/{numContrato}/domicilios-heredables?tipoParticipante={tipo}&numParticipante={num}",
                1234567890, "FIDEICOMITENTE", 1))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$.length()").value(2))
            .andExpect(jsonPath("$[0].calle").value("Calle Principal"))
            .andExpect(jsonPath("$[0].numeroExterior").value("123"))
            .andExpect(jsonPath("$[0].colonia").value("Colonia Centro"))
            .andExpect(jsonPath("$[0].municipio").value("Cuauhtémoc"))
            .andExpect(jsonPath("$[0].estadoId").value(9))
            .andExpect(jsonPath("$[0].paisId").value(1))
            .andExpect(jsonPath("$[0].codigoPostal").value("06600"))
            .andExpect(jsonPath("$[0].nombreLegal").value("Fideicomitente Uno"))
            .andExpect(jsonPath("$[1].calle").value("Av. Secundaria"))
            .andExpect(jsonPath("$[1].numeroExterior").value("456"))
            .andExpect(jsonPath("$[1].colonia").value("Colonia Norte"))
            .andExpect(jsonPath("$[1].municipio").value("Gustavo A. Madero"))
            .andExpect(jsonPath("$[1].estadoId").value(9))
            .andExpect(jsonPath("$[1].paisId").value(1))
            .andExpect(jsonPath("$[1].codigoPostal").value("06700"))
            .andExpect(jsonPath("$[1].nombreLegal").value("Fideicomitente Uno"));
    }

    @Test
    void getDomiciliosHeredables_returnsEmpty_whenNoMatch() throws Exception {
        mvc.perform(get("/api/v1/fideicomisos/{numContrato}/domicilios-heredables?tipoParticipante={tipo}&numParticipante={num}",
                1234567890, "TERCERO", 1))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$.length()").value(0));
    }
}
