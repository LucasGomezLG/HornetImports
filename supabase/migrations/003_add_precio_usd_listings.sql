-- precio_usd como fuente de verdad para el cron de actualización de precios
-- Correr en Supabase Dashboard → SQL Editor
ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS precio_usd NUMERIC(10,2);
