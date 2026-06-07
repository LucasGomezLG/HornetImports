"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./ListingGrid.module.css";

export interface ListingDB {
  id: string;
  nombre: string;
  descripcion: string | null;
  vendedor_nombre: string;
  categoria: string;
  precio_usd: number | null;
  precio_ars: number;
  stock: number;
}

const CATEGORIAS_MARKETPLACE = [
  { id: "todos", label: "Todos" },
  { id: "autopartes", label: "Autopartes" },
  { id: "herramientas", label: "Herramientas" },
  { id: "electronica", label: "Electrónica" },
  { id: "hogar", label: "Hogar" },
  { id: "indumentaria", label: "Indumentaria" },
];

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  );
}


const CATEGORY_BG: Record<string, string> = {
  autopartes: "linear-gradient(145deg, #1d2b3a 0%, #2d4052 100%)",
  herramientas: "linear-gradient(145deg, #374151 0%, #4b5f6e 100%)",
  electronica: "linear-gradient(145deg, #1e3a5f 0%, #1d4ed8 100%)",
  hogar: "linear-gradient(145deg, #312e81 0%, #4338ca 100%)",
  indumentaria: "linear-gradient(145deg, #4c1d95 0%, #7c3aed 100%)",
};


function formatARS(n: number) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);
}

export default function ListingGrid({ listings: allListings }: { listings: ListingDB[] }) {
  const [categoriaActiva, setCategoriaActiva] = useState("todos");
  const [query, setQuery] = useState("");

  const listings = allListings
    .filter((l) => categoriaActiva === "todos" || l.categoria === categoriaActiva)
    .filter((l) => {
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return (
        l.nombre.toLowerCase().includes(q) ||
        (l.descripcion ?? "").toLowerCase().includes(q) ||
        l.vendedor_nombre.toLowerCase().includes(q)
      );
    });

  return (
    <div className={styles.wrapper}>
      <div className={styles.searchRow}>
        <div className={styles.searchWrapper}>
          <SearchIcon />
          <input
            className={styles.searchInput}
            type="search"
            placeholder="Buscar producto o vendedor..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Buscar en el marketplace"
          />
        </div>
      </div>

      <div className={styles.filterBar}>
        <div className={styles.filterTabs}>
          {CATEGORIAS_MARKETPLACE.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              className={categoriaActiva === id ? `${styles.tab} ${styles.tabActive}` : styles.tab}
              onClick={() => setCategoriaActiva(id)}
            >
              {label}
            </button>
          ))}
        </div>
        <p className={styles.count}>{listings.length} {listings.length === 1 ? "producto" : "productos"}</p>
      </div>

      {listings.length === 0 && (
        <div className={styles.empty}>
          <p>No hay productos en esta categoría todavía.</p>
        </div>
      )}
      <div className={styles.grid}>
        {listings.map((listing) => (
          <div key={listing.id} className={styles.card}>
            <div className={styles.imageArea} style={{ background: CATEGORY_BG[listing.categoria] ?? CATEGORY_BG.herramientas }}>
              <span className={styles.commissionBadge}>8–12% comisión</span>
            </div>

            <div className={styles.content}>
              <div className={styles.vendedor}>
                <div className={styles.vendedorAvatar}>
                  {listing.vendedor_nombre.charAt(0).toUpperCase()}
                </div>
                <span>{listing.vendedor_nombre}</span>
              </div>

              <h3 className={styles.nombre}>{listing.nombre}</h3>
              <p className={styles.descripcion}>{listing.descripcion}</p>

              <div className={styles.bottom}>
                <span className={styles.price}>{formatARS(listing.precio_ars)}</span>
                <Link href={`/marketplace/${listing.id}`} className={styles.btnVer}>Ver producto</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
