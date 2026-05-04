import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { EstadoPedido } from "@/lib/supabase/types";
import { formatUSD, formatDate } from "@/lib/utils/format";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "Mi cuenta | Hornet Imports" };

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

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: pedidos } = await supabase
    .from("pedidos")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  const pedidosData = pedidos ?? [];
  const nombre = profile?.nombre ?? user.email?.split("@")[0] ?? "Usuario";
  const inicial = nombre[0]?.toUpperCase() ?? "U";

  const activos = pedidosData.filter((p) =>
    ["en_proceso", "comprado", "en_transito", "en_aduana"].includes(p.estado)
  ).length;
  const completados = pedidosData.filter((p) => p.estado === "entregado").length;
  const gastado = pedidosData
    .filter((p) => p.estado !== "cancelado")
    .reduce((acc, p) => acc + p.precio_usd, 0);

  const perfilIncompleto = !profile?.telefono;

  return (
    <div className={styles.page}>
      {perfilIncompleto && (
        <a href="/perfil" className={styles.perfilBanner}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>Completá tu perfil — agregá tu WhatsApp para que podamos contactarte más rápido.</span>
          <span className={styles.perfilBannerCta}>Completar →</span>
        </a>
      )}

      <div className={styles.welcome}>
        <div className={styles.welcomeAvatar}>{inicial}</div>
        <div>
          <h1 className={styles.welcomeTitle}>Hola, {nombre}</h1>
          <p className={styles.welcomeSub}>Bienvenido a tu panel de Hornet Imports</p>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Pedidos activos</span>
          <span className={`${styles.statNum} ${styles.statBlue}`}>{activos}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Completados</span>
          <span className={`${styles.statNum} ${styles.statGreen}`}>{completados}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total gastado</span>
          <span className={styles.statNum}>{formatUSD(gastado)}</span>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Últimos pedidos</h2>
          <Link href="/pedidos" className={styles.sectionLink}>Ver todos →</Link>
        </div>

        {pedidosData.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>Todavía no tenés pedidos.</p>
            <Link href="/cotizar" className={styles.emptyBtn}>Cotizá tu primer importación →</Link>
          </div>
        ) : (
          <div className={styles.orderList}>
            {pedidosData.slice(0, 3).map((order) => (
              <div key={order.id} className={styles.orderCard}>
                <div className={styles.orderLeft}>
                  <span className={styles.orderId}>{order.id}</span>
                  <p className={styles.orderProducto}>{order.producto_nombre}</p>
                  <span className={styles.orderFecha}>
                    {formatDate(order.created_at)}{order.origen ? ` · ${order.origen}` : ""}
                  </span>
                </div>
                <div className={styles.orderRight}>
                  <span className={`${styles.statusChip} ${styles[`status_${STATUS_COLOR[order.estado]}`]}`}>
                    {STATUS_LABEL[order.estado]}
                  </span>
                  <span className={styles.orderPrecio}>{formatUSD(order.precio_usd)}</span>
                  {order.tracking_code && (
                    <Link href={`/seguimiento?code=${order.tracking_code}`} className={styles.trackingBtn}>
                      Ver tracking
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
