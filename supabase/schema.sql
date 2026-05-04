-- ============================================================
-- Hornet Imports — Schema completo
-- ¿Cómo correr? Supabase Dashboard → SQL Editor → pegar y ejecutar
-- Para empezar de cero: ejecutar el bloque DROP primero,
-- luego todo el resto de una sola vez (o sección por sección).
-- ============================================================


-- ============================================================
-- SECCIÓN 0 — DROP (empezar de cero)
-- Borrar en orden inverso de dependencias.
--
-- NOTA: no usamos "DROP TRIGGER IF EXISTS ... ON tabla" porque
-- falla si la tabla no existe (IF EXISTS sólo cubre el trigger,
-- no la tabla). En su lugar, dropeamos las funciones con CASCADE
-- (que elimina automáticamente los triggers que las usan), y
-- luego las tablas con CASCADE (que elimina triggers restantes,
-- índices y policies de una vez).
-- ============================================================

-- Funciones CASCADE → elimina también los triggers que las usan
-- (pedidos_updated_at y on_auth_user_created)
DROP FUNCTION IF EXISTS set_updated_at()  CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- Tablas CASCADE → elimina políticas RLS, índices y FK constraints
-- Orden: primero las que tienen FKs apuntando a otras
DROP TABLE IF EXISTS pedidos      CASCADE;
DROP TABLE IF EXISTS cotizaciones CASCADE;
DROP TABLE IF EXISTS listings     CASCADE;
DROP TABLE IF EXISTS profiles     CASCADE;

-- Secuencia de pedidos
DROP SEQUENCE IF EXISTS pedido_seq;

-- Tipos ENUM
DROP TYPE IF EXISTS estado_pedido      CASCADE;
DROP TYPE IF EXISTS estado_cotizacion  CASCADE;
DROP TYPE IF EXISTS tipo_cuenta        CASCADE;


-- ============================================================
-- SECCIÓN 1 — Tipos ENUM
-- ============================================================

CREATE TYPE tipo_cuenta AS ENUM ('comprador', 'vendedor', 'admin');

CREATE TYPE estado_cotizacion AS ENUM ('pendiente', 'aprobada', 'rechazada', 'expirada');

CREATE TYPE estado_pedido AS ENUM (
  'en_proceso',
  'comprado',
  'en_transito',
  'en_aduana',
  'entregado',
  'cancelado'
);


-- ============================================================
-- SECCIÓN 2 — Secuencias
-- ============================================================

CREATE SEQUENCE pedido_seq START 1;


-- ============================================================
-- SECCIÓN 3 — Tablas
-- ============================================================

-- ── profiles ─────────────────────────────────────────────────
CREATE TABLE profiles (
  id          UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT        NOT NULL,
  nombre      TEXT,
  apellido    TEXT,
  telefono    TEXT,
  cuit        TEXT        UNIQUE,
  tipo        tipo_cuenta NOT NULL DEFAULT 'comprador',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── cotizaciones ─────────────────────────────────────────────
CREATE TABLE cotizaciones (
  id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID          REFERENCES profiles(id) ON DELETE SET NULL,
  producto_url     TEXT          NOT NULL,
  nombre_producto  TEXT          NOT NULL,
  precio_usd       NUMERIC(10,2) NOT NULL,
  peso_kg          NUMERIC(6,3)  NOT NULL,
  categoria        TEXT          NOT NULL,
  costo_total_ars  NUMERIC(14,2) NOT NULL,
  desglose           JSONB             NOT NULL DEFAULT '{}',
  estado             estado_cotizacion NOT NULL DEFAULT 'pendiente',
  aprobada_por_admin BOOLEAN           NOT NULL DEFAULT FALSE,
  utm_source         TEXT,
  created_at         TIMESTAMPTZ       NOT NULL DEFAULT now()
);

-- ── pedidos ──────────────────────────────────────────────────
CREATE TABLE pedidos (
  id               TEXT          PRIMARY KEY DEFAULT 'HI-' || LPAD(nextval('pedido_seq')::TEXT, 4, '0'),
  cotizacion_id    UUID          REFERENCES cotizaciones(id) ON DELETE SET NULL,
  user_id          UUID          NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  producto_nombre  TEXT          NOT NULL,
  producto_url     TEXT,
  precio_usd       NUMERIC(10,2) NOT NULL,
  costo_total_ars  NUMERIC(14,2) NOT NULL,
  estado           estado_pedido NOT NULL DEFAULT 'en_proceso',
  tracking_code    TEXT,
  origen           TEXT,
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- ── listings ─────────────────────────────────────────────────
CREATE TABLE listings (
  id           UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  vendedor_id  UUID          NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  nombre       TEXT          NOT NULL,
  descripcion  TEXT,
  precio_usd   NUMERIC(10,2),
  precio_ars   NUMERIC(14,2) NOT NULL,
  categoria    TEXT          NOT NULL,
  imagen_url   TEXT,
  stock        INT           NOT NULL DEFAULT 0,
  activo       BOOLEAN       NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT now()
);


-- ============================================================
-- SECCIÓN 4 — Funciones y Triggers
-- ============================================================

-- Crea el profile automáticamente cuando se registra un usuario.
-- Lee tipo y nombre desde raw_user_meta_data (pasados en signUp options.data).
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, tipo, nombre)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'tipo', 'comprador')::tipo_cuenta,
    NULLIF(TRIM(NEW.raw_user_meta_data->>'nombre'), '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Mantiene updated_at al día en cada UPDATE de pedidos.
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER pedidos_updated_at
  BEFORE UPDATE ON pedidos
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ============================================================
-- SECCIÓN 5 — Índices
-- ============================================================

CREATE INDEX idx_cotizaciones_user      ON cotizaciones(user_id);
CREATE INDEX idx_cotizaciones_estado    ON cotizaciones(estado);
CREATE INDEX idx_pedidos_user           ON pedidos(user_id);
CREATE INDEX idx_pedidos_estado         ON pedidos(estado);
CREATE INDEX idx_listings_vendedor      ON listings(vendedor_id);
CREATE INDEX idx_listings_categoria     ON listings(categoria);
CREATE INDEX idx_listings_activo        ON listings(activo);


-- ============================================================
-- SECCIÓN 6 — Row Level Security
-- ============================================================

-- ── profiles ─────────────────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "users update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- No hay INSERT policy para usuarios: profiles solo se crean via el trigger
-- handle_new_user (SECURITY DEFINER), que bypasea RLS. Exponer INSERT sería
-- un agujero de seguridad que permitiría insertar profiles arbitrarios.

CREATE POLICY "admin read all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.tipo = 'admin')
  );

CREATE POLICY "admin update all profiles"
  ON profiles FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.tipo = 'admin')
  );

-- ── cotizaciones ─────────────────────────────────────────────
ALTER TABLE cotizaciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users read own cotizaciones"
  ON cotizaciones FOR SELECT
  USING (auth.uid() = user_id);

-- Permite insert sin user_id (anónimo cotiza) o con user_id propio.
CREATE POLICY "users insert cotizaciones"
  ON cotizaciones FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Necesaria para confirmarPedido: actualiza estado a "aprobada" con el client
-- de usuario (no admin). Sin esta policy el UPDATE silently falla.
CREATE POLICY "users update own cotizaciones"
  ON cotizaciones FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "admin manage cotizaciones"
  ON cotizaciones FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.tipo = 'admin')
  );

-- ── pedidos ──────────────────────────────────────────────────
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users read own pedidos"
  ON pedidos FOR SELECT
  USING (auth.uid() = user_id);

-- Necesaria para confirmarPedido: inserta el pedido con el client de usuario.
-- Sin esta policy el INSERT falla y la acción devuelve error al usuario.
CREATE POLICY "users insert own pedidos"
  ON pedidos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "admin manage pedidos"
  ON pedidos FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.tipo = 'admin')
  );

-- ── listings ─────────────────────────────────────────────────
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone read active listings"
  ON listings FOR SELECT
  USING (activo = true);

CREATE POLICY "sellers manage own listings"
  ON listings FOR ALL
  USING (auth.uid() = vendedor_id)
  WITH CHECK (auth.uid() = vendedor_id);

CREATE POLICY "admin manage all listings"
  ON listings FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.tipo = 'admin')
  );


-- ============================================================
-- SECCIÓN 7 — Datos iniciales (opcional)
-- Crear primer usuario admin manualmente luego de registrarlo:
--
--   UPDATE profiles SET tipo = 'admin' WHERE email = 'tu@email.com';
--
-- ============================================================
