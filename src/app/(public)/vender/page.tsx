import type { Metadata } from "next";
import Link from "next/link";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Vendé en Hornet Imports | Comisión 8-12%",
  description:
    "Publicá tus productos gratis. Comisión 8-12% vs el 13-17% de Mercado Libre. Sin mensualidad, sin costo de alta.",
};

const BENEFICIOS = [
  {
    num: "01",
    titulo: "Tienda online lista",
    desc: "Tu catálogo publicado con URL propia desde el día uno. Sin configuración técnica, sin hosting, sin dominio.",
  },
  {
    num: "02",
    titulo: "Cobro automático",
    desc: "Integramos Mercado Pago. El dinero llega directo a vos; la comisión se descuenta automáticamente después del cobro.",
  },
  {
    num: "03",
    titulo: "Cotizador de importación integrado",
    desc: "Desde tu panel podés cotizar y encargar cualquier producto del exterior. Reponés sin llamar a nadie.",
  },
  {
    num: "04",
    titulo: "Sin mensualidad",
    desc: "No pagás nada para publicar. Solo abonás comisión cuando efectivamente vendés — si no vendés, no pagás.",
  },
  {
    num: "05",
    titulo: 'Sello "Importador Verificado"',
    desc: "Tras 3 importaciones exitosas accedés al sello que diferencia tu tienda en el listado y mejora conversión.",
  },
  {
    num: "06",
    titulo: "Soporte en ventas iniciales",
    desc: "Tu primera venta tiene soporte humano. Te acompañamos para que el proceso sea exitoso de entrada.",
  },
];

const COMISIONES = [
  { categoria: "Indumentaria y accesorios", comision: "8%" },
  { categoria: "Artesanías y productos hechos a mano", comision: "9%" },
  { categoria: "Hogar y decoración", comision: "10%" },
  { categoria: "Herramientas y repuestos automotores", comision: "11%" },
  { categoria: "Electrónica y tecnología", comision: "12%" },
];

const PASOS = [
  {
    num: "1",
    titulo: "Creás tu cuenta",
    desc: "Registro con email o Google. Gratis, en menos de 2 minutos.",
  },
  {
    num: "2",
    titulo: "Verificás tu CUIT",
    desc: "Validación automática contra el padrón de AFIP. Sin papeles, sin trámites.",
  },
  {
    num: "3",
    titulo: "Cargás tus productos",
    desc: "Formulario simple: foto, descripción, precio y stock. Sin tecnicismos.",
  },
  {
    num: "4",
    titulo: "Configurás el cobro",
    desc: "Conectás tu Mercado Pago. El dinero va directo a tu cuenta.",
  },
  {
    num: "5",
    titulo: "Empezás a vender",
    desc: "Tu tienda queda activa. Compartís el link y arrancás.",
  },
];

export default function VenderPage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>Para vendedores</p>
          <h1 className={styles.heroTitle}>
            Vendé más.<br />
            <span className={styles.accent}>Quedáte con más margen.</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Publicá gratis en Hornet Imports. Comisión 8-12% contra el 13-17%
            de Mercado Libre. Y además, importá tus insumos a precio mayorista
            desde el mismo panel.
          </p>
          <div className={styles.heroCtas}>
            <Link href="/registro?plan=vendedor" className={styles.btnPrimary}>
              Crear cuenta gratis →
            </Link>
            <a href="#como-funciona" className={styles.btnSecondary}>
              Ver cómo funciona
            </a>
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────── */}
      <section className={styles.statsBar}>
        <div className={styles.statsInner}>
          <div className={styles.stat}>
            <span className={styles.statNum}>8–12%</span>
            <span className={styles.statLabel}>Comisión por venta</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statNum}>-40%</span>
            <span className={styles.statLabel}>vs Mercado Libre</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statNum}>$0</span>
            <span className={styles.statLabel}>Costo de publicar</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statNum}>30–40%</span>
            <span className={styles.statLabel}>Vendedores que importan a 90 días</span>
          </div>
        </div>
      </section>

      {/* ── Beneficios ───────────────────────────────────── */}
      <section className={styles.beneficios}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Todo lo que recibís al publicar</h2>
            <p className={styles.sectionSubtitle}>
              Sin configuración técnica. Desde el día uno tenés herramientas de venta reales.
            </p>
          </div>
          <div className={styles.beneficiosGrid}>
            {BENEFICIOS.map((b) => (
              <div key={b.num} className={styles.beneficioCard}>
                <span className={styles.beneficioNum}>{b.num}</span>
                <h3 className={styles.beneficioTitulo}>{b.titulo}</h3>
                <p className={styles.beneficioDesc}>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tabla comisiones ─────────────────────────────── */}
      <section className={styles.comisiones}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Comisiones por categoría</h2>
            <p className={styles.sectionSubtitle}>
              La comisión varía según categoría y se ajusta por tasa de devolución.
              Siempre menos que ML.
            </p>
          </div>
          <div className={styles.tablaWrapper}>
            <div className={styles.tablaHeader}>
              <span>Categoría</span>
              <span>Hornet</span>
              <span>Mercado Libre</span>
            </div>
            {COMISIONES.map((row) => (
              <div key={row.categoria} className={styles.tablaRow}>
                <span className={styles.tablaCategoria}>{row.categoria}</span>
                <span className={styles.tablaHornet}>{row.comision}</span>
                <span className={styles.tablaML}>13–17%</span>
              </div>
            ))}
          </div>
          <p className={styles.tablaNote}>
            * Las comisiones se revisan trimestralmente. Sin cambios retroactivos sobre ventas ya procesadas.
          </p>
        </div>
      </section>

      {/* ── Cómo funciona ────────────────────────────────── */}
      <section className={styles.comoFunciona} id="como-funciona">
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>De la cuenta a la primera venta en 5 pasos</h2>
            <p className={styles.sectionSubtitle}>
              Todo el proceso tarda menos de 30 minutos.
            </p>
          </div>
          <div className={styles.pasos}>
            {PASOS.map((p, i) => (
              <div key={p.num} className={styles.pasoItem}>
                <div className={styles.pasoLeft}>
                  <div className={styles.pasoNum}>{p.num}</div>
                  {i < PASOS.length - 1 && <div className={styles.pasoLine} />}
                </div>
                <div className={styles.pasoContent}>
                  <h3 className={styles.pasoTitulo}>{p.titulo}</h3>
                  <p className={styles.pasoDesc}>{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA final ────────────────────────────────────── */}
      <section className={styles.ctaFinal}>
        <div className={styles.ctaInner}>
          <h2 className={styles.ctaTitle}>
            Empezá a vender hoy, gratis
          </h2>
          <p className={styles.ctaSubtitle}>
            Sin contrato, sin mensualidad. Creás la cuenta en 2 minutos
            y publicás tu primer producto hoy mismo.
          </p>
          <Link href="/registro?plan=vendedor" className={styles.btnCta}>
            Crear cuenta gratis →
          </Link>
          <p className={styles.ctaNote}>
            ¿Tenés dudas?{" "}
            <a href="mailto:vendedores@hornetimports.com" className={styles.ctaEmail}>
              vendedores@hornetimports.com
            </a>
          </p>
        </div>
      </section>
    </>
  );
}
