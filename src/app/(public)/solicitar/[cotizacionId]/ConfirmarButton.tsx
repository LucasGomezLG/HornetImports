"use client";

import { useState, useTransition } from "react";
import { confirmarPedido } from "./actions";
import styles from "./page.module.css";

type MetodoPago = "mp" | "efectivo";

export default function ConfirmarButton({
  cotizacionId,
  mpDisponible,
}: {
  cotizacionId: string;
  mpDisponible: boolean;
}) {
  const [metodo, setMetodo] = useState<MetodoPago>(mpDisponible ? "mp" : "efectivo");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handle() {
    setError(null);
    startTransition(async () => {
      const result = await confirmarPedido(cotizacionId, metodo);
      if ("error" in result) { setError(result.error); return; }
      if ("mpUrl" in result) { window.location.href = result.mpUrl; return; }
      if ("redirect" in result) { window.location.href = result.redirect; }
    });
  }

  return (
    <div className={styles.ctaArea}>
      {mpDisponible && (
        <div className={styles.metodoPagoGrid}>
          <button
            type="button"
            className={`${styles.metodoBtn} ${metodo === "mp" ? styles.metodoBtnActive : ""}`}
            onClick={() => setMetodo("mp")}
          >
            <span className={styles.metodoIcon}>💳</span>
            <span className={styles.metodoLabel}>MercadoPago</span>
            <span className={styles.metodoDesc}>Pago online</span>
          </button>
          <button
            type="button"
            className={`${styles.metodoBtn} ${metodo === "efectivo" ? styles.metodoBtnActive : ""}`}
            onClick={() => setMetodo("efectivo")}
          >
            <span className={styles.metodoIcon}>💵</span>
            <span className={styles.metodoLabel}>Efectivo</span>
            <span className={styles.metodoDesc}>Al retirar / coordinar</span>
          </button>
        </div>
      )}

      {error && <p className={styles.errorMsg} role="alert">{error}</p>}

      <button
        type="button"
        className={styles.btnConfirmar}
        onClick={handle}
        disabled={isPending}
      >
        {isPending ? "Procesando..." : "Confirmar pedido →"}
      </button>
      <p className={styles.ctaNote}>
        {metodo === "efectivo"
          ? "Coordinaremos el pago en efectivo una vez confirmado tu pedido."
          : "Nuestro equipo revisará tu pedido y te contactará en menos de 24 hs."}
      </p>
    </div>
  );
}
