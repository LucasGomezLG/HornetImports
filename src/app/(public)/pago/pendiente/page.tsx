import type { Metadata } from "next";
import Link from "next/link";
import styles from "../pago.module.css";

export const metadata: Metadata = { title: "Pago pendiente | Hornet Imports" };

export default function PagoPendientePage() {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={`${styles.icon} ${styles.iconYellow}`}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>
        <h1 className={styles.title}>Pago en proceso</h1>
        <p className={styles.subtitle}>
          Tu pago está siendo procesado. Te avisaremos por email cuando se confirme. Podés ver el estado de tu pedido en tu panel.
        </p>
        <Link href="/pedidos" className={styles.btn}>Ver mis pedidos →</Link>
      </div>
    </div>
  );
}
