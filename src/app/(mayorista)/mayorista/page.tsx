import type { Metadata } from "next";
import styles from "./page.module.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Para Empresas y Revendedores | Hornet Imports",
  description:
    "Escalá tu negocio con importación directa y comisiones desde el 3%. Sin depósito propio, sin logística, sin ML.",
};

const BENEFICIOS = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    ),
    titulo: "Comisión desde 3%",
    desc: "Vendé en nuestro marketplace con hasta 5x menos comisión que Mercado Libre. Más margen, mismo alcance.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" rx="2" />
        <path d="M16 8h4l3 5v4h-7V8z" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
    titulo: "Dropshipping sin depósito",
    desc: "Vendé sin tener stock. Nosotros importamos y despachamos directamente al cliente final por vos.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    titulo: "Ejecutivo dedicado",
    desc: "Cada cuenta B2B tiene un ejecutivo de cuenta. Sin tickets, sin esperas. WhatsApp directo.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    titulo: "Documentación aduanera incluida",
    desc: "DUA, factura comercial, packing list. Todo gestionado por nuestro equipo. Vos solo vendés.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    titulo: "Tiempos claros",
    desc: "15 a 25 días hábiles puerta a puerta. Tracking en tiempo real en cada etapa del proceso.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    titulo: "Volumen = mejor precio",
    desc: "A mayor volumen, menor fee de servicio. Negociamos tarifas de flete consolidado para escalar tu margen.",
  },
];

const PERFILES = [
  { emoji: "👕", titulo: "Indumentaria y moda", desc: "Revendedores de ropa, calzado y accesorios importados." },
  { emoji: "🔧", titulo: "Herramientas y equipos", desc: "Distribuidores de herramientas eléctricas y equipamiento industrial." },
  { emoji: "📱", titulo: "Electrónica y gadgets", desc: "Tiendas online de tecnología, periféricos y accesorios." },
  { emoji: "🚗", titulo: "Autopartes", desc: "Repuestos y accesorios para autos nacionales e importados." },
];

export default function MayoristaPage() {
  return (
    <>
      {/* ── Hero ───────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>Para empresas y revendedores</p>
          <h1 className={styles.heroTitle}>
            Importá a escala.<br />
            <span className={styles.accent}>Sin los costos de ML.</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Vendé en nuestro marketplace con comisiones desde el 3% o tercerizá
            toda tu logística de importación. Sin depósito propio, sin trámites aduaneros,
            sin dolores de cabeza.
          </p>
          <div className={styles.heroCtas}>
            <Link href="/registro" className={styles.btnPrimary}>
              Quiero empezar →
            </Link>
            <a href="#como-funciona" className={styles.btnSecondary}>
              Ver cómo funciona
            </a>
          </div>
        </div>
      </section>

      {/* ── Stats ──────────────────────────────────────── */}
      <section className={styles.stats}>
        <div className={styles.statsInner}>
          <div className={styles.stat}>
            <span className={styles.statNum}>3–5%</span>
            <span className={styles.statLabel}>Comisión en marketplace</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statNum}>-70%</span>
            <span className={styles.statLabel}>vs comisión de ML</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statNum}>25 días</span>
            <span className={styles.statLabel}>Puerta a puerta promedio</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statNum}>$0</span>
            <span className={styles.statLabel}>Costo de apertura de cuenta</span>
          </div>
        </div>
      </section>

      {/* ── Beneficios ─────────────────────────────────── */}
      <section className={styles.beneficios}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Todo lo que necesitás para escalar</h2>
            <p className={styles.sectionSubtitle}>
              Un solo proveedor para importación, logística, documentación y venta online.
            </p>
          </div>
          <div className={styles.beneficiosGrid}>
            {BENEFICIOS.map((b) => (
              <div key={b.titulo} className={styles.beneficioCard}>
                <div className={styles.beneficioIcon}>{b.icon}</div>
                <h3 className={styles.beneficioTitulo}>{b.titulo}</h3>
                <p className={styles.beneficioDesc}>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Cómo funciona ──────────────────────────────── */}
      <section className={styles.comoFunciona} id="como-funciona">
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>De la idea al cliente final en 4 pasos</h2>
            <p className={styles.sectionSubtitle}>
              Vos elegís el producto. Nosotros hacemos el resto.
            </p>
          </div>
          <div className={styles.pasos}>
            <div className={styles.paso}>
              <div className={styles.pasoNum}>1</div>
              <div className={styles.pasoContent}>
                <h3>Abrís tu cuenta B2B</h3>
                <p>Registrate gratis, completás el perfil de tu negocio y te asignamos un ejecutivo en menos de 24 hs.</p>
              </div>
            </div>
            <div className={styles.pasoConector} />
            <div className={styles.paso}>
              <div className={styles.pasoNum}>2</div>
              <div className={styles.pasoContent}>
                <h3>Elegís los productos</h3>
                <p>Usás nuestro cotizador para calcular el costo total con aranceles, flete e IVA incluidos antes de comprometerte.</p>
              </div>
            </div>
            <div className={styles.pasoConector} />
            <div className={styles.paso}>
              <div className={styles.pasoNum}>3</div>
              <div className={styles.pasoContent}>
                <h3>Publicás en el marketplace</h3>
                <p>Listás tus productos con precio ya calculado. Los compradores ven tu catálogo con comisión del 3 al 5%.</p>
              </div>
            </div>
            <div className={styles.pasoConector} />
            <div className={styles.paso}>
              <div className={styles.pasoNum}>4</div>
              <div className={styles.pasoContent}>
                <h3>Vendés, nosotros despachamos</h3>
                <p>Al confirmar la venta, importamos y entregamos directo al comprador. Tracking en tiempo real para vos y tu cliente.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Perfiles ───────────────────────────────────── */}
      <section className={styles.perfiles}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>¿Para quién es esto?</h2>
            <p className={styles.sectionSubtitle}>
              Trabajamos con revendedores, distribuidores y tiendas online de todos los rubros.
            </p>
          </div>
          <div className={styles.perfilesGrid}>
            {PERFILES.map((p) => (
              <div key={p.titulo} className={styles.perfilCard}>
                <span className={styles.perfilEmoji}>{p.emoji}</span>
                <h3 className={styles.perfilTitulo}>{p.titulo}</h3>
                <p className={styles.perfilDesc}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA final ──────────────────────────────────── */}
      <section className={styles.ctaFinal}>
        <div className={styles.ctaInner}>
          <h2 className={styles.ctaTitle}>
            Empezá hoy, sin compromisos
          </h2>
          <p className={styles.ctaSubtitle}>
            Cuenta gratis. Sin contrato mínimo. Sin volumen mínimo para empezar.
            Escala a tu ritmo.
          </p>
          <div className={styles.ctaBtns}>
            <Link href="/registro" className={styles.btnAccent}>
              Crear cuenta gratis →
            </Link>
            <Link href="/cotizar" className={styles.btnOutline}>
              Probar el cotizador
            </Link>
          </div>
          <p className={styles.ctaNote}>
            ¿Tenés preguntas? Escribinos a{" "}
            <a href="mailto:b2b@hornetimports.com" className={styles.ctaEmail}>
              b2b@hornetimports.com
            </a>
          </p>
        </div>
      </section>
    </>
  );
}
