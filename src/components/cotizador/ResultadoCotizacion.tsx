import type { CotizacionDesglose } from "@/lib/cotizador/types";
import { formatUSD as usd, formatARS as ars } from "@/lib/utils/format";
import styles from "./ResultadoCotizacion.module.css";

interface Props {
  desglose: CotizacionDesglose;
  cotizacionId: string | null;
  miamAddress?: string;
}

export default function ResultadoCotizacion({ desglose, cotizacionId, miamAddress }: Props) {
  const ctaHref = cotizacionId ? `/solicitar/${cotizacionId}` : "/login";
  const esForwarding = desglose.tipoServicio === "forwarding";
  const feePercent   = Math.round(desglose.feeRatio * 100);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.headerTitle}>
          {esForwarding ? "Costo del servicio de envío" : "Desglose del costo estimado"}
        </h3>
        <div className={styles.badges}>
          {esForwarding && (
            <span className={styles.forwardingBadge}>📦 Forwarding · Fee {feePercent}%</span>
          )}
          {!esForwarding && desglose.tipoImportacion === "mayorista" && (
            <span className={styles.mayoristaBadge}>B2B · Tarifa mayorista {feePercent}%</span>
          )}
        </div>
      </div>

      {/* Total hero */}
      <div className={styles.totalHero}>
        <span className={styles.totalHeroLabel}>
          {esForwarding ? "Total del servicio (logística)" : "Total estimado"}
        </span>
        <span className={styles.totalHeroArs}>{ars(desglose.totalArs)}</span>
        <span className={styles.totalHeroUsd}>
          = {usd(desglose.total)} · Dólar blue {ars(desglose.tipoCambio)}
        </span>
        {esForwarding && (
          <span className={styles.totalHeroNote}>El precio del producto no está incluido (ya lo pagaste vos)</span>
        )}
      </div>

      <div className={styles.body}>
        <table className={styles.table}>
          <tbody>
            {esForwarding ? (
              <tr>
                <td>
                  Valor declarado del producto
                  <span className={styles.subtext}>base para cálculo de aranceles</span>
                </td>
                <td className={styles.valorDeclarado}>{usd(desglose.precioProducto)}</td>
              </tr>
            ) : (
              <tr>
                <td>Precio del producto</td>
                <td>{usd(desglose.precioProducto)}</td>
              </tr>
            )}
            <tr>
              <td>
                Flete internacional
                <span className={styles.subtext}>{desglose.pesoFacturable} kg facturables</span>
              </td>
              <td>{usd(desglose.costoFlete)}</td>
            </tr>
            <tr>
              <td>Arancel de importación</td>
              <td>{usd(desglose.arancelImportacion)}</td>
            </tr>
            <tr>
              <td>IVA de importación (21%)</td>
              <td>{usd(desglose.ivaImportacion)}</td>
            </tr>
            <tr>
              <td>Tasa estadística (3%)</td>
              <td>{usd(desglose.tasaEstadistica)}</td>
            </tr>
            <tr>
              <td>
                Fee del servicio
                <span className={styles.subtext}>
                  {esForwarding ? "handling, aduana y entrega" : "incluye cobertura cambiaria"}
                </span>
              </td>
              <td>{usd(desglose.feeServicio)}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr className={styles.totalRow}>
              <td>{esForwarding ? "Total a pagarnos a nosotros" : "Total en USD"}</td>
              <td>{usd(desglose.total)}</td>
            </tr>
          </tfoot>
        </table>

        {/* Dirección Miami para forwarding */}
        {esForwarding && miamAddress && (
          <div className={styles.miamiBox}>
            <div className={styles.miamiTitle}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              Enviá tu paquete a nuestra dirección en Miami
            </div>
            <p className={styles.miamiAddress}>{miamAddress}</p>
            <p className={styles.miamiNote}>La dirección completa con tu código se confirma por email al aprobar.</p>
          </div>
        )}

        <p className={styles.disclaimer}>
          {esForwarding
            ? "Precio estimado sujeto a revisión. Puede variar ±5% según tipo de cambio al momento del despacho."
            : "Precio estimado. Puede variar ±5% según el tipo de cambio al momento del despacho. Tiempo estimado de entrega: 15–25 días hábiles."}
        </p>

        <a href={ctaHref} className={styles.btnCta}>
          {esForwarding ? "Solicitar servicio de envío →" : "Solicitar importación →"}
        </a>
      </div>
    </div>
  );
}
