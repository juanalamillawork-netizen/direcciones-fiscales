DELETE FROM direccif;
DELETE FROM catalogo_regimen_fiscal;
DELETE FROM catalogo_estado WHERE estado_id IN (9, 19, 15);
DELETE FROM catalogo_pais WHERE pais_id = 1;

-- Seed catálogos (idempotente)
INSERT INTO catalogo_pais (pais_id, pais_nombre) VALUES (1, 'México');
INSERT INTO catalogo_estado (estado_id, estado_nombre, pais_id) VALUES (9, 'Ciudad de México', 1);
INSERT INTO catalogo_estado (estado_id, estado_nombre, pais_id) VALUES (19, 'Nuevo León', 1);
INSERT INTO catalogo_estado (estado_id, estado_nombre, pais_id) VALUES (15, 'México (Estado de)', 1);

INSERT INTO catalogo_regimen_fiscal (reg_clave, reg_descripcion, reg_aplica_fisica, reg_aplica_moral) VALUES
    (601, 'General de Ley Personas Morales', FALSE, TRUE),
    (603, 'Personas Morales con Fines no Lucrativos', FALSE, TRUE),
    (605, 'Sueldos y Salarios e Ingresos Asimilados a Salarios', TRUE, FALSE),
    (606, 'Arrendamiento', TRUE, FALSE),
    (607, 'Régimen de Enajenación o Adquisición de Bienes', TRUE, FALSE),
    (608, 'Demás ingresos', TRUE, FALSE),
    (610, 'Residentes en el Extranjero sin Establecimiento Permanente en México', TRUE, TRUE),
    (611, 'Ingresos por Dividendos (socios y accionistas)', TRUE, FALSE),
    (612, 'Personas Físicas con Actividades Empresariales y Profesionales', TRUE, FALSE),
    (614, 'Ingresos por intereses', TRUE, FALSE),
    (615, 'Régimen de los ingresos por obtención de premios', TRUE, FALSE),
    (616, 'Sin obligaciones fiscales', TRUE, FALSE),
    (620, 'Sociedades Cooperativas de Producción que optan por diferir sus ingresos', FALSE, TRUE),
    (621, 'Incorporación Fiscal', TRUE, FALSE),
    (622, 'Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras', FALSE, TRUE),
    (623, 'Opcional para Grupos de Sociedades', FALSE, TRUE),
    (624, 'Coordinados', FALSE, TRUE),
    (625, 'Régimen de las Actividades Empresariales con ingresos a través de Plataformas Tecnológicas', TRUE, FALSE),
    (626, 'Régimen Simplificado de Confianza', TRUE, TRUE);

INSERT INTO direccif (dif_num_contrato, dif_cve_pers, dif_num_pers_fid,
    dif_recep_calle, dif_recep_no_ext, dif_recep_no_int, dif_recep_colonia,
    dif_recep_localidad, dif_recep_municipio,
    dif_num_pais, dif_num_estado, dif_recep_cp,
    dif_recep_referencia, dif_telefono,
    dif_fec_alta, dif_fec_ultmod, dif_regimen_fiscal, dif_mail, dif_nom_legal)
VALUES
    ('1234567890', 'FIDEICOMITENTE', '1',
     'Calle Principal', '123', NULL, 'Colonia Centro',
     'Centro', 'Ciudad de México',
     1, 9, '06600',
     'Entre calles A y B', '5551234567',
     now(), now(), '601', 'contacto@empresauno.com', 'Empresa Uno S.A. de C.V.'),
    ('1234567890', 'FIDEICOMISARIO', '1',
     'Avenida Reforma', '456', 'A', 'Colonia Juárez',
     'Juárez', 'Ciudad de México',
     1, 9, '06600',
     NULL, NULL,
     now(), now(), '605', NULL, 'Beneficiario Uno S.A.'),
    ('555555555', 'FIDEICOMITENTE', '1',
     'Boulevard Principal', '789', NULL, 'Colonia del Valle',
     'Del Valle', 'Monterrey',
     1, 19, '66220',
     'Frente al parque', '5559876543',
     now(), now(), '601', 'finanzas@empresados.com', 'Empresa Dos S.A. de C.V.');
