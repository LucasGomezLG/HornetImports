import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatUSDInt, formatDate } from "@/lib/utils/format";
import type { EstadoCotizacion } from "@/lib/supabase/types";
import CotizacionActions from "./CotizacionActions";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "Cotizaciones | Admin Hornet Imports" };

const ESTADO_COLOR: Record<EstadoCotizacion, string> = {
  pendiente: "orange",
  aprobada:  "green",
  rechazada: "red",
  expirada:  "gray",
};

const ESTADO_LABEL: Record<EstadoCotizacion, string> = {
  pendiente: "Pendiente",
  aprobada:  "Aprobada",
  rechazada: "Rechazada",
  expirada:  "Expirada",
};

export default async function AdminCotizacionesPage() {
  const db = createAdminClient();

  const { data: cotizaciones } = await db
    .from("cotizaciones")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  const rows = cotizaciones ?? [];
  const pendientes = rows.filter((c) => c.estado === "pendiente").length;

  // Fetch profile emails for user_ids
  const userIds = [...new Set(rows.map((c) => c.user_id).filter(Boolean))] as string[];
  const { data: profiles } = userIds.length > 0
    ? await db.from("profiles").select("id, email").in("id", userIds)
    : { data: [] };
  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p.email]));

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Cotizaciones</h1>
          <p className={styles.subtitle}>{pendientes} pendientes · {rows.length} total</p>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Usuario</th>
                <th>Precio USD</th>
                <th>Peso</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan={7} className={styles.tdEmpty}>No hay cotizaciones aún.</td></tr>
              ) : rows.map((c) => {
                const email = c.user_id ? profileMap.get(c.user_id) ?? null : null;
                return (
                  <tr key={c.id}>
                    <td className={styles.tdProducto}>
                      {c.nombre_producto}
                      {(c.desglose as { alertaOrigenEuropa?: boolean } | null)?.alertaOrigenEuropa && (
                        <span className={styles.europaTag} title="Revisar ruta — origen Europa">🌍</span>
                      )}
                    </td>
                    <td className={styles.tdEmail}>{email ?? "Anónimo"}</td>
                    <td className={styles.tdPrecio}>{formatUSDInt(c.precio_usd)}</td>
                    <td className={styles.tdMuted}>{c.peso_kg} kg</td>
                    <td>
                      <span className={`${styles.statusChip} ${styles[`status_${ESTADO_COLOR[c.estado]}`]}`}>
                        {ESTADO_LABEL[c.estado]}
                      </span>
                    </td>
                    <td className={styles.tdMuted}>{formatDate(c.created_at, false)}</td>
                    <td>
                      <CotizacionActions
                        cotizacionId={c.id}
                        emailUsuario={email}
                        nombreProducto={c.nombre_producto}
                        estado={c.estado}
                        aprobadaPorAdmin={c.aprobada_por_admin}
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
