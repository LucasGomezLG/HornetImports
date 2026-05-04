import type { Metadata } from "next";
import Link from "next/link";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Hornet Imports | Importá lo que necesités",
  description:
    "Plataforma de importación para Argentina. Cotizá cualquier producto, comprá en nuestra tienda o vendé con la comisión más baja del mercado.",
};

function IconCotizador() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <line x1="8" y1="8" x2="16" y2="8" />
      <line x1="8" y1="12" x2="16" y2="12" />
      <line x1="8" y1="16" x2="12" y2="16" />
    </svg>
  );
}

function IconTienda() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  );
}

function IconMarketplace() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

const COMPARISON = [
  { feature: "Comisión marketplace", hornet: "8–12%", ml: "13–17%", hornetOk: true, mlOk: false },
  { feature: "Importación a pedido", hornet: "Sí", ml: "No", hornetOk: true, mlOk: false },
  { feature: "Precio transparente", hornet: "Sí", ml: "No", hornetOk: true, mlOk: false },
  { feature: "Tienda pre-cotizada", hornet: "Sí", ml: "No", hornetOk: true, mlOk: false },
  { feature: "Panel mayorista B2B", hornet: "Sí", ml: "No", hornetOk: true, mlOk: false },
];

export default function LandingPage() {
  return (
    <>
      {/* ── Hero ────────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.heroPre}>Disponible en Argentina</p>
          <h1 className={styles.heroTitle}>
            Importá lo que necesités,{" "}
            <span className={styles.accent}>sin vueltas.</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Pegá el link de cualquier producto y te calculamos flete, impuestos y
            nuestro fee en segundos. Sin sorpresas, sin intermediarios ocultos.
          </p>
          <div className={styles.heroCtas}>
            <Link href="/cotizar" className={styles.btnPrimary}>
              Cotizá ahora →
            </Link>
            <Link href="/tienda" className={styles.btnSecondary}>
              Ver tienda
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────── */}
      <section className={styles.features}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Tres formas de importar o vender</h2>
            <p className={styles.sectionSubtitle}>
              Una sola plataforma, todo lo que necesitás.
            </p>
          </div>

          <div className={styles.grid3}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <IconCotizador />
              </div>
              <h3>Cotizador universal</h3>
              <p>
                Pegá el link del producto, ingresá las medidas y recibís el precio
                total: flete, impuestos y todo incluido.
              </p>
              <Link href="/cotizar" className={styles.featureLink}>
                Cotizar producto →
              </Link>
            </div>

            <div className={`${styles.featureCard} ${styles.featureCardFeatured}`}>
              <div className={`${styles.featureIcon} ${styles.featureIconFeatured}`}>
                <IconTienda />
              </div>
              <h3>Tienda pre-cotizada</h3>
              <p>
                Catálogo curado de productos ya importados repetidamente. Comprá con
                un click, sin re-cotizar.
              </p>
              <Link href="/tienda" className={styles.featureLink}>
                Ver tienda →
              </Link>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <IconMarketplace />
              </div>
              <h3>Marketplace local</h3>
              <p>
                Vendedores locales con los mejores productos. Comisión 8–12% vs el
                13–17% de Mercado Libre.
              </p>
              <Link href="/marketplace" className={styles.featureLink}>
                Ver marketplace →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Cómo funciona ────────────────────────────────── */}
      <section className={styles.howItWorks}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>En 3 pasos simples</h2>
            <p className={styles.sectionSubtitle}>
              Del link al delivery, todo gestionado por nosotros.
            </p>
          </div>

          <div className={styles.steps}>
            <div className={styles.step}>
              <div className={styles.stepNum}>01</div>
              <h3>Pegá el link</h3>
              <p>
                De Amazon, AliExpress, eBay o donde sea. Ingresás el peso y las
                medidas del producto.
              </p>
            </div>
            <div className={styles.stepDivider} />
            <div className={styles.step}>
              <div className={styles.stepNum}>02</div>
              <h3>Recibís el precio total</h3>
              <p>
                Flete internacional + impuestos de importación + nuestro fee.
                Sin letra chica, sin sorpresas.
              </p>
            </div>
            <div className={styles.stepDivider} />
            <div className={styles.step}>
              <div className={styles.stepNum}>03</div>
              <h3>Seguís el envío</h3>
              <p>
                Tracking en tiempo real con más de 900 couriers internacionales.
                Te avisamos en cada etapa.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Comparación ──────────────────────────────────── */}
      <section className={styles.comparison}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>¿Por qué Hornet Imports?</h2>
            <p className={styles.sectionSubtitle}>
              Más funciones, menores comisiones.
            </p>
          </div>

          <div className={styles.comparisonTable}>
            <div className={styles.comparisonHeader}>
              <div className={styles.comparisonFeatureCol} />
              <div className={styles.comparisonCol}>
                <span className={styles.comparisonBrandUs}>Hornet</span>
              </div>
              <div className={styles.comparisonCol}>
                <span className={styles.comparisonBrandML}>Mercado Libre</span>
              </div>
            </div>

            {COMPARISON.map(({ feature, hornet, ml, hornetOk, mlOk }) => (
              <div key={feature} className={styles.comparisonRow}>
                <div className={styles.comparisonFeatureCol}>{feature}</div>
                <div className={`${styles.comparisonCol} ${hornetOk ? styles.ok : styles.nok}`}>
                  <CheckIcon />
                  <span>{hornet}</span>
                </div>
                <div className={`${styles.comparisonCol} ${mlOk ? styles.ok : styles.nok}`}>
                  {mlOk ? <CheckIcon /> : <CrossIcon />}
                  <span>{ml}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Mayoristas ───────────────────────────────── */}
      <section className={styles.mayoristas}>
        <div className={styles.mayoristasInner}>
          <div className={styles.mayoristasContent}>
            <h2 className={styles.mayoristasTitle}>
              ¿Tenés una tienda o negocio?
            </h2>
            <p className={styles.mayoristasSubtitle}>
              Importá en volumen con precios escalonados, factura A y atención
              dedicada. Los mayoristas son el motor del modelo — los tratamos así.
            </p>
            <Link href="/mayorista" className={styles.btnAccent}>
              Quiero ser mayorista →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
