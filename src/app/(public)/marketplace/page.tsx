import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ListingGrid, { type ListingDB } from "@/components/marketplace/ListingGrid";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Marketplace | Hornet Imports",
  description: "Comprá a vendedores locales con la comisión más baja del mercado. Menos que Mercado Libre, más transparencia.",
};

export default async function MarketplacePage() {
  const supabase = await createClient();

  const { data: rawListings } = await supabase
    .from("listings")
    .select("id, nombre, descripcion, precio_usd, precio_ars, categoria, stock, vendedor_id")
    .eq("activo", true)
    .order("created_at", { ascending: false });

  const items = rawListings ?? [];
  const vendedorIds = [...new Set(items.map((l) => l.vendedor_id))];

  const { data: profiles } = vendedorIds.length > 0
    ? await supabase.from("profiles").select("id, nombre, apellido, email").in("id", vendedorIds)
    : { data: [] };

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  const listings: ListingDB[] = items.map((l) => {
    const p = profileMap.get(l.vendedor_id);
    const vendedor_nombre = p
      ? [p.nombre, p.apellido].filter(Boolean).join(" ") || p.email || "Vendedor"
      : "Vendedor";
    return {
      id: l.id,
      nombre: l.nombre,
      descripcion: l.descripcion,
      precio_usd: l.precio_usd,
      precio_ars: l.precio_ars,
      categoria: l.categoria,
      stock: l.stock,
      vendedor_nombre,
    };
  });

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
        <ListingGrid listings={listings} />
      </section>

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
