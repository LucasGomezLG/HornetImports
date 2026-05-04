import { notFound } from "next/navigation";
import Link from "next/link";
import { PRODUCTOS_MOCK } from "@/lib/tienda/productos-mock";
import styles from "./page.module.css";

const CATEGORY_BG: Record<string, string> = {
  autopartes: "linear-gradient(145deg, #1d2b3a 0%, #2d4052 100%)",
  herramientas: "linear-gradient(145deg, #374151 0%, #4b5f6e 100%)",
  hogar: "linear-gradient(145deg, #1e3a5f 0%, #2563a8 100%)",
  deporte: "linear-gradient(145deg, #064e3b 0%, #059669 100%)",
  accesorios: "linear-gradient(145deg, #4c1d95 0%, #7c3aed 100%)",
};

const CATEGORY_LABEL: Record<string, string> = {
  autopartes: "Autopartes",
  herramientas: "Herramientas",
  hogar: "Hogar",
  deporte: "Deporte",
  accesorios: "Accesorios",
};

export async function generateStaticParams() {
  return PRODUCTOS_MOCK.map((p) => ({ slug: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = PRODUCTOS_MOCK.find((x) => x.id === slug);
  if (!p) return {};
  return {
    title: `${p.nombre} | Hornet Imports`,
    description: p.descripcion,
  };
}

function formatUSD(n: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(n);
}

export default async function ProductoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const producto = PRODUCTOS_MOCK.find((p) => p.id === slug);
  if (!producto) notFound();

  const bg = CATEGORY_BG[producto.categoria] ?? CATEGORY_BG.herramientas;
  const categoryLabel = CATEGORY_LABEL[producto.categoria] ?? producto.categoria;
  const stockBajo = producto.stock <= 4;

  return (
    <div className={styles.page}>
      {/* Breadcrumb */}
      <nav className={styles.breadcrumb}>
        <Link href="/">Inicio</Link>
        <span className={styles.sep}>›</span>
        <Link href="/tienda">Tienda</Link>
        <span className={styles.sep}>›</span>
        <span>{categoryLabel}</span>
        <span className={styles.sep}>›</span>
        <span className={styles.breadcrumbCurrent}>{producto.nombre}</span>
      </nav>

      <div className={styles.layout}>
        {/* Imagen */}
        <div className={styles.imageCol}>
          <div className={styles.imageArea} style={{ background: bg }}>
            {producto.destacado && (
              <span className={`${styles.badge} ${styles.badgeDestacado}`}>Más vendido</span>
            )}
            <span className={`${styles.badge} ${styles.badgePrecotizado}`}>Pre-cotizado</span>
          </div>
          <p className={styles.imageNote}>
            Imagen ilustrativa. El producto real puede variar levemente.
          </p>
        </div>

        {/* Info */}
        <div className={styles.infoCol}>
          <span className={styles.categoryChip}>{categoryLabel}</span>
          <h1 className={styles.nombre}>{producto.nombre}</h1>
          <p className={styles.descripcion}>{producto.descripcion}</p>

          <div className={styles.priceBlock}>
            <span className={styles.price}>{formatUSD(producto.precioUsd)}</span>
            <span className={styles.priceCurrency}>USD</span>
            <span className={styles.priceNote}>Precio de referencia. Incluye arancel estimado.</span>
          </div>

          <div className={styles.stockRow}>
            {stockBajo ? (
              <span className={styles.stockBajo}>⚠ Últimas {producto.stock} unidades</span>
            ) : (
              <span className={styles.stockOk}>✓ {producto.stock} unidades disponibles</span>
            )}
          </div>

          <div className={styles.ctaBlock}>
            <Link
              href={`/registro?plan=comprador&producto=${encodeURIComponent(producto.nombre)}`}
              className={styles.btnComprar}
            >
              Comprar ahora →
            </Link>
            <Link href="/cotizar" className={styles.btnCotizar}>
              Cotizar importación
            </Link>
          </div>

          <div className={styles.infoChips}>
            <div className={styles.chip}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v4h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
              </svg>
              15–25 días hábiles
            </div>
            <div className={styles.chip}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
              </svg>
              Doc. aduanera incluida
            </div>
            <div className={styles.chip}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              Tracking en tiempo real
            </div>
          </div>
        </div>
      </div>

      <div className={styles.backRow}>
        <Link href="/tienda" className={styles.backLink}>
          ← Volver a la tienda
        </Link>
      </div>
    </div>
  );
}
