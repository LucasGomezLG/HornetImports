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

  const productos =
    categoriaActiva === "todos"
      ? PRODUCTOS_MOCK
      : PRODUCTOS_MOCK.filter((p) => p.categoria === categoriaActiva);

  return (
    <div className={styles.wrapper}>
      {/* Filtros */}
      <div className={styles.filterBar}>
        <div className={styles.filterTabs}>
          {CATEGORIAS_TIENDA.map(({ id, label }) => (
            <button
              key={id}
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
