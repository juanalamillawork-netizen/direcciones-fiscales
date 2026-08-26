-- =========================================================
-- Datos semilla para Fideicomiso 555555555 (NaturalFoods - CIF)
-- Basado en el PDF "cedula fiscal Naturalfoods.pdf"
-- HU-04 Cargar CIF: persona moral (Fideicomisario)
-- =========================================================

-- Contrato / Fideicomiso
INSERT INTO contrato (cto_num_contrato, cto_nom_contrato, cto_rfc, cto_cve_st_contrat, cto_cve_tipo_per)
VALUES (555555555, 'FIDEICOMISO PATRIMONIAL DEL BAJIO', 'FPB020202BBB', 'ACTIVO', 'MORAL');

-- Fideicomitente (persona física)
INSERT INTO fideicom (fid_num_contrato, fid_fideicomitente, fid_rfc, fid_nom_fideicom, fid_cve_st_fideico, fid_cve_tipo_per)
VALUES (555555555, 1, 'GARJ800101ABC', 'ROBERTO GARCIA HERNANDEZ', 'ACTIVO', 'FISICA');

-- Fideicomisario (persona moral - NaturalFoods)
INSERT INTO benefici (ben_num_contrato, ben_beneficiario, ben_rfc, ben_nom_benef, ben_cve_st_benefic, ben_cve_tipo_per)
VALUES (555555555, 1, 'NFI140728K35', 'NATURALFOODS SA DE CV', 'ACTIVO', 'MORAL');

-- Tercero (mismo RFC que el fideicomisario para testing de coincidencia)
INSERT INTO terceros (ter_num_contrato, ter_num_tercero, ter_rfc, ter_nom_tercero, ter_cve_st_tercero, ter_cve_tipo_pers)
VALUES (555555555, 1, 'NFI140728K35', 'NATURALFOODS SA DE CV', 'ACTIVO', 'MORAL');

-- Domicilio heredable para el Fideicomisario (NaturalFoods)
INSERT INTO direcci (
    dir_num_contrato, dir_cve_pers_fid, dir_num_pers_fid, dir_num_sec_direcc,
    dir_cve_tipo_domic, dir_calle_num, dir_nom_colonia, dir_nom_poblacion,
    dir_nom_estado, dir_num_estado, dir_nom_pais, dir_num_pais,
    dir_codigo_postal, dir_nom_atencion, dir_cve_st_direcc,
    dir_nom_mun_alcaldia
) VALUES (
    555555555, 'FIDEICOMISARIO', 1, 1,
    'PARTICULAR', 'CARRETERA FEDERAL LIBRE IRAPUATO-GUANAJUATO', 'ZONA CENTRO', 'IRAPUTO',
    'GUANAJUATO', 13, 'MEXICO', 1,
    '36000', 'PATRICIO GOMEZ', 'ACTIVO',
    'IRAPUTO'
);

-- Domicilio fiscal en direccif (para la precarga del formulario CIF)
INSERT INTO direccif (
    dif_num_contrato, dif_cve_pers, dif_num_pers_fid,
    dif_recep_calle, dif_recep_no_ext, dif_recep_no_int,
    dif_recep_colonia, dif_recep_localidad, dif_recep_municipio,
    dif_num_pais, dif_num_estado, dif_recep_cp,
    dif_recep_referencia, dif_telefono,
    dif_regimen_fiscal, dif_nom_legal, dif_rfc
) VALUES (
    '555555555', 'FIDEICOMISARIO', '1',
    'CARRETERA FEDERAL LIBRE IRAPUATO-GUANAJUATO', NULL, NULL,
    'ZONA CENTRO', 'IRAPUTO', 'IRAPUTO',
    1, 13, '36000',
    'CALLE SIN NOMBRE/CALLE SIN NOMBRE', NULL,
    '611', 'NATURALFOODS SA DE CV', 'NFI140728K35'
);

-- =========================================================
-- Verificación rápida
-- =========================================================
-- SELECT * FROM contrato WHERE cto_num_contrato = 555555555;
-- SELECT * FROM benefici WHERE ben_num_contrato = 555555555 AND ben_beneficiario = 1;
-- SELECT * FROM direcci WHERE dir_num_contrato = 555555555 AND dir_cve_pers_fid = 'FIDEICOMISARIO';
-- SELECT * FROM direccif WHERE dif_num_contrato = '555555555' AND dif_cve_pers = 'FIDEICOMISARIO';