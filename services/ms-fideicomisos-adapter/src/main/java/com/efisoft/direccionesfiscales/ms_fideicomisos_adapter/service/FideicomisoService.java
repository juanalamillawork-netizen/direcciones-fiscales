package com.efisoft.direccionesfiscales.ms_fideicomisos_adapter.service;

import com.efisoft.direccionesfiscales.ms_fideicomisos_adapter.dto.DomicilioHeredableDTO;
import com.efisoft.direccionesfiscales.ms_fideicomisos_adapter.dto.FideicomisoDTO;
import com.efisoft.direccionesfiscales.ms_fideicomisos_adapter.dto.NombreDTO;
import com.efisoft.direccionesfiscales.ms_fideicomisos_adapter.dto.RfcDTO;
import com.efisoft.direccionesfiscales.ms_fideicomisos_adapter.entity.Direcci;
import com.efisoft.direccionesfiscales.ms_fideicomisos_adapter.repository.ContratoRepository;
import com.efisoft.direccionesfiscales.ms_fideicomisos_adapter.repository.DirecciRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class FideicomisoService {

    private final ContratoRepository contratoRepository;
    private final DirecciRepository direcciRepository;
    private final RfcResolverService rfcResolverService;
    private final NombreResolverService nombreResolverService;

    public FideicomisoService(
            ContratoRepository contratoRepository,
            DirecciRepository direcciRepository,
            RfcResolverService rfcResolverService,
            NombreResolverService nombreResolverService) {
        this.contratoRepository = contratoRepository;
        this.direcciRepository = direcciRepository;
        this.rfcResolverService = rfcResolverService;
        this.nombreResolverService = nombreResolverService;
    }

    public Optional<FideicomisoDTO> findById(Integer numContrato) {
        return contratoRepository.findById(numContrato)
            .map(c -> new FideicomisoDTO(c.getCtoNumContrato(), c.getCtoNomContrato()));
    }

    public Optional<RfcDTO> findRfc(String tipoParticipante, Integer numContrato, Integer numParticipante) {
        String rfc = rfcResolverService.resolveRfc(tipoParticipante, numContrato, numParticipante);
        return Optional.ofNullable(rfc).map(RfcDTO::new);
    }

    public Optional<NombreDTO> findNombre(String tipoParticipante, Integer numContrato, Integer numParticipante) {
        return Optional.ofNullable(nombreResolverService.resolveNombre(tipoParticipante, numContrato, numParticipante))
            .map(p -> new NombreDTO(p.nombre(), p.tipoPersona()));
    }

    public List<DomicilioHeredableDTO> findDomiciliosHeredables(
            Integer numContrato, String tipoParticipante, Integer numParticipante) {
        return direcciRepository.findByContratoYParticipante(numContrato, tipoParticipante, numParticipante)
            .stream()
            .map(this::toDomicilioHeredableDTO)
            .toList();
    }

    private DomicilioHeredableDTO toDomicilioHeredableDTO(Direcci d) {
        CalleNumeroSplit calleNum = dividirCalleNumero(d.getDirCalleNum());
        return new DomicilioHeredableDTO(
            calleNum.calle(),
            calleNum.numeroExterior(),
            d.getDirNomColonia(),
            d.getDirNomPoblacion(),
            d.getDirNomMunAlcaldia(),
            d.getDirNomEstado(),
            toInteger(d.getDirNumEstado()),
            d.getDirNomPais(),
            toInteger(d.getDirNumPais()),
            d.getDirCodigoPostal(),
            d.getDirNomAtencion(),
            d.getDirCveTipoDomic(),
            d.getId().getDirNumSecDirecc() != null ? d.getId().getDirNumSecDirecc().intValue() : null
        );
    }

    private static Integer toInteger(Short value) {
        return value == null ? null : value.intValue();
    }

    record CalleNumeroSplit(String calle, String numeroExterior) {}

    static CalleNumeroSplit dividirCalleNumero(String dirCalleNum) {
        if (dirCalleNum == null || dirCalleNum.isBlank()) {
            return new CalleNumeroSplit("", "");
        }
        String texto = dirCalleNum.trim();
        int ultimoEspacio = texto.lastIndexOf(' ');
        if (ultimoEspacio > 0 && ultimoEspacio < texto.length() - 1) {
            String ultimoToken = texto.substring(ultimoEspacio + 1);
            if (ultimoToken.matches("\\d+")) {
                return new CalleNumeroSplit(texto.substring(0, ultimoEspacio), ultimoToken);
            }
        }
        return new CalleNumeroSplit(texto, "");
    }
}
