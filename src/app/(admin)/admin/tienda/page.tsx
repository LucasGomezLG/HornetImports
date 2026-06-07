import type { Metadata } from "next";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { toggleActivo, eliminarProducto } from "./actions";
import TiendaProductForm from "./TiendaProductForm";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "Tienda · Productos | Admin Hornet Imports" };

function formatUSD(n: number) {
  return `USD ${n.toFixed(2)}`;
}

export default async function AdminTiendaPage({
  searchParams,
}: {
  searchParams: Promise<{ modo?: string; editar?: string }>;
}) {
  const { modo, editar } = await searchParams;
  const db = createAdminClient();

  const { data: productos } = await db
    .from("tienda_productos")
    .select("*")
    .order("activo", { ascending: false })
    .order("nombre");

  const rows = productos ?? [];

  const productoEditar = editar
    ? rows.find((p) => p.id === editar) ?? null
    : null;

  const mostrarFormulario = modo === "nuevo" || !!productoEditar;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Tienda · Productos</h1>
          <p className={styles.subtitle}>{rows.filter((p) => p.activo).length} activos · {rows.length} total</p>
        </div>
        <Link
          href={mostrarFormulario ? "/admin/tienda" : "/admin/tienda?modo=nuevo"}
          className={mostrarFormulario ? styles.btnSecondary : styles.btnPrimary}
        >
          {mostrarFormulario ? "Cancelar" : "+ Agregar producto"}
        </Link>
      </div>

      {mostrarFormulario && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            {productoEditar ? `Editando: ${productoEditar.nombre}` : "Nuevo producto"}
          </h2>
          <TiendaProductForm producto={productoEditar ?? undefined} />
        </div>
      )}

      <div className={styles.section}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Precio USD</th>
                <th>Stock</th>
                <th>Destacado</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan={7} className={styles.tdEmpty}>No hay productos. Agregá el primero.</td></tr>
              ) : rows.map((p) => (
                <tr key={p.id} className={!p.activo ? styles.trInactivo : undefined}>
                  <td className={styles.tdNombre}>{p.nombre}</td>
                  <td className={styles.tdCategoria}>{p.categoria}</td>
                  <td className={styles.tdPrecio}>{formatUSD(p.precio_usd)}</td>
                  <td className={styles.tdNum}>{p.stock}</td>
                  <td className={styles.tdCenter}>{p.destacado ? "⭐" : "—"}</td>
                  <td>
                    <span className={p.activo ? styles.chipActivo : styles.chipInactivo}>
                      {p.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td>
                    <div className={styles.rowActions}>
                      <Link href={`/admin/tienda?editar=${p.id}`} className={styles.btnEdit}>Editar</Link>
                      <form action={toggleActivo.bind(null, p.id, p.activo)}>
                        <button type="submit" className={styles.btnToggle}>
                          {p.activo ? "Desactivar" : "Activar"}
                        </button>
                      </form>
                      <form action={eliminarProducto.bind(null, p.id)}
                        onSubmit={(e) => {
                          if (!confirm(`¿Eliminar "${p.nombre}"?`)) e.preventDefault();
                        }}
                      >
                        <button type="submit" className={styles.btnDelete}>Eliminar</button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
