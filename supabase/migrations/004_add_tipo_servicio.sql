-- Distingue entre "Hornet compra y envía" vs "Solo envío (Forwarding)"
-- Correr en Supabase Dashboard → SQL Editor
ALTER TABLE cotizaciones
  ADD COLUMN IF NOT EXISTS tipo_servicio TEXT NOT NULL DEFAULT 'completo';
