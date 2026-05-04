import type { Metadata } from "next";
import TrackingForm from "@/components/seguimiento/TrackingForm";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Seguimiento | Hornet Imports",
  description: "Rastreá el estado de tu importación en tiempo real.",
};

export default function SeguimientoPage() {
  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>Seguimiento</p>
          <h1 className={styles.title}>¿Dónde está tu paquete?</h1>
          <p className={styles.subtitle}>
            Ingresá tu número de orden y te mostramos el estado en tiempo real,
            desde el envío en origen hasta la entrega en tu puerta.
          </p>
        </div>
      </section>

      <section className={styles.trackSection}>
        <TrackingForm />
      </section>
    </>
  );
}
