import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatUSDInt, formatDate } from "@/lib/utils/format";
import type { EstadoPedido } from "@/lib/supabase/types";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "Pedidos | Admin Hornet Imports" };

const STATUS_LABEL: Record<EstadoPedido, string> = {
  en_proceso:  "En proceso",
  comprado:    "Comprado",
  en_transito: "En tránsito",
  en_aduana:   "En aduana",
  entregado:   "Entregado",
  cancelado:   "Cancelado",
};

const STATUS_COLOR: Record<EstadoPedido, string> = {
  en_proceso:  "orange",
  comprado:    "purple",
  en_transito: "blue",
  en_aduana:   "yellow",
  entregado:   "green",
  cancelado:   "red",
};

export default async function AdminPedidosPage() {
  const db = createAdminClient();

  const { data: pedidos } = await db
    .from("pedidos")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  const rows = pedidos ?? [];

  // Fetch profile names for user_ids present in pedidos
  const userIds = [...new Set(rows.map((p) => p.user_id))];
  const { data: profiles } = userIds.length > 0
    ? await db.from("profiles").select("id, nombre, apellido").in("id", userIds)
    : { data: [] };
  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Pedidos</h1>
          <p className={styles.subtitle}>{rows.length} pedidos (últimos 100)</p>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Producto</th>
                <th>Comprador</th>
                <th>Origen</th>
                <th>Estado</th>
                <th>Precio</th>
                <th>Tracking</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan={8} className={styles.tdEmpty}>No hay pedidos aún.</td></tr>
              ) : rows.map((order) => {
                const profile = profileMap.get(order.user_id);
                const comprador = profile
                  ? `${profile.nombre ?? ""}${profile.apellido ? ` ${profile.apellido}` : ""}`.trim() || "—"
                  : "—";
                return (
                  <tr key={order.id}>
                    <td className={styles.tdId}>{order.id}</td>
                    <td className={styles.tdProducto}>{order.producto_nombre}</td>
                    <td>{comprador}</td>
                    <td className={styles.tdMuted}>{order.origen ?? "—"}</td>
                    <td>
                      <span className={`${styles.statusChip} ${styles[`status_${STATUS_COLOR[order.estado]}`]}`}>
                        {STATUS_LABEL[order.estado]}
                      </span>
                    </td>
                    <td className={styles.tdPrecio}>{formatUSDInt(order.precio_usd)}</td>
                    <td className={styles.tdTracking}>{order.tracking_code ?? "—"}</td>
                    <td className={styles.tdMuted}>{formatDate(order.created_at, false)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
