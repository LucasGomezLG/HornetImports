-- Agrega columna de aprobación manual a cotizaciones
-- Correr en Supabase Dashboard → SQL Editor
ALTER TABLE cotizaciones
  ADD COLUMN IF NOT EXISTS aprobada_por_admin BOOLEAN NOT NULL DEFAULT FALSE;
