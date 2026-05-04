import type { Metadata } from "next";
import CotizadorForm from "@/components/cotizador/CotizadorForm";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Cotizador | Hornet Imports",
  description:
    "Calculá el costo total de importar cualquier producto a Argentina: flete, impuestos y fee del servicio incluidos.",
};

export default function CotizarPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Cotizador de importación</h1>
        <p className={styles.subtitle}>
          Pegá el link del producto, completá el peso y las medidas, y te
          calculamos el precio final con flete, impuestos y todo incluido.
        </p>
      </header>
      <CotizadorForm />
    </div>
  );
}
