# Hornet Imports — Estado del proyecto

> Última actualización: mayo 2026  
> Stack: Next.js 16.2.4 · Supabase · Resend · MercadoPago · Vercel

---

## Funcionalidades implementadas

### Públicas
| Ruta | Estado | Descripción |
|---|---|---|
| `/` | ✅ | Landing page con hero, stats, CTA |
| `/cotizar` | ✅ | Formulario de cotización con cálculo real (flete, aranceles, IVA, tasa estadística, fee) |
| `/marketplace` | ✅ | Listado de productos locales con filtros |
| `/marketplace/[slug]` | ✅ | Detalle de producto |
| `/tienda/[slug]` | ✅ | Tienda de vendedor |
| `/como-funciona` | ✅ | Explicación del proceso |
| `/nosotros` | ✅ | Página de equipo |
| `/faq` | ✅ | Accordion de preguntas frecuentes |
| `/vender` | ✅ | Landing para vendedores |
| `/mayorista` | ✅ | Propuesta B2B |
| `/seguimiento` | ✅ | Tracking por ID de pedido / código; conectado a pedidos reales si el usuario está logueado |
| `/privacidad` / `/terminos` | ✅ | Legales |

### Autenticación
| Ruta | Estado | Descripción |
|---|---|---|
| `/registro` | ✅ | Registro con email/password |
| `/login` | ✅ | Login con redirect post-auth |
| `/recuperar-contrasena` | ✅ | Envío de email de recuperación |
| `/actualizar-contrasena` | ✅ | Reset con evento `PASSWORD_RECOVERY` de Supabase |

### Flujo de importación
| Ruta | Estado | Descripción |
|---|---|---|
| `/cotizar` → API | ✅ | Calcula y guarda cotización en Supabase |
| `/solicitar/[cotizacionId]` | ✅ | Resumen de costos + confirmación |
| `/pago/exitoso` | ✅ | Pantalla post-pago aprobado |
| `/pago/pendiente` | ✅ | Pantalla post-pago pendiente |
| `/pago/fallido` | ✅ | Pantalla de error de pago con WhatsApp CTA |

### Dashboard usuario
| Ruta | Estado | Descripción |
|---|---|---|
| `/dashboard` | ✅ | Stats reales (pedidos activos, completados, total gastado) + últimos pedidos |
| `/pedidos` | ✅ | Lista completa con filtros por estado y paginación |
| `/perfil` | ✅ | Edición de nombre, apellido, teléfono |
| `/seguimiento` | ✅ | Conectado a pedidos del usuario logueado |

### Panel Admin (`/admin/*`)
| Ruta | Estado | Descripción |
|---|---|---|
| `/admin` | ✅ | Dashboard con métricas del día/mes |
| `/admin/pedidos` | ✅ | Tabla con cambio de estado + tracking code inline |
| `/admin/cotizaciones` | ✅ | Tabla con botones Enviar Link / Rechazar por fila |
| `/admin/vendedores` | ✅ | Lista de vendedores con conteo de listings |

### APIs
| Endpoint | Descripción |
|---|---|
| `POST /api/cotizar` | Calcula cotización, guarda en Supabase. Rate limit: 10 req/min por IP |
| `GET /api/tipo-cambio` | Dólar blue desde dolarapi.com con fallback |
| `POST /api/mp/webhook` | Recibe notificaciones de MercadoPago, actualiza estado del pedido |
| `GET /api/mp/webhook` | Health check para verificación de URL por MP |

---

## Emails automáticos (Resend)

| Trigger | Destinatario | Descripción |
|---|---|---|
| Admin envía link de cotización | Usuario | Link a `/solicitar/[id]` para confirmar |
| Admin rechaza cotización | Usuario | Notificación con motivo opcional |
| Usuario confirma pedido | Usuario | Confirmación con número de pedido |
| Usuario confirma pedido | Admin | Alerta interna con datos del pedido |
| MP confirma pago (webhook) | Admin | Alerta de pago recibido |

---

## Variables de entorno

### Requeridas (ya en `.env.local`)
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### Requeridas para funciones críticas
```env
# Supabase (panel admin — bypasa RLS)
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Resend (emails transaccionales)
RESEND_API_KEY=re_...
RESEND_FROM=Hornet Imports <noreply@tudominio.com>
RESEND_ADMIN_EMAIL=tu@email.com

# MercadoPago
MP_ACCESS_TOKEN=APP_USR-...

# URL del sitio (para links en emails y back_urls de MP)
NEXT_PUBLIC_SITE_URL=https://tudominio.com

# WhatsApp (número sin + ni espacios, con código de país)
NEXT_PUBLIC_WHATSAPP_NUMBER=5491100000000
```

### Cómo agregarlas en Vercel
1. Dashboard → proyecto → Settings → Environment Variables
2. Agregar cada variable para el ambiente `Production`
3. Redeploy para que tomen efecto

---

## Base de datos (Supabase)

### Tablas existentes
| Tabla | Campos clave |
|---|---|
| `profiles` | `id`, `email`, `nombre`, `apellido`, `telefono`*, `cuit`, `tipo` |
| `cotizaciones` | `id`, `user_id`, `nombre_producto`, `producto_url`, `precio_usd`, `peso_kg`, `categoria`, `costo_total_ars`, `desglose` (JSON), `estado` |
| `pedidos` | `id`, `cotizacion_id`, `user_id`, `producto_nombre`, `producto_url`, `precio_usd`, `costo_total_ars`, `estado`, `tracking_code`, `origen` |
| `listings` | `id`, `vendedor_id`, `titulo`, `precio`, `categoria`, `slug` |

### Migración pendiente — ejecutar en Supabase SQL Editor
```sql
-- Agregar campo teléfono a profiles (si no existe)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS telefono TEXT;
```

### Estados de cotización
`pendiente` → `aprobada` | `rechazada` | `expirada`

### Estados de pedido
`en_proceso` → `comprado` → `en_transito` → `en_aduana` → `entregado` | `cancelado`

> El webhook de MercadoPago cambia automáticamente `en_proceso` → `comprado` al confirmar el pago.

---

## Seguridad implementada

- **Row Level Security (RLS)** — usuarios solo ven sus propios pedidos y cotizaciones
- **Ownership check** — `confirmarPedido` verifica `.eq("user_id", user.id)` antes de crear pedido
- **Rate limiting** — `/api/cotizar`: 10 requests/minuto por IP (in-memory)
- **Proxy auth** — `proxy.ts` protege `/dashboard`, `/pedidos`, `/perfil`, `/solicitar`, `/admin` a nivel de routing
- **Admin role check** — layout de admin verifica `profile.tipo === "admin"` server-side
- **Service role** — `createAdminClient()` usa service role key solo en server-only files

---

## Pendiente / Roadmap

| Item | Prioridad | Notas |
|---|---|---|
| Migración SQL `telefono` | 🔴 Alta | Ejecutar el ALTER TABLE en Supabase |
| Test real de MercadoPago | 🔴 Alta | Probar con cuenta sandbox de MP |
| Filtros por estado en admin/pedidos | 🟡 Media | Con volumen se vuelve necesario |
| Rate limiting con Redis/Upstash | 🟡 Media | El actual (in-memory) no escala entre instancias |
| Integración de tracking real | 🟡 Media | API de courier o tracking manual |
| MercadoPago: reembolsos | 🟡 Media | Flujo de cancelación con devolución |
| Página de vendedor (CRUD listings) | 🟡 Media | Dashboard para vendedores |
| Notificación push / SMS | 🟢 Baja | Para cambios de estado del pedido |
| Analytics / métricas | 🟢 Baja | Plausible o Posthog |

---

## Arquitectura general

```
src/
├── app/
│   ├── (public)/          # Rutas sin auth requerida
│   ├── (auth)/            # Login, registro, recuperar contraseña
│   ├── (dashboard)/       # Panel del usuario (protegido por proxy.ts)
│   ├── (admin)/           # Panel admin (protegido por proxy.ts + layout check)
│   └── api/               # Route handlers (cotizar, tipo-cambio, mp/webhook)
├── components/
│   ├── cotizador/         # Formulario y resultado de cotización
│   ├── layout/            # Header, Footer, MobileNav
│   ├── seguimiento/       # TrackingForm
│   └── ui/                # Componentes reutilizables (LogoutButton, etc.)
└── lib/
    ├── cotizador/         # Lógica de cálculo (calcular.ts, tipos, categorías)
    ├── email/             # Cliente Resend + funciones de envío
    ├── mp/                # Cliente MercadoPago
    ├── supabase/          # server.ts, client.ts, admin.ts, types.ts
    └── utils/             # format.ts (formatUSD, formatARS, formatDate)
```
