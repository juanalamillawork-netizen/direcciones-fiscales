-- =========================================================
-- Datos semilla: 2 direcciones para Fideicomiso 1234567890
-- FIDEICOMITENTE: 1 dirección PARTICULAR + 1 dirección EMPRESA
-- Incluye dir_nom_mun_alcaldia (agregado 4 ago 2026)
-- =========================================================

-- Secuencia 1: Domicilio PARTICULAR (residencial)
INSERT INTO direcci (
    dir_num_contrato, dir_cve_pers_fid, dir_num_pers_fid, dir_num_sec_direcc,
    dir_cve_tipo_domic, dir_calle_num, dir_nom_colonia, dir_nom_poblacion,
    dir_nom_estado, dir_num_estado, dir_nom_pais, dir_num_pais,
    dir_codigo_postal, dir_nom_atencion, dir_cve_st_direcc,
    dir_nom_mun_alcaldia
) VALUES (
    1234567890, 'FIDEICOMITENTE', 1, 1,
    'PARTICULAR', 'AV. MEXICO 200', 'CENTRO', 'CIUDAD DE MEXICO',
    'CIUDAD DE MEXICO', 9, 'MEXICO', 1,
    '06000', 'JUAN PEREZ', 'ACTIVO',
    'AZCAPOTZALCO'
);

-- Secuencia 2: Domicilio EMPRESA (oficina/compañía)
INSERT INTO direcci (
    dir_num_contrato, dir_cve_pers_fid, dir_num_pers_fid, dir_num_sec_direcc,
    dir_cve_tipo_domic, dir_calle_num, dir_nom_colonia, dir_nom_poblacion,
    dir_nom_estado, dir_num_estado, dir_nom_pais, dir_num_pais,
    dir_codigo_postal, dir_nom_atencion, dir_cve_st_direcc,
    dir_nom_mun_alcaldia
) VALUES (
    1234567890, 'FIDEICOMITENTE', 1, 2,
    'EMPRESA', 'BLVD. PACTO 145', 'POBLACION NUEVA', 'CIUDAD DE MEXICO',
    'CIUDAD DE MEXICO', 9, 'MEXICO', 1,
    '14000', 'RAZON SOCIAL SA DE CV', 'ACTIVO',
    'MIGUEL HIDALGO'
);

-- =========================================================
-- DELETE para remover estas semillas (persona FIDEICOMITENTE, contrato 1234567890)
-- =========================================================
DELETE FROM direcci
WHERE dir_num_contrato = 1234567890
  AND dir_cve_pers_fid = 'FIDEICOMITENTE'
  AND dir_num_pers_fid = 1;

-- =========================================================
-- Verificación: debe regresar 0 filas después del DELETE
-- =========================================================
-- SELECT COUNT(*) FROM direcci
-- WHERE dir_num_contrato = 1234567890 AND dir_cve_pers_fid = 'FIDEICOMITENTE' AND dir_num_pers_fid = 1;