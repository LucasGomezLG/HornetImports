import type { Metadata } from "next";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatUSDInt, formatDate } from "@/lib/utils/format";
import type { EstadoPedido } from "@/lib/supabase/types";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "Admin | Hornet Imports" };

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

export default async function AdminPage() {
  const db = createAdminClient();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const [
    { count: pedidosHoy },
    { data: pedidosMes },
    { count: vendedores },
    { count: cotizacionesPendientes },
    { data: recent },
  ] = await Promise.all([
    db.from("pedidos").select("id", { count: "exact", head: true }).gte("created_at", today.toISOString()),
    db.from("pedidos").select("precio_usd").gte("created_at", monthStart.toISOString()).neq("estado", "cancelado"),
    db.from("profiles").select("id", { count: "exact", head: true }).eq("tipo", "vendedor"),
    db.from("cotizaciones").select("id", { count: "exact", head: true }).eq("estado", "pendiente"),
    db.from("pedidos").select("*").order("created_at", { ascending: false }).limit(5),
  ]);

  const ingresosUsd = (pedidosMes ?? []).reduce((sum, p) => sum + p.precio_usd, 0);

  return (
    <div className={styles.page}>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Pedidos hoy</span>
          <span className={styles.statNum}>{pedidosHoy ?? 0}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Ingresos del mes</span>
          <span className={styles.statNum}>{formatUSDInt(ingresosUsd)}</span>
          <span className={styles.statNote}>pedidos no cancelados</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Vendedores activos</span>
          <span className={styles.statNum}>{vendedores ?? 0}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Cotizaciones pendientes</span>
          <span className={`${styles.statNum} ${styles.statNumWarning}`}>
            {cotizacionesPendientes ?? 0}
          </span>
          <span className={styles.statNote}>Sin responder</span>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Pedidos recientes</h2>
          <Link href="/admin/pedidos" className={styles.sectionLink}>Ver todos →</Link>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Producto</th>
                <th>Estado</th>
                <th>Precio</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {(recent ?? []).length === 0 ? (
                <tr><td colSpan={5} className={styles.tdEmpty}>No hay pedidos aún.</td></tr>
              ) : (recent ?? []).map((order) => (
                <tr key={order.id}>
                  <td className={styles.tdId}>{order.id}</td>
                  <td className={styles.tdProducto}>
                    <span>{order.producto_nombre}</span>
                    {order.origen && <span className={styles.origen}>{order.origen}</span>}
                  </td>
                  <td>
                    <span className={`${styles.statusChip} ${styles[`status_${STATUS_COLOR[order.estado]}`]}`}>
                      {STATUS_LABEL[order.estado]}
                    </span>
                  </td>
                  <td className={styles.tdPrecio}>{formatUSDInt(order.precio_usd)}</td>
                  <td className={styles.tdFecha}>{formatDate(order.created_at, false)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Acciones rápidas</h2>
        <div className={styles.actionsGrid}>
          <Link href="/admin/vendedores" className={styles.actionCard}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
            </svg>
            <span>Gestionar vendedores</span>
          </Link>
          <Link href="/admin/cotizaciones" className={styles.actionCard}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="8" x2="16" y2="8"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="16" x2="12" y2="16"/>
            </svg>
            <span>Ver cotizaciones</span>
          </Link>
          <Link href="/admin/pedidos" className={styles.actionCard}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v4h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
            </svg>
            <span>Todos los pedidos</span>
          </Link>
          <Link href="/cotizar" className={styles.actionCard}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
            <span>Nueva cotización</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
