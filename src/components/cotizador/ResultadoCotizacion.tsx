import type { CotizacionDesglose } from "@/lib/cotizador/types";
import styles from "./ResultadoCotizacion.module.css";

function usd(valor: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency", currency: "USD",
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(valor);
}

function ars(valor: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency", currency: "ARS",
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(valor);
}

interface Props {
  desglose: CotizacionDesglose;
  cotizacionId: string | null;
}

export default function ResultadoCotizacion({ desglose, cotizacionId }: Props) {
  const ctaHref = cotizacionId
    ? `/registro?cotizacion=${cotizacionId}`
    : "/registro";

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.headerTitle}>Desglose del costo estimado</h3>
      </div>

      {/* Total en ARS destacado */}
      <div className={styles.totalHero}>
        <span className={styles.totalHeroLabel}>Total estimado</span>
        <span className={styles.totalHeroArs}>{ars(desglose.totalArs)}</span>
        <span className={styles.totalHeroUsd}>
          = {usd(desglose.total)} · Dólar blue {ars(desglose.tipoCambio)}
        </span>
      </div>

      <div className={styles.body}>
        <table className={styles.table}>
          <tbody>
            <tr>
              <td>Precio del producto</td>
              <td>{usd(desglose.precioProducto)}</td>
            </tr>
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
                <span className={styles.subtext}>incluye cobertura cambiaria</span>
              </td>
              <td>{usd(desglose.feeServicio)}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr className={styles.totalRow}>
              <td>Total en USD</td>
              <td>{usd(desglose.total)}</td>
            </tr>
          </tfoot>
        </table>

        <p className={styles.disclaimer}>
          Precio estimado. Puede variar ±5% según el tipo de cambio al momento del despacho.
          Tiempo estimado de entrega: 15–25 días hábiles.
        </p>

        <a href={ctaHref} className={styles.btnCta}>
          Solicitar importación →
        </a>
      </div>
    </div>
  );
}
