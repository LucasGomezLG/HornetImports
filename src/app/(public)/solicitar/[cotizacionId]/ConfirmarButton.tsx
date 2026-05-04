"use client";

import { useState, useTransition } from "react";
import { confirmarPedido } from "./actions";
import styles from "./page.module.css";

export default function ConfirmarButton({ cotizacionId }: { cotizacionId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handle() {
    setError(null);
    startTransition(async () => {
      const result = await confirmarPedido(cotizacionId);
      if ("error" in result) { setError(result.error); return; }
      if ("mpUrl" in result) { window.location.href = result.mpUrl; return; }
      if ("redirect" in result) { window.location.href = result.redirect; }
    });
  }

  return (
    <div className={styles.ctaArea}>
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
        Nuestro equipo revisará tu pedido y te contactará en menos de 24 hs.
      </p>
    </div>
  );
}
