# Setup Producción — Hornet Imports
Checklist paso a paso para dejar todo funcionando en producción.

---

## Estado actual
- [x] Código deployado en Vercel
- [x] Base de datos creada en Supabase
- [x] URLs de auth configuradas en Supabase
- [ ] Emails funcionando (bloqueador actual)
- [ ] Variables de entorno completas en Vercel
- [ ] Mercado Pago configurado
- [ ] WhatsApp configurado

---

## PASO 1 — Emails con Resend (BLOQUEADOR)

Sin esto los usuarios no reciben confirmación de registro ni ningún email de la app.

### 1.1 Crear cuenta en Resend
1. Ir a https://resend.com → Sign up (gratis)
2. Verificar tu email

### 1.2 Agregar dominio (recomendado) o usar el dominio de prueba
**Opción A — Con dominio propio** (para producción real):
1. Resend → Domains → Add Domain → ingresar tu dominio (ej: `hornetimports.com`)
2. Agregar los registros DNS que te da Resend en tu proveedor de dominio
3. Esperar verificación (5-30 minutos)
4. El FROM email será: `noreply@tudominio.com`

**Opción B — Sin dominio propio** (arrancar rápido):
1. Resend te da `onboarding@resend.dev` como FROM
2. Solo podés enviar a tu propio email en el plan gratis
3. No sirve para producción real — usá Opción A

### 1.3 Crear API Key en Resend
1. Resend → API Keys → Create API Key
2. Nombre: `hornet-imports-prod`
3. Permission: `Sending access`
4. Guardar el key (empieza con `re_`)

### 1.4 Conectar Resend a Supabase (para emails de auth)
Supabase → Authentication → Emails → SMTP Settings:
- **Enable custom SMTP**: ON
- **Host**: `smtp.resend.com`
- **Port**: `465`
- **Username**: `resend`
- **Password**: tu API key de Resend (`re_...`)
- **Sender email**: `noreply@tudominio.com` (o el que configuraste)
- **Sender name**: `Hornet Imports`

Guardar → enviar email de prueba para verificar.

### 1.5 Personalizar templates de email (opcional pero recomendado)
Supabase → Authentication → Emails → Confirm signup:
Cambiar el link de confirmación para que apunte a tu callback:
```
{{ .SiteURL }}/auth/callback?code={{ .TokenHash }}&next=/dashboard
```

---

## PASO 2 — Variables de entorno en Vercel

Vercel → tu proyecto → Settings → Environment Variables → agregar una por una:

| Variable | Valor | Dónde conseguirla |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://daenfyucaxljaoojmpvi.supabase.co` | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` | Supabase → Settings → API |
| `NEXT_PUBLIC_SITE_URL` | `https://hornet-imports.vercel.app` | Tu URL de Vercel |
| `RESEND_API_KEY` | `re_...` | Resend → API Keys |
| `RESEND_FROM` | `noreply@tudominio.com` | El email sender configurado |
| `RESEND_ADMIN_EMAIL` | `luccaass96@gmail.com` | Tu email de admin |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | `5491XXXXXXXXX` | Tu número (sin + ni espacios) |
| `MP_ACCESS_TOKEN` | `APP_USR-...` | Ver Paso 3 |

Después de agregar todas → Vercel → Deployments → Redeploy (para que tome las nuevas variables).

---

## PASO 3 — Mercado Pago

### 3.1 Crear aplicación en MP
1. Ir a https://www.mercadopago.com.ar/developers/panel
2. Crear aplicación → nombre: `Hornet Imports`
3. Producto: `Pagos online`

### 3.2 Obtener credenciales
- Panel → tu app → Credenciales de producción
- Copiar **Access Token** (empieza con `APP_USR-`)
- Pegarlo en Vercel como `MP_ACCESS_TOKEN`

### 3.3 Configurar webhook en MP
- Panel → tu app → Webhooks → Agregar webhook
- URL: `https://hornet-imports.vercel.app/api/mp/webhook`
- Eventos: `payment`

> **Nota**: Mientras desarrollás podés usar las credenciales de **prueba** (TEST-...) para no mover dinero real.

---

## PASO 4 — Supabase: confirmar tu usuario admin

1. Supabase → Authentication → Users → click en `luccaass96@gmail.com`
2. Click en **"Send confirmation email"** o directamente en **"Confirm user"**
3. Verificar en SQL Editor que el profile tiene `tipo = 'admin'`:
```sql
SELECT id, email, tipo FROM profiles;
```
Si no tiene tipo admin:
```sql
UPDATE profiles SET tipo = 'admin' WHERE email = 'luccaass96@gmail.com';
```

---

## PASO 5 — Verificar que todo funciona

### Checklist final:
- [ ] Registrar un usuario nuevo desde `/registro` → recibe email de confirmación
- [ ] Confirmar email → redirige a `/dashboard`
- [ ] Header muestra nombre del usuario logueado
- [ ] Admin ve botón "Admin ↗" en el header
- [ ] `/admin` carga correctamente con stats
- [ ] `/admin/tienda` permite agregar/editar productos
- [ ] `/admin/cotizaciones` muestra cotizaciones
- [ ] `/cotizar` genera cotización y la guarda en DB
- [ ] `/tienda` muestra productos de la DB
- [ ] `/marketplace` muestra listings de la DB
- [ ] Vendedor puede entrar a `/vendedor/productos`

---

## Orden recomendado para arrancar YA

1. **Paso 1** (Resend) → para poder recibir el email de confirmación
2. **Paso 2** (Vercel env vars) → para que la app use Resend
3. **Paso 4** (confirmar tu usuario) → para poder entrar como admin
4. **Paso 3** (Mercado Pago) → cuando quieras activar pagos reales
