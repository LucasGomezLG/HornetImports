"use client";

import { useActionState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { login } from "./actions";
import styles from "./page.module.css";

const INIT = { error: null };

function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/dashboard";
  const [state, action, isPending] = useActionState(login, INIT);

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Link href="/" className={styles.logo}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Hornet Imports" width={36} height={36} />
          <span className={styles.logoText}>Hornet Imports</span>
        </Link>

        <div className={styles.header}>
          <h1 className={styles.title}>Iniciá sesión</h1>
          <p className={styles.subtitle}>Bienvenido de vuelta</p>
        </div>

        <form className={styles.form} action={action}>
          <input type="hidden" name="redirectTo" value={redirectTo} />

          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              className={styles.input}
              placeholder="tu@email.com"
              autoComplete="email"
              required
            />
          </div>

          <div className={styles.field}>
            <div className={styles.labelRow}>
              <label className={styles.label} htmlFor="password">Contraseña</label>
              <Link href="/recuperar-contrasena" className={styles.forgotLink}>
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              name="password"
              className={styles.input}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          {state.error && <p className={styles.error}>{state.error}</p>}

          <button type="submit" className={styles.btnSubmit} disabled={isPending}>
            {isPending ? "Ingresando..." : "Ingresar"}
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

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
