package com.efisoft.direccionesfiscales.ms_fideicomisos_adapter.repository;

import com.efisoft.direccionesfiscales.ms_fideicomisos_adapter.entity.Direcci;
import com.efisoft.direccionesfiscales.ms_fideicomisos_adapter.entity.DirecciId;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DirecciRepository extends Repository<Direcci, DirecciId> {

    @Query("""
        SELECT d FROM Direcci d
        WHERE d.id.dirNumContrato = :numContrato
          AND d.id.dirCvePersFid = :cvePersFid
          AND d.id.dirNumPersFid = :numPersFid
        ORDER BY d.id.dirNumSecDirecc
        """)
    List<Direcci> findByContratoYParticipante(
        @Param("numContrato") Integer numContrato,
        @Param("cvePersFid") String cvePersFid,
        @Param("numPersFid") Integer numPersFid);
}
