-- =========================================================
-- Datos semilla para Prueba de Carga Masiva
-- Contrato: 1850084029
-- Fideicomitente, Fideicomisario y Tercero
-- =========================================================

-- ---------------------------------------------------------
-- 1. Contrato principal
-- ---------------------------------------------------------
INSERT INTO contrato (cto_num_contrato, cto_nom_contrato, cto_rfc, cto_cve_st_contrat, cto_cve_tipo_per)
VALUES (1850084029, 'FIDEICOMISO INMOBILIARIO MIXTO NOROESTE', 'FIM090909AAA', 'ACTIVO', 'MORAL');

-- ---------------------------------------------------------
-- 2. Fideicomitente (Persona Física)
-- ---------------------------------------------------------
INSERT INTO fideicom (fid_num_contrato, fid_fideicomitente, fid_rfc, fid_nom_fideicom, fid_cve_st_fideico, fid_cve_tipo_per)
VALUES (1850084029, 1, 'GARJ800101ABC', 'MARIA GARCIA LOPEZ', 'ACTIVO', 'FISICA');

-- ---------------------------------------------------------
-- 3. Fideicomisario (Persona Moral)
-- ---------------------------------------------------------
INSERT INTO benefici (ben_num_contrato, ben_beneficiario, ben_rfc, ben_nom_benef, ben_cve_st_benefic, ben_cve_tipo_per)
VALUES (1850084029, 1, 'CONE120304DEF', 'CONSTRUYE MÉXICO SA DE CV', 'ACTIVO', 'MORAL');

-- ---------------------------------------------------------
-- 4. Tercero (Otro participante persona moral)
-- ---------------------------------------------------------
INSERT INTO terceros (ter_num_contrato, ter_num_tercero, ter_rfc, ter_nom_tercero, ter_cve_st_tercero, ter_cve_tipo_pers)
VALUES (1850084029, 1, 'INTE150615GHI', 'INTEGRA SERVICIOS LOGISTICOS SA DE CV', 'ACTIVO', 'MORAL');

-- ---------------------------------------------------------
-- 5. Domicilios para el Fideicomitente (Persona Física - secuencia 1: PARTICULAR)
-- ---------------------------------------------------------
INSERT INTO direcci (
    dir_num_contrato, dir_cve_pers_fid, dir_num_pers_fid, dir_num_sec_direcc,
    dir_cve_tipo_domic, dir_calle_num, dir_nom_colonia, dir_nom_poblacion,
    dir_nom_estado, dir_num_estado, dir_nom_pais, dir_num_pais,
    dir_codigo_postal, dir_nom_atencion, dir_cve_st_direcc,
    dir_nom_mun_alcaldia
) VALUES (
    1850084029, 'FIDEICOMITENTE', 1, 1,
    'PARTICULAR', 'AV. SOL 100', 'CENTRO', 'GUADALAJARA',
    'JALISCO', 20, 'MEXICO', 1,
    '44100', 'MARIA GARCIA', 'ACTIVO',
    'GUADALAJARA'
);

-- Secuencia 2: OFICINA para el Fideicomitente
INSERT INTO direcci (
    dir_num_contrato, dir_cve_pers_fid, dir_num_pers_fid, dir_num_sec_direcc,
    dir_cve_tipo_domic, dir_calle_num, dir_nom_colonia, dir_nom_poblacion,
    dir_nom_estado, dir_num_estado, dir_nom_pais, dir_num_pais,
    dir_codigo_postal, dir_nom_atencion, dir_cve_st_direcc,
    dir_nom_mun_alcaldia
) VALUES (
    1850084029, 'FIDEICOMITENTE', 1, 2,
    'OFICINA', 'BLVD. MARIANO ESCOBAR 300', 'NUEVA VILLA', 'GUADALAJARA',
    'JALISCO', 20, 'MEXICO', 1,
    '44270', 'MARIA GARCIA (OFICINA)', 'ACTIVO',
    'GUADALAJARA'
);

-- ---------------------------------------------------------
-- 6. Domicilios para el Fideicomisario (Persona Moral - secuencia 1: EMPRESA)
-- ---------------------------------------------------------
INSERT INTO direcci (
    dir_num_contrato, dir_cve_pers_fid, dir_num_pers_fid, dir_num_sec_direcc,
    dir_cve_tipo_domic, dir_calle_num, dir_nom_colonia, dir_nom_poblacion,
    dir_nom_estado, dir_num_estado, dir_nom_pais, dir_num_pais,
    dir_codigo_postal, dir_nom_atencion, dir_cve_st_direcc,
    dir_nom_mun_alcaldia
) VALUES (
    1850084029, 'FIDEICOMISARIO', 1, 1,
    'EMPRESA', 'BLVD. LUIS NÚÑEZ 500', 'POLANCO', 'CIUDAD DE MÉXICO',
    'CIUDAD DE MÉXICO', 9, 'MEXICO', 1,
    '05000', 'CONSTRUYE MÉXICO SA DE CV', 'ACTIVO',
    'ALVARO OBREGON'
);

-- Secuencia 2: OFICINA para el Fideicomisario
INSERT INTO direcci (
    dir_num_contrato, dir_cve_pers_fid, dir_num_pers_fid, dir_num_sec_direcc,
    dir_cve_tipo_domic, dir_calle_num, dir_nom_colonia, dir_nom_poblacion,
    dir_nom_estado, dir_num_estado, dir_nom_pais, dir_num_pais,
    dir_codigo_postal, dir_nom_atencion, dir_cve_st_direcc,
    dir_nom_mun_alcaldia
) VALUES (
    1850084029, 'FIDEICOMISARIO', 1, 2,
    'OFICINA', 'AV. INSURGENTES SUR 400', 'CREMERAS', 'CIUDAD DE MÉXICO',
    'CIUDAD DE MÉXICO', 9, 'MEXICO', 1,
    '03100', 'CONSTRUYE MÉXICO SA DE CV (OFICINA)', 'ACTIVO',
    'CREMERAS'
);

-- ---------------------------------------------------------
-- 7. Domicilios para el Tercero (secuencia 1: PARTICULAR)
-- ---------------------------------------------------------
INSERT INTO direcci (
    dir_num_contrato, dir_cve_pers_fid, dir_num_pers_fid, dir_num_sec_direcc,
    dir_cve_tipo_domic, dir_calle_num, dir_nom_colonia, dir_nom_poblacion,
    dir_nom_estado, dir_num_estado, dir_nom_pais, dir_num_pais,
    dir_codigo_postal, dir_nom_atencion, dir_cve_st_direcc,
    dir_nom_mun_alcaldia
) VALUES (
    1850084029, 'TERCERO', 1, 1,
    'PARTICULAR', 'CALZADA MICHOACÁN 200', 'Roma Norte', 'CIUDAD DE MÉXICO',
    'CIUDAD DE MÉXICO', 9, 'MEXICO', 1,
    '06700', 'USUARIO TERCERO', 'ACTIVO',
    'ÁLVARO OBREGÓN'
);

-- ---------------------------------------------------------
-- 8. Domicilios fiscales en direccif (para precarga/validación)
-- ---------------------------------------------------------
-- Fideicomitente (persona física)
INSERT INTO direccif (
    dif_num_contrato, dif_cve_pers, dif_num_pers_fid,
    dif_recep_calle, dif_recep_no_ext, dif_recep_no_int,
    dif_recep_colonia, dif_recep_localidad, dif_recep_municipio,
    dif_num_pais, dif_num_estado, dif_recep_cp,
    dif_recep_referencia, dif_telefono,
    dif_regimen_fiscal, dif_nom_legal
) VALUES (
    '1850084029', 'FIDEICOMITENTE', '1',
    'AV. SOL 100', NULL, NULL,
    'CENTRO', 'GUADALAJARA', 'GUADALAJARA',
    1, 20, '44100',   -- CAMBIADO de 13 a 20 (Jalisco)
    'DOMICILIO RESIDENCIAL', '5512345678',
    '605', 'MARIA GARCIA LOPEZ'
);

-- Fideicomisario (persona moral)
INSERT INTO direccif (
    dif_num_contrato, dif_cve_pers, dif_num_pers_fid,
    dif_recep_calle, dif_recep_no_ext, dif_recep_no_int,
    dif_recep_colonia, dif_recep_localidad, dif_recep_municipio,
    dif_num_pais, dif_num_estado, dif_recep_cp,
    dif_recep_referencia, dif_telefono,
    dif_regimen_fiscal, dif_nom_legal
) VALUES (
    '1850084029', 'FIDEICOMISARIO', '1',
    'BLVD. LUIS NÚÑEZ 500', NULL, NULL,
    'POLANCO', 'CIUDAD DE MÉXICO', 'ALVARO OBREGÓN',
    1, 9, '05000',
    'DOMICILIO EMPRESARIAL', NULL,
    '601', 'CONSTRUYE MÉXICO SA DE CV'
);

-- Tercero (persona moral)
INSERT INTO direccif (
    dif_num_contrato, dif_cve_pers, dif_num_pers_fid,
    dif_recep_calle, dif_recep_no_ext, dif_recep_no_int,
    dif_recep_colonia, dif_recep_localidad, dif_recep_municipio,
    dif_num_pais, dif_num_estado, dif_recep_cp,
    dif_recep_referencia, dif_telefono,
    dif_regimen_fiscal, dif_nom_legal
) VALUES (
    '1850084029', 'TERCERO', '1',
    'CALZADA MICHOACÁN 200', NULL, NULL,
    'Roma Norte', 'CIUDAD DE MÉXICO', 'ÁLVARO OBREGÓN',
    1, 9, '06700',
    'DOMICILIO PARTICULAR', NULL,
    '612', 'INTEGRA SERVICIOS LOGISTICOS SA DE CV'
);

-- =========================================================
-- Verificación rápida tras correr este script
-- =========================================================
-- SELECT * FROM contrato WHERE cto_num_contrato = 1850084029;
-- SELECT * FROM fideicom WHERE fid_num_contrato = 1850084029 AND fid_fideicomitente = 1;
-- SELECT * FROM benefici WHERE ben_num_contrato = 1850084029 AND ben_beneficiario = 1;
-- SELECT * FROM terceros WHERE ter_num_contrato = 1850084029 AND ter_num_tercero = 1;
-- SELECT * FROM direcci WHERE dir_num_contrato = 1850084029 ORDER BY dir_cve_pers_fid, dir_num_pers_fid, dir_num_sec_direcc;
-- SELECT * FROM direccif WHERE dif_num_contrato = '1850084029' ORDER BY dif_cve_pers, dif_num_pers_fid;