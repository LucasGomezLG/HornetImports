"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import styles from "./page.module.css";

type TipoCuenta = "comprador" | "vendedor";

export default function RegistroPage() {
  const [tipo, setTipo] = useState<TipoCuenta>("comprador");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre.trim()) { setError("El nombre es obligatorio."); return; }
    if (password.length < 8) { setError("La contraseña debe tener al menos 8 caracteres."); return; }
    if (!terms) { setError("Tenés que aceptar los términos y condiciones."); return; }

    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { tipo, nombre: nombre.trim() },
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      const msg = error.message;
      setError(
        msg.includes("already registered") || msg.includes("User already registered")
          ? "Ya existe una cuenta con ese email."
          : msg.includes("rate") || msg.includes("Too many")
          ? "Demasiados intentos. Esperá unos minutos e intentá de nuevo."
          : "Ocurrió un error. Intentá de nuevo."
      );
      setLoading(false);
      return;
    }

    setEnviado(true);
  }

  if (enviado) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.success}>
            <div className={styles.successIcon}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className={styles.successTitle}>¡Revisá tu email!</h2>
            <p className={styles.successText}>
              Te enviamos un link de confirmación a <strong>{email}</strong>. Hacé click en el link para activar tu cuenta.
            </p>
          </div>
          <p className={styles.footer}>
            <Link href="/login" className={styles.footerLink}>← Volver al inicio de sesión</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Link href="/" className={styles.logo}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Hornet Imports" width={36} height={36} />
          <span className={styles.logoText}>Hornet Imports</span>
        </Link>

        <div className={styles.header}>
          <h1 className={styles.title}>Crear cuenta</h1>
          <p className={styles.subtitle}>Gratis, sin tarjeta de crédito</p>
        </div>

        <div className={styles.tipoRow}>
          <button
            type="button"
            className={`${styles.tipoBtn} ${tipo === "comprador" ? styles.tipoBtnActive : ""}`}
            onClick={() => setTipo("comprador")}
          >
            <span className={styles.tipoIcon}>🛒</span>
            <span className={styles.tipoLabel}>Comprador</span>
            <span className={styles.tipoDesc}>Importo para mí</span>
          </button>
          <button
            type="button"
            className={`${styles.tipoBtn} ${tipo === "vendedor" ? styles.tipoBtnActive : ""}`}
            onClick={() => setTipo("vendedor")}
          >
            <span className={styles.tipoIcon}>🏪</span>
            <span className={styles.tipoLabel}>Vendedor</span>
            <span className={styles.tipoDesc}>Vendo en el marketplace</span>
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="nombre">
              {tipo === "vendedor" ? "Nombre del negocio" : "Nombre completo"}
            </label>
            <input
              id="nombre"
              type="text"
              className={styles.input}
              placeholder={tipo === "vendedor" ? "Mi Negocio SRL" : "Juan Pérez"}
              autoComplete="name"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className={styles.input}
              placeholder="tu@email.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              className={styles.input}
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className={styles.checkField}>
            <input
              id="terms"
              type="checkbox"
              className={styles.checkbox}
              checked={terms}
              onChange={(e) => setTerms(e.target.checked)}
            />
            <label htmlFor="terms" className={styles.checkLabel}>
              Acepto los{" "}
              <Link href="/terminos" className={styles.checkLink}>términos y condiciones</Link>
              {" "}y la{" "}
              <Link href="/privacidad" className={styles.checkLink}>política de privacidad</Link>
            </label>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.btnSubmit} disabled={loading}>
            {loading ? "Creando cuenta..." : "Crear cuenta gratis"}
          </button>
        </form>

        <p className={styles.footer}>
          ¿Ya tenés cuenta?{" "}
          <Link href="/login" className={styles.footerLink}>Iniciá sesión</Link>
        </p>
      </div>
    </div>
  );
}
