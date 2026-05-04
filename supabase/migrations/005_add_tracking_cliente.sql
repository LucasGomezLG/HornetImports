ALTER TABLE pedidos
  ADD COLUMN IF NOT EXISTS tipo_servicio TEXT NOT NULL DEFAULT 'completo',
  ADD COLUMN IF NOT EXISTS tracking_codigo_cliente TEXT;
