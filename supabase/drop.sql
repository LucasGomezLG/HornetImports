-- ============================================================
-- Hornet Imports — DROP COMPLETO
-- Ejecutar en Supabase → SQL Editor para borrar todo y empezar de cero.
-- ============================================================

DROP FUNCTION IF EXISTS set_updated_at()  CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

DROP TABLE IF EXISTS pedidos          CASCADE;
DROP TABLE IF EXISTS cotizaciones     CASCADE;
DROP TABLE IF EXISTS listings         CASCADE;
DROP TABLE IF EXISTS tienda_productos CASCADE;
DROP TABLE IF EXISTS profiles         CASCADE;

DROP SEQUENCE IF EXISTS pedido_seq;

DROP TYPE IF EXISTS estado_pedido     CASCADE;
DROP TYPE IF EXISTS estado_cotizacion CASCADE;
DROP TYPE IF EXISTS tipo_cuenta       CASCADE;
