import type { Metadata } from "next";
import Link from "next/link";
import { ORDERS_MOCK, STATUS_LABEL, type OrderStatus } from "@/lib/orders-mock";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "Mi cuenta | Hornet Imports" };

function formatUSD(n: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(n);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
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

const activos = ORDERS_MOCK.filter((o) => o.estado === "en_proceso" || o.estado === "en_transito");
const completados = ORDERS_MOCK.filter((o) => o.estado === "entregado");
const gastado = ORDERS_MOCK.filter((o) => o.estado !== "cancelado").reduce((acc, o) => acc + o.precioUsd, 0);

export default function DashboardPage() {
  return (
    <div className={styles.page}>
      {/* Welcome */}
      <div className={styles.welcome}>
        <div className={styles.welcomeAvatar}>C</div>
        <div>
          <h1 className={styles.welcomeTitle}>Hola, Carlos</h1>
          <p className={styles.welcomeSub}>Bienvenido a tu panel de Hornet Imports</p>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Pedidos activos</span>
          <span className={`${styles.statNum} ${styles.statBlue}`}>{activos.length}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Completados</span>
          <span className={`${styles.statNum} ${styles.statGreen}`}>{completados.length}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total gastado</span>
          <span className={styles.statNum}>{formatUSD(gastado)}</span>
        </div>
      </div>

      {/* Recent orders */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Últimos pedidos</h2>
          <Link href="/pedidos" className={styles.sectionLink}>Ver todos →</Link>
        </div>
        <div className={styles.orderList}>
          {ORDERS_MOCK.slice(0, 3).map((order) => (
            <div key={order.id} className={styles.orderCard}>
              <div className={styles.orderLeft}>
                <span className={styles.orderId}>{order.id}</span>
                <p className={styles.orderProducto}>{order.producto}</p>
                <span className={styles.orderFecha}>{formatDate(order.fecha)} · {order.origen}</span>
              </div>
              <div className={styles.orderRight}>
                <span className={`${styles.statusChip} ${styles[`status_${STATUS_COLOR[order.estado]}`]}`}>
                  {STATUS_LABEL[order.estado]}
                </span>
                <span className={styles.orderPrecio}>{formatUSD(order.precioUsd)}</span>
                {order.tracking && (
                  <Link href={`/seguimiento?code=${order.tracking}`} className={styles.trackingBtn}>
                    Ver tracking
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className={styles.actionsGrid}>
        <Link href="/cotizar" className={styles.actionCard}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="8" x2="16" y2="8"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="16" x2="12" y2="16"/>
          </svg>
          <span className={styles.actionLabel}>Nueva cotización</span>
          <span className={styles.actionDesc}>Calculá el costo de importar</span>
        </Link>
        <Link href="/marketplace" className={styles.actionCard}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
          </svg>
          <span className={styles.actionLabel}>Explorar marketplace</span>
          <span className={styles.actionDesc}>Productos de vendedores locales</span>
        </Link>
        <Link href="/seguimiento" className={styles.actionCard}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          <span className={styles.actionLabel}>Seguimiento</span>
          <span className={styles.actionDesc}>Rastreá tu importación</span>
        </Link>
        <Link href="/vender" className={styles.actionCard}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
          </svg>
          <span className={styles.actionLabel}>Publicar productos</span>
          <span className={styles.actionDesc}>Vendé con 8–12% comisión</span>
        </Link>
      </div>
    </div>
  );
}
