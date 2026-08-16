-- =========================================================
-- Datos semilla — Laboratorio Direcciones Fiscales
-- Pensados para poder probar ms-fideicomisos-adapter y
-- ms-direcciones-fiscales de principio a fin con casos reales.
-- Ejecutar DESPUÉS de 04-esquema-datos-postgres.sql
-- =========================================================

-- ---------------------------------------------------------
-- Fideicomiso 1234567890 — con los 3 tipos de participante
-- ---------------------------------------------------------
INSERT INTO contrato (cto_num_contrato, cto_nom_contrato, cto_rfc, cto_cve_st_contrat, cto_cve_tipo_per)
VALUES (1234567890, 'FIDEICOMISO INMOBILIARIO DEL NORTE', 'FIN010101AAA', 'ACTIVO', 'MORAL');

INSERT INTO fideicom (fid_num_contrato, fid_fideicomitente, fid_rfc, fid_nom_fideicom, fid_cve_st_fideico, fid_cve_tipo_per)
VALUES (1234567890, 1, 'GARJ800101ABC', 'JUAN GARCIA RAMIREZ', 'ACTIVO', 'FISICA');

INSERT INTO benefici (ben_num_contrato, ben_beneficiario, ben_rfc, ben_nom_benef, ben_cve_st_benefic, ben_cve_tipo_per)
VALUES (1234567890, 1, 'LOMA750615XYZ', 'MARIA LOPEZ MARTINEZ', 'ACTIVO', 'FISICA');

INSERT INTO terceros (ter_num_contrato, ter_num_tercero, ter_rfc, ter_nom_tercero, ter_cve_st_tercero, ter_cve_tipo_pers)
VALUES (1234567890, 1, 'SERI900202DEF', 'SERVICIOS INTEGRALES SA DE CV', 'ACTIVO', 'MORAL');

-- Domicilio heredable (DIRECCI) para el Fideicomitente del contrato 1234567890
INSERT INTO direcci (
    dir_num_contrato, dir_cve_pers_fid, dir_num_pers_fid, dir_num_sec_direcc,
    dir_cve_tipo_domic, dir_calle_num, dir_nom_colonia, dir_nom_poblacion,
    dir_nom_estado, dir_num_estado, dir_nom_pais, dir_num_pais,
    dir_codigo_postal, dir_nom_atencion, dir_cve_st_direcc
) VALUES (
    1234567890, 'FIDEICOMITENTE', 1, 1,
    'PARTICULAR', 'AV. REFORMA 100', 'CENTRO', 'CIUDAD DE MEXICO',
    'CIUDAD DE MEXICO', 9, 'MEXICO', 1,
    '06000', 'JUAN GARCIA', 'ACTIVO'
);

-- ---------------------------------------------------------
-- Fideicomiso 555555555 — otro contrato para probar búsquedas
-- con múltiples resultados y el criterio "Tipo de Participante"
-- ---------------------------------------------------------
INSERT INTO contrato (cto_num_contrato, cto_nom_contrato, cto_rfc, cto_cve_st_contrat, cto_cve_tipo_per)
VALUES (555555555, 'FIDEICOMISO PATRIMONIAL DEL BAJIO', 'FPB020202BBB', 'ACTIVO', 'MORAL');

INSERT INTO fideicom (fid_num_contrato, fid_fideicomitente, fid_rfc, fid_nom_fideicom, fid_cve_st_fideico, fid_cve_tipo_per)
VALUES (555555555, 1, 'HERR700303GHI', 'ROBERTO HERRERA SOTO', 'ACTIVO', 'FISICA');

INSERT INTO benefici (ben_num_contrato, ben_beneficiario, ben_rfc, ben_nom_benef, ben_cve_st_benefic, ben_cve_tipo_per)
VALUES (555555555, 1, 'TORA850909JKL', 'ANA TORRES AGUILAR', 'ACTIVO', 'FISICA');

-- Domicilio heredable para el Fideicomisario del contrato 555555555
INSERT INTO direcci (
    dir_num_contrato, dir_cve_pers_fid, dir_num_pers_fid, dir_num_sec_direcc,
    dir_cve_tipo_domic, dir_calle_num, dir_nom_colonia, dir_nom_poblacion,
    dir_nom_estado, dir_num_estado, dir_nom_pais, dir_num_pais,
    dir_codigo_postal, dir_nom_atencion, dir_cve_st_direcc
) VALUES (
    555555555, 'FIDEICOMISARIO', 1, 1,
    'PARTICULAR', 'CALZADA INDEPENDENCIA 250', 'LAS AMERICAS', 'GUADALAJARA',
    'JALISCO', 19, 'MEXICO', 1,
    '44600', 'ANA TORRES', 'ACTIVO'
);
-- Nota: 'JALISCO' no está en catalogo_estado (solo 9, 15, 19 = CDMX,
-- Edo. Méx, Nuevo León están cargados). Si necesitas Jalisco real,
-- agrega su fila a catalogo_estado antes de correr este INSERT, o
-- cambia dir_num_estado a uno de los 3 ya sembrados en 04-esquema.

-- ---------------------------------------------------------
-- Domicilio fiscal YA registrado en direccif (para probar HU-01
-- consulta y HU-02/05 edición sobre un registro existente)
-- ---------------------------------------------------------
INSERT INTO direccif (
    dif_num_contrato, dif_cve_pers, dif_num_pers_fid,
    dif_recep_calle, dif_recep_no_ext, dif_recep_no_int,
    dif_recep_colonia, dif_recep_localidad, dif_recep_municipio,
    dif_num_pais, dif_num_estado, dif_recep_cp,
    dif_recep_referencia, dif_telefono,
    dif_regimen_fiscal, dif_nom_legal
) VALUES (
    '1234567890', 'FIDEICOMITENTE', '1',
    'AV. REFORMA', '100', NULL,
    'CENTRO', 'CUAUHTEMOC', 'CUAUHTEMOC',
    1, 9, '06000',
    'Frente al parque', '5512345678',
    'Régimen de Personas Físicas con Actividades Empresariales', 'JUAN GARCIA RAMIREZ'
);

-- =========================================================
-- Verificación rápida tras correr este script
-- =========================================================
-- SELECT * FROM contrato;
-- SELECT * FROM fideicom;
-- SELECT * FROM benefici;
-- SELECT * FROM terceros;
-- SELECT * FROM direcci;
-- SELECT * FROM direccif;
