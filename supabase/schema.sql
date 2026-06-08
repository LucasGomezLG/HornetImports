-- ============================================================
-- Hornet Imports — Schema completo v2
-- Ejecutar DESPUÉS de drop.sql (o en una DB vacía).
-- ============================================================


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
  tipo_servicio      TEXT              NOT NULL DEFAULT 'completo',
  utm_source         TEXT,
  created_at         TIMESTAMPTZ       NOT NULL DEFAULT now()
);

-- ── pedidos ──────────────────────────────────────────────────
CREATE TABLE pedidos (
  id                    TEXT          PRIMARY KEY DEFAULT 'HI-' || LPAD(nextval('pedido_seq')::TEXT, 4, '0'),
  cotizacion_id         UUID          REFERENCES cotizaciones(id) ON DELETE SET NULL,
  user_id               UUID          NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  producto_nombre       TEXT          NOT NULL,
  producto_url          TEXT,
  precio_usd            NUMERIC(10,2) NOT NULL,
  costo_total_ars       NUMERIC(14,2) NOT NULL,
  estado                estado_pedido NOT NULL DEFAULT 'en_proceso',
  tracking_code         TEXT,
  tracking_codigo_cliente TEXT,
  tipo_servicio         TEXT          NOT NULL DEFAULT 'completo',
  origen                TEXT,
  created_at            TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- ── listings (marketplace de vendedores) ─────────────────────
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

-- ── tienda_productos (catálogo curado por admin) ──────────────
CREATE TABLE tienda_productos (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre      TEXT          NOT NULL,
  descripcion TEXT,
  categoria   TEXT          NOT NULL,
  precio_usd  NUMERIC(10,2) NOT NULL,
  stock       INT           NOT NULL DEFAULT 0,
  destacado   BOOLEAN       NOT NULL DEFAULT false,
  activo      BOOLEAN       NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT now()
);


-- ============================================================
-- SECCIÓN 4 — Funciones y Triggers
-- ============================================================

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

CREATE TRIGGER tienda_productos_updated_at
  BEFORE UPDATE ON tienda_productos
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
CREATE INDEX idx_tienda_productos_categoria ON tienda_productos(categoria);
CREATE INDEX idx_tienda_productos_activo    ON tienda_productos(activo);


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

CREATE POLICY "admin read all profiles"
  ON profiles FOR SELECT
  USING (
    (SELECT tipo FROM profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "admin update all profiles"
  ON profiles FOR UPDATE
  USING (
    (SELECT tipo FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- ── cotizaciones ─────────────────────────────────────────────
ALTER TABLE cotizaciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users read own cotizaciones"
  ON cotizaciones FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "users insert cotizaciones"
  ON cotizaciones FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

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

-- ── tienda_productos ─────────────────────────────────────────
ALTER TABLE tienda_productos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone read active tienda_productos"
  ON tienda_productos FOR SELECT
  USING (activo = true);

CREATE POLICY "admin manage tienda_productos"
  ON tienda_productos FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.tipo = 'admin')
  );


-- ============================================================
-- SECCIÓN 7 — Datos iniciales
-- ============================================================

-- Seed tienda_productos con catálogo base
INSERT INTO tienda_productos (nombre, descripcion, categoria, precio_usd, stock, destacado) VALUES
  ('Filtro de aceite Toyota Corolla 2014–2022', 'Filtro original OEM compatible con motores 1.8L y 2.0L.', 'autopartes', 18.90, 12, false),
  ('Pastillas de freno delanteras Ford Ka', 'Set de 4 pastillas de cerámica de alto rendimiento.', 'autopartes', 32.50, 8, true),
  ('Kit de distribución Chevrolet Cruze 1.4T', 'Cadena + tensor + polea. Compatible con motor turbo 1.4.', 'autopartes', 89.90, 5, true),
  ('Sensor de oxígeno universal Bosch', 'Sonda lambda universal 4 cables. Rosca M18 × 1.5.', 'autopartes', 45.00, 7, false),
  ('Par de faros LED Honda Civic 2022+', 'Luz de día DRL integrada, plug & play, par completo.', 'autopartes', 124.00, 3, false),
  ('Amortiguador trasero Volkswagen Gol KYB', 'Gas presurizado KYB para Gol Trend 2009–2018.', 'autopartes', 67.00, 6, false),
  ('Llave de torque digital 1/2" 20–200 Nm', 'Pantalla LCD, memoria de 9 ajustes, alarma sonora.', 'herramientas', 89.00, 4, true),
  ('Set de llaves combinadas 20 piezas Cr-V', 'Acero Cr-V pulido satinado. Medidas 6 mm a 32 mm.', 'herramientas', 54.00, 9, false),
  ('Destornillador eléctrico inalámbrico 4V', 'Batería de litio, 28 puntas incluidas, torque 3.5 Nm.', 'herramientas', 67.50, 6, false),
  ('Multímetro digital profesional AC/DC', 'True RMS, temperatura, capacitancia. Bolso incluido.', 'herramientas', 38.90, 11, false),
  ('Purificador de aire HEPA H13 280 m³/h', 'Filtro verdadero H13, modo nocturno, WiFi. Hasta 35 m².', 'hogar', 89.00, 4, true),
  ('Cafetera pour-over acero inoxidable 600 ml', 'Filtro permanente, jarra térmica, libre de BPA.', 'hogar', 42.00, 7, false),
  ('Rodilleras de escalada bouldering premium', 'Neopreno reforzado, velcro ajustable, par.', 'deporte', 38.00, 5, false),
  ('Soporte lumbar para ciclismo y running', 'Velcro anatómico, transpirable, talla S–XL.', 'deporte', 24.90, 8, false),
  ('Soporte magnético para celular — auto', 'Imán N52, para rejilla de ventilación, universal.', 'accesorios', 19.90, 15, false),
  ('Organizador de cables escritorio 6 clips', 'Silicona premium, adhesivo 3M, colores surtidos.', 'accesorios', 14.90, 20, false);

-- Después de registrarte, corré esto para ser admin:
-- UPDATE profiles SET tipo = 'admin' WHERE email = 'tu@email.com';
