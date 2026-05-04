import type { Metadata } from "next";
import { ORDERS_MOCK, STATUS_LABEL, type OrderStatus } from "@/lib/orders-mock";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "Pedidos | Admin Hornet Imports" };

function formatUSD(n: number) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(n);
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" });
}

const STATUS_COLOR: Record<OrderStatus, string> = {
  en_proceso:  "orange",
  comprado:    "purple",
  en_transito: "blue",
  en_aduana:   "yellow",
  entregado:   "green",
  cancelado:   "red",
};

export default function AdminPedidosPage() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Pedidos</h1>
          <p className={styles.subtitle}>{ORDERS_MOCK.length} pedidos en total</p>
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
              {ORDERS_MOCK.map((order) => (
                <tr key={order.id}>
                  <td className={styles.tdId}>{order.id}</td>
                  <td className={styles.tdProducto}>{order.producto}</td>
                  <td>{order.comprador}</td>
                  <td className={styles.tdMuted}>{order.origen}</td>
                  <td>
                    <span className={`${styles.statusChip} ${styles[`status_${STATUS_COLOR[order.estado]}`]}`}>
                      {STATUS_LABEL[order.estado]}
                    </span>
                  </td>
                  <td className={styles.tdPrecio}>{formatUSD(order.precioUsd)}</td>
                  <td className={styles.tdTracking}>{order.tracking || "—"}</td>
                  <td className={styles.tdMuted}>{formatDate(order.fecha)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
