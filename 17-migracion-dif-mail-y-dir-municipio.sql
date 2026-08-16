-- =========================================================
-- Migración (4 ago 2026): agregar columnas aprobadas
-- 1. dif_mail en DIRECCIF (persistir Correo Electrónico)
-- 2. dir_nom_mun_alcaldia en DIRECCI (Municipio/Alcaldía faltante)
-- =========================================================

ALTER TABLE direccif ADD COLUMN IF NOT EXISTS dif_mail VARCHAR(150);

ALTER TABLE direcci ADD COLUMN IF NOT EXISTS dir_nom_mun_alcaldia VARCHAR(50);

-- =========================================================
-- Verificación
-- =========================================================
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'direccif' AND column_name = 'dif_mail';
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'direcci' AND column_name = 'dir_nom_mun_alcaldia';
