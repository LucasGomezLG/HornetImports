"use client";

import { useActionState } from "react";
import { actualizarPerfil } from "./actions";
import styles from "./page.module.css";

interface Props {
  nombre: string;
  apellido: string;
  telefono: string;
  email: string;
  cuit: string;
}

const INIT = { error: null, success: false };

export default function PerfilForm({ nombre, apellido, telefono, email, cuit }: Props) {
  const [state, action, isPending] = useActionState(actualizarPerfil, INIT);

  return (
    <form action={action} className={styles.form}>
      <div className={styles.fieldGroup}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="nombre">Nombre *</label>
          <input
            className={styles.input}
            id="nombre"
            name="nombre"
            type="text"
            defaultValue={nombre}
            required
            autoComplete="given-name"
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="apellido">Apellido</label>
          <input
            className={styles.input}
            id="apellido"
            name="apellido"
            type="text"
            defaultValue={apellido}
            autoComplete="family-name"
          />
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="telefono">Teléfono / WhatsApp</label>
        <input
          className={styles.input}
          id="telefono"
          name="telefono"
          type="tel"
          defaultValue={telefono}
          placeholder="+54 9 11 xxxx-xxxx"
          autoComplete="tel"
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="cuit">CUIT / CUIL</label>
        <input
          className={styles.input}
          id="cuit"
          name="cuit"
          type="text"
          defaultValue={cuit}
          placeholder="20-12345678-9"
          autoComplete="off"
        />
        <p className={styles.hint}>Necesario para gestionar la importación a tu nombre.</p>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Email</label>
        <input className={`${styles.input} ${styles.inputReadonly}`} type="email" value={email} readOnly />
        <p className={styles.hint}>El email no se puede cambiar desde aquí.</p>
      </div>

      {state.error && <p className={styles.errorMsg} role="alert">{state.error}</p>}
      {state.success && <p className={styles.successMsg} role="status">Perfil actualizado correctamente.</p>}

      <button type="submit" className={styles.btnGuardar} disabled={isPending}>
        {isPending ? "Guardando..." : "Guardar cambios →"}
      </button>
    </form>
  );
}
