import type { Metadata } from "next";
import Link from "next/link";
import styles from "../pago.module.css";

export const metadata: Metadata = { title: "Pago fallido | Hornet Imports" };

export default function PagoFallidoPage() {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={`${styles.icon} ${styles.iconRed}`}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        </div>
        <h1 className={styles.title}>No pudimos procesar el pago</h1>
        <p className={styles.subtitle}>
          Ocurrió un problema con tu pago. Podés intentarlo de nuevo o contactarnos por WhatsApp.
        </p>
        <div className={styles.btnGroup}>
          <Link href="/pedidos" className={styles.btn}>Ver mis pedidos →</Link>
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5491100000000"}`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.btnSecondary}
          >
            Contactar por WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
