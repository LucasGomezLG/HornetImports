# Hornet Imports — Estado del proyecto

> Última actualización: mayo 2026  
> Stack: Next.js 16.2.4 · Supabase · Resend · MercadoPago · Vercel  
> Repo: github.com/LucasGomezLG/HornetImports

---

## Modelo de negocio

### Segmentos y pricing

| Tipo | Fee logístico | Comisión marketplace |
|---|---|---|
| Particular (B2C) | 15% sobre CIF | — |
| Mayorista (B2B) | 12% sobre CIF (mín. USD 200/envío) | — |
| Vendedor del marketplace | — | 8–12% según categoría |

> El cotizador ya implementa la diferencia de fee: 15% particular / 12% mayorista.

### Descuento por volumen mayorista (target — no implementado aún)

| Volumen anual acumulado | Fee aplicado |
|---|---|
| $0 – $5.000 USD | 12% |
| $5.001 – $20.000 USD | 11% |
| $20.001 – $50.000 USD | 10% |
| > $50.000 USD | negociado |

### Unit economics (escenario realista)

| Métrica | Particular | Mayorista |
|---|---|---|
| Ticket promedio | $150 USD | $2.000 USD |
| Frecuencia anual | 1,5 importaciones | 5 importaciones |
| Fee neto efectivo | 15% | 12% |
| Churn anual | 40% | 30% |
| **LTV proyectado** | **$79 USD** | **$3.500 USD** |

> **1 mayorista = 44 particulares en LTV.** La estrategia comercial prioriza B2B desde el día 1.

### Break-even (escenario realista)

Mix mínimo mensual para cubrir burn-rate (~$1.200 USD/mes):
- 20 importaciones particulares × $21 USD margen = $420 USD
- 3 importaciones mayoristas × $300 USD margen = $900 USD
- $5.000 GMV marketplace × 4% neto = $200 USD
- **Total: $1.520 USD/mes** — break-even proyectado en mes 6–7.

---

## Cotizador — lógica implementada

### Fórmula de cálculo

```
CIF = precio_origen + flete
flete = peso_facturable × USD 18/kg
peso_facturable = redondear_al_medio(pesoKg)  ← solo peso real, sin volumétrico

arancel      = CIF × tasa_categoria (0% – 35%)
IVA          = (CIF + arancel) × 21%
tasa_est     = CIF × 3%
fee_servicio = CIF × fee_ratio  ← 15% particular / 12% mayorista
total_usd    = CIF + arancel + IVA + tasa_est + fee_servicio
total_ars    = total_usd × tipo_cambio_blue
```

### Parámetros clave

| Parámetro | Valor |
|---|---|
| Tarifa flete | USD 18/kg facturable |
| Fee particular | 15% sobre CIF |
| Fee mayorista | 12% sobre CIF |
| Precio mínimo particular | USD 25 |
| Precio mínimo mayorista | USD 200 |
| Peso máximo | 30 kg (régimen Courier AFIP) |
| Tipo de cambio | Dólar blue vía dolarapi.com · fallback: $1.200 |

### Campos del cotizador

- Nombre del producto
- URL del producto
- Precio en USD
- Peso en kg
- País de origen: Asia/China · EE.UU. · Europa · Otro
- Categoría
- Tipo de importación: Particular / Mayorista

### Categorías whitelist (cotización automática)

| ID | Categoría | Arancel |
|---|---|---|
| `autopartes` | Autopartes y repuestos | 35% |
| `herramientas` | Herramientas y equipamiento | 35% |
| `indumentaria` | Ropa y calzado | 35% |
| `hogar` | Hogar y decoración | 35% |
| `deporte` | Deportes y fitness | 35% |
| `juguetes` | Juguetes y entretenimiento | 35% |
| `libros` | Libros y materiales educativos | 0% |
| `accesorios` | Accesorios y bijouterie | 35% |

### Categorías blacklist (deriva a revisión manual)

| ID | Categoría | Motivo |
|---|---|---|
| `tecnologia` | Electrónica / Tecnología | ENACOM, batería litio |
| `alimentos` | Alimentos y bebidas | SENASA |
| `cosmeticos` | Cosméticos y perfumería | ANMAT |
| `otros` | Otro rubro | Sin clasificar |

### Lógica de origen Europa

Si `origen === "europa"` y `precio > USD 100`: el sistema muestra un banner de alerta amarilla advirtiendo que puede aplicar un arancel adicional del 50% si el producto hace escala en EE.UU. El flag `alertaOrigenEuropa: true` queda guardado en el JSONB de `desglose`.

---

## Funcionalidades implementadas

### Páginas públicas

| Ruta | Estado | Descripción |
|---|---|---|
| `/` | ✅ | Landing con hero, stats, CTA |
| `/cotizar` | ✅ | Cotizador completo: toggle particular/mayorista, origen, whitelist/blacklist |
| `/marketplace` | ✅ | Listado de productos con filtros |
| `/marketplace/[slug]` | ✅ | Detalle de producto |
| `/tienda/[slug]` | ✅ | Tienda de vendedor |
| `/como-funciona` | ✅ | Proceso de importación |
| `/nosotros` | ✅ | Página de equipo |
| `/faq` | ✅ | Accordion de preguntas frecuentes |
| `/vender` | ✅ | Landing para vendedores |
| `/mayorista` | ✅ | Propuesta B2B (landing estático — sin formulario de alta aún) |
| `/seguimiento` | ✅ | Tracking por ID o código; datos reales si el usuario está logueado |
| `/privacidad` · `/terminos` | ✅ | Páginas legales |

### Autenticación

| Ruta | Estado | Descripción |
|---|---|---|
| `/registro` | ✅ | Email/password. `nombre` guardado en DB via trigger. Mensajes de error específicos. |
| `/login` | ✅ | Redirect post-auth. Maneja: credenciales incorrectas, email no confirmado, rate limit. |
| `/recuperar-contrasena` | ✅ | Email de recuperación vía Supabase |
| `/actualizar-contrasena` | ✅ | Reset via evento `PASSWORD_RECOVERY` |

### Flujo de importación

| Paso | Estado | Descripción |
|---|---|---|
| Cotizar | ✅ | `POST /api/cotizar` — calcula, guarda en Supabase, retorna `cotizacionId` |
| Confirmar | ✅ | `/solicitar/[cotizacionId]` — resumen de costos, selector MP / Efectivo, CTA WhatsApp |
| Pago online | ✅ | Redirige a MercadoPago si `MP_ACCESS_TOKEN` está configurado |
| Pago efectivo | ✅ | Crea pedido, envía emails, redirige a `/pedidos` |
| Post-pago | ✅ | `/pago/exitoso` · `/pago/pendiente` · `/pago/fallido` |
| Webhook MP | ✅ | `POST /api/mp/webhook` — actualiza pedido a `comprado` al confirmar pago |

### Dashboard usuario

| Ruta | Estado | Descripción |
|---|---|---|
| `/dashboard` | ✅ | Stats reales + últimos pedidos + banner de perfil incompleto |
| `/pedidos` | ✅ | Lista completa con filtros y paginación (8 items/página) |
| `/perfil` | ✅ | Edición de nombre, apellido, teléfono |
| `/seguimiento` | ✅ | Conectado a pedidos reales del usuario |

### Panel Admin

| Ruta | Estado | Descripción |
|---|---|---|
| `/admin` | ✅ | Métricas del día/mes: pedidos, ingresos, vendedores, cotizaciones pendientes |
| `/admin/pedidos` | ✅ | Tabla con dropdown de estado + tracking code editable por fila |
| `/admin/cotizaciones` | ✅ | Tabla con acciones: Enviar link al usuario / Rechazar con motivo |
| `/admin/vendedores` | ✅ | Lista de vendedores con conteo de listings |

### APIs

| Endpoint | Descripción |
|---|---|
| `POST /api/cotizar` | Calcula cotización, guarda en Supabase. Rate limit 10 req/min por IP (in-memory) |
| `GET /api/tipo-cambio` | Dólar blue desde dolarapi.com con fallback $1.200 |
| `POST /api/mp/webhook` | Notificaciones MercadoPago → actualiza pedido a `comprado` |
| `GET /api/mp/webhook` | Health check para verificación de URL por MP |

---

## Emails automáticos (Resend)

| Trigger | Destinatario | Contenido |
|---|---|---|
| Admin hace click en "Enviar link" | Usuario | Link para confirmar la cotización |
| Admin rechaza cotización | Usuario | Notificación de rechazo con motivo |
| Usuario confirma pedido | Usuario | Confirmación con ID de pedido |
| Usuario confirma pedido | Admin | Alerta de nuevo pedido |
| MP confirma pago (webhook) | Admin | Alerta de pago recibido |

> **Requisito:** `RESEND_API_KEY` + dominio verificado en Resend para producción. Sin dominio verificado, usar SMTP nativo de Supabase (límite: 3 emails/hora).

---

## Base de datos (Supabase)

### Tablas

| Tabla | Campos clave |
|---|---|
| `profiles` | `id`, `email`, `nombre`, `apellido`, `telefono`, `cuit`, `tipo` (`comprador`/`vendedor`/`admin`) |
| `cotizaciones` | `id`, `user_id`, `nombre_producto`, `producto_url`, `precio_usd`, `peso_kg`, `categoria`, `costo_total_ars`, `desglose` (JSONB), `estado` |
| `pedidos` | `id` (HI-XXXX), `cotizacion_id`, `user_id`, `producto_nombre`, `producto_url`, `precio_usd`, `costo_total_ars`, `estado`, `tracking_code`, `origen`, `updated_at` |
| `listings` | `id`, `vendedor_id`, `nombre`, `descripcion`, `precio_ars`, `categoria`, `imagen_url`, `stock`, `activo` |

### Estructura del campo `desglose` (JSONB)

```json
{
  "precioProducto": 150,
  "pesoFacturable": 1.5,
  "costoFlete": 27,
  "arancelImportacion": 63.45,
  "ivaImportacion": 50.34,
  "tasaEstadistica": 5.31,
  "feeServicio": 26.55,
  "feeRatio": 0.15,
  "total": 322.65,
  "tipoCambio": 1250,
  "totalArs": 403312.5,
  "tipoImportacion": "particular",
  "alertaOrigenEuropa": false
}
```

### Estados de cotización

`pendiente` → `aprobada` | `rechazada` | `expirada`

### Estados de pedido

`en_proceso` → `comprado` → `en_transito` → `en_aduana` → `entregado` | `cancelado`

> El webhook de MP cambia automáticamente `en_proceso` → `comprado` al confirmar el pago.

### RLS — políticas implementadas

| Tabla | Operación | Regla |
|---|---|---|
| `profiles` | SELECT | Usuario ve solo el propio; admin ve todos |
| `profiles` | UPDATE | Usuario actualiza el propio; admin actualiza cualquiera |
| `profiles` | INSERT | Solo via trigger `handle_new_user` (SECURITY DEFINER) |
| `cotizaciones` | SELECT | Usuario ve las propias |
| `cotizaciones` | INSERT | Usuario propio o anónimo (user_id = null) |
| `cotizaciones` | UPDATE | Usuario actualiza las propias (necesario para confirmarPedido) |
| `cotizaciones` | ALL | Admin gestiona todo |
| `pedidos` | SELECT | Usuario ve los propios |
| `pedidos` | INSERT | Usuario inserta los propios (necesario para confirmarPedido) |
| `pedidos` | ALL | Admin gestiona todo |
| `listings` | SELECT | Cualquiera ve listings activos |
| `listings` | ALL | Vendedor gestiona los propios; admin gestiona todos |

---

## Seguridad implementada

| Capa | Mecanismo |
|---|---|
| Routing | `proxy.ts` protege `/dashboard`, `/pedidos`, `/perfil`, `/solicitar`, `/admin` |
| Admin | Layout verifica `profile.tipo === "admin"` server-side antes de renderizar |
| Datos | RLS en todas las tablas — usuarios solo ven sus propios datos |
| Ownership | `confirmarPedido` verifica `.eq("user_id", user.id)` — imposible confirmar cotización ajena |
| Rate limiting | 10 req/min por IP en `/api/cotizar` (in-memory — no persiste en multi-instancia) |
| Admin DB | `createAdminClient()` con service role key, solo en archivos server-only |
| Pagos | Cero persistencia de tarjetas — delegación total a MercadoPago (PCI-DSS) |
| Auth errors | Login maneja: credenciales incorrectas, email no confirmado, rate limit |

---

## Variables de entorno

### Configuradas en `.env.local` (desarrollo)

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### Pendientes en Vercel (producción)

```env
# Supabase — bypasa RLS, solo server-side
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Resend — emails transaccionales
RESEND_API_KEY=re_...
RESEND_FROM=Hornet Imports <noreply@tudominio.com>
RESEND_ADMIN_EMAIL=admin@tudominio.com

# MercadoPago — opcional; sin esto el flujo cae a efectivo
MP_ACCESS_TOKEN=APP_USR-...

# URLs
NEXT_PUBLIC_SITE_URL=https://tudominio.com
NEXT_PUBLIC_WHATSAPP_NUMBER=5491100000000   # sin + ni espacios
```

**Cómo agregar en Vercel:** Dashboard → proyecto → Settings → Environment Variables → `Production` → Redeploy.

---

## Gaps críticos del cotizador

| Feature | Estado | Descripción |
|---|---|---|
| ~~Toggle Particular / Mayorista~~ | ✅ Hecho | Selector en primera pantalla. Fee 15% / 12%. Mínimos distintos. Badge B2B en resultado. |
| ~~Simplificación de datos~~ | ✅ Hecho | Eliminados largo/ancho/alto. Solo `pesoKg`. |
| ~~Lógica de origen Europa~~ | ✅ Hecho | Selector de origen + alerta amarilla + flag en `desglose` JSONB. |
| **Modo asistido** | 🔴 Pendiente | Admin debe confirmar manualmente cada cotización antes de que el usuario pueda confirmar el pedido. Falta: columna `aprobada_por_admin BOOLEAN` en `cotizaciones` + gate en `/solicitar`. |
| **Validación CUIT + cupo Courier** | 🔴 Pendiente | Verificar que el usuario no supere los 12 envíos/año por CUIT (AFIP). Fase 1: autodeclaración en perfil. Fase 2: webservice AFIP A4/A5. |
| **Intervención humana por origen Europa** | 🟡 Pendiente | Cuando `alertaOrigenEuropa === true`, el admin ve un indicador especial en `/admin/cotizaciones` y debe revisar la ruta antes de enviar el link. |
| **Circuit breaker de margen** | 🟡 Pendiente | Si una categoría tiene margen real < 10% en los últimos 10 envíos, desactivarla automáticamente. Requiere registrar margen real post-envío. |
| **Descuento escalonado por volumen mayorista** | 🟡 Pendiente | El fee fijo del 12% no considera el volumen acumulado. Requiere historial de pedidos por CUIT. |
| **Panel Health Check del cotizador** | 🟢 Pendiente | Dashboard interno: margen predicho vs real por categoría. Señal temprana de calibración rota. |
| **Cobertura cambiaria T+0** | 🟢 Pendiente | Conversión inmediata a USDT/USDC al confirmar el pago. El spread del fee cubre el riesgo cambiario pero no hay conversión real. |

---

## Roadmap por fases

### Fase 1 — Digitalización (mes 0–3) ← Estamos acá

**Objetivo:** convertir "pedime precio por WhatsApp" en autoservicio digital.

- ✅ Cotizador con cálculo real (whitelist + blacklist)
- ✅ Toggle particular / mayorista con pricing diferenciado
- ✅ Lógica de origen Europa con alerta
- ✅ Pago online (MercadoPago) + pago en efectivo
- ✅ Flujo completo cotización → pedido → pago
- ✅ Emails automáticos (confirmación, rechazo, alerta admin)
- ✅ Dashboard usuario + panel admin básico
- ✅ Auth completa (registro, login, recuperación, errores específicos)
- ❌ Modo asistido (gate admin antes de confirmación)
- ❌ Validación CUIT + cupo Courier
- **KPI clave:** > 60% de los pedidos migran de WhatsApp a la web

### Fase 2 — Escala B2B (mes 3–9)

- Modo asistido + intervención por origen Europa
- Validación CUIT + cupo courier (autodeclaración → AFIP)
- Descuento escalonado por volumen acumulado
- Panel mayorista con historial y saldo
- WhatsApp Business API para mayoristas
- Upstash Redis (rate limiting robusto)
- Inngest (alertas automáticas de estado de tránsito)
- AfterShip para tracking real de 900+ couriers
- UTM tracking en cotizaciones
- Analytics (Plausible + Posthog)
- **KPI clave:** ≥ 10 mayoristas activos con frecuencia mensual

### Fase 3 — Ecosistema Marketplace (mes 9–18)

- Panel de vendedor externo (CRUD listings, gestión de ventas)
- Split payment automático con MercadoPago
- USDT gateway (Coinbase Commerce / BitPay)
- Anti-bypass: ocultar contacto del vendedor hasta transacción iniciada
- ERP básico de stock para vendedores
- Stripe para fees en USD a mayoristas internacionales
- **KPI clave:** GMV marketplace > $10.000 USD/mes

### Fase 4 — Optimización logística (mes 18+)

- Algoritmo de consolidación de lotes (bin-packing)
- Smart routing dinámico entre rutas (Miami / Shanghai / São Paulo)
- Microservicio Python/FastAPI si la optimización lo requiere

---

## Pendiente inmediato

### Ops (Lucas — sin código)

| Item | Prioridad |
|---|---|
| Agregar env vars en Vercel (`SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `MP_ACCESS_TOKEN`, etc.) | 🔴 |
| Correr SQL del trigger en Supabase (para que `nombre` se guarde al registrarse) | 🔴 |
| Promover primer admin: `UPDATE profiles SET tipo='admin' WHERE email='...'` | 🔴 |
| Configurar URL en Supabase: `Authentication → URL Configuration → Site URL` | 🔴 |
| Testear flujo completo con MP sandbox | 🟡 |

### Dev — alta prioridad

| Item | Complejidad |
|---|---|
| Modo asistido (columna `aprobada_por_admin` + gate en `/solicitar`) | Media |
| Validación CUIT + cupo Courier en perfil (autodeclaración) | Media |
| Filtros por estado en `/admin/pedidos` | Baja |
| UTM tracking (`?utm_source` guardado en cotizaciones) | Baja |

### Dev — media prioridad

| Item | Complejidad |
|---|---|
| Analytics — Plausible o Posthog | Baja |
| Dólar Blue cron para `listings.precio_ars` | Media |
| Rate limiting con Upstash Redis (reemplaza in-memory) | Media |
| AfterShip tracking real | Alta |
| MercadoPago: reembolsos y cancelaciones | Media |

### Dev — fase 2/3

| Item | Complejidad |
|---|---|
| Panel vendedor (CRUD listings) | Alta |
| Anti-bypass marketplace | Alta |
| USDT gateway | Alta |
| Descuento escalonado por volumen mayorista | Media |

---

## Integraciones planeadas

| Integración | Fase | Descripción |
|---|---|---|
| **Upstash Redis** | 2 | Rate limiting robusto multi-instancia + caché de cotizaciones frecuentes |
| **Inngest** | 2 | Orquestador de flujos largos — alerta si el flete no cambia de estado en 7 días |
| **AfterShip API** | 2 | Tracking unificado de 900+ couriers |
| **WhatsApp Business API** | 2 | Notificaciones de estado para mayoristas vía Twilio/Meta |
| **AFIP Webservice A4/A5** | 2 | Validación automática de CUIT + condición fiscal |
| **Binance / Bitso / Lemon** | 2 | Conversión T+0 a USDT/USDC para cobertura cambiaria real |
| **Plausible / Posthog** | 2 | Analytics de tráfico y embudo de conversión |
| **Amazon / eBay / AliExpress APIs** | 2 | Extracción automática de título y precio desde el link del producto |
| **USDT gateway (Coinbase Commerce)** | 3 | Aceptar pagos en cripto directamente |
| **Stripe** | 3 | Cobro de fees en USD a mayoristas internacionales |

---

## Compliance y estructura legal

### Límites del régimen Courier (AFIP)

- Máximo **USD 3.000** por envío
- **12 envíos/año por CUIT** ← el sistema debe validarlo (PENDIENTE)
- Máximo **50 kg** por envío
- Presunción comercial si hay múltiples unidades idénticas

### Organismos reguladores relevantes

| Organismo | Categorías que controla |
|---|---|
| SENASA | Alimentos, bebidas, productos de origen animal/vegetal |
| ANMAT | Cosméticos, medicamentos, suplementos |
| ENACOM / Res. 92 SeCom | Electrónica, dispositivos eléctricos |
| Res. 404 COPANT | Textiles |
| Res. INTI | Juguetes para niños < 36 meses |

### Estructura legal target

- **LLC en Delaware/Uruguay/Paraguay** — procesar fees B2B y operatoria USDT/USDC offshore
- **SRL/SAS en Argentina** — operación local, facturación en pesos
- Responsabilidad solidaria marketplace (RG 4622 AFIP) → verificar CUIT + condición fiscal de vendedores al alta y cada 6 meses

---

## KPIs objetivo

| KPI | Target | Alarma |
|---|---|---|
| Conversión visita → cotización | ≥ 8% | < 5% |
| Conversión cotización → compra (particular) | ≥ 30% | < 15% |
| Conversión cotización → compra (mayorista) | ≥ 50% | < 30% |
| Margen post-envío promedio | ≥ 14% | < 10% (circuit breaker) |
| Tasa de fallback a manual | < 25% | > 35% (sprint de whitelist) |
| LTV/CAC particular | ≥ 3× | < 2× |
| LTV/CAC mayorista | ≥ 5× | < 3× |
| Account expansion rate mayoristas | Crecimiento MoM | Caída 2 meses seguidos |

---

## Riesgos principales

### 🔴 Riesgo #1 — Quema de margen por calibración incorrecta del cotizador

Un solo envío con arancel 35% y peso mal declarado puede comerse el margen de 20 envíos rentables.

**Mitigaciones:**
- Whitelist conservadora (expandir solo con datos reales de envíos realizados)
- Modo asistido los primeros 60 días — **PENDIENTE**
- Circuit breaker por categoría si margen real < 10% en últimos 10 envíos — **PENDIENTE**

### 🔴 Riesgo #2 — Asfixia regulatoria (AFIP / Aduana)

Cambios de régimen Courier, cepos, congelamiento de fondos, responsabilidad solidaria marketplace.

**Mitigaciones:**
- Estructura legal multi-jurisdicción (LLC offshore + SRL local)
- Validación CUIT + cupo Courier antes de cotizar — **PENDIENTE**
- Logs forenses de cada cambio de estado de pedido

### 🟡 Riesgo #3 — Cuello de botella manual al escalar

Si fallback a manual > 35%, el founder se convierte en el cuello de botella.

**Mitigaciones:**
- Tasa de fallback como KPI semanal (target < 25%)
- Expandir whitelist en sprints con datos reales
- Operador junior de cotizaciones manuales (~$600 USD/mes) cuando sea necesario

### 🟡 Riesgo #4 — Riesgo cambiario durante el tránsito (15–30 días)

Una devaluación durante el tránsito puede liquidar el margen si no hay cobertura.

**Mitigaciones:**
- Spread cambiario incluido en el fee (15% particular / 12% mayorista)
- Conversión T+0 a USDT/USDC al confirmar el pago — **PENDIENTE**

---

## Arquitectura general

```
D:\Anti-ML\HornetImports\
├── docs/
│   └── ESTADO-PROYECTO.md        ← este archivo
├── supabase/
│   └── schema.sql                ← DROP + recreate completo (correr en Supabase SQL Editor)
└── src/
    ├── app/
    │   ├── (public)/             # Rutas sin auth requerida
    │   │   ├── cotizar/          # CotizadorForm con toggle particular/mayorista
    │   │   ├── solicitar/        # Confirmación + selector MP/Efectivo
    │   │   ├── seguimiento/      # Tracking form
    │   │   ├── pago/             # exitoso · pendiente · fallido
    │   │   └── marketplace/      # Listado + detalle de productos
    │   ├── (auth)/               # Login, registro, recuperar/actualizar contraseña
    │   ├── (dashboard)/          # Panel usuario (proxy.ts requerido)
    │   │   ├── dashboard/        # Stats + últimos pedidos + banner perfil
    │   │   ├── pedidos/          # Lista completa con paginación
    │   │   └── perfil/           # Edición de datos personales
    │   ├── (admin)/              # Panel admin (proxy.ts + tipo="admin")
    │   │   ├── admin/            # Métricas generales
    │   │   ├── admin/pedidos/    # Gestión de pedidos con estado y tracking
    │   │   ├── admin/cotizaciones/ # Enviar link / rechazar
    │   │   └── admin/vendedores/ # Lista de vendedores
    │   └── api/
    │       ├── cotizar/          # POST — calcula + guarda cotización
    │       ├── tipo-cambio/      # GET — dólar blue
    │       └── mp/webhook/       # POST — confirma pago MP
    ├── components/
    │   ├── cotizador/            # CotizadorForm, ResultadoCotizacion
    │   ├── layout/               # Header, Footer, MobileNav
    │   ├── seguimiento/          # TrackingForm
    │   └── ui/                   # LogoutButton, etc.
    ├── lib/
    │   ├── cotizador/            # calcular.ts, categorias.ts, types.ts
    │   ├── email/                # client.ts (Resend), send.ts (5 templates)
    │   ├── mp/                   # client.ts (preference + webhook)
    │   ├── supabase/             # server.ts, client.ts, admin.ts, types.ts
    │   └── utils/                # format.ts
    └── proxy.ts                  # Auth guard centralizado
```

---

## Feedback de cliente incorporado — mayo 2026

| Pedido | Estado |
|---|---|
| MercadoPago | ✅ Implementado |
| Dólar Blue automático en cotizaciones | ✅ Real-time en cada cotización |
| Dólar Blue en listings (catálogo propio) | ❌ `listings.precio_ars` es estático — necesita cron si hay catálogo activo |
| Pago en efectivo | ✅ Selector en `/solicitar` |
| Toggle particular / mayorista | ✅ Fee diferenciado, mínimos distintos, badge B2B |
| Simplificar cotizador (sin medidas) | ✅ Solo peso + origen |
| Lógica de origen Europa | ✅ Alerta + flag en desglose |
| Sección Mayorista completa | ⚠️ Landing estático ok — falta formulario de alta y pricing escalonado interactivo |
| USDT | ❌ Fase 3 |
| UTM / trazabilidad de leads | ❌ Pendiente |
| Analytics / control de clics | ❌ Pendiente (Plausible + Posthog) |
| Anti-bypass marketplace | ❌ Pendiente |
| Tres pilares (cotizador + mkt empresa + mkt usuarios) | ⚠️ Schema listo, cotizador ✅, panel vendedor ❌ |
