import type { Metadata } from "next";
import Link from "next/link";
import {
  ORDERS_MOCK,
  ADMIN_STATS,
  STATUS_LABEL,
  type OrderStatus,
} from "@/lib/orders-mock";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "Admin | Hornet Imports" };

function formatUSD(n: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(n);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
  });
}

const STATUS_COLOR: Record<OrderStatus, string> = {
  en_proceso:  "orange",
  comprado:    "purple",
  en_transito: "blue",
  en_aduana:   "yellow",
  entregado:   "green",
  cancelado:   "red",
};

export default function AdminPage() {
  const recent = ORDERS_MOCK.slice(0, 5);

  return (
    <div className={styles.page}>
      {/* Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Pedidos hoy</span>
          <span className={styles.statNum}>{ADMIN_STATS.pedidosHoy}</span>
          <span className={styles.statNote}>+2 vs ayer</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Ingresos del mes</span>
          <span className={styles.statNum}>{formatUSD(ADMIN_STATS.ingresosUsd)}</span>
          <span className={styles.statNote}>USD</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Vendedores activos</span>
          <span className={styles.statNum}>{ADMIN_STATS.vendedoresActivos}</span>
          <span className={styles.statNote}>+1 este mes</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Cotizaciones pendientes</span>
          <span className={`${styles.statNum} ${styles.statNumWarning}`}>
            {ADMIN_STATS.cotizacionesPendientes}
          </span>
          <span className={styles.statNote}>Sin responder</span>
        </div>
      </div>

      {/* Recent orders */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Pedidos recientes</h2>
          <Link href="/admin/pedidos" className={styles.sectionLink}>
            Ver todos →
          </Link>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Producto</th>
                <th>Comprador</th>
                <th>Estado</th>
                <th>Precio</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((order) => (
                <tr key={order.id}>
                  <td className={styles.tdId}>{order.id}</td>
                  <td className={styles.tdProducto}>
                    <span>{order.producto}</span>
                    <span className={styles.origen}>{order.origen}</span>
                  </td>
                  <td className={styles.tdComprador}>{order.comprador}</td>
                  <td>
                    <span className={`${styles.statusChip} ${styles[`status_${STATUS_COLOR[order.estado]}`]}`}>
                      {STATUS_LABEL[order.estado]}
                    </span>
                  </td>
                  <td className={styles.tdPrecio}>{formatUSD(order.precioUsd)}</td>
                  <td className={styles.tdFecha}>{formatDate(order.fecha)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick actions */}
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
