"use client";

import { useEffect } from "react";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <div style={{ padding: "4rem 2rem", textAlign: "center", maxWidth: 480, margin: "0 auto" }}>
      <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#1d2b3a", marginBottom: "0.75rem" }}>
        Error en el panel
      </h2>
      <p style={{ color: "#6b7280", marginBottom: "1.5rem" }}>
        Ocurrió un error al cargar los datos. Revisá que{" "}
        <code style={{ background: "#f3f4f6", padding: "2px 6px", borderRadius: 4 }}>SUPABASE_SERVICE_ROLE_KEY</code>{" "}
        esté configurado en las variables de entorno.
      </p>
      <button
        type="button"
        onClick={reset}
        style={{ padding: "0.75rem 1.5rem", background: "#f5a623", color: "#fff", fontWeight: 700, borderRadius: 8, border: "none", cursor: "pointer" }}
      >
        Reintentar
      </button>
    </div>
  );
}
