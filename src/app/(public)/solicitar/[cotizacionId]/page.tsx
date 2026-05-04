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

        <a
          href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5491100000000"}?text=${encodeURIComponent(`Hola! Tengo una consulta sobre mi importación de ${cotizacion.nombre_producto}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.whatsappLink}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.554 4.121 1.522 5.855L.057 23.704a.5.5 0 00.61.636l5.982-1.437A11.944 11.944 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.891 0-3.666-.51-5.192-1.399l-.372-.22-3.853.926.963-3.739-.242-.387A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
          </svg>
          ¿Tenés dudas? Consultanos por WhatsApp
        </a>
      </div>
    </div>
  );
}
