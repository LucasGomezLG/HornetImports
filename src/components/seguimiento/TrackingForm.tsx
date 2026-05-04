"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
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
  { id: "recibida",        label: "Pedido recibido",          detalle: "Tu pedido fue registrado y está siendo revisado por nuestro equipo." },
  { id: "pago_confirmado", label: "Pago confirmado",          detalle: "El pago fue acreditado. Iniciamos la compra del producto." },
  { id: "enviado_origen",  label: "Producto adquirido",       detalle: "Compramos tu producto. En camino a nuestro depósito en Miami." },
  { id: "en_transito",     label: "En camino a Buenos Aires", detalle: "El paquete salió de Miami y está en vuelo hacia Argentina. ETA: 5–10 días hábiles." },
  { id: "en_aduana",       label: "En aduana argentina",      detalle: "En proceso de despacho aduanero. Duración habitual: 2–4 días." },
  { id: "camino_destino",  label: "En camino a vos",          detalle: "El paquete salió de nuestro depósito. Te contactamos para coordinar la entrega." },
  { id: "entregado",       label: "Entregado",                detalle: "Paquete entregado. ¡Gracias por confiar en Hornet Imports!" },
];

const PEDIDO_A_ORDEN: Record<string, EstadoOrden> = {
  en_proceso:  "pago_confirmado",
  comprado:    "enviado_origen",
  en_transito: "en_transito",
  en_aduana:   "en_aduana",
  entregado:   "entregado",
  cancelado:   "recibida",
};

const ORDEN_DEMO = {
  codigo:        "HI-2026-00481",
  producto:      "Kit de distribución Chevrolet Cruze 1.4T",
  estadoActual:  "en_transito" as EstadoOrden,
  fechaEstimada: "8 de mayo, 2026" as string | null,
  esDemo:        true,
};

export interface PedidoReal {
  id: string;
  producto_nombre: string;
  estado: string;
  tracking_code: string | null;
  created_at: string;
}

interface Props {
  pedidos?: PedidoReal[];
}

function getEstadoIndex(id: EstadoOrden) {
  return ESTADOS.findIndex((e) => e.id === id);
}

export default function TrackingForm({ pedidos = [] }: Props) {
  const searchParams = useSearchParams();
  const [codigo, setCodigo] = useState(searchParams.get("code") ?? "");
  const [orden, setOrden] = useState<typeof ORDEN_DEMO | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get("code");
    if (code) {
      setCodigo(code);
      buscar(code);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function buscar(code: string) {
    setError(null);
    const trimmed = code.trim();
    if (!trimmed) { setError("Ingresá tu número de orden."); return; }

    const pedido = pedidos.find(
      (p) => p.id === trimmed || p.tracking_code === trimmed
    );

    if (pedido) {
      setOrden({
        codigo:        pedido.tracking_code ?? pedido.id,
        producto:      pedido.producto_nombre,
        estadoActual:  PEDIDO_A_ORDEN[pedido.estado] ?? "recibida",
        fechaEstimada: null,
        esDemo:        false,
      });
    } else {
      setOrden({ ...ORDEN_DEMO, esDemo: true });
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    buscar(codigo);
  }

  const estadoActualIdx = orden ? getEstadoIndex(orden.estadoActual) : -1;

  return (
    <div className={styles.wrapper}>
      {orden?.esDemo && (
        <div className={styles.demoBanner}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>Resultado de ejemplo — el seguimiento real estará disponible una vez que tu pedido tenga código de tracking asignado.</span>
        </div>
      )}

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.inputRow}>
          <input
            className={styles.input}
            type="text"
            placeholder="ID de pedido o código de tracking"
            value={codigo}
            onChange={(e) => { setCodigo(e.target.value); setError(null); setOrden(null); }}
          />
          <button type="submit" className={styles.btnBuscar}>Rastrear</button>
        </div>
        {error && <p className={styles.error}>{error}</p>}
        <p className={styles.hint}>
          Encontrás tu ID de pedido en el panel de <a href="/pedidos" className={styles.hintLink}>Mis pedidos</a>.
        </p>
      </form>

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
            {orden.fechaEstimada && (
              <div>
                <p className={styles.resultLabel}>Entrega estimada</p>
                <p className={styles.resultFecha}>{orden.fechaEstimada}</p>
              </div>
            )}
          </div>

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
