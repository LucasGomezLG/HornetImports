"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ORDERS_MOCK,
  STATUS_LABEL,
  type OrderStatus,
} from "@/lib/orders-mock";
import styles from "./page.module.css";

const FILTERS: { id: OrderStatus | "todos"; label: string }[] = [
  { id: "todos",       label: "Todos" },
  { id: "en_proceso",  label: "En proceso" },
  { id: "en_transito", label: "En tránsito" },
  { id: "entregado",   label: "Entregado" },
  { id: "cancelado",   label: "Cancelado" },
];

const STATUS_COLOR: Record<OrderStatus, string> = {
  en_proceso:  "orange",
  en_transito: "blue",
  entregado:   "green",
  cancelado:   "red",
};

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

function TrackIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}

export default function PedidosPage() {
  const [filtro, setFiltro] = useState<OrderStatus | "todos">("todos");

  const pedidos =
    filtro === "todos"
      ? ORDERS_MOCK
      : ORDERS_MOCK.filter((o) => o.estado === filtro);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Mis pedidos</h1>
        <Link href="/cotizar" className={styles.btnNuevo}>+ Nueva cotización</Link>
      </div>

      {/* Filtros */}
      <div className={styles.filterTabs}>
        {FILTERS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            className={`${styles.tab} ${filtro === id ? styles.tabActive : ""}`}
            onClick={() => setFiltro(id)}
          >
            {label}
            <span className={styles.tabCount}>
              {id === "todos"
                ? ORDERS_MOCK.length
                : ORDERS_MOCK.filter((o) => o.estado === id).length}
            </span>
          </button>
        ))}
      </div>

      {/* Pedidos */}
      {pedidos.length === 0 ? (
        <div className={styles.empty}>
          <p>No hay pedidos con ese estado.</p>
        </div>
      ) : (
        <div className={styles.orderList}>
          {pedidos.map((order) => (
            <div key={order.id} className={styles.orderCard}>
              <div className={styles.orderTop}>
                <div className={styles.orderMeta}>
                  <span className={styles.orderId}>{order.id}</span>
                  <span className={`${styles.statusChip} ${styles[`status_${STATUS_COLOR[order.estado]}`]}`}>
                    {STATUS_LABEL[order.estado]}
                  </span>
                </div>
                <span className={styles.orderPrecio}>{formatUSD(order.precioUsd)}</span>
              </div>

              <h3 className={styles.orderProducto}>{order.producto}</h3>

              <div className={styles.orderDetails}>
                <span className={styles.orderDetail}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  {formatDate(order.fecha)}
                </span>
                <span className={styles.orderDetail}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/>
                  </svg>
                  Origen: {order.origen}
                </span>
                {order.tracking && (
                  <span className={styles.orderDetail}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                    </svg>
                    {order.tracking}
                  </span>
                )}
              </div>

              {order.tracking && (
                <div className={styles.orderActions}>
                  <Link
                    href={`/seguimiento?code=${order.tracking}`}
                    className={styles.btnTracking}
                  >
                    <TrackIcon />
                    Ver seguimiento
                  </Link>
                </div>
              )}

              {order.estado === "cancelado" && (
                <div className={styles.cancelNote}>
                  Pedido cancelado. Para reordenar,{" "}
                  <Link href="/cotizar" className={styles.cancelLink}>
                    creá una nueva cotización
                  </Link>.
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
