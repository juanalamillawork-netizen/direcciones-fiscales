TRUNCATE TABLE direccif RESTART IDENTITY CASCADE;
TRUNCATE TABLE catalogo_pais RESTART IDENTITY CASCADE;
TRUNCATE TABLE catalogo_estado RESTART IDENTITY CASCADE;
TRUNCATE TABLE catalogo_regimen_fiscal RESTART IDENTITY CASCADE;

-- Seed catálogos
INSERT INTO catalogo_pais (pais_id, pais_nombre) VALUES (1, 'México');
INSERT INTO catalogo_estado (estado_id, estado_nombre, pais_id) VALUES (9, 'Ciudad de México', 1);
INSERT INTO catalogo_estado (estado_id, estado_nombre, pais_id) VALUES (15, 'México', 1);
INSERT INTO catalogo_estado (estado_id, estado_nombre, pais_id) VALUES (11, 'Guanajuato', 1);
INSERT INTO catalogo_estado (estado_id, estado_nombre, pais_id) VALUES (19, 'Nuevo León', 1);

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

-- Seed participantes con RFC conocidos para los PDFs de prueba
INSERT INTO contrato (cto_num_contrato, cto_nom_contrato) VALUES (1234567890, 'FIDEICOMISO INMOBILIARIO DEL NORTE');
INSERT INTO contrato (cto_num_contrato, cto_nom_contrato) VALUES (555555555, 'FIDEICOMISO PATRIMONIAL DEL BAJIO');

INSERT INTO fideicom (fid_num_contrato, fid_fideicomitente, fid_rfc, fid_nom_fideicom)
VALUES (1234567890, 1, 'TOVA700409ID8', 'ALEJANDRA DE LA TORRE VERDUZCO');

INSERT INTO benefici (ben_num_contrato, ben_beneficiario, ben_rfc, ben_nom_benef)
VALUES (555555555, 1, 'NFI140728K35', 'NATURAL FOODS INTERNACIONAL');
