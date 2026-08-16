-- =========================================================
-- Múltiples domicilios heredables para Fideicomitente No. 1
-- del Fideicomiso 1234567890 (ya tiene secuencia 1: Av. Reforma,
-- casa). Se agregan secuencia 2 (oficina) y 3 (empresa).
-- Confirmado con negocio (3 ago 2026): DIRECCI SÍ permite varios
-- domicilios por participante, vía dir_num_sec_direcc.
-- =========================================================

-- Secuencia 2: Oficina
INSERT INTO direcci (
    dir_num_contrato, dir_cve_pers_fid, dir_num_pers_fid, dir_num_sec_direcc,
    dir_cve_tipo_domic, dir_calle_num, dir_nom_colonia, dir_nom_poblacion,
    dir_nom_estado, dir_num_estado, dir_nom_pais, dir_num_pais,
    dir_codigo_postal, dir_nom_atencion, dir_cve_st_direcc
) VALUES (
    1234567890, 'FIDEICOMITENTE', 1, 2,
    'OFICINA', 'AV. INSURGENTES SUR 500', 'DEL VALLE', 'CIUDAD DE MEXICO',
    'CIUDAD DE MEXICO', 9, 'MEXICO', 1,
    '03100', 'JUAN GARCIA (OFICINA)', 'ACTIVO'
);

-- Secuencia 3: Empresa
INSERT INTO direcci (
    dir_num_contrato, dir_cve_pers_fid, dir_num_pers_fid, dir_num_sec_direcc,
    dir_cve_tipo_domic, dir_calle_num, dir_nom_colonia, dir_nom_poblacion,
    dir_nom_estado, dir_num_estado, dir_nom_pais, dir_num_pais,
    dir_codigo_postal, dir_nom_atencion, dir_cve_st_direcc
) VALUES (
    1234567890, 'FIDEICOMITENTE', 1, 3,
    'EMPRESA', 'BLVD. MANUEL AVILA CAMACHO 40', 'LOMAS DE CHAPULTEPEC', 'CIUDAD DE MEXICO',
    'CIUDAD DE MEXICO', 9, 'MEXICO', 1,
    '11000', 'JUAN GARCIA (EMPRESA)', 'ACTIVO'
);

-- =========================================================
-- Verificación: debe regresar 3 filas (secuencias 1, 2, 3)
-- =========================================================
-- SELECT dir_num_sec_direcc, dir_cve_tipo_domic, dir_calle_num
-- FROM direcci
-- WHERE dir_num_contrato = 1234567890 AND dir_cve_pers_fid = 'FIDEICOMITENTE' AND dir_num_pers_fid = 1;
