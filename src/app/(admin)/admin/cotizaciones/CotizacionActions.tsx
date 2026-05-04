"use client";

import { useState, useTransition } from "react";
import { aprobarCotizacion, rechazarCotizacion } from "./actions";
import styles from "./CotizacionActions.module.css";

interface Props {
  cotizacionId: string;
  emailUsuario: string | null;
  nombreProducto: string;
  estado: string;
  aprobadaPorAdmin: boolean;
}

export default function CotizacionActions({
  cotizacionId,
  emailUsuario,
  nombreProducto,
  estado,
  aprobadaPorAdmin,
}: Props) {
  const [mode, setMode] = useState<"idle" | "rechazando" | "done_aprobada" | "done_rechazado">("idle");
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (estado !== "pendiente") return null;
  if (!emailUsuario) return <span className={styles.noEmail}>Sin email</span>;

  if (aprobadaPorAdmin && mode === "idle") {
    return (
      <div className={styles.actions}>
        <span className={styles.sent}>✓ Aprobada · esperando cliente</span>
        <button className={styles.btnRechazar} onClick={() => setMode("rechazando")} disabled={isPending}>
          Rechazar
        </button>
      </div>
    );
  }

  function handleAprobar() {
    setError(null);
    startTransition(async () => {
      const res = await aprobarCotizacion(cotizacionId, emailUsuario!, nombreProducto);
      if (res?.error) { setError(res.error); return; }
      setMode("done_aprobada");
    });
  }

  function handleRechazar() {
    setError(null);
    startTransition(async () => {
      const res = await rechazarCotizacion(cotizacionId, emailUsuario, nombreProducto, motivo);
      if (res?.error) { setError(res.error); return; }
      setMode("done_rechazado");
    });
  }

  if (mode === "done_aprobada") return <span className={styles.sent}>✓ Aprobada · link enviado</span>;
  if (mode === "done_rechazado") return <span className={styles.rejected}>✗ Rechazada</span>;

  if (mode === "rechazando") {
    return (
      <div className={styles.rechazarForm}>
        <input
          className={styles.motivoInput}
          type="text"
          placeholder="Motivo (opcional)"
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          autoFocus
        />
        <button className={styles.btnConfirmRechazar} onClick={handleRechazar} disabled={isPending}>
          {isPending ? "..." : "Confirmar"}
        </button>
        <button className={styles.btnCancel} onClick={() => setMode("idle")}>Cancelar</button>
        {error && <span className={styles.errorTxt}>{error}</span>}
      </div>
    );
  }

  return (
    <div className={styles.actions}>
      <button className={styles.btnLink} onClick={handleAprobar} disabled={isPending}>
        {isPending ? "..." : "Aprobar ✓"}
      </button>
      <button className={styles.btnRechazar} onClick={() => setMode("rechazando")} disabled={isPending}>
        Rechazar
      </button>
      {error && <span className={styles.errorTxt}>{error}</span>}
    </div>
  );
}
