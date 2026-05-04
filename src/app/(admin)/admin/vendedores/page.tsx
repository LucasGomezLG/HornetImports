import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/utils/format";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "Vendedores | Admin Hornet Imports" };

export default async function AdminVendedoresPage() {
  const db = createAdminClient();

  const { data: vendedores } = await db
    .from("profiles")
    .select("*")
    .eq("tipo", "vendedor")
    .order("created_at", { ascending: false });

  const rows = vendedores ?? [];

  // Count listings per vendedor
  const vendedorIds = rows.map((v) => v.id);
  const { data: listings } = vendedorIds.length > 0
    ? await db.from("listings").select("vendedor_id").in("vendedor_id", vendedorIds)
    : { data: [] };
  const listingsCount = new Map<string, number>();
  (listings ?? []).forEach((l) => {
    listingsCount.set(l.vendedor_id, (listingsCount.get(l.vendedor_id) ?? 0) + 1);
  });

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Vendedores</h1>
          <p className={styles.subtitle}>{rows.length} vendedores registrados</p>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>CUIT</th>
                <th>Listings</th>
                <th>Registrado</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan={5} className={styles.tdEmpty}>No hay vendedores registrados aún.</td></tr>
              ) : rows.map((v) => (
                <tr key={v.id}>
                  <td className={styles.tdNombre}>
                    {v.nombre ?? ""}
                    {v.apellido ? ` ${v.apellido}` : ""}
                    {!v.nombre && !v.apellido && <span className={styles.tdMuted}>Sin nombre</span>}
                  </td>
                  <td className={styles.tdEmail}>{v.email}</td>
                  <td className={styles.tdCuit}>{v.cuit ?? "—"}</td>
                  <td className={styles.tdNum}>{listingsCount.get(v.id) ?? 0}</td>
                  <td className={styles.tdMuted}>{formatDate(v.created_at, false)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
