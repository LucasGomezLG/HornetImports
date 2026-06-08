# Hornet Imports — Especificación Técnica Completa
**Stack:** React (frontend) · Java Spring Boot (backend) · PostgreSQL (base de datos)

---

## ÍNDICE

1. [¿Qué es Hornet Imports?](#1-qué-es-hornet-imports)
2. [Tipos de usuario](#2-tipos-de-usuario)
3. [Flujos principales](#3-flujos-principales)
4. [Pantallas del frontend](#4-pantallas-del-frontend)
5. [Lógica de negocio](#5-lógica-de-negocio)
6. [Autenticación y seguridad](#6-autenticación-y-seguridad)
7. [Integraciones externas](#7-integraciones-externas)
8. [Base de datos — Para el DBA](#8-base-de-datos--para-el-dba)
9. [API REST — Para el backend Java](#9-api-rest--para-el-backend-java)
10. [SPEC TÉCNICO COMPLETO PARA IA](#10-spec-técnico-completo-para-ia)

---

# PARTE 1 — PARA HUMANOS

---

## 1. ¿Qué es Hornet Imports?

Hornet Imports es una plataforma argentina de importación y comercio electrónico con tres servicios integrados:

### Servicio 1: Cotizador automático
El usuario pega el link de cualquier producto (Amazon, AliExpress, eBay, etc.), ingresa el peso y la categoría, y el sistema calcula en segundos el precio total puesto en Argentina: flete internacional + aranceles de aduana + IVA + fee del servicio. Sin sorpresas, sin letra chica.

**Dos modos:**
- **Servicio completo:** Hornet compra el producto, lo trae y lo entrega en la puerta.
- **Forwarding:** El cliente ya compró el producto y lo mandó a Miami. Hornet solo hace el tramo Miami → Buenos Aires.

### Servicio 2: Tienda pre-cotizada
Catálogo de productos que Hornet importa repetidamente (autopartes, herramientas, hogar, etc.). Ya tienen el precio calculado. El usuario compra directamente sin necesidad de cotizar.

### Servicio 3: Marketplace local
Vendedores argentinos publican sus productos. La plataforma cobra entre 8% y 12% de comisión por venta concretada (vs. 13–17% de Mercado Libre).

---

## 2. Tipos de usuario

### Comprador (tipo: `comprador`)
- Puede cotizar productos
- Puede comprar en la tienda y el marketplace
- Tiene un dashboard con sus pedidos e historial de cotizaciones
- Puede hacer seguimiento de sus importaciones

### Vendedor (tipo: `vendedor`)
- Todo lo que puede un comprador
- Puede publicar productos en el marketplace
- Tiene su propio panel para gestionar sus listings (nombre, precio, stock)
- El precio en ARS se calcula automáticamente según el tipo de cambio blue del día

### Admin (tipo: `admin`)
- Acceso total a la plataforma
- Aprueba o rechaza cotizaciones
- Gestiona pedidos (actualiza estado, agrega tracking)
- Gestiona el catálogo de la tienda (agregar/editar/eliminar productos)
- Ve todos los usuarios y vendedores registrados
- Recibe alertas por email cuando entra un pedido nuevo

### Anónimo (sin cuenta)
- Puede usar el cotizador sin registrarse (la cotización se guarda sin user_id)
- Puede ver la tienda y el marketplace
- Para confirmar y pagar necesita crear una cuenta

---

## 3. Flujos principales

### Flujo A: Cotización y compra (el más importante)

```
1. Usuario entra a /cotizar
2. Completa el formulario:
   - Link del producto
   - Nombre del producto
   - Precio en USD
   - Peso en kg
   - Categoría (autopartes, herramientas, etc.)
   - Origen (Asia, Europa, EEUU, otro)
   - Tipo: particular o mayorista
   - Modo: servicio completo o forwarding
3. El sistema calcula y muestra el desglose de costos
4. Si está conforme, hace clic en "Solicitar importación"
   → Si no está logueado, lo lleva a /login (con redirect de vuelta)
   → Si está logueado, va a /solicitar/{cotizacionId}
5. En /solicitar/{cotizacionId}:
   → Si la cotización está "pendiente revisión": ve un mensaje de espera
   → Si fue aprobada por el admin: puede elegir método de pago y confirmar
6. Confirma el pedido → paga por Mercado Pago (o elige transferencia/cripto)
7. Si paga por MP: redirige a la plataforma de MP → vuelve a /pago/exitoso
8. El pedido queda registrado con estado "en_proceso"
9. El admin ve el pedido en su panel, actualiza el estado y agrega tracking
10. El usuario puede ver el estado en /seguimiento o en /pedidos
```

### Flujo B: Registro y login

```
1. /registro → completa nombre, email, contraseña, elige comprador o vendedor
2. Llega email de confirmación → hace clic → /auth/callback → /dashboard
3. /login → email + contraseña → /dashboard
4. /recuperar-contrasena → email → link en email → /auth/callback → /actualizar-contrasena
```

### Flujo C: Venta en marketplace

```
1. Vendedor va a /vendedor/productos
2. Crea un listing: nombre, descripción, categoría, precio en USD, stock
3. El sistema calcula precio ARS automáticamente (USD × tipo de cambio blue)
4. El listing aparece en /marketplace visible para todos
5. Un comprador lo ve y hace clic en "Contactar vendedor"
6. (Flujo de compra marketplace: a implementar en fase 2)
```

### Flujo D: Admin aprueba una cotización

```
1. Usuario cotiza → cotización queda en estado "pendiente"
2. Admin entra a /admin/cotizaciones
3. Revisa la cotización (producto, precio, peso, categoría)
4. Aprueba → el sistema envía email al usuario con link para confirmar
5. O rechaza con un motivo → el sistema envía email de rechazo
```

---

## 4. Pantallas del frontend

### Páginas públicas (sin login)

| Ruta | Descripción |
|------|-------------|
| `/` | Landing page: propuesta de valor, comparativa con ML, CTA al cotizador |
| `/cotizar` | Formulario del cotizador con resultado en tiempo real |
| `/tienda` | Grid de productos pre-cotizados con filtros por categoría |
| `/tienda/{id}` | Detalle de producto de la tienda |
| `/marketplace` | Grid de listings de vendedores con filtros |
| `/marketplace/{id}` | Detalle de listing de vendedor |
| `/vender` | Página informativa para atraer vendedores |
| `/mayorista` | Página informativa para empresas/mayoristas |
| `/como-funciona` | Explicación del proceso en 3 pasos |
| `/faq` | Preguntas frecuentes con acordeón |
| `/seguimiento` | Búsqueda de estado de pedido por ID o tracking code |
| `/nosotros` | Sobre la empresa |
| `/terminos` | Términos y condiciones |
| `/privacidad` | Política de privacidad |

### Páginas de auth

| Ruta | Descripción |
|------|-------------|
| `/login` | Formulario de login |
| `/registro` | Formulario de registro (comprador o vendedor) |
| `/recuperar-contrasena` | Solicitar reset de contraseña |
| `/actualizar-contrasena` | Nueva contraseña (llega desde el email) |
| `/auth/callback` | Maneja confirmación de email y reset (no es una página visible) |

### Páginas de pago

| Ruta | Descripción |
|------|-------------|
| `/solicitar/{cotizacionId}` | Resumen de cotización + elección de método de pago |
| `/pago/exitoso` | Confirmación de pago exitoso |
| `/pago/pendiente` | Pago en proceso |
| `/pago/fallido` | Pago fallido con opciones |

### Dashboard de usuario (requiere login)

| Ruta | Descripción |
|------|-------------|
| `/dashboard` | Resumen: pedidos activos, completados, total gastado + acciones rápidas |
| `/pedidos` | Lista completa de pedidos con estado |
| `/perfil` | Editar nombre, apellido, teléfono |
| `/seguimiento` | Rastrear pedido por ID o código de tracking |

### Panel de vendedor (requiere login + tipo vendedor)

| Ruta | Descripción |
|------|-------------|
| `/vendedor/productos` | Lista de listings propios + formulario para agregar/editar |

### Panel de admin (requiere login + tipo admin)

| Ruta | Descripción |
|------|-------------|
| `/admin` | Overview: stats del día (pedidos, ingresos, cotizaciones pendientes) |
| `/admin/cotizaciones` | Lista de cotizaciones con acciones de aprobar/rechazar |
| `/admin/pedidos` | Lista de todos los pedidos con acciones de actualizar estado/tracking |
| `/admin/vendedores` | Lista de vendedores registrados con cantidad de listings |
| `/admin/tienda` | CRUD de productos de la tienda |

---

## 5. Lógica de negocio

### El cotizador (núcleo del negocio)

**Variables de entrada:**
- `precioUsd`: precio del producto en USD
- `pesoKg`: peso real en kg
- `categoriaId`: categoría del producto
- `tipo`: `particular` o `mayorista`
- `tipoServicio`: `completo` o `forwarding`
- `origen`: `asia` | `europa` | `eeuu` | `otro`

**Validaciones previas:**
- Si la categoría está en blacklist → rechazado, requiere cotización manual
- Si el peso > 30 kg → rechazado
- Si `tipoServicio = completo` y `tipo = particular` → precio mínimo USD 25
- Si `tipoServicio = completo` y `tipo = mayorista` → precio mínimo USD 200
- Si `tipoServicio = forwarding` → precio mínimo USD 10

**Cálculo paso a paso:**

```
pesoFacturable = redondear_al_medio(pesoKg)
  → ej: 1.3 kg → 1.5 kg, 2.1 kg → 2.5 kg

costoFlete = pesoFacturable × USD 18/kg

CIF = precioUsd + costoFlete

arancelImportacion = CIF × tasaArancel (según categoría)
ivaImportacion = (CIF + arancelImportacion) × 21%
tasaEstadistica = CIF × 3%
feeServicio = CIF × feeRatio

feeRatio según modo:
  - particular + completo:   15%
  - mayorista  + completo:   12%
  - particular + forwarding:  8%
  - mayorista  + forwarding:  6%

Si modo = completo:
  total = CIF + arancelImportacion + ivaImportacion + tasaEstadistica + feeServicio

Si modo = forwarding (el cliente ya compró el producto):
  total = costoFlete + arancelImportacion + ivaImportacion + tasaEstadistica + feeServicio

totalArs = total × tipoCambioBlueDia
```

**Categorías y aranceles:**

| Categoría | Arancel | Estado |
|-----------|---------|--------|
| Autopartes | 35% | ✅ Automática |
| Herramientas | 35% | ✅ Automática |
| Indumentaria y calzado | 35% | ✅ Automática |
| Hogar y decoración | 35% | ✅ Automática |
| Deportes y fitness | 35% | ✅ Automática |
| Juguetes | 35% | ✅ Automática |
| Libros | 0% | ✅ Automática |
| Accesorios y bijouterie | 35% | ✅ Automática |
| Electrónica / Tecnología | 16% | ❌ Manual (blacklist) |
| Alimentos y bebidas | 35% | ❌ Manual (blacklist) |
| Cosméticos y perfumería | 35% | ❌ Manual (blacklist) |
| Otro rubro | 35% | ❌ Manual (blacklist) |

**Alerta Europa:** Si el origen es Europa y el precio > USD 100, se muestra una advertencia de que puede haber demoras adicionales en aduana.

### Estados de una cotización

```
pendiente → aprobada (admin aprueba)
pendiente → rechazada (admin rechaza)
aprobada  → [el usuario confirma y paga, la cotización queda en aprobada]
pendiente → expirada (futuro: cron job a los 7 días sin acción)
```

### Estados de un pedido

```
en_proceso → comprado (usuario pagó, MP confirmó)
comprado   → en_transito (admin actualiza)
en_transito → en_aduana (admin actualiza)
en_aduana  → entregado (admin actualiza)
cualquiera → cancelado (MP reporta cancelación o admin cancela)
```

### Comisión del marketplace
- Los vendedores pagan entre 8% y 12% de comisión al concretarse una venta
- El porcentaje exacto se define por categoría (a implementar en fase 2)
- El costo de publicar es 0 (no hay mensualidad)

---

## 6. Autenticación y seguridad

### Sistema de auth
- **JWT tokens** emitidos por el backend
- **Access token:** corta duración (ej: 1 hora)
- **Refresh token:** larga duración (ej: 30 días), httpOnly cookie
- El frontend guarda el access token en memoria (no localStorage)
- El refresh token va en una cookie httpOnly (no accesible por JS)
- En cada request el frontend manda el access token en el header: `Authorization: Bearer {token}`

### Registro
- Email + contraseña (mínimo 8 caracteres)
- Confirmación por email (link de activación)
- Campo `tipo`: `comprador` o `vendedor` (el admin se asigna manualmente)

### Rutas protegidas
- `/dashboard/**` → requiere estar logueado
- `/pedidos`, `/perfil`, `/solicitar/**` → requiere estar logueado
- `/vendedor/**` → requiere tipo `vendedor` o `admin`
- `/admin/**` → requiere tipo `admin`

### Seguridad en el backend
- Todas las operaciones de escritura verifican que el usuario sea dueño del recurso
- Las operaciones admin verifican que `tipo = admin`
- Rate limiting en el endpoint del cotizador: 10 requests/minuto por IP

---

## 7. Integraciones externas

### Mercado Pago
- Cuando el usuario confirma un pedido eligiendo MP, el backend crea una **preferencia de pago**
- El usuario es redirigido a la checkout page de MP
- MP llama al webhook del backend (`POST /api/pagos/webhook`) cuando el pago se procesa
- El backend actualiza el estado del pedido según el resultado:
  - `approved` → pedido pasa a `comprado`
  - `cancelled` / `refunded` / `charged_back` → pedido pasa a `cancelado`

### Resend (emails transaccionales)
| Evento | Email enviado |
|--------|--------------|
| Cotización aprobada | Email al usuario con link para confirmar |
| Cotización rechazada | Email al usuario con el motivo |
| Pedido confirmado | Email al usuario con número de pedido |
| Pedido nuevo | Alerta al admin |

### DolarAPI (tipo de cambio)
- `GET https://dolarapi.com/v1/dolares/blue`
- Devuelve el precio de venta del dólar blue
- Se cachea 1 hora para no saturar la API
- Fallback: valor hardcodeado (1320) si la API falla

---

## 8. Base de datos — Para el DBA

### Diagrama de relaciones

```
auth_users (manejado por el sistema de auth)
    ↓ (1:1)
profiles
    ↓ (1:N)          ↓ (1:N)
cotizaciones        listings
    ↓ (1:1)
pedidos
```

### Script completo (PostgreSQL)

```sql
-- TIPOS ENUM
CREATE TYPE tipo_cuenta AS ENUM ('comprador', 'vendedor', 'admin');
CREATE TYPE estado_cotizacion AS ENUM ('pendiente', 'aprobada', 'rechazada', 'expirada');
CREATE TYPE estado_pedido AS ENUM (
  'en_proceso', 'comprado', 'en_transito', 'en_aduana', 'entregado', 'cancelado'
);

-- SECUENCIA para IDs de pedido (HI-0001, HI-0002...)
CREATE SEQUENCE pedido_seq START 1;

-- TABLA: profiles (información del usuario)
CREATE TABLE profiles (
  id          UUID        PRIMARY KEY,  -- mismo UUID que auth_users.id
  email       TEXT        NOT NULL UNIQUE,
  nombre      TEXT,
  apellido    TEXT,
  telefono    TEXT,
  cuit        TEXT        UNIQUE,
  tipo        tipo_cuenta NOT NULL DEFAULT 'comprador',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- TABLA: cotizaciones
CREATE TABLE cotizaciones (
  id                 UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID              REFERENCES profiles(id) ON DELETE SET NULL,
  producto_url       TEXT              NOT NULL,
  nombre_producto    TEXT              NOT NULL,
  precio_usd         NUMERIC(10,2)     NOT NULL,
  peso_kg            NUMERIC(6,3)      NOT NULL,
  categoria          TEXT              NOT NULL,
  costo_total_ars    NUMERIC(14,2)     NOT NULL,
  desglose           JSONB             NOT NULL DEFAULT '{}',
  estado             estado_cotizacion NOT NULL DEFAULT 'pendiente',
  aprobada_por_admin BOOLEAN           NOT NULL DEFAULT FALSE,
  tipo_servicio      TEXT              NOT NULL DEFAULT 'completo',
  utm_source         TEXT,
  created_at         TIMESTAMPTZ       NOT NULL DEFAULT now()
);

-- TABLA: pedidos
CREATE TABLE pedidos (
  id                      TEXT          PRIMARY KEY
                          DEFAULT 'HI-' || LPAD(nextval('pedido_seq')::TEXT, 4, '0'),
  cotizacion_id           UUID          REFERENCES cotizaciones(id) ON DELETE SET NULL,
  user_id                 UUID          NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  producto_nombre         TEXT          NOT NULL,
  producto_url            TEXT,
  precio_usd              NUMERIC(10,2) NOT NULL,
  costo_total_ars         NUMERIC(14,2) NOT NULL,
  estado                  estado_pedido NOT NULL DEFAULT 'en_proceso',
  tracking_code           TEXT,
  tracking_codigo_cliente TEXT,
  tipo_servicio           TEXT          NOT NULL DEFAULT 'completo',
  origen                  TEXT,
  created_at              TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- TABLA: listings (marketplace de vendedores)
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

-- TABLA: tienda_productos (catálogo curado por admin)
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

-- ÍNDICES
CREATE INDEX idx_cotizaciones_user   ON cotizaciones(user_id);
CREATE INDEX idx_cotizaciones_estado ON cotizaciones(estado);
CREATE INDEX idx_pedidos_user        ON pedidos(user_id);
CREATE INDEX idx_pedidos_estado      ON pedidos(estado);
CREATE INDEX idx_listings_vendedor   ON listings(vendedor_id);
CREATE INDEX idx_listings_categoria  ON listings(categoria);
CREATE INDEX idx_listings_activo     ON listings(activo);
CREATE INDEX idx_tienda_categoria    ON tienda_productos(categoria);
CREATE INDEX idx_tienda_activo       ON tienda_productos(activo);

-- TRIGGER: updated_at automático en pedidos y tienda_productos
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER pedidos_updated_at
  BEFORE UPDATE ON pedidos
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER tienda_productos_updated_at
  BEFORE UPDATE ON tienda_productos
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
```

### Descripción del campo `desglose` (JSONB en cotizaciones)

```json
{
  "precioProducto": 100.00,
  "pesoFacturable": 1.5,
  "costoFlete": 27.00,
  "arancelImportacion": 44.55,
  "ivaImportacion": 36.12,
  "tasaEstadistica": 3.81,
  "feeServicio": 19.05,
  "feeRatio": 0.15,
  "total": 230.53,
  "tipoCambio": 1350.00,
  "totalArs": 311215.50,
  "tipoImportacion": "particular",
  "tipoServicio": "completo",
  "incluyeProducto": true,
  "alertaOrigenEuropa": false
}
```

---

## 9. API REST — Para el backend Java

### Base URL
```
https://api.hornetimports.com/api
```

### Autenticación
Todos los endpoints protegidos requieren header:
```
Authorization: Bearer {access_token}
```

### Endpoints de Auth

#### `POST /auth/registro`
Crear una cuenta nueva.
```json
// Request
{
  "email": "usuario@gmail.com",
  "password": "mi-contraseña",
  "nombre": "Juan",
  "tipo": "comprador"  // o "vendedor"
}

// Response 201
{
  "message": "Revisá tu email para confirmar tu cuenta."
}

// Response 400
{ "error": "El email ya está registrado." }
```

#### `POST /auth/login`
Iniciar sesión.
```json
// Request
{ "email": "usuario@gmail.com", "password": "mi-contraseña" }

// Response 200 — setea refresh token como cookie httpOnly
{
  "accessToken": "eyJ...",
  "user": { "id": "uuid", "email": "...", "nombre": "Juan", "tipo": "comprador" }
}

// Response 401
{ "error": "Email o contraseña incorrectos." }
// Response 403
{ "error": "Confirmá tu email antes de ingresar." }
```

#### `POST /auth/refresh`
Obtener nuevo access token usando el refresh token de la cookie.
```json
// Response 200
{ "accessToken": "eyJ..." }

// Response 401
{ "error": "Sesión expirada. Iniciá sesión de nuevo." }
```

#### `POST /auth/logout`
Cerrar sesión (invalida el refresh token).
```json
// Response 200
{ "message": "Sesión cerrada." }
```

#### `POST /auth/recuperar-contrasena`
Solicitar email de reset.
```json
// Request
{ "email": "usuario@gmail.com" }

// Response 200 (siempre, para no revelar si el email existe)
{ "message": "Si el email existe, recibirás un link." }
```

#### `POST /auth/actualizar-contrasena`
Actualizar contraseña con el token del email.
```json
// Request
{ "token": "reset-token-del-email", "password": "nueva-contraseña" }

// Response 200
{ "message": "Contraseña actualizada." }
// Response 400
{ "error": "El link expiró o es inválido." }
```

#### `GET /auth/confirmar?token={token}`
Confirmar el email (el link del email apunta acá).
- Redirige a `/dashboard` si todo OK
- Redirige a `/login?error=token_invalido` si falló

---

### Endpoints del Cotizador

#### `POST /cotizar`
Calcular el costo de importar un producto. No requiere auth (anónimo puede cotizar).
```json
// Request
{
  "nombreProducto": "Pastillas de freno Ford Ka",
  "urlProducto": "https://amazon.com/...",
  "precioUsd": 32.50,
  "pesoKg": 1.2,
  "categoriaId": "autopartes",
  "origen": "eeuu",
  "tipo": "particular",
  "tipoServicio": "completo",
  "utmSource": "instagram"  // opcional
}

// Response 200 — cotización aceptada
{
  "ok": true,
  "cotizacionId": "uuid-de-la-cotizacion",  // null si no hay sesión y falla el guardado
  "desglose": {
    "precioProducto": 32.50,
    "pesoFacturable": 1.5,
    "costoFlete": 27.00,
    "arancelImportacion": 21.47,
    "ivaImportacion": 11.20,
    "tasaEstadistica": 1.79,
    "feeServicio": 8.93,
    "feeRatio": 0.15,
    "total": 102.89,
    "tipoCambio": 1350.00,
    "totalArs": 138901.50,
    "tipoImportacion": "particular",
    "tipoServicio": "completo",
    "incluyeProducto": true,
    "alertaOrigenEuropa": false
  }
}

// Response 200 — cotización rechazada
{
  "ok": false,
  "razon": "categoria_blacklist"
  // razones: categoria_blacklist | precio_invalido | precio_minimo |
  //           precio_minimo_mayorista | peso_excedido | rate_limit
}

// Response 429
{ "ok": false, "razon": "rate_limit" }
```

#### `GET /cotizar/{cotizacionId}`
Ver el detalle de una cotización (requiere auth, solo el dueño o admin).
```json
// Response 200
{
  "id": "uuid",
  "nombreProducto": "...",
  "urlProducto": "...",
  "precioUsd": 32.50,
  "pesoKg": 1.2,
  "categoria": "autopartes",
  "costoTotalArs": 138901.50,
  "desglose": { ... },
  "estado": "pendiente",
  "aprobadaPorAdmin": false,
  "tipoServicio": "completo",
  "createdAt": "2026-06-08T12:00:00Z"
}
```

---

### Endpoints de Pedidos

#### `POST /pedidos/confirmar`
Confirmar una cotización aprobada y crear un pedido. Requiere auth.
```json
// Request
{
  "cotizacionId": "uuid",
  "metodoPago": "mp"  // mp | transferencia | cripto
}

// Response 200 — pago con MP
{
  "pedidoId": "HI-0001",
  "metodoPago": "mp",
  "mpInitPoint": "https://www.mercadopago.com.ar/checkout/v1/redirect?..."
}

// Response 200 — otros métodos de pago
{
  "pedidoId": "HI-0001",
  "metodoPago": "transferencia",
  "mensaje": "Te enviamos los datos bancarios por email."
}

// Response 400
{ "error": "Esta cotización ya fue procesada." }
// Response 404
{ "error": "Cotización no encontrada." }
```

#### `GET /pedidos`
Listar los pedidos del usuario logueado.
```json
// Response 200
[
  {
    "id": "HI-0001",
    "productoNombre": "Pastillas de freno Ford Ka",
    "productoUrl": "https://...",
    "precioUsd": 32.50,
    "costoTotalArs": 138901.50,
    "estado": "en_transito",
    "trackingCode": "AB123456789AR",
    "trackingCodigoCliente": null,
    "tipoServicio": "completo",
    "createdAt": "2026-06-08T12:00:00Z",
    "updatedAt": "2026-06-09T10:00:00Z"
  }
]
```

#### `GET /pedidos/{pedidoId}`
Detalle de un pedido específico. Requiere auth (solo el dueño o admin).

---

### Endpoints de Perfil

#### `GET /perfil`
Obtener el perfil del usuario logueado.
```json
// Response 200
{
  "id": "uuid",
  "email": "usuario@gmail.com",
  "nombre": "Juan",
  "apellido": "Pérez",
  "telefono": "+54 9 11 1234-5678",
  "cuit": null,
  "tipo": "comprador",
  "createdAt": "2026-06-01T10:00:00Z"
}
```

#### `PATCH /perfil`
Actualizar perfil. Requiere auth.
```json
// Request
{
  "nombre": "Juan",
  "apellido": "Pérez",
  "telefono": "+54 9 11 1234-5678"
}
// Response 200 — el perfil actualizado
```

---

### Endpoints de Tienda

#### `GET /tienda`
Listar productos activos de la tienda.
```json
// Query params: categoria (opcional), destacado (opcional)
// Response 200
[
  {
    "id": "uuid",
    "nombre": "Pastillas de freno Ford Ka",
    "descripcion": "Set de 4 pastillas cerámica.",
    "categoria": "autopartes",
    "precioUsd": 32.50,
    "stock": 8,
    "destacado": true
  }
]
```

#### `GET /tienda/{id}`
Detalle de un producto de la tienda.

---

### Endpoints de Marketplace

#### `GET /marketplace`
Listar listings activos del marketplace.
```json
// Query params: categoria (opcional), search (opcional)
// Response 200
[
  {
    "id": "uuid",
    "nombre": "Batería moto 12V 7Ah",
    "descripcion": "Compatible Honda, Yamaha...",
    "vendedorNombre": "MotoPartes Rosario",
    "categoria": "autopartes",
    "precioUsd": 28.00,
    "precioArs": 37800.00,
    "stock": 5
  }
]
```

#### `GET /marketplace/{id}`
Detalle de un listing.

---

### Endpoints de Vendedor

#### `GET /vendedor/productos`
Listar los listings del vendedor logueado. Requiere auth + tipo vendedor.
```json
// Response 200 — misma estructura que /marketplace pero incluye listings inactivos
```

#### `POST /vendedor/productos`
Crear un nuevo listing. Requiere auth + tipo vendedor.
```json
// Request
{
  "nombre": "Batería moto 12V 7Ah",
  "descripcion": "Compatible Honda, Yamaha, Zanella.",
  "categoria": "autopartes",
  "precioUsd": 28.00,
  "stock": 5
}
// El backend calcula precio_ars automáticamente con el tipo de cambio blue

// Response 201
{ "id": "uuid", ... }
```

#### `PUT /vendedor/productos/{id}`
Actualizar un listing propio. Requiere auth + ser el dueño.

#### `PATCH /vendedor/productos/{id}/toggle`
Activar/desactivar un listing. Requiere auth + ser el dueño.

#### `DELETE /vendedor/productos/{id}`
Eliminar un listing propio. Requiere auth + ser el dueño.

---

### Endpoints de Admin

#### `GET /admin/stats`
Stats del dashboard admin. Requiere auth + admin.
```json
// Response 200
{
  "pedidosHoy": 3,
  "ingresosUsdMes": 1250.00,
  "vendedoresActivos": 7,
  "cotizacionesPendientes": 12
}
```

#### `GET /admin/cotizaciones`
Listar todas las cotizaciones. Requiere admin.
```json
// Query params: estado (opcional), limit (default 100)
// Response 200 — lista de cotizaciones con email del usuario
```

#### `POST /admin/cotizaciones/{id}/aprobar`
Aprobar una cotización y enviar email al usuario.
```json
// Response 200
{ "message": "Cotización aprobada. Email enviado." }
// Response 400
{ "error": "Solo se puede aprobar cotizaciones pendientes." }
```

#### `POST /admin/cotizaciones/{id}/rechazar`
Rechazar una cotización.
```json
// Request
{ "motivo": "El producto está en lista de restricción aduanera." }
// Response 200
{ "message": "Cotización rechazada. Email enviado." }
```

#### `GET /admin/pedidos`
Listar todos los pedidos. Requiere admin.
```json
// Query params: estado (opcional), limit (default 200)
```

#### `PATCH /admin/pedidos/{id}`
Actualizar estado y tracking de un pedido. Requiere admin.
```json
// Request
{
  "estado": "en_transito",
  "trackingCode": "AB123456789AR"
}
// Response 200 — el pedido actualizado
```

#### `GET /admin/vendedores`
Listar todos los usuarios tipo vendedor. Requiere admin.

#### `GET /admin/tienda`
Listar todos los productos de la tienda (activos e inactivos). Requiere admin.

#### `POST /admin/tienda`
Crear producto en la tienda. Requiere admin.
```json
// Request
{
  "nombre": "Pastillas de freno Ford Ka",
  "descripcion": "Set de 4 pastillas cerámica.",
  "categoria": "autopartes",
  "precioUsd": 32.50,
  "stock": 8,
  "destacado": true
}
```

#### `PUT /admin/tienda/{id}`
Actualizar producto. Requiere admin.

#### `PATCH /admin/tienda/{id}/toggle`
Activar/desactivar producto. Requiere admin.

#### `DELETE /admin/tienda/{id}`
Eliminar producto. Requiere admin.

---

### Endpoint de Pagos (Webhook)

#### `POST /pagos/webhook`
Recibir notificaciones de Mercado Pago. **No requiere auth** (viene de MP).
```
El backend valida que la request venga de MP (verificando la firma o el IP).
Obtiene el payment_id del body.
Consulta a la API de MP el estado del pago.
Si approved → actualiza el pedido a "comprado", envía alerta al admin.
Si cancelled/refunded/charged_back → actualiza el pedido a "cancelado".
Siempre responde 200 (MP reintenta si no recibe 200).
```

---

### Endpoint de Tipo de Cambio

#### `GET /tipo-cambio`
Obtener el tipo de cambio blue actual. Sin auth.
```json
// Response 200
{ "rate": 1350.00, "source": "live" }  // source: live | cache | fallback
```

---

# PARTE 2 — SPEC TÉCNICO COMPLETO PARA IA

---

## 10. SPEC TÉCNICO COMPLETO PARA IA

Esta sección está escrita para que una IA (Claude u otro modelo) pueda recrear el proyecto completo desde cero con precisión absoluta. Incluye todos los detalles que no son obvios.

---

### 10.1 Arquitectura general

```
┌─────────────────────┐     HTTP/REST     ┌─────────────────────────┐
│   React Frontend    │ ◄──────────────── │  Spring Boot Backend    │
│   (Vite o CRA)      │                   │  (Java 17+)             │
│                     │                   │                         │
│  - Axios/Fetch      │                   │  - Spring Security      │
│  - React Router v6  │                   │  - Spring Data JPA      │
│  - Context API      │                   │  - JWT auth             │
│    (auth state)     │                   │  - Hibernate            │
└─────────────────────┘                   └──────────┬──────────────┘
                                                     │ JPA/JDBC
                                          ┌──────────▼──────────────┐
                                          │   PostgreSQL             │
                                          │   (Railway / Supabase   │
                                          │    / RDS / local)        │
                                          └─────────────────────────┘
```

---

### 10.2 Stack tecnológico exacto

**Backend (Java):**
- Java 17 o superior
- Spring Boot 3.x
- Spring Security (JWT con jjwt o nimbus-jose-jwt)
- Spring Data JPA + Hibernate
- PostgreSQL driver (pg)
- Spring Mail (JavaMail) para emails
- Maven o Gradle
- Lombok para reducir boilerplate

**Frontend (React):**
- React 18
- Vite como build tool
- React Router v6 (rutas)
- Axios para HTTP requests
- Context API para estado de auth (no necesita Redux)
- CSS Modules o Tailwind CSS (a elección del equipo)

**Base de datos:**
- PostgreSQL 15+

---

### 10.3 Modelo de datos completo

#### Tabla: `profiles`
| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | UUID | PK | Igual al ID del sistema de auth |
| email | TEXT | NOT NULL, UNIQUE | Email del usuario |
| nombre | TEXT | nullable | Nombre o nombre del negocio (vendedor) |
| apellido | TEXT | nullable | Solo para compradores |
| telefono | TEXT | nullable | WhatsApp preferentemente |
| cuit | TEXT | nullable, UNIQUE | Para vendedores/empresas |
| tipo | ENUM | NOT NULL, DEFAULT 'comprador' | comprador / vendedor / admin |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

#### Tabla: `cotizaciones`
| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | |
| user_id | UUID | FK profiles(id), ON DELETE SET NULL, nullable | null = cotización anónima |
| producto_url | TEXT | NOT NULL | Link del producto |
| nombre_producto | TEXT | NOT NULL | Nombre ingresado por el usuario |
| precio_usd | NUMERIC(10,2) | NOT NULL | Precio del producto en USD |
| peso_kg | NUMERIC(6,3) | NOT NULL | Peso real en kg |
| categoria | TEXT | NOT NULL | ID de la categoría (ej: "autopartes") |
| costo_total_ars | NUMERIC(14,2) | NOT NULL | Total calculado en ARS |
| desglose | JSONB | NOT NULL, DEFAULT '{}' | Ver estructura en sección 8 |
| estado | ENUM | NOT NULL, DEFAULT 'pendiente' | pendiente/aprobada/rechazada/expirada |
| aprobada_por_admin | BOOLEAN | NOT NULL, DEFAULT false | Flag de aprobación |
| tipo_servicio | TEXT | NOT NULL, DEFAULT 'completo' | completo / forwarding |
| utm_source | TEXT | nullable | Origen del tráfico |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

#### Tabla: `pedidos`
| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | TEXT | PK, DEFAULT 'HI-' + secuencia | Formato: HI-0001, HI-0002... |
| cotizacion_id | UUID | FK cotizaciones(id), ON DELETE SET NULL, nullable | |
| user_id | UUID | FK profiles(id), ON DELETE CASCADE, NOT NULL | |
| producto_nombre | TEXT | NOT NULL | |
| producto_url | TEXT | nullable | |
| precio_usd | NUMERIC(10,2) | NOT NULL | Precio del producto |
| costo_total_ars | NUMERIC(14,2) | NOT NULL | Total con todos los costos |
| estado | ENUM | NOT NULL, DEFAULT 'en_proceso' | Ver estados |
| tracking_code | TEXT | nullable | Código internacional de tracking |
| tracking_codigo_cliente | TEXT | nullable | Código del cliente a Miami (forwarding) |
| tipo_servicio | TEXT | NOT NULL, DEFAULT 'completo' | completo / forwarding |
| origen | TEXT | nullable | País/región de origen |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Se actualiza automáticamente |

#### Tabla: `listings`
| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | |
| vendedor_id | UUID | FK profiles(id), ON DELETE CASCADE, NOT NULL | |
| nombre | TEXT | NOT NULL | |
| descripcion | TEXT | nullable | |
| precio_usd | NUMERIC(10,2) | nullable | Precio en USD (para recalcular ARS) |
| precio_ars | NUMERIC(14,2) | NOT NULL | Precio en ARS (lo que ve el comprador) |
| categoria | TEXT | NOT NULL | autopartes/herramientas/electronica/hogar/indumentaria |
| imagen_url | TEXT | nullable | URL de imagen (futuro) |
| stock | INT | NOT NULL, DEFAULT 0 | |
| activo | BOOLEAN | NOT NULL, DEFAULT true | Visible en marketplace o no |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

#### Tabla: `tienda_productos`
| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | |
| nombre | TEXT | NOT NULL | |
| descripcion | TEXT | nullable | |
| categoria | TEXT | NOT NULL | autopartes/herramientas/hogar/deporte/accesorios |
| precio_usd | NUMERIC(10,2) | NOT NULL | |
| stock | INT | NOT NULL, DEFAULT 0 | |
| destacado | BOOLEAN | NOT NULL, DEFAULT false | Aparece primero en el grid |
| activo | BOOLEAN | NOT NULL, DEFAULT true | |
| created_at | TIMESTAMPTZ | NOT NULL | |
| updated_at | TIMESTAMPTZ | NOT NULL | Se actualiza automáticamente |

---

### 10.4 Lógica del cotizador — Implementación exacta

```java
// Constantes
private static final double TARIFA_FLETE_USD_KG = 18.0;
private static final double FEE_PARTICULAR = 0.15;
private static final double FEE_MAYORISTA = 0.12;
private static final double FEE_FORWARDING_PARTICULAR = 0.08;
private static final double FEE_FORWARDING_MAYORISTA = 0.06;
private static final double IVA_RATIO = 0.21;
private static final double TASA_ESTADISTICA_RATIO = 0.03;
private static final double PRECIO_MINIMO_PARTICULAR = 25.0;
private static final double PRECIO_MINIMO_MAYORISTA = 200.0;
private static final double PRECIO_MINIMO_FORWARDING = 10.0;
private static final double PESO_MAX_KG = 30.0;
private static final double EUROPA_UMBRAL_USD = 100.0;

// Función de redondeo al 0.5 más cercano hacia arriba
// Ejemplos: 1.0→1.0, 1.1→1.5, 1.5→1.5, 1.6→2.0, 2.3→2.5
private double redondearAlMedio(double valor) {
    return Math.ceil(valor * 2) / 2;
}

// Algoritmo principal
public CotizacionResult calcular(CotizacionInput input, double tipoCambio) {

    // 1. Validar categoría
    Categoria categoria = getCategoriaById(input.getCategoriaId());
    if (categoria == null || categoria.isBlacklist()) {
        return CotizacionResult.rechazado("categoria_blacklist");
    }

    // 2. Validar precio
    if (input.getPrecioUsd() <= 0) {
        return CotizacionResult.rechazado("precio_invalido");
    }

    boolean esForwarding = "forwarding".equals(input.getTipoServicio());
    boolean esMayorista = "mayorista".equals(input.getTipo());

    // 3. Validar precio mínimo según modo
    if (esForwarding) {
        if (input.getPrecioUsd() < PRECIO_MINIMO_FORWARDING)
            return CotizacionResult.rechazado("precio_minimo");
    } else {
        double minimo = esMayorista ? PRECIO_MINIMO_MAYORISTA : PRECIO_MINIMO_PARTICULAR;
        if (input.getPrecioUsd() < minimo)
            return CotizacionResult.rechazado(esMayorista ? "precio_minimo_mayorista" : "precio_minimo");
    }

    // 4. Validar peso
    if (input.getPesoKg() <= 0 || input.getPesoKg() > PESO_MAX_KG) {
        return CotizacionResult.rechazado("peso_excedido");
    }

    // 5. Determinar fee ratio
    double feeRatio;
    if (esForwarding) {
        feeRatio = esMayorista ? FEE_FORWARDING_MAYORISTA : FEE_FORWARDING_PARTICULAR;
    } else {
        feeRatio = esMayorista ? FEE_MAYORISTA : FEE_PARTICULAR;
    }

    // 6. Calcular
    double pesoFacturable = redondearAlMedio(input.getPesoKg());
    double costoFlete = pesoFacturable * TARIFA_FLETE_USD_KG;
    double cif = input.getPrecioUsd() + costoFlete;
    double arancelImportacion = cif * categoria.getTasaArancel();
    double ivaImportacion = (cif + arancelImportacion) * IVA_RATIO;
    double tasaEstadistica = cif * TASA_ESTADISTICA_RATIO;
    double feeServicio = cif * feeRatio;

    double total;
    if (esForwarding) {
        // Cliente ya compró — solo paga logística
        total = costoFlete + arancelImportacion + ivaImportacion + tasaEstadistica + feeServicio;
    } else {
        total = cif + arancelImportacion + ivaImportacion + tasaEstadistica + feeServicio;
    }

    double totalArs = total * tipoCambio;
    boolean alertaOrigenEuropa = "europa".equals(input.getOrigen())
                                  && input.getPrecioUsd() > EUROPA_UMBRAL_USD;

    // 7. Retornar desglose
    CotizacionDesglose desglose = new CotizacionDesglose();
    desglose.setPrecioProducto(input.getPrecioUsd());
    desglose.setPesoFacturable(pesoFacturable);
    desglose.setCostoFlete(costoFlete);
    desglose.setArancelImportacion(arancelImportacion);
    desglose.setIvaImportacion(ivaImportacion);
    desglose.setTasaEstadistica(tasaEstadistica);
    desglose.setFeeServicio(feeServicio);
    desglose.setFeeRatio(feeRatio);
    desglose.setTotal(total);
    desglose.setTipoCambio(tipoCambio);
    desglose.setTotalArs(totalArs);
    desglose.setTipoImportacion(input.getTipo());
    desglose.setTipoServicio(input.getTipoServicio());
    desglose.setIncluyeProducto(!esForwarding);
    desglose.setAlertaOrigenEuropa(alertaOrigenEuropa);

    return CotizacionResult.aprobado(desglose);
}
```

---

### 10.5 Categorías con sus tasas de arancel

```java
// WHITELIST — cotización automática
{ id: "autopartes",   nombre: "Autopartes y repuestos",           tasaArancel: 0.35, blacklist: false }
{ id: "herramientas", nombre: "Herramientas y equipamiento",      tasaArancel: 0.35, blacklist: false }
{ id: "indumentaria", nombre: "Ropa y calzado",                   tasaArancel: 0.35, blacklist: false }
{ id: "hogar",        nombre: "Hogar y decoración",               tasaArancel: 0.35, blacklist: false }
{ id: "deporte",      nombre: "Deportes y fitness",               tasaArancel: 0.35, blacklist: false }
{ id: "juguetes",     nombre: "Juguetes y entretenimiento",       tasaArancel: 0.35, blacklist: false }
{ id: "libros",       nombre: "Libros y materiales educativos",   tasaArancel: 0.00, blacklist: false }
{ id: "accesorios",   nombre: "Accesorios y bijouterie",          tasaArancel: 0.35, blacklist: false }

// BLACKLIST — requieren revisión manual del admin
{ id: "tecnologia",   nombre: "Electrónica / Tecnología",         tasaArancel: 0.16, blacklist: true  }
{ id: "alimentos",    nombre: "Alimentos y bebidas",              tasaArancel: 0.35, blacklist: true  }
{ id: "cosmeticos",   nombre: "Cosméticos y perfumería",          tasaArancel: 0.35, blacklist: true  }
{ id: "otros",        nombre: "Otro rubro",                       tasaArancel: 0.35, blacklist: true  }
```

---

### 10.6 Sistema de autenticación — Implementación

#### Spring Security + JWT

```java
// application.properties
jwt.secret=clave-secreta-de-al-menos-256-bits
jwt.access-token-expiration=3600000       // 1 hora en ms
jwt.refresh-token-expiration=2592000000   // 30 días en ms

spring.mail.host=smtp.resend.com
spring.mail.port=465
spring.mail.username=resend
spring.mail.password=${RESEND_API_KEY}
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.ssl.enable=true
```

#### Flujo de auth:
1. Usuario hace POST /auth/login
2. Backend verifica credenciales en BD
3. Si OK: genera access_token (JWT firmado, 1h expiración) + refresh_token (opaco, en BD, 30d)
4. Retorna access_token en el body JSON
5. Setea refresh_token como cookie httpOnly: `Set-Cookie: refresh_token=...; HttpOnly; Secure; SameSite=Strict; Path=/auth/refresh; Max-Age=2592000`
6. Frontend guarda access_token en memoria (React Context/state, NO localStorage)
7. Cada request: `Authorization: Bearer {access_token}`
8. Cuando el access_token expira (401), el frontend llama POST /auth/refresh automáticamente
9. POST /auth/refresh lee la cookie httpOnly, verifica el refresh_token en BD, emite nuevo access_token

#### Tabla adicional necesaria para refresh tokens:
```sql
CREATE TABLE refresh_tokens (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  token      TEXT        NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

#### Confirmación de email:
```sql
CREATE TABLE email_confirmations (
  token      TEXT        PRIMARY KEY,
  user_id    UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  used       BOOLEAN     NOT NULL DEFAULT false
);
```

---

### 10.7 Estructura de proyecto Spring Boot

```
src/main/java/com/hornetimports/
├── HornetImportsApplication.java
│
├── config/
│   ├── SecurityConfig.java          # Spring Security, rutas protegidas, CORS
│   ├── JwtConfig.java               # Configuración del JWT
│   └── CorsConfig.java              # Orígenes permitidos
│
├── auth/
│   ├── AuthController.java          # POST /auth/login, /registro, /refresh, etc.
│   ├── AuthService.java
│   ├── JwtService.java              # Generar y validar tokens
│   ├── JwtFilter.java               # OncePerRequestFilter para extraer JWT
│   └── dto/
│       ├── LoginRequest.java
│       ├── LoginResponse.java
│       └── RegistroRequest.java
│
├── user/
│   ├── Profile.java                 # @Entity
│   ├── ProfileRepository.java
│   ├── ProfileService.java
│   └── ProfileController.java       # GET/PATCH /perfil
│
├── cotizador/
│   ├── CotizacionController.java    # POST /cotizar, GET /cotizar/{id}
│   ├── CotizacionService.java
│   ├── CotizacionRepository.java
│   ├── CotizadorEngine.java         # Lógica pura de cálculo
│   ├── Cotizacion.java              # @Entity
│   ├── Categoria.java               # Enum o tabla (recomendado: hardcodeado)
│   └── dto/
│       ├── CotizarRequest.java
│       ├── CotizarResponse.java
│       └── CotizacionDesglose.java
│
├── pedido/
│   ├── PedidoController.java        # GET /pedidos, POST /pedidos/confirmar
│   ├── PedidoService.java
│   ├── PedidoRepository.java
│   └── Pedido.java                  # @Entity
│
├── tienda/
│   ├── TiendaController.java        # GET /tienda, /tienda/{id}
│   ├── TiendaAdminController.java   # POST/PUT/DELETE /admin/tienda/**
│   ├── TiendaService.java
│   ├── TiendaRepository.java
│   └── TiendaProducto.java          # @Entity
│
├── marketplace/
│   ├── MarketplaceController.java   # GET /marketplace, /marketplace/{id}
│   ├── VendedorController.java      # GET/POST/PUT/DELETE /vendedor/productos/**
│   ├── MarketplaceService.java
│   ├── ListingRepository.java
│   └── Listing.java                 # @Entity
│
├── admin/
│   ├── AdminController.java         # GET /admin/stats, /admin/cotizaciones, etc.
│   └── AdminService.java
│
├── pago/
│   ├── PagoController.java          # POST /pagos/webhook, POST /pedidos/confirmar
│   ├── MercadoPagoService.java      # Integración con MP SDK
│   └── dto/
│       ├── ConfirmarPedidoRequest.java
│       └── ConfirmarPedidoResponse.java
│
├── email/
│   ├── EmailService.java            # Envío de emails con Spring Mail + Resend
│   └── templates/                   # HTML templates de emails
│
└── tipocambio/
    ├── TipoCambioController.java    # GET /tipo-cambio
    └── TipoCambioService.java       # Llama a dolarapi.com, cachea 1h
```

---

### 10.8 Estructura de proyecto React

```
src/
├── main.jsx                         # ReactDOM.createRoot, Router
├── App.jsx                          # Rutas con React Router v6
│
├── context/
│   └── AuthContext.jsx              # Estado global: user, accessToken, login(), logout()
│
├── hooks/
│   ├── useAuth.js                   # Consume AuthContext
│   └── useApi.js                    # Axios con interceptor para JWT y refresh automático
│
├── api/
│   ├── auth.js                      # login(), logout(), registro(), refresh()
│   ├── cotizador.js                 # cotizar(), getCotizacion()
│   ├── pedidos.js                   # getPedidos(), confirmarPedido()
│   ├── tienda.js                    # getProductos(), getProducto()
│   ├── marketplace.js               # getListings(), getListing()
│   ├── vendedor.js                  # getListingsPropios(), crearListing(), etc.
│   ├── admin.js                     # getStats(), aprobarCotizacion(), etc.
│   ├── perfil.js                    # getPerfil(), actualizarPerfil()
│   └── tipoCambio.js                # getTipoCambio()
│
├── components/
│   ├── layout/
│   │   ├── Header.jsx               # Nav + estado de auth (botón Ingresar vs nombre)
│   │   ├── Footer.jsx
│   │   └── MobileNav.jsx
│   ├── ui/
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Select.jsx
│   │   ├── StatusChip.jsx           # Chip de estado (verde, naranja, rojo)
│   │   └── LoadingSpinner.jsx
│   ├── cotizador/
│   │   ├── CotizadorForm.jsx        # Formulario principal
│   │   └── ResultadoCotizacion.jsx  # Muestra el desglose
│   ├── tienda/
│   │   ├── ProductGrid.jsx          # Grid con filtros
│   │   └── ProductCard.jsx
│   └── marketplace/
│       ├── ListingGrid.jsx
│       └── ListingCard.jsx
│
├── pages/
│   ├── public/
│   │   ├── HomePage.jsx
│   │   ├── CotizarPage.jsx
│   │   ├── TiendaPage.jsx
│   │   ├── TiendaProductoPage.jsx
│   │   ├── MarketplacePage.jsx
│   │   ├── MarketplaceListingPage.jsx
│   │   ├── SeguimientoPage.jsx
│   │   ├── ComoFuncionaPage.jsx
│   │   ├── FaqPage.jsx
│   │   ├── VenderPage.jsx
│   │   ├── MayoristaPage.jsx
│   │   └── NosotrosPage.jsx
│   ├── auth/
│   │   ├── LoginPage.jsx
│   │   ├── RegistroPage.jsx
│   │   ├── RecuperarContrasenaPage.jsx
│   │   └── ActualizarContrasenaPage.jsx
│   ├── pago/
│   │   ├── SolicitarPage.jsx        # Resumen + elección de método de pago
│   │   ├── PagoExitosoPage.jsx
│   │   ├── PagoPendientePage.jsx
│   │   └── PagoFallidoPage.jsx
│   ├── dashboard/
│   │   ├── DashboardPage.jsx
│   │   ├── PedidosPage.jsx
│   │   └── PerfilPage.jsx
│   ├── vendedor/
│   │   └── ProductosPage.jsx
│   └── admin/
│       ├── AdminOverviewPage.jsx
│       ├── CotizacionesPage.jsx
│       ├── PedidosAdminPage.jsx
│       ├── VendedoresPage.jsx
│       └── TiendaAdminPage.jsx
│
└── router/
    ├── ProtectedRoute.jsx           # Redirige a /login si no hay sesión
    └── AdminRoute.jsx               # Redirige a / si no es admin
```

---

### 10.9 Manejo de sesión en React

```jsx
// context/AuthContext.jsx
// El accessToken vive en el state de React (memoria).
// El refreshToken vive en una cookie httpOnly (no accesible por JS).

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Al montar, intentar renovar el access token con el refresh token de la cookie
  useEffect(() => {
    refreshSession().finally(() => setLoading(false));
  }, []);

  async function refreshSession() {
    try {
      const res = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' });
      if (!res.ok) return;
      const data = await res.json();
      setAccessToken(data.accessToken);
      // Decodificar el JWT para obtener el user (o hacer GET /perfil)
      const userData = decodeJwt(data.accessToken);
      setUser(userData);
    } catch {
      // No hay sesión activa
    }
  }

  async function login(email, password) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include', // Para recibir la cookie del refresh token
    });
    if (!res.ok) throw new Error((await res.json()).error);
    const data = await res.json();
    setAccessToken(data.accessToken);
    setUser(data.user);
    return data.user;
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    setAccessToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, accessToken, loading, login, logout, refreshSession }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
```

```jsx
// hooks/useApi.js — Axios con refresh automático
import axios from 'axios';
import { useAuth } from './useAuth';

export function useApi() {
  const { accessToken, refreshSession, logout } = useAuth();

  const api = axios.create({ baseURL: '/api', withCredentials: true });

  api.interceptors.request.use(config => {
    if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
    return config;
  });

  api.interceptors.response.use(
    res => res,
    async error => {
      if (error.response?.status === 401 && !error.config._retry) {
        error.config._retry = true;
        try {
          await refreshSession();
          return api(error.config);
        } catch {
          logout();
        }
      }
      return Promise.reject(error);
    }
  );

  return api;
}
```

---

### 10.10 Rutas en React Router v6

```jsx
// App.jsx
<Routes>
  {/* Públicas */}
  <Route path="/" element={<HomePage />} />
  <Route path="/cotizar" element={<CotizarPage />} />
  <Route path="/tienda" element={<TiendaPage />} />
  <Route path="/tienda/:id" element={<TiendaProductoPage />} />
  <Route path="/marketplace" element={<MarketplacePage />} />
  <Route path="/marketplace/:id" element={<MarketplaceListingPage />} />
  <Route path="/seguimiento" element={<SeguimientoPage />} />
  <Route path="/vender" element={<VenderPage />} />
  <Route path="/mayorista" element={<MayoristaPage />} />
  <Route path="/como-funciona" element={<ComoFuncionaPage />} />
  <Route path="/faq" element={<FaqPage />} />
  <Route path="/nosotros" element={<NosotrosPage />} />
  <Route path="/terminos" element={<TerminosPage />} />
  <Route path="/privacidad" element={<PrivacidadPage />} />

  {/* Auth */}
  <Route path="/login" element={<LoginPage />} />
  <Route path="/registro" element={<RegistroPage />} />
  <Route path="/recuperar-contrasena" element={<RecuperarContrasenaPage />} />
  <Route path="/actualizar-contrasena" element={<ActualizarContrasenaPage />} />

  {/* Pago */}
  <Route path="/solicitar/:cotizacionId" element={<ProtectedRoute><SolicitarPage /></ProtectedRoute>} />
  <Route path="/pago/exitoso" element={<PagoExitosoPage />} />
  <Route path="/pago/pendiente" element={<PagoPendientePage />} />
  <Route path="/pago/fallido" element={<PagoFallidoPage />} />

  {/* Dashboard (requiere login) */}
  <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
  <Route path="/pedidos" element={<ProtectedRoute><PedidosPage /></ProtectedRoute>} />
  <Route path="/perfil" element={<ProtectedRoute><PerfilPage /></ProtectedRoute>} />

  {/* Vendedor */}
  <Route path="/vendedor/productos" element={<ProtectedRoute requiredTipo="vendedor"><ProductosPage /></ProtectedRoute>} />

  {/* Admin */}
  <Route path="/admin" element={<AdminRoute><AdminOverviewPage /></AdminRoute>} />
  <Route path="/admin/cotizaciones" element={<AdminRoute><CotizacionesPage /></AdminRoute>} />
  <Route path="/admin/pedidos" element={<AdminRoute><PedidosAdminPage /></AdminRoute>} />
  <Route path="/admin/vendedores" element={<AdminRoute><VendedoresPage /></AdminRoute>} />
  <Route path="/admin/tienda" element={<AdminRoute><TiendaAdminPage /></AdminRoute>} />
</Routes>
```

---

### 10.11 Integración Mercado Pago (Spring Boot)

```java
// Dependencia Maven
// <dependency>
//   <groupId>com.mercadopago</groupId>
//   <artifactId>sdk-java</artifactId>
//   <version>2.1.7</version>
// </dependency>

@Service
public class MercadoPagoService {

    @Value("${mercadopago.access-token}")
    private String accessToken;

    @Value("${app.base-url}")
    private String baseUrl;

    public String crearPreferencia(String pedidoId, String productoNombre, double costoTotalArs) {
        MercadoPagoConfig.setAccessToken(accessToken);

        PreferenceItemRequest item = PreferenceItemRequest.builder()
            .title(productoNombre)
            .quantity(1)
            .unitPrice(new BigDecimal(costoTotalArs))
            .currencyId("ARS")
            .build();

        PreferenceBackUrlsRequest backUrls = PreferenceBackUrlsRequest.builder()
            .success(baseUrl + "/pago/exitoso")
            .pending(baseUrl + "/pago/pendiente")
            .failure(baseUrl + "/pago/fallido")
            .build();

        PreferenceRequest request = PreferenceRequest.builder()
            .items(List.of(item))
            .backUrls(backUrls)
            .externalReference(pedidoId)  // Crucial: referencia para el webhook
            .notificationUrl(baseUrl + "/api/pagos/webhook")
            .build();

        Preference preference = new Preference(new MercadoPagoConfig()).create(request);
        return preference.getInitPoint();
    }
}
```

---

### 10.12 Integración Email con Resend (Spring Boot)

```java
// application.properties
spring.mail.host=smtp.resend.com
spring.mail.port=465
spring.mail.username=resend
spring.mail.password=${RESEND_API_KEY}
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.ssl.enable=true

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${email.from}")
    private String emailFrom;  // ej: noreply@hornetimports.com

    @Value("${app.base-url}")
    private String baseUrl;

    // 1. Confirmación de cuenta
    public void sendConfirmacion(String to, String token) {
        String link = baseUrl + "/auth/confirmar?token=" + token;
        sendHtml(to, "Confirmá tu cuenta — Hornet Imports",
            "<p>Hacé clic acá para confirmar: <a href='" + link + "'>Confirmar cuenta</a></p>");
    }

    // 2. Cotización aprobada
    public void sendCotizacionAprobada(String to, String productoNombre, String cotizacionId) {
        String link = baseUrl + "/solicitar/" + cotizacionId;
        sendHtml(to, "Tu cotización está lista — " + productoNombre,
            "<p>Tu cotización para <strong>" + productoNombre + "</strong> fue aprobada.</p>" +
            "<a href='" + link + "'>Confirmar pedido →</a>");
    }

    // 3. Cotización rechazada
    public void sendCotizacionRechazada(String to, String productoNombre, String motivo) {
        sendHtml(to, "Actualización sobre tu cotización — " + productoNombre,
            "<p>No pudimos procesar tu solicitud de <strong>" + productoNombre + "</strong>.</p>" +
            "<p>Motivo: " + motivo + "</p>");
    }

    // 4. Pedido confirmado
    public void sendPedidoConfirmado(String to, String productoNombre, String pedidoId) {
        sendHtml(to, "Pedido confirmado — " + productoNombre,
            "<p>Tu pedido <strong>" + pedidoId + "</strong> fue registrado.</p>" +
            "<p>Te contactamos en menos de 24 hs para coordinar.</p>");
    }

    // 5. Alerta nuevo pedido (al admin)
    public void sendAlertaNuevoPedido(String adminEmail, String productoNombre, String pedidoId) {
        sendHtml(adminEmail, "[Hornet] Nuevo pedido — " + productoNombre,
            "<p>Nuevo pedido: <strong>" + pedidoId + "</strong></p>" +
            "<p>Producto: " + productoNombre + "</p>");
    }

    private void sendHtml(String to, String subject, String htmlBody) {
        MimeMessageHelper helper = new MimeMessageHelper(mailSender.createMimeMessage(), true, "UTF-8");
        helper.setFrom(emailFrom);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlBody, true);
        mailSender.send(helper.getMimeMessage());
    }
}
```

---

### 10.13 Variables de entorno necesarias

**Backend (application.properties / environment):**
```
# Base de datos
spring.datasource.url=jdbc:postgresql://localhost:5432/hornet_imports
spring.datasource.username=postgres
spring.datasource.password=TU_PASSWORD

# JWT
jwt.secret=CLAVE_SECRETA_256_BITS_MINIMO
jwt.access-token-expiration=3600000
jwt.refresh-token-expiration=2592000000

# Email (Resend)
spring.mail.host=smtp.resend.com
spring.mail.port=465
spring.mail.username=resend
spring.mail.password=re_XXXXXXXX

email.from=noreply@tudominio.com
email.admin=admin@tudominio.com

# Mercado Pago
mercadopago.access-token=APP_USR-XXXXXXXX

# App
app.base-url=https://hornetimports.com
app.frontend-url=https://hornetimports.com
```

**Frontend (.env):**
```
VITE_API_BASE_URL=https://api.hornetimports.com
```

---

### 10.14 CORS en Spring Boot

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins(frontendUrl)
            .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
            .allowedHeaders("*")
            .allowCredentials(true)  // Necesario para las cookies de refresh token
            .maxAge(3600);
    }
}
```

---

### 10.15 Reglas de negocio adicionales

1. **Una cotización anónima** (sin user_id) puede existir en la DB pero no puede ser confirmada. Para confirmar, el usuario debe estar logueado.

2. **La confirmación de un pedido** requiere que la cotización tenga `aprobada_por_admin = true` Y `estado = pendiente`. Después de confirmar, el estado pasa a `aprobada`.

3. **El precio ARS de los listings de vendedores** se recalcula automáticamente cuando el vendedor crea o edita su listing: `precio_ars = precio_usd × tipoCambioBlueDia`. Un cron job puede actualizarlo diariamente.

4. **Los pedidos tienen IDs secuenciales** en formato `HI-0001`. La secuencia no debe resetear. En Spring/PostgreSQL se usa una sequence (`pedido_seq`) y se formatea como `String.format("HI-%04d", nextval)`.

5. **Rate limiting del cotizador:** 10 requests por minuto por IP. Implementar con Spring's Bucket4j o una solución simple con un Map<String, RateLimit> en memoria.

6. **El webhook de MP** debe responder siempre con HTTP 200, incluso si hay un error interno (MP reintenta si no recibe 200). Loguear los errores pero no retornarlos.

7. **Alerta de Europa:** Si `origen = "europa"` y `precioUsd > 100`, mostrar en el frontend un warning de que los productos europeos pueden tener demoras adicionales en aduana argentina.

8. **El forwarding** es cuando el cliente ya compró el producto por su cuenta y lo mandó a la dirección de Miami de Hornet. Hornet solo hace el tramo Miami → Buenos Aires. Por eso el total no incluye el precio del producto.

9. **Los tipos de cuenta** son: `comprador` (default), `vendedor` (se elige en el registro), `admin` (se asigna manualmente en la DB). No hay endpoint para promover a admin.

---

### 10.16 Checklist para el equipo de desarrollo

**Backend (Java):**
- [ ] Setup Spring Boot project con todas las dependencias
- [ ] Configurar PostgreSQL + JPA + Hibernate
- [ ] Implementar entidades y repositories
- [ ] Implementar auth completo (registro, login, refresh, logout, confirmación email)
- [ ] Implementar CotizadorEngine con todas las fórmulas exactas
- [ ] Implementar endpoint POST /cotizar con rate limiting
- [ ] Implementar gestión de pedidos
- [ ] Implementar integración con Mercado Pago
- [ ] Implementar webhook de MP
- [ ] Implementar integración con Resend para emails
- [ ] Implementar endpoints de admin con verificación de rol
- [ ] Implementar endpoints de vendedor
- [ ] Implementar endpoint /tipo-cambio con cache de 1 hora
- [ ] Configurar CORS para el frontend
- [ ] Agregar logging estructurado (SLF4J + Logback)

**Frontend (React):**
- [ ] Setup Vite + React Router v6
- [ ] Implementar AuthContext con refresh automático
- [ ] Implementar Axios interceptor para JWT y refresh
- [ ] Implementar ProtectedRoute y AdminRoute
- [ ] Landing page con CTA al cotizador
- [ ] Formulario del cotizador con resultado en tiempo real
- [ ] Páginas de tienda y marketplace con filtros
- [ ] Flujo de auth (login, registro, recuperar contraseña)
- [ ] Dashboard de usuario con pedidos
- [ ] Página /solicitar/:id con selección de método de pago
- [ ] Panel de vendedor para gestionar listings
- [ ] Panel de admin completo
- [ ] Manejo de errores y estados de carga en todas las páginas

**DBA:**
- [ ] Crear la base de datos en el servidor elegido
- [ ] Ejecutar el schema SQL completo
- [ ] Crear tabla `refresh_tokens`
- [ ] Crear tabla `email_confirmations`
- [ ] Configurar backups automáticos
- [ ] Configurar índices (ya incluidos en el schema)
- [ ] Verificar que la secuencia `pedido_seq` funcione correctamente
