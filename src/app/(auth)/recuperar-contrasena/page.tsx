"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function RecuperarContrasenaPage() {
  const [enviado, setEnviado] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEnviado(true);
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Link href="/" className={styles.logo}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${BASE}/logo.png`} alt="Hornet Imports" width={36} height={36} />
          <span className={styles.logoText}>Hornet Imports</span>
        </Link>

        {!enviado ? (
          <>
            <div className={styles.header}>
              <h1 className={styles.title}>Recuperar contraseña</h1>
              <p className={styles.subtitle}>
                Ingresá tu email y te mandamos un link para resetear tu contraseña.
              </p>
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  className={styles.input}
                  placeholder="tu@email.com"
                  autoComplete="email"
                  required
                />
              </div>
              <button type="submit" className={styles.btnSubmit}>
                Enviar link de recuperación
              </button>
            </form>
          </>
        ) : (
          <div className={styles.success}>
            <div className={styles.successIcon}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className={styles.successTitle}>¡Revisá tu email!</h2>
            <p className={styles.successText}>
              Si existe una cuenta con ese email, te enviamos un link para restablecer tu contraseña en los próximos minutos.
            </p>
          </div>
        )}

        <p className={styles.footer}>
          <Link href="/login" className={styles.footerLink}>← Volver al inicio de sesión</Link>
        </p>
      </div>
    </div>
  );
}
