import type { Metadata } from "next";
import Link from "next/link";
import styles from "../pago.module.css";

export const metadata: Metadata = { title: "Pago exitoso | Hornet Imports" };

export default function PagoExitosoPage() {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={`${styles.icon} ${styles.iconGreen}`}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h1 className={styles.title}>¡Pago confirmado!</h1>
        <p className={styles.subtitle}>
          Tu pedido fue registrado y el equipo de Hornet Imports te contactará en menos de 24 hs.
        </p>
        <Link href="/pedidos" className={styles.btn}>Ver mis pedidos →</Link>
      </div>
    </div>
  );
}
