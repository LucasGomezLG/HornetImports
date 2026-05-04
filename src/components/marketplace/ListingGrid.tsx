"use client";

import { useState } from "react";
import { LISTINGS_MOCK, CATEGORIAS_MARKETPLACE } from "@/lib/marketplace/listings-mock";
import styles from "./ListingGrid.module.css";

function StarIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
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

function formatUSD(n: number) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(n);
}

export default function ListingGrid() {
  const [categoriaActiva, setCategoriaActiva] = useState("todos");

  const listings =
    categoriaActiva === "todos"
      ? LISTINGS_MOCK
      : LISTINGS_MOCK.filter((l) => l.categoria === categoriaActiva);

  return (
    <div className={styles.wrapper}>
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

      <div className={styles.grid}>
        {listings.map((listing) => (
          <div key={listing.id} className={styles.card}>
            <div className={styles.imageArea} style={{ background: CATEGORY_BG[listing.categoria] ?? CATEGORY_BG.herramientas }}>
              <span className={styles.commissionBadge}>8–12% comisión</span>
            </div>

            <div className={styles.content}>
              <div className={styles.vendedor}>
                <div className={styles.vendedorAvatar}>
                  {listing.vendedor.charAt(0)}
                </div>
                <span>{listing.vendedor}</span>
                <div className={styles.stars}>
                  {Array.from({ length: listing.calificacion }).map((_, i) => (
                    <span key={i} className={styles.star}><StarIcon /></span>
                  ))}
                </div>
              </div>

              <h3 className={styles.nombre}>{listing.nombre}</h3>
              <p className={styles.descripcion}>{listing.descripcion}</p>

              <div className={styles.bottom}>
                <span className={styles.price}>{formatUSD(listing.precioUsd)}</span>
                <a href="/registro" className={styles.btnVer}>Ver producto</a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
