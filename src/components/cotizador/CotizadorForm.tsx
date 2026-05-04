"use client";

import { useState } from "react";
import { CATEGORIAS } from "@/lib/cotizador/categorias";
import type { InputCotizacion, CotizacionResult } from "@/lib/cotizador/types";
import ResultadoCotizacion from "./ResultadoCotizacion";
import styles from "./CotizadorForm.module.css";

const INPUT_INICIAL: InputCotizacion = {
  nombreProducto: "",
  urlProducto: "",
  precioUsdProducto: 0,
  pesoKg: 0,
  largo: 0,
  ancho: 0,
  alto: 0,
  categoriaId: "",
};

const MENSAJES_ERROR: Record<string, string> = {
  categoria_blacklist: "Esta categoría requiere cotización manual. Te contactamos en menos de 24 hs.",
  precio_invalido: "Ingresá el precio del producto en USD.",
  precio_minimo: "El precio mínimo para importar es USD 25.",
  dimensiones_invalidas: "Verificá que el peso y las dimensiones estén completos y sean correctos.",
  volumen_excedido: "El paquete supera los límites del régimen Courier (30 kg / 0.1 m³). Escribinos para cotización especial.",
};

export default function CotizadorForm() {
  const [input, setInput] = useState<InputCotizacion>(INPUT_INICIAL);
  const [resultado, setResultado] = useState<CotizacionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorManual, setErrorManual] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    setInput((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    }));
    setResultado(null);
    setErrorManual(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!input.nombreProducto.trim()) { setErrorManual("Ingresá el nombre del producto."); return; }
    if (!input.urlProducto.trim()) { setErrorManual("Ingresá el link del producto."); return; }
    if (!input.categoriaId) { setErrorManual("Seleccioná una categoría."); return; }

    setLoading(true);
    setErrorManual(null);

    try {
      const res = await fetch("/api/cotizar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data: CotizacionResult = await res.json();
      setResultado(data);

      if (data.ok) {
        setTimeout(() => {
          document.getElementById("resultado-cotizacion")
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 50);
      }
    } catch {
      setErrorManual("Error de conexión. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  const error = errorManual ?? (resultado && !resultado.ok ? MENSAJES_ERROR[resultado.razon] : null);
  const categoriasAuto = CATEGORIAS.filter((c) => !c.blacklist);
  const categoriasManual = CATEGORIAS.filter((c) => c.blacklist);

  return (
    <div className={styles.wrapper}>
      <div className={styles.modoAsistido}>
        <span className={styles.badge}>Modo asistido</span>
        Tu cotización es revisada antes de procesar el cobro.
      </div>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Producto</h3>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="nombreProducto">Nombre del producto</label>
            <input
              className={styles.input}
              id="nombreProducto"
              name="nombreProducto"
              type="text"
              placeholder="Ej: Monitor LG 27 pulgadas 4K"
              value={input.nombreProducto}
              onChange={handleChange}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="urlProducto">Link del producto</label>
            <input
              className={styles.input}
              id="urlProducto"
              name="urlProducto"
              type="url"
              placeholder="https://www.amazon.com/..."
              value={input.urlProducto}
              onChange={handleChange}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="precioUsdProducto">Precio del producto</label>
            <div className={styles.inputGroup}>
              <span className={styles.inputPrefix}>USD</span>
              <input
                className={`${styles.input} ${styles.inputWithPrefix}`}
                id="precioUsdProducto"
                name="precioUsdProducto"
                type="number"
                min="1"
                step="0.01"
                placeholder="0.00"
                value={input.precioUsdProducto || ""}
                onChange={handleChange}
              />
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Peso y dimensiones</h3>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="pesoKg">Peso real del paquete</label>
            <div className={styles.inputGroup}>
              <input
                className={`${styles.input} ${styles.inputWithSuffix}`}
                id="pesoKg"
                name="pesoKg"
                type="number"
                min="0.1"
                step="0.1"
                placeholder="0.0"
                value={input.pesoKg || ""}
                onChange={handleChange}
              />
              <span className={styles.inputSuffix}>kg</span>
            </div>
          </div>

          <div className={styles.fieldGrid3}>
            {(["largo", "ancho", "alto"] as const).map((key) => (
              <div className={styles.field} key={key}>
                <label className={styles.label} htmlFor={key}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </label>
                <div className={styles.inputGroup}>
                  <input
                    className={`${styles.input} ${styles.inputWithSuffix}`}
                    id={key}
                    name={key}
                    type="number"
                    min="1"
                    step="1"
                    placeholder="0"
                    value={input[key] || ""}
                    onChange={handleChange}
                  />
                  <span className={styles.inputSuffix}>cm</span>
                </div>
              </div>
            ))}
          </div>

          <p className={styles.hint}>
            Usamos el mayor entre peso real y peso volumétrico (largo×ancho×alto / 5000).
          </p>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Categoría</h3>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="categoriaId">Tipo de producto</label>
            <select
              className={styles.select}
              id="categoriaId"
              name="categoriaId"
              value={input.categoriaId}
              onChange={handleChange}
            >
              <option value="" disabled>Seleccioná una categoría...</option>
              <optgroup label="Cotización automática">
                {categoriasAuto.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </optgroup>
              <optgroup label="Requiere revisión manual">
                {categoriasManual.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </optgroup>
            </select>
          </div>
        </section>

        {error && <div className={styles.errorBox} role="alert">{error}</div>}

        <div className={styles.formFooter}>
          <button type="submit" className={styles.btnSubmit} disabled={loading}>
            {loading ? "Calculando..." : "Calcular precio →"}
          </button>
        </div>
      </form>

      {resultado?.ok && (
        <div id="resultado-cotizacion">
          <ResultadoCotizacion
            desglose={resultado.desglose}
            cotizacionId={resultado.cotizacionId}
          />
        </div>
      )}
    </div>
  );
}
