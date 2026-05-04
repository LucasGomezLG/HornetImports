"use client";

import { useState, useTransition } from "react";
import { enviarLinkCotizacion, rechazarCotizacion } from "./actions";
import styles from "./CotizacionActions.module.css";

interface Props {
  cotizacionId: string;
  emailUsuario: string | null;
  nombreProducto: string;
  estado: string;
}

export default function CotizacionActions({ cotizacionId, emailUsuario, nombreProducto, estado }: Props) {
  const [mode, setMode] = useState<"idle" | "rechazando" | "done_link" | "done_rechazado">("idle");
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (estado !== "pendiente") return null;
  if (!emailUsuario) return <span className={styles.noEmail}>Sin email</span>;

  function handleLink() {
    setError(null);
    startTransition(async () => {
      const res = await enviarLinkCotizacion(cotizacionId, emailUsuario!, nombreProducto);
      if (res?.error) { setError(res.error); return; }
      setMode("done_link");
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

  if (mode === "done_link") return <span className={styles.sent}>✓ Link enviado</span>;
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
      <button className={styles.btnLink} onClick={handleLink} disabled={isPending}>
        {isPending ? "..." : "Enviar link ✉"}
      </button>
      <button className={styles.btnRechazar} onClick={() => setMode("rechazando")} disabled={isPending}>
        Rechazar
      </button>
      {error && <span className={styles.errorTxt}>{error}</span>}
    </div>
  );
}
