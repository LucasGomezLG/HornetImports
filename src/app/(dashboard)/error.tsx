"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <div style={{ padding: "4rem 2rem", textAlign: "center", maxWidth: 480, margin: "0 auto" }}>
      <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#1d2b3a", marginBottom: "0.75rem" }}>
        Error al cargar
      </h2>
      <p style={{ color: "#6b7280", marginBottom: "1.5rem" }}>
        No pudimos cargar esta sección. Verificá tu conexión e intentá de nuevo.
      </p>
      <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
        <button
          type="button"
          onClick={reset}
          style={{ padding: "0.75rem 1.5rem", background: "#f5a623", color: "#fff", fontWeight: 700, borderRadius: 8, border: "none", cursor: "pointer" }}
        >
          Reintentar
        </button>
        <Link
          href="/dashboard"
          style={{ padding: "0.75rem 1.5rem", border: "1px solid #e5e7eb", borderRadius: 8, color: "#374151", fontWeight: 600 }}
        >
          Ir al panel
        </Link>
      </div>
    </div>
  );
}
