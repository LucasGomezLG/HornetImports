"use client";

import { useState } from "react";
import Link from "next/link";
import type { EstadoPedido } from "@/lib/supabase/types";
import type { Database } from "@/lib/supabase/types";
import styles from "./page.module.css";

type PedidoRow = Database["public"]["Tables"]["pedidos"]["Row"];

const FILTERS: { id: EstadoPedido | "todos"; label: string }[] = [
  { id: "todos",       label: "Todos" },
  { id: "en_proceso",  label: "En proceso" },
  { id: "comprado",    label: "Comprado" },
  { id: "en_transito", label: "En tránsito" },
  { id: "en_aduana",   label: "En aduana" },
  { id: "entregado",   label: "Entregado" },
  { id: "cancelado",   label: "Cancelado" },
];

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

const PAGE_SIZE = 8;

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

export default function PedidosList({ pedidos }: { pedidos: PedidoRow[] }) {
  const [filtro, setFiltro] = useState<EstadoPedido | "todos">("todos");
  const [page, setPage] = useState(0);

  const filtered = filtro === "todos" ? pedidos : pedidos.filter((p) => p.estado === filtro);
  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
  const visible = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  function handleFilter(f: EstadoPedido | "todos") {
    setFiltro(f);
    setPage(0);
  }

  if (pedidos.length === 0) {
    return (
      <div className={styles.empty}>
        <p>Todavía no tenés pedidos.</p>
        <Link href="/cotizar" className={styles.btnNuevo} style={{ display: "inline-block", marginTop: "1rem" }}>
          Cotizá tu primer importación →
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className={styles.filterTabs}>
        {FILTERS.map(({ id, label }) => {
          const count = id === "todos" ? pedidos.length : pedidos.filter((p) => p.estado === id).length;
          if (count === 0 && id !== "todos") return null;
          return (
            <button
              key={id}
              type="button"
              className={`${styles.tab} ${filtro === id ? styles.tabActive : ""}`}
              onClick={() => handleFilter(id)}
            >
              {label}
              <span className={styles.tabCount}>{count}</span>
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <div className={styles.empty}>
          <p>No hay pedidos con ese estado.</p>
        </div>
      ) : (
        <div className={styles.orderList}>
          {visible.map((order) => (
            <div key={order.id} className={styles.orderCard}>
              <div className={styles.orderTop}>
                <div className={styles.orderMeta}>
                  <span className={styles.orderId}>{order.id}</span>
                  <span className={`${styles.statusChip} ${styles[`status_${STATUS_COLOR[order.estado]}`]}`}>
                    {STATUS_LABEL[order.estado]}
                  </span>
                </div>
                <span className={styles.orderPrecio}>{formatUSD(order.precio_usd)}</span>
              </div>

              <h3 className={styles.orderProducto}>{order.producto_nombre}</h3>

              <div className={styles.orderDetails}>
                <span className={styles.orderDetail}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  {formatDate(order.created_at)}
                </span>
                {order.origen && (
                  <span className={styles.orderDetail}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/>
                    </svg>
                    Origen: {order.origen}
                  </span>
                )}
                {order.tracking_code && (
                  <span className={styles.orderDetail}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                    </svg>
                    {order.tracking_code}
                  </span>
                )}
              </div>

              {order.tracking_code && (
                <div className={styles.orderActions}>
                  <Link href={`/seguimiento?code=${order.tracking_code}`} className={styles.btnTracking}>
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

      {pageCount > 1 && (
        <div className={styles.pagination}>
          <button
            type="button"
            className={styles.pageBtn}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
          >
            ← Anterior
          </button>
          <span className={styles.pageInfo}>
            Página {page + 1} de {pageCount}
          </span>
          <button
            type="button"
            className={styles.pageBtn}
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            disabled={page >= pageCount - 1}
          >
            Siguiente →
          </button>
        </div>
      )}
    </>
  );
}
