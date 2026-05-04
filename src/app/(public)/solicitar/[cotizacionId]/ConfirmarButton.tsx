"use client";

import { useState, useTransition } from "react";
import { confirmarPedido, type MetodoPago } from "./actions";
import styles from "./page.module.css";

const METODOS: { id: MetodoPago; icon: string; label: string; desc: string }[] = [
  { id: "mp",           icon: "💳", label: "MercadoPago",      desc: "Pago online" },
  { id: "transferencia",icon: "🏦", label: "Transferencia",    desc: "CBU / Alias" },
  { id: "cripto",       icon: "₿",  label: "Cripto / USDT",   desc: "USDT · BTC" },
];

const CTA_NOTE: Record<MetodoPago, string> = {
  mp:           "Nuestro equipo revisará tu pedido y te contactará en menos de 24 hs.",
  transferencia:"Te enviaremos los datos bancarios por email para coordinar la transferencia.",
  cripto:       "Te enviamos la wallet USDT/BTC por email para que realices el pago.",
  efectivo:     "Coordinaremos el pago en efectivo una vez confirmado tu pedido.",
};

export default function ConfirmarButton({
  cotizacionId,
  mpDisponible,
}: {
  cotizacionId: string;
  mpDisponible: boolean;
}) {
  const metodoDefault: MetodoPago = mpDisponible ? "mp" : "transferencia";
  const [metodo, setMetodo] = useState<MetodoPago>(metodoDefault);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const metodosList = mpDisponible ? METODOS : METODOS.filter((m) => m.id !== "mp");

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
      <div className={styles.metodoPagoGrid} style={{ gridTemplateColumns: `repeat(${metodosList.length}, 1fr)` }}>
        {metodosList.map((m) => (
          <button
            key={m.id}
            type="button"
            className={`${styles.metodoBtn} ${metodo === m.id ? styles.metodoBtnActive : ""}`}
            onClick={() => setMetodo(m.id)}
          >
            <span className={styles.metodoIcon}>{m.icon}</span>
            <span className={styles.metodoLabel}>{m.label}</span>
            <span className={styles.metodoDesc}>{m.desc}</span>
          </button>
        ))}
      </div>

      {error && <p className={styles.errorMsg} role="alert">{error}</p>}

      <button
        type="button"
        className={styles.btnConfirmar}
        onClick={handle}
        disabled={isPending}
      >
        {isPending ? "Procesando..." : "Confirmar pedido →"}
      </button>
      <p className={styles.ctaNote}>{CTA_NOTE[metodo]}</p>
    </div>
  );
}
