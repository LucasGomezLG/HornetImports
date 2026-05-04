"use client";

import { useState } from "react";
import styles from "./TrackingForm.module.css";

type EstadoOrden =
  | "recibida"
  | "pago_confirmado"
  | "enviado_origen"
  | "en_transito"
  | "en_aduana"
  | "camino_destino"
  | "entregado";

const ESTADOS: { id: EstadoOrden; label: string; detalle: string }[] = [
  { id: "recibida", label: "Orden recibida", detalle: "Tu solicitud fue registrada en el sistema." },
  { id: "pago_confirmado", label: "Pago confirmado", detalle: "El pago fue acreditado correctamente." },
  { id: "enviado_origen", label: "Enviado desde origen", detalle: "El paquete salió del depósito en Miami, EE.UU." },
  { id: "en_transito", label: "En tránsito internacional", detalle: "En vuelo hacia Argentina. ETA: 3–5 días hábiles." },
  { id: "en_aduana", label: "En aduana argentina", detalle: "En proceso de despacho aduanero. Duración habitual: 2–4 días." },
  { id: "camino_destino", label: "En camino a destino", detalle: "Con el courier local. Entrega estimada: hoy o mañana." },
  { id: "entregado", label: "Entregado", detalle: "Paquete entregado exitosamente." },
];

const ORDEN_DEMO = {
  codigo: "HI-2026-00481",
  producto: "Kit de distribución Chevrolet Cruze 1.4T",
  estadoActual: "en_transito" as EstadoOrden,
  fechaEstimada: "8 de mayo, 2026",
};

function getEstadoIndex(id: EstadoOrden) {
  return ESTADOS.findIndex((e) => e.id === id);
}

export default function TrackingForm() {
  const [codigo, setCodigo] = useState("");
  const [orden, setOrden] = useState<typeof ORDEN_DEMO | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!codigo.trim()) {
      setError("Ingresá tu número de orden.");
      return;
    }
    // Demo: cualquier código muestra la orden de ejemplo
    setOrden(ORDEN_DEMO);
  }

  const estadoActualIdx = orden ? getEstadoIndex(orden.estadoActual) : -1;

  return (
    <div className={styles.wrapper}>
      {/* Formulario */}
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.inputRow}>
          <input
            className={styles.input}
            type="text"
            placeholder="Ej: HI-2026-00481"
            value={codigo}
            onChange={(e) => { setCodigo(e.target.value); setError(null); setOrden(null); }}
          />
          <button type="submit" className={styles.btnBuscar}>
            Rastrear
          </button>
        </div>
        {error && <p className={styles.error}>{error}</p>}
        <p className={styles.hint}>
          Encontrás tu número de orden en el email de confirmación.
        </p>
      </form>

      {/* Resultado */}
      {orden && (
        <div className={styles.result}>
          <div className={styles.resultHeader}>
            <div>
              <p className={styles.resultLabel}>Orden</p>
              <p className={styles.resultCodigo}>{orden.codigo}</p>
            </div>
            <div>
              <p className={styles.resultLabel}>Producto</p>
              <p className={styles.resultProducto}>{orden.producto}</p>
            </div>
            <div>
              <p className={styles.resultLabel}>Entrega estimada</p>
              <p className={styles.resultFecha}>{orden.fechaEstimada}</p>
            </div>
          </div>

          {/* Timeline */}
          <div className={styles.timeline}>
            {ESTADOS.map((estado, idx) => {
              const completado = idx < estadoActualIdx;
              const actual = idx === estadoActualIdx;
              const pendiente = idx > estadoActualIdx;

              return (
                <div
                  key={estado.id}
                  className={`${styles.step} ${completado ? styles.stepDone : ""} ${actual ? styles.stepActive : ""} ${pendiente ? styles.stepPending : ""}`}
                >
                  <div className={styles.stepIndicator}>
                    <div className={styles.stepDot}>
                      {completado && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                      {actual && <div className={styles.stepDotPulse} />}
                    </div>
                    {idx < ESTADOS.length - 1 && <div className={styles.stepLine} />}
                  </div>

                  <div className={styles.stepContent}>
                    <p className={styles.stepLabel}>{estado.label}</p>
                    {(completado || actual) && (
                      <p className={styles.stepDetalle}>{estado.detalle}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
