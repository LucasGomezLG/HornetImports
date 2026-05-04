import type { Metadata } from "next";
import Link from "next/link";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Sobre Nosotros | Hornet Imports",
  description:
    "Somos una plataforma argentina que democratiza el acceso a la importación. Marketplace con comisión 8-12% y hub logístico sin intermediarios.",
};

const VALORES = [
  {
    num: "01",
    titulo: "Transparencia total",
    desc: "Cada costo del proceso de importación visible antes de comprometerte: arancel, flete, IVA, fee de servicio.",
  },
  {
    num: "02",
    titulo: "Menos comisión, más margen",
    desc: "8–12% vs el 13–17% de Mercado Libre. No cobramos mensualidad. Si el vendedor gana, nosotros ganamos.",
  },
  {
    num: "03",
    titulo: "Importación sin fricción",
    desc: "DUA, factura comercial, packing list — toda la documentación aduanera gestionada por nuestro equipo.",
  },
  {
    num: "04",
    titulo: "Tecnología local",
    desc: "Construido en Argentina para el mercado argentino. Entendemos los vaivenes del tipo de cambio y la aduana.",
  },
];

const STATS = [
  { num: "8–12%", label: "Comisión en marketplace" },
  { num: "$0", label: "Costo de alta y publicación" },
  { num: "15–25d", label: "Puerta a puerta promedio" },
  { num: "2025", label: "Año de fundación" },
];

export default function NosotrosPage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>Sobre nosotros</p>
          <h1 className={styles.heroTitle}>
            Importamos lo que<br />
            <span className={styles.accent}>Argentina necesita.</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Hornet Imports es una plataforma de comercio exterior pensada para
            emprendedores, revendedores y compradores argentinos. Reducimos la
            brecha entre el precio mayorista global y el precio local, sin
            trámites, sin depósito propio y sin comisiones abusivas.
          </p>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────── */}
      <section className={styles.statsBar}>
        <div className={styles.statsInner}>
          {STATS.map((s, i) => (
            <>
              <div key={s.num} className={styles.stat}>
                <span className={styles.statNum}>{s.num}</span>
                <span className={styles.statLabel}>{s.label}</span>
              </div>
              {i < STATS.length - 1 && <div className={styles.statDivider} />}
            </>
          ))}
        </div>
      </section>

      {/* ── Misión ───────────────────────────────────── */}
      <section className={styles.mision}>
        <div className={styles.container}>
          <div className={styles.misionGrid}>
            <div className={styles.misionText}>
              <p className={styles.eyebrowDark}>Nuestra misión</p>
              <h2 className={styles.misionTitle}>
                Que cualquier vendedor argentino pueda competir con el precio
                de importación.
              </h2>
              <p className={styles.misionDesc}>
                Hoy importar requiere conocer despachantes, bancos, regímenes
                aduaneros y terminología técnica. Eso excluye a la mayoría.
                Nosotros simplificamos todo ese proceso en un cotizador, un
                formulario de pedido y un panel de seguimiento.
              </p>
              <p className={styles.misionDesc}>
                Al mismo tiempo, ofrecemos un marketplace con la comisión más
                baja del mercado para que los vendedores que ya tienen
                productos puedan publicar sin el peso de Mercado Libre.
              </p>
            </div>
            <div className={styles.misionVisual}>
              <div className={styles.misionCard}>
                <span className={styles.misionCardNum}>-40%</span>
                <span className={styles.misionCardLabel}>
                  Menos comisión que Mercado Libre
                </span>
              </div>
              <div className={styles.misionCard}>
                <span className={styles.misionCardNum}>$0</span>
                <span className={styles.misionCardLabel}>
                  Costo de publicar en el marketplace
                </span>
              </div>
              <div className={styles.misionCard}>
                <span className={styles.misionCardNum}>100%</span>
                <span className={styles.misionCardLabel}>
                  Documentación aduanera incluida
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Valores ──────────────────────────────────── */}
      <section className={styles.valores}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Cómo operamos</h2>
            <p className={styles.sectionSubtitle}>
              Cuatro principios que guían cada decisión del producto.
            </p>
          </div>
          <div className={styles.valoresGrid}>
            {VALORES.map((v) => (
              <div key={v.num} className={styles.valorCard}>
                <span className={styles.valorNum}>{v.num}</span>
                <h3 className={styles.valorTitulo}>{v.titulo}</h3>
                <p className={styles.valorDesc}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────── */}
      <section className={styles.ctaFinal}>
        <div className={styles.ctaInner}>
          <h2 className={styles.ctaTitle}>¿Querés ser parte?</h2>
          <p className={styles.ctaSubtitle}>
            Estamos buscando vendedores que quieran crecer con menos fricción.
            Creá tu cuenta gratis y empezá hoy.
          </p>
          <div className={styles.ctaBtns}>
            <Link href="/registro?plan=vendedor" className={styles.btnPrimary}>
              Crear cuenta gratis →
            </Link>
            <Link href="/cotizar" className={styles.btnSecondary}>
              Probar el cotizador
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
