import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import styles from "./page.module.css";

const CATEGORY_BG: Record<string, string> = {
  autopartes: "linear-gradient(145deg, #1d2b3a 0%, #2d4052 100%)",
  herramientas: "linear-gradient(145deg, #374151 0%, #4b5f6e 100%)",
  electronica: "linear-gradient(145deg, #1e3a5f 0%, #1d4ed8 100%)",
  hogar: "linear-gradient(145deg, #312e81 0%, #4338ca 100%)",
  indumentaria: "linear-gradient(145deg, #4c1d95 0%, #7c3aed 100%)",
};

const CATEGORY_LABEL: Record<string, string> = {
  autopartes: "Autopartes",
  herramientas: "Herramientas",
  electronica: "Electrónica",
  hogar: "Hogar",
  indumentaria: "Indumentaria",
};

function formatARS(n: number) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);
}

function formatUSD(n: number) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(n);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: l } = await supabase.from("listings").select("nombre, descripcion").eq("id", slug).single();
  if (!l) return {};
  return { title: `${l.nombre} | Hornet Imports`, description: l.descripcion };
}

export default async function ListingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: listing } = await supabase
    .from("listings")
    .select("id, nombre, descripcion, precio_usd, precio_ars, categoria, stock, vendedor_id")
    .eq("id", slug)
    .eq("activo", true)
    .single();

  if (!listing) notFound();

  const { data: profile } = await supabase
    .from("profiles")
    .select("nombre, apellido, email")
    .eq("id", listing.vendedor_id)
    .single();

  const vendedorNombre = profile
    ? [profile.nombre, profile.apellido].filter(Boolean).join(" ") || profile.email || "Vendedor"
    : "Vendedor";

  const bg = CATEGORY_BG[listing.categoria] ?? CATEGORY_BG.herramientas;
  const categoryLabel = CATEGORY_LABEL[listing.categoria] ?? listing.categoria;

  return (
    <div className={styles.page}>
      <nav className={styles.breadcrumb}>
        <Link href="/">Inicio</Link>
        <span className={styles.sep}>›</span>
        <Link href="/marketplace">Marketplace</Link>
        <span className={styles.sep}>›</span>
        <span>{categoryLabel}</span>
        <span className={styles.sep}>›</span>
        <span className={styles.breadcrumbCurrent}>{listing.nombre}</span>
      </nav>

      <div className={styles.layout}>
        <div className={styles.imageCol}>
          <div className={styles.imageArea} style={{ background: bg }}>
            <span className={styles.commissionBadge}>8–12% comisión</span>
          </div>
        </div>

        <div className={styles.infoCol}>
          <div className={styles.vendedorRow}>
            <div className={styles.vendedorAvatar}>{vendedorNombre.charAt(0).toUpperCase()}</div>
            <div className={styles.vendedorInfo}>
              <span className={styles.vendedorNombre}>{vendedorNombre}</span>
            </div>
          </div>

          <span className={styles.categoryChip}>{categoryLabel}</span>
          <h1 className={styles.nombre}>{listing.nombre}</h1>
          {listing.descripcion && <p className={styles.descripcion}>{listing.descripcion}</p>}

          <div className={styles.priceBlock}>
            <span className={styles.price}>{formatARS(listing.precio_ars)}</span>
            <span className={styles.priceCurrency}>ARS</span>
            {listing.precio_usd && (
              <span className={styles.priceUsd}>≈ {formatUSD(listing.precio_usd)} USD</span>
            )}
          </div>

          {listing.stock > 0 ? (
            <p className={styles.stockOk}>✓ {listing.stock} unidades disponibles</p>
          ) : (
            <p className={styles.stockAgotado}>Sin stock momentáneamente</p>
          )}

          <div className={styles.ctaBlock}>
            <Link
              href={`/registro?plan=comprador&producto=${encodeURIComponent(listing.nombre)}`}
              className={styles.btnComprar}
            >
              Contactar vendedor →
            </Link>
            <Link href="/marketplace" className={styles.btnVolver}>
              Ver más productos
            </Link>
          </div>

          <div className={styles.trustRow}>
            <div className={styles.trustItem}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              Vendedor verificado
            </div>
            <div className={styles.trustItem}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
              </svg>
              Mercado Pago integrado
            </div>
            <div className={styles.trustItem}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
              </svg>
              Comisión 8–12%
            </div>
          </div>
        </div>
      </div>

      <div className={styles.backRow}>
        <Link href="/marketplace" className={styles.backLink}>
          ← Volver al marketplace
        </Link>
      </div>
    </div>
  );
}
