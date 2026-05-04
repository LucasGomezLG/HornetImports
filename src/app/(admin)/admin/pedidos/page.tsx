import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatUSDInt, formatDate } from "@/lib/utils/format";
import type { EstadoPedido } from "@/lib/supabase/types";
import PedidoActions from "./PedidoActions";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "Pedidos | Admin Hornet Imports" };

const ESTADOS: { value: EstadoPedido | "todos"; label: string }[] = [
  { value: "todos",       label: "Todos" },
  { value: "en_proceso",  label: "En proceso" },
  { value: "comprado",    label: "Comprado" },
  { value: "en_transito", label: "En tránsito" },
  { value: "en_aduana",   label: "En aduana" },
  { value: "entregado",   label: "Entregado" },
  { value: "cancelado",   label: "Cancelado" },
];

export default async function AdminPedidosPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const { estado } = await searchParams;
  const filtroActivo = (estado && estado !== "todos") ? estado as EstadoPedido : null;

  const db = createAdminClient();

  let query = db
    .from("pedidos")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (filtroActivo) {
    query = query.eq("estado", filtroActivo);
  }

  const { data: pedidos } = await query;
  const rows = pedidos ?? [];

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
          <p className={styles.subtitle}>
            {filtroActivo ? `${rows.length} pedidos · filtro: ${filtroActivo.replace("_", " ")}` : `${rows.length} pedidos (últimos 200)`}
          </p>
        </div>
      </div>

      {/* Filtros por estado */}
      <div className={styles.filtros}>
        {ESTADOS.map(({ value, label }) => {
          const isActive = (filtroActivo ?? "todos") === value;
          return (
            <a
              key={value}
              href={value === "todos" ? "/admin/pedidos" : `/admin/pedidos?estado=${value}`}
              className={`${styles.filtroTab} ${isActive ? styles.filtroTabActive : ""}`}
            >
              {label}
            </a>
          );
        })}
      </div>

      <div className={styles.section}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Producto</th>
                <th>Comprador</th>
                <th>Precio</th>
                <th>Fecha</th>
                <th>Estado / Tracking</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan={6} className={styles.tdEmpty}>No hay pedidos para este filtro.</td></tr>
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
                    <td className={styles.tdPrecio}>{formatUSDInt(order.precio_usd)}</td>
                    <td className={styles.tdMuted}>{formatDate(order.created_at, false)}</td>
                    <td>
                      <PedidoActions
                        pedidoId={order.id}
                        estadoInicial={order.estado}
                        trackingInicial={order.tracking_code ?? null}
                      />
                    </td>
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
