-- Agrega columna utm_source para trazabilidad de leads
-- Correr en Supabase Dashboard → SQL Editor
ALTER TABLE cotizaciones
  ADD COLUMN IF NOT EXISTS utm_source TEXT;
