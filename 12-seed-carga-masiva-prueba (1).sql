-- =========================================================
-- Datos semilla — participantes del Fideicomiso 1850084029
-- para probar la carga masiva real (CargaMasiva_Pruebas (1).txt)
-- =========================================================

INSERT INTO contrato (cto_num_contrato, cto_nom_contrato, cto_rfc, cto_cve_st_contrat, cto_cve_tipo_per)
VALUES (1850084029, 'FIDEICOMISO SCOTIABANK PRUEBA CARGA MASIVA', 'FSPC040404DDD', 'ACTIVO', 'MORAL');

-- Línea 1: Fideicomitente No. 1, RFC CABF860205560
INSERT INTO fideicom (fid_num_contrato, fid_fideicomitente, fid_rfc, fid_nom_fideicom, fid_cve_st_fideico, fid_cve_tipo_per)
VALUES (1850084029, 1, 'CABF860205560', 'FELIX PRUEBA UNO', 'ACTIVO', 'FISICA');

-- Línea 2: Fideicomisario No. 2, RFC GAMG920223318
INSERT INTO benefici (ben_num_contrato, ben_beneficiario, ben_rfc, ben_nom_benef, ben_cve_st_benefic, ben_cve_tipo_per)
VALUES (1850084029, 2, 'GAMG920223318', 'GABY PRUEBA DOS', 'ACTIVO', 'FISICA');

-- Línea 3: Fideicomisario No. 3, RFC FCM950703D3A
INSERT INTO benefici (ben_num_contrato, ben_beneficiario, ben_rfc, ben_nom_benef, ben_cve_st_benefic, ben_cve_tipo_per)
VALUES (1850084029, 3, 'FCM950703D3A', 'FORD PRUEBA TRES', 'ACTIVO', 'MORAL');

-- =========================================================
-- Verificación
-- =========================================================
-- SELECT * FROM fideicom WHERE fid_num_contrato = 1850084029;
-- SELECT * FROM benefici WHERE ben_num_contrato = 1850084029;
