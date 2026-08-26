-- =========================================================
-- Esquema Postgres (laboratorio local) — Direcciones Fiscales
-- Basado en el esquema legado real: DIRECCIF y CARGA_INTERFAZ
-- =========================================================

-- Requerida por ms-carga-masiva para comparación de nombres de país/
-- estado insensible a acentos (ej. "MEXICO" debe coincidir con "México").
CREATE EXTENSION IF NOT EXISTS unaccent;

-- -------------------------------------------------------
-- Tabla principal: DIRECCIF
-- -------------------------------------------------------
-- NOTA: esta tabla se define TAL CUAL la real, sin columnas, PK ni
-- constraints agregados por la migración. La identidad de cada registro
-- es la llave natural (dif_num_contrato, dif_cve_pers, dif_num_pers_fid);
-- la unicidad se valida por completo en la capa de aplicación
-- (ms-direcciones-fiscales), no en la base de datos.
CREATE TABLE direccif (
    dif_num_contrato      VARCHAR(10)   NOT NULL,               -- No. de Fideicomiso/Contrato (sinónimos)
    dif_cve_pers          VARCHAR(20)   NOT NULL,               -- FIDEICOMITENTE / FIDEICOMISARIO / TERCERO
    dif_num_pers_fid      VARCHAR(20)   NOT NULL,               -- No. de persona relacionada con el tipo de persona y fideicomiso
    dif_recep_calle       VARCHAR(150)  NOT NULL,
    dif_recep_no_ext      VARCHAR(20)   NOT NULL,
    dif_recep_no_int      VARCHAR(20),
    dif_recep_colonia     VARCHAR(150)  NOT NULL,
    dif_recep_localidad   VARCHAR(150),
    dif_recep_municipio   VARCHAR(150)  NOT NULL,
    dif_num_pais          INTEGER       NOT NULL,               -- FK a catálogo de países
    dif_num_estado        INTEGER       NOT NULL,               -- FK a catálogo de estados
    dif_recep_cp          VARCHAR(5)    NOT NULL,
    dif_recep_referencia  VARCHAR(250),
    dif_telefono          VARCHAR(20),
    dif_fec_alta          TIMESTAMP     NOT NULL DEFAULT now(),
    dif_fec_ultmod        TIMESTAMP     NOT NULL DEFAULT now(),
    dif_regimen_fiscal    VARCHAR(100),
    dif_nom_legal         VARCHAR(250),
    dif_mail              VARCHAR(150)                          -- CORRECCIÓN aprobada (4 ago 2026, revierte decisión anterior): el correo electrónico SÍ se persiste ahora. DIRECCIF admite esta modificación (confirmado explícitamente).
);

-- Índice (no constraint) para acelerar las búsquedas por llave natural.
-- Un índice no-único no impone la regla de negocio, solo optimiza lectura;
-- la validación de unicidad real ocurre en el servicio antes de escribir.
CREATE INDEX ix_direccif_llave_natural
    ON direccif (dif_num_contrato, dif_cve_pers, dif_num_pers_fid);

CREATE INDEX ix_direccif_contrato ON direccif (dif_num_contrato);
CREATE INDEX ix_direccif_cve_pers ON direccif (dif_cve_pers);

COMMENT ON TABLE direccif IS 'Domicilios fiscales asociados a un Fideicomiso/Participante/No. Participante. Un solo registro por combinación dif_num_contrato+dif_cve_pers+dif_num_pers_fid, validado a nivel de aplicación (sin constraint en BD).';
COMMENT ON COLUMN direccif.dif_num_contrato IS 'No. de Fideicomiso (Fideicomiso = Contrato, sinónimos). Máx 10 caracteres.';
COMMENT ON COLUMN direccif.dif_cve_pers IS 'Tipo de participante: FIDEICOMITENTE, FIDEICOMISARIO o TERCERO.';
COMMENT ON COLUMN direccif.dif_num_pers_fid IS 'Número de persona relacionado con el tipo de participante dentro del fideicomiso.';
COMMENT ON COLUMN direccif.dif_num_pais IS 'FK numérica a catálogo de países (ver catalogo_pais).';
COMMENT ON COLUMN direccif.dif_num_estado IS 'FK numérica a catálogo de estados (ver catalogo_estado).';
COMMENT ON COLUMN direccif.dif_nom_legal IS 'Nombre legal, tal como aparece en el documento CIF.';

-- -------------------------------------------------------
-- Catálogos referenciados por DIRECCIF (mínimos para el laboratorio)
-- -------------------------------------------------------
CREATE TABLE catalogo_pais (
    pais_id     INTEGER PRIMARY KEY,
    pais_nombre VARCHAR(100) NOT NULL
);

CREATE TABLE catalogo_estado (
    estado_id     INTEGER PRIMARY KEY,
    estado_nombre VARCHAR(100) NOT NULL,
    pais_id       INTEGER NOT NULL REFERENCES catalogo_pais(pais_id)
);

-- NOTA: NO se agregan FK constraints sobre `direccif` (misma razón que
-- el PK/UNIQUE: la tabla no admite modificaciones estructurales). La
-- validación de que dif_num_pais/dif_num_estado existan en el catálogo
-- se hace en ms-direcciones-fiscales antes de escribir, no en la BD.

-- Semilla mínima para pruebas locales
INSERT INTO catalogo_pais (pais_id, pais_nombre) VALUES (1, 'México');
INSERT INTO catalogo_estado (estado_id, estado_nombre, pais_id) VALUES
    (9, 'Ciudad de México', 1),
    (13, 'Guanajuato', 1),
    (15, 'México (Estado de)', 1),
    (19, 'Nuevo León', 1),
    (20, 'Jalisco', 1);

-- =========================================================
-- Tablas legadas de origen (solo lectura para ms-fideicomisos-adapter)
-- Reproducidas en Postgres local para el laboratorio, a partir del
-- catálogo real de columnas (formato DB2) proporcionado por el usuario.
-- NULLS='N' en el catálogo original -> NOT NULL aquí.
-- =========================================================

-- Fideicomiso / Contrato (nombre y datos generales)
CREATE TABLE contrato (
    cto_num_contrato    INTEGER      NOT NULL,   -- No. de Fideicomiso/Contrato
    cto_nom_contrato    VARCHAR(80),              -- Nombre del Fideicomiso
    cto_rfc             VARCHAR(18),              -- RFC del propio contrato (no confundir con el RFC del participante)
    cto_cve_st_contrat  VARCHAR(25),              -- estatus del contrato
    cto_cve_tipo_per    VARCHAR(25)
    -- (se omiten el resto de columnas de auditoría/control no relevantes para este laboratorio)
);
CREATE INDEX ix_contrato_num_contrato ON contrato (cto_num_contrato);
COMMENT ON TABLE contrato IS 'Tabla legada real. Fuente del Nombre del Fideicomiso (cto_nom_contrato) para ms-fideicomisos-adapter.';

-- Fideicomitente (RFC por este tipo de participante)
CREATE TABLE fideicom (
    fid_num_contrato     INTEGER      NOT NULL,
    fid_fideicomitente   INTEGER      NOT NULL,   -- No. de Participante
    fid_rfc              VARCHAR(18),
    fid_nom_fideicom     VARCHAR(145),
    fid_cve_st_fideico   VARCHAR(25),
    fid_cve_tipo_per     VARCHAR(25)
);
CREATE INDEX ix_fideicom_contrato_part ON fideicom (fid_num_contrato, fid_fideicomitente);
COMMENT ON TABLE fideicom IS 'Tabla legada real. Tipo de participante FIDEICOMITENTE. Fuente de RFC (fid_rfc).';

-- Fideicomisario (llamada BENEFICI en el legado)
CREATE TABLE benefici (
    ben_num_contrato    INTEGER      NOT NULL,
    ben_beneficiario    INTEGER      NOT NULL,   -- No. de Participante
    ben_rfc             VARCHAR(18),
    ben_nom_benef       VARCHAR(145),
    ben_cve_st_benefic  VARCHAR(25),
    ben_cve_tipo_per    VARCHAR(25)
);
CREATE INDEX ix_benefici_contrato_part ON benefici (ben_num_contrato, ben_beneficiario);
COMMENT ON TABLE benefici IS 'Tabla legada real. Corresponde al tipo de participante FIDEICOMISARIO (nombre de tabla histórico: BENEFICI/Beneficiario). Fuente de RFC (ben_rfc).';

-- Tercero
CREATE TABLE terceros (
    ter_num_contrato    INTEGER      NOT NULL,
    ter_num_tercero     INTEGER      NOT NULL,   -- No. de Participante
    ter_rfc             VARCHAR(18),
    ter_nom_tercero     VARCHAR(145),
    ter_cve_st_tercero  VARCHAR(25),
    ter_cve_tipo_pers   VARCHAR(25)
);
CREATE INDEX ix_terceros_contrato_part ON terceros (ter_num_contrato, ter_num_tercero);
COMMENT ON TABLE terceros IS 'Tabla legada real. Tipo de participante TERCERO. Fuente de RFC (ter_rfc).';

-- Domicilios heredables (grid de HU-03) — DISTINTA de direccif.
-- Confirmado con negocio: estas son TODAS las columnas de la tabla real.
CREATE TABLE direcci (
    dir_num_contrato     INTEGER      NOT NULL,
    dir_cve_pers_fid     VARCHAR(25)  NOT NULL,   -- tipo de participante
    dir_num_pers_fid     INTEGER      NOT NULL,   -- No. de Participante
    dir_num_sec_direcc   SMALLINT,                -- secuencia de domicilio — SÍ forma parte de la llave de negocio (confirmado 3 ago 2026): puede haber varios domicilios por Contrato+Tipo de Persona+No. Persona (ej. casa, oficina, empresa), diferenciados por esta secuencia
    dir_cve_tipo_domic   VARCHAR(25),
    dir_calle_num        VARCHAR(50),
    dir_nom_colonia      VARCHAR(50),
    dir_nom_poblacion    VARCHAR(50),
    dir_nom_mun_alcaldia VARCHAR(50),              -- AGREGADO (4 ago 2026): DIRECCI no tenía Municipio/Alcaldía por separado — confirmado con negocio como tabla "mal diseñada" que se corrige
    dir_nom_estado       VARCHAR(50),
    dir_num_estado       SMALLINT     NOT NULL,
    dir_nom_pais         VARCHAR(50),
    dir_num_pais         SMALLINT     NOT NULL,
    dir_codigo_postal    VARCHAR(10)  NOT NULL,
    dir_nom_atencion     VARCHAR(50),
    dir_cve_st_direcc    VARCHAR(25)
);
CREATE INDEX ix_direcci_contrato_part ON direcci (dir_num_contrato, dir_cve_pers_fid, dir_num_pers_fid);
COMMENT ON TABLE direcci IS 'Tabla legada real, DISTINTA de direccif. Domicilios generales por persona/tipo de persona, de donde HU-03 hereda hacia direccif. Solo lectura para ms-fideicomisos-adapter (o un servicio dedicado).';


CREATE TABLE carga_interfaz (
    carint_id             BIGSERIAL PRIMARY KEY,                -- PK técnica agregada
    carint_num_usuario     VARCHAR(20)   NOT NULL,               -- Usuario que ejecuta la carga
    rut_id_rutina          VARCHAR(50)   NOT NULL DEFAULT 'MASIVO DIRECCIONES FISCAL', -- Código duro
    carint_fecha           TIMESTAMP     NOT NULL DEFAULT now(), -- Fecha del sistema
    carint_sec_archivo     INTEGER       NOT NULL DEFAULT 1,     -- Fijo en 1
    carint_secuencial      INTEGER       NOT NULL,               -- No. de renglón/registro del archivo CSV
    carint_nom_path        VARCHAR(250)  NOT NULL,               -- Nombre/ruta del archivo cargado
    carint_nom_arch        VARCHAR(250)  NOT NULL,               -- Nombre del archivo (igual que el anterior según especificación)
    carint_arch_tmp        VARCHAR(10)   NOT NULL DEFAULT 'N/A', -- Fijo "N/A"
    carint_cadena          TEXT          NOT NULL,               -- Línea completa del archivo tal cual vino
    carint_estatus         CHAR(1)       NOT NULL DEFAULT 'A',   -- Fijo "A" al insertar
    carint_mensaje         VARCHAR(500)                          -- Vacío al insertar; se llena si hay error de procesamiento posterior
);

CREATE INDEX ix_carga_interfaz_usuario_fecha ON carga_interfaz (carint_num_usuario, carint_fecha);

COMMENT ON TABLE carga_interfaz IS 'Registro de control de cada línea procesada en una carga masiva (Importar). Un registro por línea del archivo, independientemente de si se insertó correctamente en DIRECCIF.';
COMMENT ON COLUMN carga_interfaz.carint_estatus IS 'Estatus de la línea. "A" = registrada/pendiente de validar. (Definir en HU-06 los demás estatus posibles: procesado OK, error, etc.)';
COMMENT ON COLUMN carga_interfaz.carint_mensaje IS 'Mensaje de error o resultado del procesamiento de la línea; vacío en el insert inicial de control.';

-- =========================================================
-- Catálogo de Régimen Fiscal (para combo y validación física/moral)
-- Confirmado con negocio 22 jul 2026 — catálogo real del SAT
-- =========================================================
CREATE TABLE catalogo_regimen_fiscal (
    reg_clave       INTEGER      PRIMARY KEY,
    reg_descripcion VARCHAR(150) NOT NULL,
    reg_aplica_fisica BOOLEAN    NOT NULL,
    reg_aplica_moral  BOOLEAN    NOT NULL
);

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

COMMENT ON TABLE catalogo_regimen_fiscal IS 'Catálogo real del SAT para validar que el Régimen Fiscal seleccionado corresponda al tipo de persona (física/moral) del participante.';
