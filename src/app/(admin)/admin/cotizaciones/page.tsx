import type { Metadata } from "next";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "Cotizaciones | Admin Hornet Imports" };

const COTIZACIONES_MOCK = [
  { id: "COT-0048", usuario: "martin.g@gmail.com", producto: "Monitor LG 27\" 4K IPS", precioUsd: 320, peso: 6.5, categoria: "electronica", estado: "pendiente", fecha: "2026-05-04" },
  { id: "COT-0047", usuario: "ana.lopez@outlook.com", producto: "Amortiguadores Monroe Ford Focus", precioUsd: 145, peso: 8.2, categoria: "autopartes", estado: "pendiente", fecha: "2026-05-04" },
  { id: "COT-0046", usuario: "lucas.s@gmail.com", producto: "Tablet Xiaomi Pad 6 Pro 256GB", precioUsd: 390, peso: 0.9, categoria: "electronica", estado: "aprobada", fecha: "2026-05-03" },
  { id: "COT-0045", usuario: "carla.m@hotmail.com", producto: "Silla ergonómica Secretlab Titan", precioUsd: 480, peso: 25, categoria: "hogar", estado: "aprobada", fecha: "2026-05-03" },
  { id: "COT-0044", usuario: "pablo.r@gmail.com", producto: "Cámara GoPro Hero 13", precioUsd: 399, peso: 0.4, categoria: "electronica", estado: "rechazada", fecha: "2026-05-02" },
  { id: "COT-0043", usuario: "sofia.k@gmail.com", producto: "Kit herramientas Stanley 200 piezas", precioUsd: 189, peso: 12, categoria: "herramientas", estado: "expirada", fecha: "2026-04-28" },
];

type EstadoCot = "pendiente" | "aprobada" | "rechazada" | "expirada";

const ESTADO_COLOR: Record<EstadoCot, string> = {
  pendiente: "orange",
  aprobada:  "green",
  rechazada: "red",
  expirada:  "gray",
};

const ESTADO_LABEL: Record<EstadoCot, string> = {
  pendiente: "Pendiente",
  aprobada:  "Aprobada",
  rechazada: "Rechazada",
  expirada:  "Expirada",
};

function formatUSD(n: number) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(n);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-AR", { day: "2-digit", month: "short" });
}

export default function AdminCotizacionesPage() {
  const pendientes = COTIZACIONES_MOCK.filter((c) => c.estado === "pendiente").length;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Cotizaciones</h1>
          <p className={styles.subtitle}>{pendientes} pendientes de respuesta</p>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Producto</th>
                <th>Usuario</th>
                <th>Precio USD</th>
                <th>Peso</th>
                <th>Categoría</th>
                <th>Estado</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {COTIZACIONES_MOCK.map((c) => (
                <tr key={c.id}>
                  <td className={styles.tdId}>{c.id}</td>
                  <td className={styles.tdProducto}>{c.producto}</td>
                  <td className={styles.tdEmail}>{c.usuario}</td>
                  <td className={styles.tdPrecio}>{formatUSD(c.precioUsd)}</td>
                  <td className={styles.tdMuted}>{c.peso} kg</td>
                  <td className={styles.tdMuted}>{c.categoria}</td>
                  <td>
                    <span className={`${styles.statusChip} ${styles[`status_${ESTADO_COLOR[c.estado as EstadoCot]}`]}`}>
                      {ESTADO_LABEL[c.estado as EstadoCot]}
                    </span>
                  </td>
                  <td className={styles.tdMuted}>{formatDate(c.fecha)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
