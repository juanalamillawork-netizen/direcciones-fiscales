TRUNCATE TABLE contrato, fideicom, benefici, terceros, direcci RESTART IDENTITY CASCADE;

INSERT INTO contrato (cto_num_contrato, cto_nom_contrato, cto_rfc) VALUES
    (1234567890, 'Fideicomiso Test Uno', 'RFC123456XXX'),
    (555555555,  'Fideicomiso Test Dos', 'RFC555555XXX');

INSERT INTO fideicom (fid_num_contrato, fid_fideicomitente, fid_rfc, fid_nom_fideicom, fid_cve_st_fideico, fid_cve_tipo_per) VALUES
    (1234567890, 1, 'FID123456XXX', 'Fideicomitente Uno', 'ACTIVO', 'FISICA');

INSERT INTO benefici (ben_num_contrato, ben_beneficiario, ben_rfc, ben_nom_benef, ben_cve_st_benefic, ben_cve_tipo_per) VALUES
    (1234567890, 1, 'BEN123456XXX', 'Beneficiario Uno', 'ACTIVO', 'FISICA');

INSERT INTO terceros (ter_num_contrato, ter_num_tercero, ter_rfc, ter_nom_tercero, ter_cve_st_tercero, ter_cve_tipo_pers) VALUES
    (1234567890, 1, 'TER123456XXX', 'Tercero Uno', 'ACTIVO', 'MORAL');

INSERT INTO direcci (dir_num_contrato, dir_cve_pers_fid, dir_num_pers_fid, dir_num_sec_direcc,
                     dir_calle_num, dir_nom_colonia, dir_nom_poblacion, dir_nom_mun_alcaldia,
                     dir_nom_estado, dir_num_estado,
                     dir_nom_pais, dir_num_pais, dir_codigo_postal, dir_nom_atencion, dir_cve_tipo_domic)
VALUES
    (1234567890, 'FIDEICOMITENTE', 1, 1,
     'Calle Principal 123', 'Colonia Centro', 'Ciudad de México', 'Cuauhtémoc',
     'Ciudad de México', 9,
     'México', 1, '06600', 'Fideicomitente Uno', 'PARTICULAR'),
    (1234567890, 'FIDEICOMITENTE', 1, 2,
     'Av. Secundaria 456', 'Colonia Norte', 'Ciudad de México', 'Gustavo A. Madero',
     'Ciudad de México', 9,
     'México', 1, '06700', 'Fideicomitente Uno', 'PARTICULAR');
