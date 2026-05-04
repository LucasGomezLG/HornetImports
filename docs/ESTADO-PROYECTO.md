# Hornet Imports — Estado del proyecto

> Última actualización: mayo 2026 — incorpora feedback de cliente v1  
> Stack: Next.js 16.2.4 · Supabase · Resend · MercadoPago · Vercel

---

## Modelo de negocio

### Segmentos y pricing

| Tipo | Fee logístico | Comisión marketplace |
|---|---|---|
| Particular (B2C) | 14–18% sobre valor en origen | — |
| Mayorista (B2B) | 10–14% con descuento por volumen | — |
| Vendedor del marketplace | — | 8–12% según categoría |

### Descuento por volumen mayorista

| Volumen anual acumulado | Fee aplicado |
|---|---|
| $0 – $5.000 USD | 14% |
| $5.001 – $20.000 USD | 12% |
| $20.001 – $50.000 USD | 11% |
| > $50.000 USD | 10% |

### Unit economics (escenario realista)

| Métrica | Particular | Mayorista |
|---|---|---|
| Ticket promedio | $150 USD | $2.000 USD |
| Frecuencia anual | 1,5 importaciones | 5 importaciones |
| Fee neto efectivo | 14% | 14% |
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

El cotizador calcula: `precio_origen + arancel(NCM) + IVA 21% + tasa estadística 3% + flete (peso facturable) + fee servicio 15%`

- **Peso facturable:** `max(peso_real, peso_volumétrico)` donde `vol = L×W×H / 5000`
- **Tarifa flete:** USD 18/kg facturable
- **Tipo de cambio:** dólar blue vía dolarapi.com con fallback hardcodeado
- **Precio mínimo:** USD 25

### Whitelist (cotización automática)

Repuestos automotores · Bijouterie · Herrajes y ferretería · Marroquinería · Textiles · Herramientas manuales · Decoración (< 0,1 m³) · Accesorios tech sin litio

### Blacklist (deriva a manual — categoría `blacklist: true`)

Electrónica con litio · Alimentos y bebidas (SENASA) · Cosméticos y medicamentos (ANMAT) · Réplicas · Juguetes < 36 meses (INTI) · Productos > 0,1 m³ · Envíos > $1.000 USD sin verificación de cupo

---

## Gaps críticos del cotizador (no implementados)

| Feature | Prioridad | Descripción |
|---|---|---|
| **Toggle Particular / Mayorista** | 🔴 Alta | Primera pantalla del cotizador debe preguntar "¿comprás para vos o para tu negocio?". Dispara pricing diferente, validaciones distintas y canal de soporte distinto. Definido en `05-clientes-dual-mode.md`. |
| **Modo asistido (60 días)** | 🔴 Alta | Durante los primeros 60 días, el admin debe confirmar manualmente cada cotización antes de que el usuario pueda confirmar el pedido. El panel ya muestra las cotizaciones, pero no hay un flag "confirmada por admin" ni gate en `/solicitar`. |
| **Validación CUIT + cupo Courier** | 🔴 Alta | El sistema debe verificar que el usuario no haya superado los 12 envíos/año por CUIT (límite AFIP régimen courier). Fase 1: autodeclaración. Fase 2: webservice AFIP A4/A5. |
| **Simplificación de datos** | 🔴 Alta | Eliminar los campos de dimensiones del paquete (largo/ancho/alto) del formulario. El cálculo de peso volumétrico se reemplaza por un estimado por categoría o se omite usando solo `pesoKg`. Reduce la fricción de entrada significativamente. |
| **Lógica de origen Europa** | 🟡 Media | Agregar selector de origen (Asia/China · Europa · EE.UU. · Otro). Si origen = Europa y precio > $100 USD, el producto puede estar sujeto a un arancel adicional del 50% si hace escala en EE.UU. El sistema debe: (1) mostrar alerta visible al usuario, (2) agregar flag en la cotización para revisión manual, (3) opcionalmente ajustar el coeficiente de arancel en `calcularCotizacion`. |
| **Intervención humana por origen** | 🟡 Media | Extensión del modo asistido: cuando una cotización tiene flag de origen europeo, el admin recibe alerta específica y debe revisar la ruta antes de enviar el link de confirmación al usuario. |
| **Circuit breaker de margen** | 🟡 Media | Si una categoría tiene margen real < 10% en los últimos 10 envíos, desactivarla automáticamente del cotizador y derivar a manual. Requiere registrar el margen real post-envío en DB. |
| **Panel "Health Check" del cotizador** | 🟡 Media | Dashboard interno que muestra margen predicho vs real por categoría, señal temprana de calibración rota. |
| **Cobertura cambiaria T+0** | 🟡 Media | Conversión inmediata del cobro en pesos a USDT/USDC vía Binance/Bitso/Lemon Cash al confirmar el pago. Actualmente el spread cambiario está hardcodeado en el fee pero no hay conversión real. |

---

## Funcionalidades implementadas

### Páginas públicas

| Ruta | Estado | Descripción |
|---|---|---|
| `/` | ✅ | Landing con hero, stats, CTA |
| `/cotizar` | ✅ | Cotizador con cálculo real (whitelist + blacklist automática) |
| `/marketplace` | ✅ | Listado de productos con filtros |
| `/marketplace/[slug]` | ✅ | Detalle de producto |
| `/tienda/[slug]` | ✅ | Tienda de vendedor |
| `/como-funciona` | ✅ | Proceso de importación |
| `/nosotros` | ✅ | Página de equipo |
| `/faq` | ✅ | Accordion de preguntas frecuentes |
| `/vender` | ✅ | Landing para vendedores |
| `/mayorista` | ✅ | Propuesta B2B |
| `/seguimiento` | ✅ | Tracking por ID / código; datos reales si el usuario está logueado |
| `/privacidad` · `/terminos` | ✅ | Páginas legales |

### Autenticación

| Ruta | Estado | Descripción |
|---|---|---|
| `/registro` | ✅ | Registro con email/password |
| `/login` | ✅ | Login con redirect post-auth |
| `/recuperar-contrasena` | ✅ | Email de recuperación |
| `/actualizar-contrasena` | ✅ | Reset via evento `PASSWORD_RECOVERY` de Supabase |

### Flujo de importación

| Ruta | Estado | Descripción |
|---|---|---|
| `/cotizar` → `/api/cotizar` | ✅ | Calcula, guarda en Supabase, retorna `cotizacionId` |
| `/solicitar/[cotizacionId]` | ✅ | Resumen de costos, confirmación, CTA WhatsApp |
| `/pago/exitoso` | ✅ | Post-pago aprobado |
| `/pago/pendiente` | ✅ | Post-pago en proceso |
| `/pago/fallido` | ✅ | Error de pago con CTA WhatsApp |

### Dashboard usuario

| Ruta | Estado | Descripción |
|---|---|---|
| `/dashboard` | ✅ | Stats reales + últimos pedidos + banner perfil incompleto |
| `/pedidos` | ✅ | Lista completa con filtros y paginación (8 items/página) |
| `/perfil` | ✅ | Edición de nombre, apellido, teléfono |
| `/seguimiento` | ✅ | Conectado a pedidos del usuario |

### Panel Admin

| Ruta | Estado | Descripción |
|---|---|---|
| `/admin` | ✅ | Métricas del día/mes: pedidos, ingresos, vendedores, cotizaciones pendientes |
| `/admin/pedidos` | ✅ | Tabla con dropdown de estado + tracking code inline por fila |
| `/admin/cotizaciones` | ✅ | Tabla con botones **Enviar link** (email al usuario) / **Rechazar** (con motivo) |
| `/admin/vendedores` | ✅ | Lista de vendedores con conteo de listings |

### APIs

| Endpoint | Descripción |
|---|---|
| `POST /api/cotizar` | Calcula cotización, guarda en Supabase. Rate limit: 10 req/min por IP (in-memory) |
| `GET /api/tipo-cambio` | Dólar blue desde dolarapi.com con fallback $1.320 |
| `POST /api/mp/webhook` | Notificaciones MercadoPago → actualiza pedido a `comprado` |
| `GET /api/mp/webhook` | Health check para verificación de URL por MP |

---

## Emails automáticos (Resend)

| Trigger | Destinatario | Asunto |
|---|---|---|
| Admin hace click en "Enviar link" | Usuario | Tu cotización está lista — [producto] |
| Admin rechaza cotización | Usuario | Actualización sobre tu cotización |
| Usuario confirma pedido | Usuario | ¡Pedido confirmado! |
| Usuario confirma pedido | Admin (`RESEND_ADMIN_EMAIL`) | [Hornet] Nuevo pedido |
| MP confirma pago (webhook) | Admin | Alerta de pago recibido |

---

## Variables de entorno

### Ya configuradas (`.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### Pendientes de agregar en Vercel

```env
# Supabase — panel admin (bypasa RLS, solo en server)
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Resend — emails transaccionales
RESEND_API_KEY=re_...
RESEND_FROM=Hornet Imports <noreply@tudominio.com>
RESEND_ADMIN_EMAIL=tu@email.com

# MercadoPago — si no está, el flujo de pago hace fallback sin cobro online
MP_ACCESS_TOKEN=APP_USR-...

# URLs
NEXT_PUBLIC_SITE_URL=https://tudominio.com
NEXT_PUBLIC_WHATSAPP_NUMBER=5491100000000   # sin + ni espacios
```

**Cómo agregarlas en Vercel:** Dashboard → proyecto → Settings → Environment Variables → agregar para `Production` → Redeploy.

---

## Base de datos (Supabase)

### Tablas

| Tabla | Campos clave |
|---|---|
| `profiles` | `id`, `email`, `nombre`, `apellido`, `telefono`*, `cuit`, `tipo` (`comprador`/`vendedor`/`admin`) |
| `cotizaciones` | `id`, `user_id`, `nombre_producto`, `producto_url`, `precio_usd`, `peso_kg`, `categoria`, `costo_total_ars`, `desglose` (JSON), `estado` |
| `pedidos` | `id`, `cotizacion_id`, `user_id`, `producto_nombre`, `producto_url`, `precio_usd`, `costo_total_ars`, `estado`, `tracking_code`, `origen` |
| `listings` | `id`, `vendedor_id`, `nombre`, `descripcion`, `precio_ars`, `categoria`, `imagen_url`, `stock`, `activo` |

### Estados de cotización

`pendiente` → `aprobada` | `rechazada` | `expirada`

### Estados de pedido

`en_proceso` → `comprado` → `en_transito` → `en_aduana` → `entregado` | `cancelado`

> El webhook de MP cambia automáticamente `en_proceso` → `comprado` al confirmar el pago.

---

## Seguridad implementada

| Capa | Mecanismo |
|---|---|
| Routing | `proxy.ts` protege `/dashboard`, `/pedidos`, `/perfil`, `/solicitar`, `/admin` |
| Admin | Layout verifica `profile.tipo === "admin"` server-side |
| Datos | Row Level Security (RLS) en Supabase — usuarios ven solo sus pedidos/cotizaciones |
| Acciones | `confirmarPedido` verifica `.eq("user_id", user.id)` — imposible confirmar cotización ajena |
| API | Rate limiting 10 req/min por IP en `/api/cotizar` (in-memory, no escala en multi-instancia) |
| Admin DB | `createAdminClient()` usa service role key solo en archivos server-only |
| Pagos | Cero persistencia de tarjetas — delegación total a MercadoPago (PCI-DSS) |

---

## Integraciones planeadas (no implementadas)

| Integración | Fase | Descripción |
|---|---|---|
| **Inngest** | 2 | Orquestador de flujos de larga duración (15–45 días de tránsito). Alerta automática si el flete no cambia de estado en 7 días. |
| **Upstash Redis** | 2 | Caché de cotizaciones frecuentes + rate limiting robusto multi-instancia. |
| **AfterShip API** | 2 | Tracking unificado de 900+ couriers. Reemplaza el seguimiento manual actual. |
| **WhatsApp Business API** | 2 | Notificaciones críticas de estado para mayoristas vía Twilio/Meta. |
| **AFIP Webservice A4/A5** | 2 | Validación automática de CUIT + condición fiscal del vendedor al alta. |
| **Binance / Bitso / Lemon** | 2 | Conversión T+0 a USDT/USDC para cobertura cambiaria real. |
| **USDT gateway (Coinbase Commerce / BitPay)** | 3 | Aceptar pagos en cripto directamente en la plataforma. Alternativa: manual via CBU/CVU con confirmación admin. |
| **Stripe** | 3 | Cobro de fees logísticos a mayoristas internacionales en USD. |
| **Amazon / eBay / AliExpress APIs** | 2 | Extracción automática de título, precio y dimensiones desde el link del producto. |
| **Plausible / Posthog** | 1 | Analytics de clics y conversiones. Plausible para métricas de tráfico; Posthog para embudo de cotización → pedido. |

---

## Compliance y estructura legal

### Límites del régimen Courier (AFIP)

- Máximo USD 3.000 por envío
- **12 envíos/año por CUIT** (crítico — el sistema debe validarlo antes de cotizar)
- Máximo 50 kg
- Presunción comercial si hay muchas unidades idénticas

### Organismos reguladores relevantes

| Organismo | Categorías que controla |
|---|---|
| SENASA | Alimentos, bebidas, productos de origen animal/vegetal |
| ANMAT | Cosméticos, medicamentos, suplementos |
| ENACOM / Res. 92 SeCom | Electrónica, dispositivos eléctricos |
| Res. 404 COPANT | Textiles |
| Res. INTI | Juguetes para niños < 36 meses |

### Estructura legal target

- **LLC en Delaware/Uruguay/Paraguay** — para procesar fees B2B y operatoria USDT/USDC offshore
- **SRL/SAS en Argentina** — para operación local y facturación
- Responsabilidad solidaria marketplace (RG 4622 AFIP) → verificación de CUIT + condición fiscal de vendedores al alta y cada 6 meses

---

## KPIs objetivo

| KPI | Target | Alarma |
|---|---|---|
| Conversión visita → cotización | ≥ 8% | < 5% |
| Conversión cotización → compra (particular) | ≥ 30% | < 15% |
| Conversión cotización → compra (mayorista) | ≥ 50% | < 30% |
| Margen post-envío promedio | ≥ 14% | < 10% (circuit breaker) |
| Tasa de fallback a manual del cotizador | < 25% | > 35% (sprint de whitelist) |
| LTV/CAC particular | ≥ 3× | < 2× |
| LTV/CAC mayorista | ≥ 5× | < 3× |
| Account expansion rate (mayoristas) | Crecimiento MoM | Caída 2 meses seguidos |

---

## Roadmap por fases

### Fase 1 — Digitalización (mes 0–3) ← Estamos acá

**Objetivo:** convertir "pedime precio por WhatsApp" en autoservicio digital.

- ✅ Cotizador con cálculo real
- ✅ Flujo cotización → pedido → pago (MercadoPago)
- ✅ Dashboard usuario
- ✅ Panel admin básico
- ❌ Toggle particular/mayorista en cotizador
- ❌ Modo asistido (admin confirma cotizaciones manualmente los primeros 60 días)
- ❌ Validación CUIT + cupo Courier
- **KPI clave:** > 60% de los pedidos migran de WhatsApp a la web

### Fase 2 — Escala B2B (mes 3–9)

- Panel mayorista con precios escalonados por volumen
- Validación AFIP + documentación (CUIT, factura A/B)
- Cuenta corriente básica (gestión manual de saldos)
- WhatsApp Business API para mayoristas
- Inngest + Upstash Redis
- AfterShip para tracking real
- **KPI clave:** ≥ 10 mayoristas activos con frecuencia mensual

### Fase 3 — Ecosistema Marketplace (mes 9–18)

- Panel de vendedor externo (CRUD de listings, gestión de ventas)
- Split payment automático con MercadoPago
- ERP básico de stock para vendedores
- **KPI clave:** GMV marketplace > $10.000 USD/mes

### Fase 4 — Optimización logística (mes 18+)

- Algoritmo de consolidación de lotes (bin-packing)
- Smart routing dinámico entre rutas (Miami / Shanghai / São Paulo)
- Microservicio Python (FastAPI) si la optimización matemática lo requiere

---

## Riesgos principales

### 🔴 Riesgo #1 — Quema de margen por mala calibración del cotizador

Un solo envío de producto voluminoso o con arancel 35% puede comerse el margen de 20 envíos rentables.

**Mitigaciones:**
- Whitelist conservadora (expandir solo con datos reales)
- Circuit breaker por categoría si margen < 10% en últimos 10 envíos
- **Modo asistido los primeros 60 días** — PENDIENTE DE IMPLEMENTAR

### 🔴 Riesgo #2 — Asfixia regulatoria (AFIP / Aduana)

Cambios de régimen Courier, cepos, congelamiento de fondos, responsabilidad solidaria marketplace.

**Mitigaciones:**
- Estructura legal multi-jurisdicción (LLC offshore + SRL local)
- Validación CUIT + cupo Courier antes de cotizar — PENDIENTE
- Logs forenses de cada cambio de estado

### 🟡 Riesgo #3 — Cuello de botella manual al escalar

Si la tasa de fallback a manual supera el 35%, el founder vuelve a ser el cuello de botella.

**Mitigaciones:**
- Tasa de fallback como KPI semanal (target < 25%)
- Expandir whitelist en sprints con datos reales
- Operador de cotizaciones manuales (junior, ~$600 USD/mes) cuando sea necesario

### 🟡 Riesgo #4 — Riesgo cambiario durante el tránsito (30–45 días)

Una devaluación del 15% durante el tránsito liquida el margen si no hay cobertura.

**Mitigaciones:**
- Spread cambiario 15–25% ya incluido en el fee del cotizador
- Conversión T+0 a USDT/USDC — PENDIENTE DE IMPLEMENTAR

---

## Feedback de cliente — mayo 2026

Análisis de los pedidos recibidos, cruzado contra lo que ya existe:

| Pedido | Estado | Notas |
|---|---|---|
| MercadoPago | ✅ Implementado | `src/lib/mp/client.ts` + webhook + flujo completo |
| Dólar Blue automático | ✅ Implementado (cotizador) | Fetchea `dolarapi.com` en cada cotización en tiempo real |
| Dólar Blue en listings | ❌ Pendiente | `listings.precio_ars` es estático en DB — necesita cron de actualización si hay catálogo propio |
| Pago en efectivo | ❌ Nuevo | Selector en `/solicitar/[id]`: "Pago online (MP)" vs "Efectivo al retirar". Estado nuevo: `pendiente_pago_efectivo`. Admin confirma recepción. |
| USDT | ❌ Nuevo (fase 3) | Requiere gateway cripto. Por ahora: manual vía confirmación admin. |
| Trazabilidad de leads (UTM) | ❌ Nuevo | Capturar `?utm_source` / `utm_medium` / `utm_campaign` al cotizar y guardar en `cotizaciones`. Cambio de schema + captura en frontend. |
| Control de clics | ❌ En roadmap | Plausible o Posthog — ya estaba planeado |
| Anti-bypass | ❌ Diseño pendiente | En marketplace: ocultar contacto del vendedor hasta que la transacción se inicie en la plataforma. Para importaciones: el flujo ya requiere todo adentro. |
| Sección "Conviértete en Mayorista" | ❌ Parcial | Página `/mayorista` existe como landing estático. Falta: cotizador con toggle B2B activo, formulario de alta, pricing escalonado interactivo. |
| Simplificar cotizador (sin medidas) | ❌ Nuevo | Eliminar `largo`/`ancho`/`alto` del form. Usar solo `pesoKg` + estimado por categoría. Alta prioridad de UX. |
| Lógica origen Europa | ❌ Nuevo | Selector de origen + alerta de 50% de arancel extra si Europa + escala EEUU + precio > $100 USD. |
| Intervención humana por origen | ⚠️ Parcial | Cubierto por "modo asistido" pero sin alerta específica de origen europeo. |
| Tres pilares (cotizador + marketplace empresa + marketplace usuarios) | ⚠️ Parcial | Schema listo. Cotizador ✅. Marketplace UI básica ✅. Panel vendedor ❌. |

---

## Pendiente inmediato

| Item | Prioridad | Responsable |
|---|---|---|
| Agregar todas las env vars en Vercel | 🔴 Ops | Lucas |
| Probar MP con cuenta sandbox | 🔴 QA | Lucas |
| Promover usuario admin: `UPDATE profiles SET tipo='admin' WHERE email='...'` | 🔴 Ops | Lucas |
| Simplificación cotizador (eliminar campos de dimensiones) | 🔴 Dev | Pendiente |
| Lógica de origen Europa + alerta + flag revisión | 🔴 Dev | Pendiente |
| Pago en efectivo (selector de método en `/solicitar`) | 🔴 Dev | Pendiente |
| Toggle particular/mayorista en cotizador | 🔴 Dev | Pendiente |
| Modo asistido (gate admin en cotizaciones) | 🔴 Dev | Pendiente |
| Validación CUIT + cupo Courier (auto-declaración) | 🔴 Dev | Pendiente |
| Filtros por estado en admin/pedidos | 🟡 Dev | Pendiente |
| UTM tracking en cotizaciones | 🟡 Dev | Pendiente |
| Dólar Blue cron para listings | 🟡 Dev | Solo si hay catálogo propio activo |
| Rate limiting con Upstash Redis | 🟡 Dev | Pendiente |
| AfterShip tracking real | 🟡 Dev | Pendiente |
| MercadoPago: reembolsos / cancelaciones | 🟡 Dev | Pendiente |
| Panel vendedor (CRUD listings) | 🟡 Dev | Pendiente |
| Analytics (Plausible o Posthog) | 🟢 Dev | Pendiente |
| Anti-bypass marketplace (ocultar contacto vendedor) | 🟢 Dev | Pendiente |
| USDT gateway | 🟢 Dev | Fase 3 |

---

## Arquitectura general

```
D:\Anti-ML\HornetImports\
├── docs/
│   └── ESTADO-PROYECTO.md       ← este archivo
├── src/
│   ├── app/
│   │   ├── (public)/            # Rutas sin auth requerida
│   │   ├── (auth)/              # Login, registro, recuperar/actualizar contraseña
│   │   ├── (dashboard)/         # Panel usuario (protegido por proxy.ts)
│   │   ├── (admin)/             # Panel admin (proxy.ts + check tipo="admin")
│   │   └── api/                 # cotizar, tipo-cambio, mp/webhook
│   ├── components/
│   │   ├── cotizador/           # CotizadorForm, ResultadoCotizacion
│   │   ├── layout/              # Header, Footer, MobileNav
│   │   ├── seguimiento/         # TrackingForm
│   │   └── ui/                  # LogoutButton, etc.
│   ├── lib/
│   │   ├── cotizador/           # calcular.ts, categorias.ts, types.ts
│   │   ├── email/               # client.ts (Resend), send.ts (4 templates)
│   │   ├── mp/                  # client.ts (MercadoPago preference + webhook)
│   │   ├── supabase/            # server.ts, client.ts, admin.ts, types.ts
│   │   └── utils/               # format.ts
│   └── proxy.ts                 # Auth guard centralizado (equivalente a middleware)
└── D:\Anti-ML\docs\             # Documentación de negocio y producto
    ├── 01-vision-y-tesis.md
    ├── 02-producto-cotizador.md
    ├── 05-clientes-dual-mode.md
    ├── 06-arquitectura-tecnica.md
    ├── 08-finanzas-unit-economics.md
    ├── 09-plan-lanzamiento.md
    └── 10-riesgos-y-mitigaciones.md
```
