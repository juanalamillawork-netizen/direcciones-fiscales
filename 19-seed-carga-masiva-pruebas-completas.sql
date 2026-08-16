-- =========================================================
-- Datos semilla — Fideicomiso 222222222 con 10 participantes
-- para probar Carga Masiva: archivo limpio (3 altas) y archivo
-- con errores mixtos (4 exitosas + 3 con error).
-- =========================================================

INSERT INTO contrato (cto_num_contrato, cto_nom_contrato, cto_rfc, cto_cve_st_contrat, cto_cve_tipo_per)
VALUES (222222222, 'FIDEICOMISO PRUEBA CARGA MASIVA COMPLETA', 'FPCM050505EEE', 'ACTIVO', 'MORAL');

-- --- Para el archivo 1 (3 altas exitosas) ---
INSERT INTO fideicom (fid_num_contrato, fid_fideicomitente, fid_rfc, fid_nom_fideicom, fid_cve_st_fideico, fid_cve_tipo_per)
VALUES (222222222, 1, 'AAAA800101AA1', 'PARTICIPANTE UNO', 'ACTIVO', 'FISICA');

INSERT INTO benefici (ben_num_contrato, ben_beneficiario, ben_rfc, ben_nom_benef, ben_cve_st_benefic, ben_cve_tipo_per)
VALUES (222222222, 1, 'BBBB810202BB2', 'PARTICIPANTE DOS', 'ACTIVO', 'FISICA');

INSERT INTO terceros (ter_num_contrato, ter_num_tercero, ter_rfc, ter_nom_tercero, ter_cve_st_tercero, ter_cve_tipo_pers)
VALUES (222222222, 1, 'CCCC820303CC3', 'PARTICIPANTE TRES SA DE CV', 'ACTIVO', 'MORAL');

-- --- Para el archivo 2: 3 participantes que provocarán ERROR ---
-- FIDEICOMITENTE 2: el archivo traerá un RFC distinto (mismatch)
INSERT INTO fideicom (fid_num_contrato, fid_fideicomitente, fid_rfc, fid_nom_fideicom, fid_cve_st_fideico, fid_cve_tipo_per)
VALUES (222222222, 2, 'DDDD830404DD4', 'PARTICIPANTE CUATRO', 'ACTIVO', 'FISICA');

-- FIDEICOMISARIO 2: RFC correcto en el archivo, pero País inválido
INSERT INTO benefici (ben_num_contrato, ben_beneficiario, ben_rfc, ben_nom_benef, ben_cve_st_benefic, ben_cve_tipo_per)
VALUES (222222222, 2, 'EEEE840505EE5', 'PARTICIPANTE CINCO', 'ACTIVO', 'FISICA');

-- TERCERO 2: RFC correcto en el archivo, pero Estado inválido
INSERT INTO terceros (ter_num_contrato, ter_num_tercero, ter_rfc, ter_nom_tercero, ter_cve_st_tercero, ter_cve_tipo_pers)
VALUES (222222222, 2, 'FFFF850606FF6', 'PARTICIPANTE SEIS SA DE CV', 'ACTIVO', 'MORAL');

-- --- Para el archivo 2: 4 participantes adicionales que SÍ tendrán éxito ---
INSERT INTO fideicom (fid_num_contrato, fid_fideicomitente, fid_rfc, fid_nom_fideicom, fid_cve_st_fideico, fid_cve_tipo_per)
VALUES (222222222, 3, 'GGGG860707GG7', 'PARTICIPANTE SIETE', 'ACTIVO', 'FISICA');

INSERT INTO benefici (ben_num_contrato, ben_beneficiario, ben_rfc, ben_nom_benef, ben_cve_st_benefic, ben_cve_tipo_per)
VALUES (222222222, 3, 'HHHH870808HH8', 'PARTICIPANTE OCHO', 'ACTIVO', 'FISICA');

INSERT INTO terceros (ter_num_contrato, ter_num_tercero, ter_rfc, ter_nom_tercero, ter_cve_st_tercero, ter_cve_tipo_pers)
VALUES (222222222, 3, 'IIII880909II9', 'PARTICIPANTE NUEVE SA DE CV', 'ACTIVO', 'MORAL');

INSERT INTO fideicom (fid_num_contrato, fid_fideicomitente, fid_rfc, fid_nom_fideicom, fid_cve_st_fideico, fid_cve_tipo_per)
VALUES (222222222, 4, 'JJJJ891010JJ0', 'PARTICIPANTE DIEZ', 'ACTIVO', 'FISICA');

-- =========================================================
-- Verificación
-- =========================================================
-- SELECT * FROM fideicom WHERE fid_num_contrato = 222222222;
-- SELECT * FROM benefici WHERE ben_num_contrato = 222222222;
-- SELECT * FROM terceros WHERE ter_num_contrato = 222222222;
