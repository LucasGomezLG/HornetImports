"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";


type TipoCuenta = "comprador" | "vendedor";

export default function RegistroPage() {
  const [tipo, setTipo] = useState<TipoCuenta>("comprador");

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Link href="/" className={styles.logo}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={"/logo.png"} alt="Hornet Imports" width={36} height={36} />
          <span className={styles.logoText}>Hornet Imports</span>
        </Link>

        <div className={styles.header}>
          <h1 className={styles.title}>Crear cuenta</h1>
          <p className={styles.subtitle}>Gratis, sin tarjeta de crédito</p>
        </div>

        {/* Tipo de cuenta */}
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

        <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
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
            />
          </div>

          <div className={styles.checkField}>
            <input id="terms" type="checkbox" className={styles.checkbox} />
            <label htmlFor="terms" className={styles.checkLabel}>
              Acepto los{" "}
              <Link href="/terminos" className={styles.checkLink}>términos y condiciones</Link>
              {" "}y la{" "}
              <Link href="/privacidad" className={styles.checkLink}>política de privacidad</Link>
            </label>
          </div>

          <button type="submit" className={styles.btnSubmit}>
            Crear cuenta gratis
          </button>
        </form>

        <p className={styles.footer}>
          ¿Ya tenés cuenta?{" "}
          <Link href="/login" className={styles.footerLink}>
            Iniciá sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
