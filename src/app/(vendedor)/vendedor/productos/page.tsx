import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { toggleListingActivo, eliminarListing } from "./actions";
import { obtenerTipoCambio } from "@/lib/utils/exchange-rate";
import ListingForm from "./ListingForm";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "Mis productos | Hornet Imports" };

function formatUSD(n: number | null) {
  if (!n) return "—";
  return `USD ${n.toFixed(2)}`;
}

function formatARS(n: number) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);
}

export default async function VendedorProductosPage({
  searchParams,
}: {
  searchParams: Promise<{ modo?: string; editar?: string }>;
}) {
  const { modo, editar } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: listings }, tipoCambio] = await Promise.all([
    supabase
      .from("listings")
      .select("id, nombre, descripcion, categoria, precio_usd, precio_ars, stock, activo")
      .eq("vendedor_id", user!.id)
      .order("created_at", { ascending: false }),
    obtenerTipoCambio(),
  ]);

  const rows = listings ?? [];
  const listingEditar = editar ? rows.find((l) => l.id === editar) ?? null : null;
  const mostrarFormulario = modo === "nuevo" || !!listingEditar;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Mis productos</h1>
          <p className={styles.subtitle}>
            {rows.filter((l) => l.activo).length} activos · {rows.length} publicados
          </p>
        </div>
        <Link
          href={mostrarFormulario ? "/vendedor/productos" : "/vendedor/productos?modo=nuevo"}
          className={mostrarFormulario ? styles.btnSecondary : styles.btnPrimary}
        >
          {mostrarFormulario ? "Cancelar" : "+ Nuevo producto"}
        </Link>
      </div>

      {mostrarFormulario && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            {listingEditar ? `Editando: ${listingEditar.nombre}` : "Nuevo producto"}
          </h2>
          <ListingForm listing={listingEditar ?? undefined} tipoCambio={tipoCambio} />
        </div>
      )}

      {rows.length === 0 && !mostrarFormulario ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyTitle}>Todavía no publicaste productos</p>
          <p className={styles.emptySubtitle}>
            Tus productos aparecerán en el marketplace visible para todos los compradores.
          </p>
          <Link href="/vendedor/productos?modo=nuevo" className={styles.btnPrimary}>
            + Publicar primer producto
          </Link>
        </div>
      ) : (
        <div className={styles.section}>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Precio USD</th>
                  <th>Precio ARS</th>
                  <th>Stock</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((l) => (
                  <tr key={l.id} className={!l.activo ? styles.trInactivo : undefined}>
                    <td className={styles.tdNombre}>{l.nombre}</td>
                    <td className={styles.tdCategoria}>{l.categoria}</td>
                    <td className={styles.tdPrecio}>{formatUSD(l.precio_usd)}</td>
                    <td className={styles.tdPrecio}>{formatARS(l.precio_ars)}</td>
                    <td className={styles.tdNum}>{l.stock}</td>
                    <td>
                      <span className={l.activo ? styles.chipActivo : styles.chipInactivo}>
                        {l.activo ? "Visible" : "Oculto"}
                      </span>
                    </td>
                    <td>
                      <div className={styles.rowActions}>
                        <Link href={`/vendedor/productos?editar=${l.id}`} className={styles.btnEdit}>
                          Editar
                        </Link>
                        <form action={toggleListingActivo.bind(null, l.id, l.activo)}>
                          <button type="submit" className={styles.btnToggle}>
                            {l.activo ? "Ocultar" : "Publicar"}
                          </button>
                        </form>
                        <form
                          action={eliminarListing.bind(null, l.id)}
                          onSubmit={(e) => {
                            if (!confirm(`¿Eliminar "${l.nombre}"?`)) e.preventDefault();
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
      )}
    </div>
  );
}
