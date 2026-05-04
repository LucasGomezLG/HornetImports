-- ============================================================
-- Hornet Imports — Schema
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

-- ── Tipos ────────────────────────────────────────────────────
CREATE TYPE tipo_cuenta AS ENUM ('comprador', 'vendedor', 'admin');
CREATE TYPE estado_cotizacion AS ENUM ('pendiente', 'aprobada', 'rechazada', 'expirada');
CREATE TYPE estado_pedido AS ENUM (
  'en_proceso', 'comprado', 'en_transito', 'en_aduana', 'entregado', 'cancelado'
);

-- ── Profiles ─────────────────────────────────────────────────
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  nombre      TEXT,
  apellido    TEXT,
  cuit        TEXT UNIQUE,
  tipo        tipo_cuenta NOT NULL DEFAULT 'comprador',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users read own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Admin puede leer todos los perfiles
CREATE POLICY "admin read all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.tipo = 'admin'
    )
  );

-- Trigger: crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, tipo)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'tipo', 'comprador')::tipo_cuenta
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ── Cotizaciones ─────────────────────────────────────────────
CREATE TABLE cotizaciones (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES profiles(id) ON DELETE SET NULL,
  producto_url     TEXT NOT NULL,
  nombre_producto  TEXT NOT NULL,
  precio_usd       NUMERIC(10,2) NOT NULL,
  peso_kg          NUMERIC(6,3) NOT NULL,
  categoria        TEXT NOT NULL,
  costo_total_ars  NUMERIC(14,2) NOT NULL,
  desglose         JSONB NOT NULL DEFAULT '{}',
  estado           estado_cotizacion NOT NULL DEFAULT 'pendiente',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE cotizaciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users read own cotizaciones"
  ON cotizaciones FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users insert cotizaciones"
  ON cotizaciones FOR INSERT WITH CHECK (
    auth.uid() = user_id OR user_id IS NULL
  );

CREATE POLICY "admin manage cotizaciones"
  ON cotizaciones FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.tipo = 'admin'
    )
  );

-- ── Pedidos ──────────────────────────────────────────────────
CREATE SEQUENCE pedido_seq START 1;

CREATE TABLE pedidos (
  id               TEXT PRIMARY KEY DEFAULT 'HI-' || LPAD(nextval('pedido_seq')::TEXT, 4, '0'),
  cotizacion_id    UUID REFERENCES cotizaciones(id) ON DELETE SET NULL,
  user_id          UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  producto_nombre  TEXT NOT NULL,
  producto_url     TEXT,
  precio_usd       NUMERIC(10,2) NOT NULL,
  costo_total_ars  NUMERIC(14,2) NOT NULL,
  estado           estado_pedido NOT NULL DEFAULT 'en_proceso',
  tracking_code    TEXT,
  origen           TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users read own pedidos"
  ON pedidos FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "admin manage pedidos"
  ON pedidos FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.tipo = 'admin'
    )
  );

-- Trigger: updated_at automático
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER pedidos_updated_at
  BEFORE UPDATE ON pedidos
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── Listings ─────────────────────────────────────────────────
CREATE TABLE listings (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendedor_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  nombre       TEXT NOT NULL,
  descripcion  TEXT,
  precio_ars   NUMERIC(14,2) NOT NULL,
  categoria    TEXT NOT NULL,
  imagen_url   TEXT,
  stock        INT NOT NULL DEFAULT 0,
  activo       BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone read active listings"
  ON listings FOR SELECT USING (activo = true);

CREATE POLICY "sellers manage own listings"
  ON listings FOR ALL
  USING (auth.uid() = vendedor_id)
  WITH CHECK (auth.uid() = vendedor_id);

CREATE POLICY "admin manage all listings"
  ON listings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.tipo = 'admin'
    )
  );

-- ── Índices ──────────────────────────────────────────────────
CREATE INDEX idx_cotizaciones_user ON cotizaciones(user_id);
CREATE INDEX idx_pedidos_user ON pedidos(user_id);
CREATE INDEX idx_pedidos_estado ON pedidos(estado);
CREATE INDEX idx_listings_vendedor ON listings(vendedor_id);
CREATE INDEX idx_listings_categoria ON listings(categoria);
CREATE INDEX idx_listings_activo ON listings(activo);
