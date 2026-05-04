import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatUSD, formatARS } from "@/lib/utils/format";
import type { CotizacionDesglose } from "@/lib/cotizador/types";
import ConfirmarButton from "./ConfirmarButton";
import styles from "./page.module.css";

export default async function SolicitarPage({
  params,
}: {
  params: Promise<{ cotizacionId: string }>;
}) {
  const { cotizacionId } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect(`/login?redirect=/solicitar/${cotizacionId}`);

  const { data: cotizacion } = await supabase
    .from("cotizaciones")
    .select("*")
    .eq("id", cotizacionId)
    .single();

  if (!cotizacion) notFound();

  if (cotizacion.estado !== "pendiente") {
    redirect("/pedidos");
  }

  const desglose = cotizacion.desglose as unknown as CotizacionDesglose;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <p className={styles.eyebrow}>Confirmá tu importación</p>
          <h1 className={styles.title}>{cotizacion.nombre_producto}</h1>
          {cotizacion.producto_url && (
            <a
              href={cotizacion.producto_url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.productLink}
            >
              Ver producto →
            </a>
          )}
        </div>

        {/* Resumen de costos */}
        <div className={styles.card}>
          <div className={styles.totalHero}>
            <span className={styles.totalLabel}>Total estimado</span>
            <span className={styles.totalArs}>{formatARS(cotizacion.costo_total_ars)}</span>
            <span className={styles.totalUsd}>
              = {formatUSD(desglose?.total ?? cotizacion.precio_usd)} · Dólar blue {formatARS(desglose?.tipoCambio ?? 0)}
            </span>
          </div>

          <div className={styles.desglose}>
            <div className={styles.row}>
              <span>Precio del producto</span>
              <span>{formatUSD(cotizacion.precio_usd)}</span>
            </div>
            {desglose && (
              <>
                <div className={styles.row}>
                  <span>Flete internacional</span>
                  <span>{formatUSD(desglose.costoFlete)}</span>
                </div>
                <div className={styles.row}>
                  <span>Arancel de importación</span>
                  <span>{formatUSD(desglose.arancelImportacion)}</span>
                </div>
                <div className={styles.row}>
                  <span>IVA (21%)</span>
                  <span>{formatUSD(desglose.ivaImportacion)}</span>
                </div>
                <div className={styles.row}>
                  <span>Tasa estadística (3%)</span>
                  <span>{formatUSD(desglose.tasaEstadistica)}</span>
                </div>
                <div className={styles.row}>
                  <span>Fee del servicio</span>
                  <span>{formatUSD(desglose.feeServicio)}</span>
                </div>
                <div className={`${styles.row} ${styles.rowTotal}`}>
                  <span>Total en USD</span>
                  <span>{formatUSD(desglose.total)}</span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className={styles.disclaimer}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          El precio puede variar ±5% según el tipo de cambio al momento del despacho. Tiempo estimado: 15–25 días hábiles.
        </div>

        <ConfirmarButton cotizacionId={cotizacionId} />
      </div>
    </div>
  );
}
