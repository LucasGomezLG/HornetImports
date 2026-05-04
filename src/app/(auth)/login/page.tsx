"use client";

import Link from "next/link";
import styles from "./page.module.css";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function LoginPage() {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Link href="/" className={styles.logo}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${BASE}/logo.png`} alt="Hornet Imports" width={36} height={36} />
          <span className={styles.logoText}>Hornet Imports</span>
        </Link>

        <div className={styles.header}>
          <h1 className={styles.title}>Iniciá sesión</h1>
          <p className={styles.subtitle}>Bienvenido de vuelta</p>
        </div>

        <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className={styles.input}
              placeholder="tu@email.com"
              autoComplete="email"
            />
          </div>

          <div className={styles.field}>
            <div className={styles.labelRow}>
              <label className={styles.label} htmlFor="password">Contraseña</label>
              <a href="#" className={styles.forgotLink}>¿Olvidaste tu contraseña?</a>
            </div>
            <input
              id="password"
              type="password"
              className={styles.input}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className={styles.btnSubmit}>
            Ingresar
          </button>
        </form>

        <p className={styles.footer}>
          ¿No tenés cuenta?{" "}
          <Link href="/registro" className={styles.footerLink}>
            Crear cuenta gratis
          </Link>
        </p>
      </div>
    </div>
  );
}
