"use client";

import { useActionState, useEffect } from "react";
import { guardarProducto } from "./actions";
import styles from "./page.module.css";

const CATEGORIAS = [
  { id: "autopartes", label: "Autopartes" },
  { id: "herramientas", label: "Herramientas" },
  { id: "hogar", label: "Hogar" },
  { id: "deporte", label: "Deporte" },
  { id: "accesorios", label: "Accesorios" },
];

interface Producto {
  id: string;
  nombre: string;
  descripcion: string | null;
  categoria: string;
  precio_usd: number;
  stock: number;
  destacado: boolean;
}

interface Props {
  producto?: Producto;
  onDone?: () => void;
}

const INIT = { error: null, success: false };

export default function TiendaProductForm({ producto, onDone }: Props) {
  const action = guardarProducto.bind(null, producto?.id ?? null);
  const [state, formAction, isPending] = useActionState(action, INIT);

  useEffect(() => {
    if (state.success) onDone?.();
  }, [state.success, onDone]);

  return (
    <form action={formAction} className={styles.form}>
      <div className={styles.formGrid}>
        <div className={styles.formField} style={{ gridColumn: "1 / -1" }}>
          <label className={styles.formLabel} htmlFor="nombre">Nombre *</label>
          <input
            className={styles.formInput}
            id="nombre"
            name="nombre"
            type="text"
            defaultValue={producto?.nombre ?? ""}
            required
            placeholder="Ej: Pastillas de freno delanteras Ford Ka"
          />
        </div>

        <div className={styles.formField} style={{ gridColumn: "1 / -1" }}>
          <label className={styles.formLabel} htmlFor="descripcion">Descripción</label>
          <textarea
            className={styles.formTextarea}
            id="descripcion"
            name="descripcion"
            rows={2}
            defaultValue={producto?.descripcion ?? ""}
            placeholder="Descripción breve del producto..."
          />
        </div>

        <div className={styles.formField}>
          <label className={styles.formLabel} htmlFor="categoria">Categoría *</label>
          <select
            className={styles.formSelect}
            id="categoria"
            name="categoria"
            defaultValue={producto?.categoria ?? ""}
            required
          >
            <option value="">Seleccioná una categoría</option>
            {CATEGORIAS.map(({ id, label }) => (
              <option key={id} value={id}>{label}</option>
            ))}
          </select>
        </div>

        <div className={styles.formField}>
          <label className={styles.formLabel} htmlFor="precio_usd">Precio (USD) *</label>
          <input
            className={styles.formInput}
            id="precio_usd"
            name="precio_usd"
            type="number"
            step="0.01"
            min="0.01"
            defaultValue={producto?.precio_usd ?? ""}
            required
            placeholder="0.00"
          />
        </div>

        <div className={styles.formField}>
          <label className={styles.formLabel} htmlFor="stock">Stock *</label>
          <input
            className={styles.formInput}
            id="stock"
            name="stock"
            type="number"
            min="0"
            defaultValue={producto?.stock ?? 0}
            required
          />
        </div>

        <div className={styles.formField}>
          <label className={styles.formCheckLabel}>
            <input
              type="checkbox"
              name="destacado"
              defaultChecked={producto?.destacado ?? false}
            />
            Marcar como destacado
          </label>
        </div>
      </div>

      {state.error && <p className={styles.formError} role="alert">{state.error}</p>}
      {state.success && <p className={styles.formSuccess} role="status">Producto guardado correctamente.</p>}

      <div className={styles.formActions}>
        <button type="submit" className={styles.btnSave} disabled={isPending}>
          {isPending ? "Guardando..." : (producto ? "Actualizar producto" : "Crear producto")}
        </button>
      </div>
    </form>
  );
}
