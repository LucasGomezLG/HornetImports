"use client";

import { useEffect } from "react";

export default function PublicError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <div style={{ padding: "4rem 2rem", textAlign: "center", maxWidth: 480, margin: "0 auto" }}>
      <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#1d2b3a", marginBottom: "0.75rem" }}>
        Algo salió mal
      </h2>
      <p style={{ color: "#6b7280", marginBottom: "1.5rem" }}>
        Ocurrió un error inesperado. Podés intentar de nuevo o volver al inicio.
      </p>
      <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
        <button
          type="button"
          onClick={reset}
          style={{ padding: "0.75rem 1.5rem", background: "#f5a623", color: "#fff", fontWeight: 700, borderRadius: 8, border: "none", cursor: "pointer" }}
        >
          Intentar de nuevo
        </button>
        <a
          href="/"
          style={{ padding: "0.75rem 1.5rem", border: "1px solid #e5e7eb", borderRadius: 8, color: "#374151", fontWeight: 600 }}
        >
          Ir al inicio
        </a>
      </div>
    </div>
  );
}
