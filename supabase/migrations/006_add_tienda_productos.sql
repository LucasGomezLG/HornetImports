-- 006: Tabla tienda_productos — catálogo curado gestionado por admin
-- Separada de `listings` (que es para vendedores del marketplace).

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

CREATE TRIGGER tienda_productos_updated_at
  BEFORE UPDATE ON tienda_productos
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_tienda_productos_categoria ON tienda_productos(categoria);
CREATE INDEX idx_tienda_productos_activo    ON tienda_productos(activo);

ALTER TABLE tienda_productos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone read active tienda_productos"
  ON tienda_productos FOR SELECT
  USING (activo = true);

CREATE POLICY "admin manage tienda_productos"
  ON tienda_productos FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.tipo = 'admin')
  );

-- Seed: migración de los datos del mock existente
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
