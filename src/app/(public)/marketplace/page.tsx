import type { Metadata } from "next";
import Link from "next/link";
import ListingGrid from "@/components/marketplace/ListingGrid";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Marketplace | Hornet Imports",
  description: "Comprá a vendedores locales con la comisión más baja del mercado. Menos que Mercado Libre, más transparencia.",
};

export default function MarketplacePage() {
  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>Marketplace</p>
          <h1 className={styles.title}>Vendedores locales, comisión real</h1>
          <p className={styles.subtitle}>
            Productos de emprendedores y tiendas argentinas. Pagamos 8–12% de
            comisión vs el 13–17% de Mercado Libre. Lo que ahorramos en fees,
            gana el vendedor.
          </p>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statNum}>8–12%</span>
              <span className={styles.statLabel}>Comisión por venta</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statNum}>vs 13–17%</span>
              <span className={styles.statLabel}>Mercado Libre</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statNum}>0%</span>
              <span className={styles.statLabel}>Costo de publicar</span>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.gridSection}>
        <ListingGrid />
      </section>

      {/* ── CTA vendedor ────────────────────────────────── */}
      <section className={styles.vendedorCta}>
        <div className={styles.vendedorInner}>
          <div className={styles.vendedorText}>
            <p className={styles.vendedorEyebrow}>¿Tenés productos para vender?</p>
            <h2 className={styles.vendedorTitle}>
              Publicá gratis. Comisión 8–12%.
            </h2>
            <p className={styles.vendedorSubtitle}>
              Sin mensualidad, sin costo de alta. Solo pagás comisión cuando vendés —
              y es hasta un 40% menos que Mercado Libre.
            </p>
          </div>
          <div className={styles.vendedorActions}>
            <Link href="/vender" className={styles.vendedorBtnPrimary}>
              Cómo vender →
            </Link>
            <Link href="/registro?plan=vendedor" className={styles.vendedorBtnSecondary}>
              Crear cuenta gratis
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
