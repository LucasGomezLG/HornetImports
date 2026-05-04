# Hornet Imports — Estado del proyecto

> Última actualización: mayo 2026  
> Stack: Next.js 16.2.4 · Supabase · Resend · MercadoPago · Vercel  
> Repo: github.com/LucasGomezLG/HornetImports

---

## Modelo de negocio real

### Cómo funciona (para el cliente)

1. El cliente entra a la web y cotiza su producto completando nombre, URL, precio, peso y categoría
2. El cliente ve el precio estimado en ARS y USD con desglose completo
3. Si le interesa, confirma y paga (MercadoPago / Transferencia bancaria / Cripto-USDT)
4. **Hornet gestiona todo lo demás**: compra el producto al proveedor, lo envía al depósito en Miami, luego Miami → Buenos Aires, gestiona la aduana y entrega al cliente
5. El cliente solo hace una cosa más: seguir el estado de su pedido desde la web

> El cliente **no importa a su nombre**. La importación va en nombre de Hornet Imports como empresa. El compliance aduanero (AFIP, aranceles, regímenes) es 100% responsabilidad de Hornet.

### Flujo logístico interno

```
Proveedor (Asia / EE.UU. / Europa)
    ↓
Depósito Hornet en Miami
    ↓
Vuelo Miami → Buenos Aires (Courier internacional)
    ↓
Aduana Argentina
    ↓
Entrega al cliente (coordinada por Hornet)
```

### Segmentos y pricing

| Tipo | Servicio | Fee logístico | Comisión marketplace |
|---|---|---|---|
| Particular (B2C) | Completo (Hornet compra + envía) | 15% sobre CIF | — |
| Mayorista (B2B) | Completo | 12% sobre CIF (mín. USD 200/envío) | — |
| Particular (B2C) | Forwarding (solo envío Miami → BsAs) | 8% sobre CIF | — |
| Mayorista (B2B) | Forwarding | 6% sobre CIF | — |
| Vendedor del marketplace | — | — | 8–12% según categoría |

> **Forwarding**: el cliente ya compró el producto y lo envía a nuestra dirección en Miami. Hornet cobra solo el flete + aduana + fee. El total cotizado **excluye** el precio del producto.

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

### Modos de servicio

| Modo | Cuándo usarlo |
|---|---|
| **Completo** | Hornet compra el producto, lo envía a Miami y lo trae a BsAs |
| **Forwarding** | El cliente ya compró el producto y lo envía a Miami; Hornet hace Miami → BsAs |

### Fórmula de cálculo

**Modo completo:**
```
CIF = precio_origen + flete
flete = peso_facturable × USD 18/kg
peso_facturable = redondear_al_medio(pesoKg)

arancel      = CIF × tasa_categoria (0% – 35%)
IVA          = (CIF + arancel) × 21%
tasa_est     = CIF × 3%
fee_servicio = CIF × fee_ratio   ← 15% particular / 12% mayorista
total_usd    = CIF + arancel + IVA + tasa_est + fee_servicio
total_ars    = total_usd × tipo_cambio_blue
```

**Modo forwarding:**
```
CIF = valor_declarado + flete    ← mismo CIF para arancel/IVA/tasa
arancel      = CIF × tasa_categoria
IVA          = (CIF + arancel) × 21%
tasa_est     = CIF × 3%
fee_servicio = CIF × fee_ratio   ← 8% particular / 6% mayorista
total_usd    = flete + arancel + IVA + tasa_est + fee_servicio  ← sin precio del producto
total_ars    = total_usd × tipo_cambio_blue
```

> En forwarding el arancel e IVA se calculan sobre el CIF completo (valor declarado + flete), igual que en modo completo. Solo el **total cobrado al cliente** excluye el precio del producto porque ya lo pagó.

### Parámetros clave

| Parámetro | Valor |
|---|---|
| Tarifa flete | USD 18/kg facturable |
| Fee particular — completo | 15% sobre CIF |
| Fee mayorista — completo | 12% sobre CIF |
| Fee particular — forwarding | 8% sobre CIF |
| Fee mayorista — forwarding | 6% sobre CIF |
| Precio mínimo particular | USD 25 |
| Precio mínimo mayorista | USD 200 |
| Precio mínimo forwarding | USD 10 (valor declarado) |
| Peso máximo | 30 kg |
| Tipo de cambio | Dólar blue vía dolarapi.com · fallback: $1.200 |
| Dirección Miami | `NEXT_PUBLIC_MIAMI_ADDRESS` (env var) |

### Campos del cotizador

- Toggle de servicio: **Completo** / **Forwarding (solo envío)**
- Nombre del producto
- URL del producto *(solo modo completo)*
- Precio en USD (valor del producto / valor declarado para aduana)
- Peso en kg
- País de origen: Asia/China · EE.UU. · Europa · Otro
- Categoría
- Tipo de importación: Particular / Mayorista (B2B)

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

Si `origen === "europa"` y `precio > USD 100`: muestra banner de alerta amarilla advirtiendo arancel adicional del 50% si el producto hace escala en EE.UU. El flag `alertaOrigenEuropa: true` se guarda en el JSONB `desglose` y aparece como indicador 🌍 en el panel admin.

---

## Funcionalidades implementadas

### Páginas públicas

| Ruta | Estado | Descripción |
|---|---|---|
| `/` | ✅ | Landing con hero, stats, CTA |
| `/cotizar` | ✅ | Toggle completo/forwarding + toggle particular/mayorista, origen, whitelist/blacklist, dirección Miami |
| `/marketplace` | ✅ | Listado de productos con filtros |
| `/marketplace/[slug]` | ✅ | Detalle de producto |
| `/tienda/[slug]` | ✅ | Tienda de vendedor |
| `/como-funciona` | ✅ | Proceso de importación |
| `/nosotros` | ✅ | Página de equipo |
| `/faq` | ✅ | Accordion de preguntas frecuentes |
| `/vender` | ✅ | Landing para vendedores |
| `/mayorista` | ✅ | Propuesta B2B (landing estático) |
| `/seguimiento` | ✅ | Timeline con etapas reales del flujo Miami → BsAs |
| `/privacidad` · `/terminos` | ✅ | Páginas legales |

### Autenticación

| Ruta | Estado | Descripción |
|---|---|---|
| `/registro` | ✅ | Email/password. `nombre` guardado en DB via trigger. Errores específicos. |
| `/login` | ✅ | Redirect post-auth. Maneja: credenciales incorrectas, email no confirmado, rate limit. |
| `/recuperar-contrasena` | ✅ | Email de recuperación vía Supabase |
| `/actualizar-contrasena` | ✅ | Reset via evento `PASSWORD_RECOVERY` |

### Flujo de importación completo

| Paso | Quién | Estado | Descripción |
|---|---|---|---|
| Cotizar | Cliente | ✅ | `POST /api/cotizar` — calcula modo completo o forwarding, guarda en Supabase, retorna cotizacionId |
| Ver resultado | Cliente | ✅ | Desglose completo en ARS y USD. Badge B2B si mayorista. Badge Fwd si forwarding. Alerta si origen Europa. Dirección Miami si forwarding. |
| Esperar aprobación | Hornet | ✅ | `/solicitar/[id]` muestra "en revisión" hasta que admin apruebe |
| Aprobar cotización | Admin | ✅ | Admin hace click en "Aprobar" → setea `aprobada_por_admin=true` + envía email al cliente |
| Elegir método de pago | Cliente | ✅ | MercadoPago · Transferencia bancaria · Cripto / USDT |
| Pagar | Cliente | ✅ | MP redirige a checkout; Transferencia y Cripto envían instrucciones por email |
| Confirmar pedido | Sistema | ✅ | Crea pedido HI-XXXX, notifica a admin |
| Webhook MP | Sistema | ✅ | Pago aprobado → estado `comprado`. Cancelado/reembolsado → estado `cancelado` |
| Comprar al proveedor | Hornet | (manual) | Hornet realiza la compra al proveedor |
| Envío a Miami | Hornet | (manual) | Hornet coordina el envío al depósito en Miami |
| Miami → BsAs | Hornet | (manual) | Vuelo internacional, 5–10 días hábiles |
| Aduana | Hornet | (manual) | Hornet gestiona el despacho aduanero |
| Entrega | Hornet | (manual) | Hornet coordina la entrega con el cliente |
| Seguimiento | Cliente | ✅ | El cliente ve el estado actualizado en `/seguimiento` y `/pedidos` |

### Estados del pedido (vistos por el cliente)

| Estado DB | Label para el cliente | Descripción |
|---|---|---|
| `en_proceso` | Procesando | Admin revisando, coordinando la compra al proveedor |
| `comprado` | Producto adquirido | Producto comprado, en camino al depósito en Miami |
| `en_transito` | En camino a Buenos Aires | Vuelo Miami → Argentina |
| `en_aduana` | En aduana argentina | Despacho aduanero (2–4 días) |
| `entregado` | Entregado | Entregado exitosamente |
| `cancelado` | Cancelado | Pedido cancelado o pago revertido |

### Dashboard usuario

| Ruta | Estado | Descripción |
|---|---|---|
| `/dashboard` | ✅ | Stats reales + últimos pedidos + banner de perfil incompleto |
| `/pedidos` | ✅ | Lista completa con filtros por estado y paginación (8 items/página) |
| `/perfil` | ✅ | Edición de nombre, apellido, teléfono |
| `/seguimiento` | ✅ | Timeline visual con etapas del flujo real (Miami → BsAs) |

### Panel Admin

| Ruta | Estado | Descripción |
|---|---|---|
| `/admin` | ✅ | Métricas del día/mes: pedidos, ingresos, vendedores, cotizaciones pendientes |
| `/admin/pedidos` | ✅ | Tabla con filtros por estado + dropdown de estado + tracking code editable |
| `/admin/cotizaciones` | ✅ | Aprobar (flag + email) / Rechazar. Badge 🌍 si origen Europa. Badge UTM source. Badge "📦 Fwd" si forwarding. |
| `/admin/pedidos` | ✅ (actualizado) | Badge "📦 Fwd" + tracking del cliente visible bajo el nombre del producto para pedidos forwarding. |
| `/admin/vendedores` | ✅ | Lista de vendedores con conteo de listings |

### APIs

| Endpoint | Descripción |
|---|---|
| `POST /api/cotizar` | Calcula cotización, guarda en Supabase con utm_source. Rate limit 10 req/min por IP. |
| `GET /api/tipo-cambio` | Dólar blue desde dolarapi.com con fallback $1.200 |
| `POST /api/mp/webhook` | Pago aprobado → `comprado`. Cancelado/reembolsado → `cancelado`. |
| `GET /api/mp/webhook` | Health check para verificación de URL por MP |
| `GET /api/cron/actualizar-precios` | Cron diario 08:00 ARG — actualiza `listings.precio_ars` desde `precio_usd` × dólar blue |

---

## Emails automáticos (Resend)

| Trigger | Destinatario | Contenido |
|---|---|---|
| Admin aprueba cotización | Cliente | Link para confirmar y pagar |
| Admin rechaza cotización | Cliente | Notificación de rechazo con motivo |
| Cliente confirma pedido (MP) | Admin | Alerta de nuevo pedido + instrucciones de pago manual si aplica |
| Cliente confirma pedido (transferencia/cripto) | Cliente | Instrucciones de pago (datos bancarios / wallet) |
| MP confirma pago (webhook) | Admin | Alerta de pago recibido |

> **Requisito:** `RESEND_API_KEY` + dominio verificado en Resend. Sin dominio verificado, usar SMTP nativo de Supabase (límite: 3 emails/hora).

---

## Base de datos (Supabase)

### Tablas

| Tabla | Campos clave |
|---|---|
| `profiles` | `id`, `email`, `nombre`, `apellido`, `telefono`, `tipo` (`comprador`/`vendedor`/`admin`) |
| `cotizaciones` | `id`, `user_id`, `nombre_producto`, `producto_url`, `precio_usd`, `peso_kg`, `categoria`, `costo_total_ars`, `desglose` (JSONB), `estado`, `aprobada_por_admin`, `utm_source`, `tipo_servicio` |
| `pedidos` | `id` (HI-XXXX), `cotizacion_id`, `user_id`, `producto_nombre`, `producto_url`, `precio_usd`, `costo_total_ars`, `estado`, `tipo_servicio`, `tracking_code`, `tracking_codigo_cliente`, `origen`, `updated_at` |
| `listings` | `id`, `vendedor_id`, `nombre`, `descripcion`, `precio_usd`, `precio_ars`, `categoria`, `imagen_url`, `stock`, `activo` |

### Estructura del campo `desglose` (JSONB)

**Modo completo (ejemplo):**
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
  "tipoServicio": "completo",
  "incluyeProducto": true,
  "alertaOrigenEuropa": false
}
```

**Modo forwarding (ejemplo) — total excluye precio del producto:**
```json
{
  "precioProducto": 150,
  "pesoFacturable": 1.5,
  "costoFlete": 27,
  "arancelImportacion": 63.45,
  "ivaImportacion": 50.34,
  "tasaEstadistica": 5.31,
  "feeServicio": 14.16,
  "feeRatio": 0.08,
  "total": 160.26,
  "tipoCambio": 1250,
  "totalArs": 200325,
  "tipoImportacion": "particular",
  "tipoServicio": "forwarding",
  "incluyeProducto": false,
  "alertaOrigenEuropa": false
}
```

### Migrations pendientes de correr en Supabase

| Archivo | Contenido |
|---|---|
| `supabase/migrations/001_add_aprobada_por_admin.sql` | `ALTER TABLE cotizaciones ADD COLUMN aprobada_por_admin BOOLEAN NOT NULL DEFAULT FALSE` |
| `supabase/migrations/002_add_utm_source.sql` | `ALTER TABLE cotizaciones ADD COLUMN utm_source TEXT` |
| `supabase/migrations/003_add_precio_usd_listings.sql` | `ALTER TABLE listings ADD COLUMN precio_usd NUMERIC(10,2)` |
| `supabase/migrations/004_add_tipo_servicio.sql` | `ALTER TABLE cotizaciones ADD COLUMN tipo_servicio TEXT NOT NULL DEFAULT 'completo'` |
| `supabase/migrations/005_add_tracking_cliente.sql` | `ALTER TABLE pedidos ADD COLUMN tipo_servicio TEXT NOT NULL DEFAULT 'completo', ADD COLUMN tracking_codigo_cliente TEXT` |

### RLS — políticas implementadas

| Tabla | Operación | Regla |
|---|---|---|
| `profiles` | SELECT | Usuario ve solo el propio; admin ve todos |
| `profiles` | UPDATE | Usuario actualiza el propio; admin actualiza cualquiera |
| `profiles` | INSERT | Solo via trigger `handle_new_user` (SECURITY DEFINER) |
| `cotizaciones` | SELECT | Usuario ve las propias |
| `cotizaciones` | INSERT | Usuario propio o anónimo (user_id = null) |
| `cotizaciones` | UPDATE | Usuario actualiza las propias (para `confirmarPedido`) |
| `cotizaciones` | ALL | Admin gestiona todo vía service role |
| `pedidos` | SELECT | Usuario ve los propios |
| `pedidos` | INSERT | Usuario inserta los propios (para `confirmarPedido`) |
| `pedidos` | ALL | Admin gestiona todo vía service role |
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
| Modo asistido | `aprobada_por_admin` verificado server-side — imposible confirmar sin aprobación admin |
| Rate limiting | 10 req/min por IP en `/api/cotizar` (in-memory — reemplazar con Redis en fase 2) |
| Cron | `CRON_SECRET` verificado en `/api/cron/actualizar-precios` |
| Admin DB | `createAdminClient()` con service role key, solo en archivos server-only |
| Pagos | Cero persistencia de tarjetas — delegación total a MercadoPago (PCI-DSS) |

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

# MercadoPago — opcional; sin esto el flujo cae a transferencia/cripto
MP_ACCESS_TOKEN=APP_USR-...

# Vercel Cron — cualquier string largo y random
CRON_SECRET=un-string-largo-y-seguro

# URLs y contacto
NEXT_PUBLIC_SITE_URL=https://tudominio.com
NEXT_PUBLIC_WHATSAPP_NUMBER=5491100000000   # sin + ni espacios

# Dirección Miami para forwarding (se muestra al cliente en cotizador y resultado)
NEXT_PUBLIC_MIAMI_ADDRESS=3250 NW 107th Ave Suite 600, Doral FL 33172
```

**Cómo agregar:** Vercel Dashboard → proyecto → Settings → Environment Variables → `Production` → Redeploy.

---

## Roadmap por fases

### Fase 1 — Digitalización (mes 0–3) ← Estamos acá

**Objetivo:** convertir "pedime precio por WhatsApp" en autoservicio digital.

- ✅ Cotizador con cálculo real (whitelist + blacklist)
- ✅ Modo servicio: **Completo** (Hornet compra + envía) y **Forwarding** (solo envío Miami → BsAs)
- ✅ Toggle particular / mayorista con pricing diferenciado (4 combinaciones de fee)
- ✅ Tracking del cliente: en forwarding, el cliente ingresa el tracking de su envío a Miami desde `/pedidos`
- ✅ Lógica de origen Europa con alerta + indicador admin
- ✅ Modo asistido (admin aprueba antes de que el cliente pueda pagar)
- ✅ Métodos de pago: MercadoPago + Transferencia + Cripto/USDT
- ✅ Webhook MP: pago aprobado → comprado / cancelado → cancelado
- ✅ Flujo completo cotización → pedido → pago → tracking
- ✅ Emails automáticos (aprobación, rechazo, confirmación, alerta admin)
- ✅ Dashboard usuario con tracking visual del flujo Miami → BsAs
- ✅ Panel admin: filtros por estado, indicador Europa, badge UTM
- ✅ Auth completa (registro, login, recuperación, errores específicos)
- ✅ UTM tracking: `utm_source` guardado automáticamente en cada cotización
- ✅ Cron dólar blue: actualiza `listings.precio_ars` diariamente a las 08:00 ARG
- **KPI clave:** > 60% de los pedidos migran de WhatsApp a la web

### Fase 2 — Escala B2B (mes 3–9)

- AfterShip: tracking real con número de guía del courier
- Upstash Redis: rate limiting robusto multi-instancia
- WhatsApp Business API: notificaciones de estado para mayoristas
- Descuento escalonado por volumen acumulado mayorista
- Panel mayorista con historial y proyecciones
- Analytics (Plausible + Posthog)
- Circuit breaker: desactivar categoría si margen real < 10%
- **KPI clave:** ≥ 10 mayoristas activos con frecuencia mensual

### Fase 3 — Ecosistema Marketplace (mes 9–18)

- Panel de vendedor externo (CRUD listings, gestión de ventas)
- Split payment automático con MercadoPago
- Gateway USDT nativo (Coinbase Commerce / BitPay)
- Anti-bypass: ocultar contacto del vendedor hasta transacción iniciada
- Stripe para fees en USD a mayoristas internacionales
- **KPI clave:** GMV marketplace > $10.000 USD/mes

### Fase 4 — Optimización logística (mes 18+)

- Algoritmo de consolidación de lotes (bin-packing)
- Smart routing dinámico Miami / Shanghai / São Paulo
- Microservicio Python/FastAPI si la optimización lo requiere

---

## Pendiente inmediato

### Ops (Lucas — sin código)

| Item | Prioridad |
|---|---|
| Agregar env vars en Vercel (ver sección Variables de entorno) | 🔴 |
| Correr el SQL del trigger `handle_new_user` en Supabase (para que `nombre` se guarde al registrarse) | 🔴 |
| Correr migrations 001–005 en Supabase SQL Editor | 🔴 |
| Agregar `NEXT_PUBLIC_MIAMI_ADDRESS` en Vercel con la dirección real del depósito | 🔴 |
| Promover primer admin: `UPDATE profiles SET tipo='admin' WHERE email='...'` | 🔴 |
| Configurar Site URL en Supabase: `Authentication → URL Configuration` | 🔴 |
| Testear flujo completo con MP sandbox | 🟡 |

### Dev — requiere cuentas externas

| Item | Requiere |
|---|---|
| Analytics — Plausible o Posthog | Cuenta en el servicio |
| AfterShip tracking real | Cuenta AfterShip + API key |
| Rate limiting Upstash Redis | Cuenta Upstash + keys |
| WhatsApp Business API | Cuenta Twilio o Meta Business |

### Dev — fase 2/3

| Item | Complejidad |
|---|---|
| Panel vendedor (CRUD listings) | Alta |
| Anti-bypass marketplace | Alta |
| Gateway USDT nativo | Alta |
| Descuento escalonado por volumen mayorista | Media |
| Circuit breaker de margen por categoría | Media |

---

## Riesgos principales

### 🔴 Riesgo #1 — Quema de margen por calibración incorrecta del cotizador

Un solo envío con arancel mal aplicado puede comerse el margen de 20 envíos rentables.

**Mitigaciones:**
- Whitelist conservadora (expandir solo con datos reales de envíos realizados)
- ✅ Modo asistido implementado — admin revisa cada cotización antes de aprobarla
- Circuit breaker por categoría si margen real < 10% en últimos 10 envíos — **fase 2**

### 🔴 Riesgo #2 — Cuello de botella manual al escalar

Si el volumen crece, la revisión manual de cada cotización puede convertirse en un cuello de botella.

**Mitigaciones:**
- Tasa de fallback como KPI semanal (target < 25% de cotizaciones manuales)
- Expandir whitelist en sprints con datos reales de envíos exitosos
- Operador junior de cotizaciones manuales (~$600 USD/mes) cuando sea necesario

### 🟡 Riesgo #3 — Riesgo cambiario durante el tránsito (15–25 días)

Una devaluación durante el tránsito puede liquidar el margen.

**Mitigaciones:**
- Spread cambiario incluido en el fee (15% particular / 12% mayorista)
- Conversión T+0 a USDT/USDC al confirmar el pago — **fase 2**

### 🟡 Riesgo #4 — Compliance aduanero

Cambios de régimen Courier, cepos, o retenciones en aduana.

**Mitigaciones:**
- El compliance corre por cuenta de Hornet (el cliente no importa a su nombre)
- Modo asistido permite que el admin verifique cada operación antes de aprobarla
- Indicador 🌍 en admin cuando hay riesgo de arancel adicional por escala en EE.UU.

---

## Arquitectura general

```
D:\Anti-ML\HornetImports\
├── docs/
│   └── ESTADO-PROYECTO.md
├── supabase/
│   ├── schema.sql                       ← DROP + recreate completo
│   └── migrations/
│       ├── 001_add_aprobada_por_admin.sql
│       ├── 002_add_utm_source.sql
│       └── 003_add_precio_usd_listings.sql
├── vercel.json                          ← Cron: /api/cron/actualizar-precios
└── src/
    ├── app/
    │   ├── (public)/
    │   │   ├── cotizar/                 # CotizadorForm (toggle particular/mayorista)
    │   │   ├── solicitar/[cotizacionId] # Gate modo asistido + MP/Transferencia/Cripto
    │   │   ├── seguimiento/             # Timeline visual Miami → BsAs
    │   │   ├── pago/                    # exitoso · pendiente · fallido
    │   │   └── marketplace/             # Listado + detalle de productos
    │   ├── (auth)/                      # Login, registro, recuperar, actualizar contraseña
    │   ├── (dashboard)/
    │   │   ├── dashboard/               # Stats + últimos pedidos
    │   │   ├── pedidos/                 # Lista con labels del flujo real
    │   │   └── perfil/                  # Nombre, apellido, teléfono
    │   ├── (admin)/
    │   │   ├── admin/                   # Métricas generales
    │   │   ├── admin/pedidos/           # Filtros por estado + edición de tracking
    │   │   ├── admin/cotizaciones/      # Aprobar/Rechazar + badge Europa + UTM
    │   │   └── admin/vendedores/        # Lista de vendedores
    │   └── api/
    │       ├── cotizar/                 # POST — calcula + guarda + utm_source
    │       ├── tipo-cambio/             # GET — dólar blue
    │       ├── mp/webhook/              # POST — aprobado/cancelado/reembolsado
    │       └── cron/actualizar-precios/ # GET — cron diario listings.precio_ars
    ├── components/
    │   ├── cotizador/                   # CotizadorForm (toggle completo/forwarding + banner Miami), ResultadoCotizacion
    │   ├── layout/                      # Header, Footer, MobileNav
    │   ├── seguimiento/                 # TrackingForm (timeline con etapas reales)
    │   └── ui/                          # LogoutButton, etc.
    ├── lib/
    │   ├── cotizador/                   # calcular.ts, categorias.ts, types.ts
    │   ├── email/                       # client.ts (Resend), send.ts (templates)
    │   ├── mp/                          # client.ts (preference + payment)
    │   ├── supabase/                    # server.ts, client.ts, admin.ts, types.ts
    │   └── utils/                       # format.ts
    └── proxy.ts                         # Auth guard centralizado
```

---

## KPIs objetivo

| KPI | Target | Alarma |
|---|---|---|
| Conversión visita → cotización | ≥ 8% | < 5% |
| Conversión cotización → compra (particular) | ≥ 30% | < 15% |
| Conversión cotización → compra (mayorista) | ≥ 50% | < 30% |
| Margen post-envío promedio | ≥ 14% | < 10% (revisar pricing) |
| Tasa de revisión manual (cotizaciones blacklist / Europa) | < 25% | > 35% |
| LTV/CAC particular | ≥ 3× | < 2× |
| LTV/CAC mayorista | ≥ 5× | < 3× |
