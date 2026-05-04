"use client";

import { useState, useTransition } from "react";
import { actualizarPedido } from "./actions";
import type { EstadoPedido } from "@/lib/supabase/types";
import styles from "./PedidoActions.module.css";

const ESTADOS: EstadoPedido[] = [
  "en_proceso",
  "comprado",
  "en_transito",
  "en_aduana",
  "entregado",
  "cancelado",
];

const LABEL: Record<EstadoPedido, string> = {
  en_proceso:  "En proceso",
  comprado:    "Comprado",
  en_transito: "En tránsito",
  en_aduana:   "En aduana",
  entregado:   "Entregado",
  cancelado:   "Cancelado",
};

interface Props {
  pedidoId: string;
  estadoInicial: EstadoPedido;
  trackingInicial: string | null;
}

export default function PedidoActions({ pedidoId, estadoInicial, trackingInicial }: Props) {
  const [estado, setEstado] = useState<EstadoPedido>(estadoInicial);
  const [tracking, setTracking] = useState(trackingInicial ?? "");
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    setSaved(false);
    startTransition(async () => {
      await actualizarPedido(pedidoId, estado, tracking);
      setSaved(true);
    });
  }

  const dirty = estado !== estadoInicial || tracking !== (trackingInicial ?? "");

  return (
    <div className={styles.row}>
      <select
        className={styles.select}
        value={estado}
        onChange={(e) => { setEstado(e.target.value as EstadoPedido); setSaved(false); }}
      >
        {ESTADOS.map((e) => (
          <option key={e} value={e}>{LABEL[e]}</option>
        ))}
      </select>

      <input
        className={styles.trackingInput}
        type="text"
        placeholder="Tracking code"
        value={tracking}
        onChange={(e) => { setTracking(e.target.value); setSaved(false); }}
      />

      <button
        className={`${styles.btnSave} ${saved ? styles.btnSaved : ""}`}
        onClick={handleSave}
        disabled={isPending || !dirty}
        title="Guardar cambios"
      >
        {isPending ? "..." : saved ? "✓" : "Guardar"}
      </button>
    </div>
  );
}
