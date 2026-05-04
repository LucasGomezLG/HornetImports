"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import styles from "../login/page.module.css";

export default function ActualizarContrasenaPage() {
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) { setError("Mínimo 8 caracteres."); return; }
    if (password !== confirm) { setError("Las contraseñas no coinciden."); return; }

    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError("No se pudo actualizar la contraseña. El link puede haber expirado.");
    } else {
      setSuccess(true);
      setTimeout(() => { window.location.href = "/dashboard"; }, 2000);
    }
    setLoading(false);
  }

  if (success) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h1 className={styles.title}>Contraseña actualizada</h1>
            <p className={styles.subtitle}>Redirigiendo a tu cuenta...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h1 className={styles.title}>Verificando enlace...</h1>
            <p className={styles.subtitle}>
              Si llegaste acá por error,{" "}
              <a href="/recuperar-contrasena" className={styles.link}>solicitá un nuevo enlace</a>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Nueva contraseña</h1>
          <p className={styles.subtitle}>Elegí una contraseña segura para tu cuenta.</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">Nueva contraseña</label>
            <input
              className={styles.input}
              id="password"
              type="password"
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="confirm">Confirmar contraseña</label>
            <input
              className={styles.input}
              id="confirm"
              type="password"
              placeholder="Repetí la contraseña"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>

          {error && <div className={styles.errorBox} role="alert">{error}</div>}

          <button type="submit" className={styles.btnSubmit} disabled={loading}>
            {loading ? "Guardando..." : "Guardar contraseña →"}
          </button>
        </form>
      </div>
    </div>
  );
}
