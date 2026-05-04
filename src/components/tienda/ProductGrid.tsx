"use client";

import { useState } from "react";
import {
  PRODUCTOS_MOCK,
  CATEGORIAS_TIENDA,
} from "@/lib/tienda/productos-mock";
import ProductCard from "./ProductCard";
import styles from "./ProductGrid.module.css";

export default function ProductGrid() {
  const [categoriaActiva, setCategoriaActiva] = useState("todos");
  const [query, setQuery] = useState("");

  const productos = PRODUCTOS_MOCK
    .filter((p) => categoriaActiva === "todos" || p.categoria === categoriaActiva)
    .filter((p) => {
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return (
        p.nombre.toLowerCase().includes(q) ||
        p.descripcion.toLowerCase().includes(q)
      );
    });

  return (
    <div className={styles.wrapper}>
      {/* Búsqueda */}
      <div className={styles.searchRow}>
        <div className={styles.searchWrapper}>
          <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            className={styles.searchInput}
            type="search"
            placeholder="Buscar producto..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Buscar productos"
          />
        </div>
      </div>

      {/* Filtros */}
      <div className={styles.filterBar}>
        <div className={styles.filterTabs}>
          {CATEGORIAS_TIENDA.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              className={
                categoriaActiva === id
                  ? `${styles.tab} ${styles.tabActive}`
                  : styles.tab
              }
              onClick={() => setCategoriaActiva(id)}
            >
              {label}
            </button>
          ))}
        </div>
        <p className={styles.count}>
          {productos.length}{" "}
          {productos.length === 1 ? "producto" : "productos"}
        </p>
      </div>

      {/* Grid */}
      {productos.length > 0 ? (
        <div className={styles.grid}>
          {productos.map((producto) => (
            <ProductCard key={producto.id} producto={producto} />
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          <p>No hay productos en esta categoría todavía.</p>
        </div>
      )}
    </div>
  );
}
