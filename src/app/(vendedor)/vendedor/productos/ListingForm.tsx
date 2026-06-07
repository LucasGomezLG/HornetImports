"use client";

import { useActionState, useEffect } from "react";
import { guardarListing } from "./actions";
import styles from "./page.module.css";

const CATEGORIAS = [
  { id: "autopartes", label: "Autopartes" },
  { id: "herramientas", label: "Herramientas" },
  { id: "electronica", label: "Electrónica" },
  { id: "hogar", label: "Hogar" },
  { id: "indumentaria", label: "Indumentaria" },
];

interface Listing {
  id: string;
  nombre: string;
  descripcion: string | null;
  categoria: string;
  precio_usd: number | null;
  stock: number;
}

interface Props {
  listing?: Listing;
  tipoCambio: number;
}

const INIT = { error: null, success: false };

export default function ListingForm({ listing, tipoCambio }: Props) {
  const action = guardarListing.bind(null, listing?.id ?? null);
  const [state, formAction, isPending] = useActionState(action, INIT);

  useEffect(() => {
    if (state.success) {
      const url = new URL(window.location.href);
      url.searchParams.delete("editar");
      url.searchParams.delete("modo");
      window.location.href = url.toString();
    }
  }, [state.success]);

  return (
    <form action={formAction} className={styles.form}>
      <div className={styles.formGrid}>
        <div className={styles.formField} style={{ gridColumn: "1 / -1" }}>
          <label className={styles.formLabel} htmlFor="nombre">Nombre del producto *</label>
          <input
            className={styles.formInput}
            id="nombre"
            name="nombre"
            type="text"
            defaultValue={listing?.nombre ?? ""}
            required
            placeholder="Ej: Batería para moto 12V 7Ah"
          />
        </div>

        <div className={styles.formField} style={{ gridColumn: "1 / -1" }}>
          <label className={styles.formLabel} htmlFor="descripcion">Descripción</label>
          <textarea
            className={styles.formTextarea}
            id="descripcion"
            name="descripcion"
            rows={2}
            defaultValue={listing?.descripcion ?? ""}
            placeholder="Descripción breve, compatibilidades, detalles..."
          />
        </div>

        <div className={styles.formField}>
          <label className={styles.formLabel} htmlFor="categoria">Categoría *</label>
          <select
            className={styles.formSelect}
            id="categoria"
            name="categoria"
            defaultValue={listing?.categoria ?? ""}
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
            defaultValue={listing?.precio_usd ?? ""}
            required
            placeholder="0.00"
          />
          <p className={styles.fieldHint}>
            Precio ARS se calcula automáticamente al tipo de cambio blue (${tipoCambio.toLocaleString("es-AR")}).
          </p>
        </div>

        <div className={styles.formField}>
          <label className={styles.formLabel} htmlFor="stock">Stock disponible *</label>
          <input
            className={styles.formInput}
            id="stock"
            name="stock"
            type="number"
            min="0"
            defaultValue={listing?.stock ?? 1}
            required
          />
        </div>
      </div>

      {state.error && <p className={styles.formError} role="alert">{state.error}</p>}
      {state.success && <p className={styles.formSuccess} role="status">Producto guardado. Redirigiendo...</p>}

      <div className={styles.formActions}>
        <button type="submit" className={styles.btnSave} disabled={isPending}>
          {isPending ? "Guardando..." : (listing ? "Actualizar producto" : "Publicar producto")}
        </button>
      </div>
    </form>
  );
}
