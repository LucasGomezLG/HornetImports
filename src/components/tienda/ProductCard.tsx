import Link from "next/link";
import type { ProductoTienda } from "@/lib/tienda/productos-mock";
import styles from "./ProductCard.module.css";

const CATEGORY_BG: Record<string, string> = {
  autopartes: "linear-gradient(145deg, #1d2b3a 0%, #2d4052 100%)",
  herramientas: "linear-gradient(145deg, #374151 0%, #4b5f6e 100%)",
  hogar: "linear-gradient(145deg, #1e3a5f 0%, #2563a8 100%)",
  deporte: "linear-gradient(145deg, #064e3b 0%, #059669 100%)",
  accesorios: "linear-gradient(145deg, #4c1d95 0%, #7c3aed 100%)",
};

function IconAutopartes() {
  return (
    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
    </svg>
  );
}

function IconHerramientas() {
  return (
    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

function IconHogar() {
  return (
    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function IconDeporte() {
  return (
    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}

function IconAccesorios() {
  return (
    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  );
}

const CATEGORY_ICON: Record<string, React.ReactNode> = {
  autopartes: <IconAutopartes />,
  herramientas: <IconHerramientas />,
  hogar: <IconHogar />,
  deporte: <IconDeporte />,
  accesorios: <IconAccesorios />,
};

const CATEGORY_LABEL: Record<string, string> = {
  autopartes: "Autopartes",
  herramientas: "Herramientas",
  hogar: "Hogar",
  deporte: "Deporte",
  accesorios: "Accesorios",
};

function formatUSD(valor: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(valor);
}

export default function ProductCard({ producto }: { producto: ProductoTienda }) {
  const bg = CATEGORY_BG[producto.categoria] ?? CATEGORY_BG.herramientas;
  const icon = CATEGORY_ICON[producto.categoria];
  const stockBajo = producto.stock <= 4;

  return (
    <div className={styles.card}>
      {/* Imagen placeholder */}
      <div className={styles.imageArea} style={{ background: bg }}>
        {producto.destacado && (
          <span className={`${styles.badge} ${styles.badgeDestacado}`}>
            Más vendido
          </span>
        )}
        <span className={`${styles.badge} ${styles.badgePreco}`}>
          Pre-cotizado
        </span>
        <div className={styles.iconWrapper}>{icon}</div>
      </div>

      {/* Contenido */}
      <div className={styles.content}>
        <span className={styles.categoryChip}>
          {CATEGORY_LABEL[producto.categoria]}
        </span>
        <h3 className={styles.nombre}>{producto.nombre}</h3>
        <p className={styles.descripcion}>{producto.descripcion}</p>

        <div className={styles.priceRow}>
          <span className={styles.price}>{formatUSD(producto.precioUsd)}</span>
          <span className={styles.priceSuffix}>USD</span>
        </div>

        <p className={stockBajo ? `${styles.stock} ${styles.stockBajo}` : styles.stock}>
          {stockBajo
            ? `Últimas ${producto.stock} unidades`
            : `${producto.stock} disponibles`}
        </p>

        <Link href="/cotizar" className={styles.btnComprar}>
          Comprar
        </Link>
      </div>
    </div>
  );
}
