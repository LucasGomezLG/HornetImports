"use client";

import { useState } from "react";
import { CATEGORIAS } from "@/lib/cotizador/categorias";
import type { InputCotizacion, CotizacionResult, TipoImportacion } from "@/lib/cotizador/types";
import ResultadoCotizacion from "./ResultadoCotizacion";
import styles from "./CotizadorForm.module.css";

const INPUT_INICIAL: InputCotizacion = {
  nombreProducto: "",
  urlProducto: "",
  precioUsdProducto: 0,
  pesoKg: 0,
  categoriaId: "",
  origen: "asia",
  tipo: "particular",
};

function readUtmSource(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return new URLSearchParams(window.location.search).get("utm_source") ?? undefined;
}

const ORIGENES = [
  { value: "asia",   label: "Asia / China" },
  { value: "eeuu",   label: "EE.UU." },
  { value: "europa", label: "Europa" },
  { value: "otro",   label: "Otro origen" },
] as const;

const MENSAJES_ERROR: Record<string, string> = {
  categoria_blacklist: "Esta categoría requiere cotización manual. Te contactamos en menos de 24 hs.",
  precio_invalido: "Ingresá el precio del producto en USD.",
  precio_minimo: "El precio mínimo para importar es USD 25.",
  precio_minimo_mayorista: "El mínimo para importación mayorista es USD 200 por envío.",
  peso_excedido: "El peso debe estar entre 0.1 y 30 kg. Para envíos más pesados, escribinos.",
  rate_limit: "Demasiadas consultas. Esperá un momento e intentá de nuevo.",
};

export default function CotizadorForm() {
  const [input, setInput] = useState<InputCotizacion>(INPUT_INICIAL);
  const [resultado, setResultado] = useState<CotizacionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorManual, setErrorManual] = useState<string | null>(null);

  function handleTipo(tipo: TipoImportacion) {
    setInput((prev) => ({ ...prev, tipo }));
    setResultado(null);
    setErrorManual(null);
  }

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
    if (!input.pesoKg) { setErrorManual("Ingresá el peso aproximado del paquete."); return; }

    setLoading(true);
    setErrorManual(null);

    try {
      const res = await fetch("/api/cotizar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...input, utmSource: readUtmSource() }),
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
  const esMayorista = input.tipo === "mayorista";
  const categoriasAuto = CATEGORIAS.filter((c) => !c.blacklist);
  const categoriasManual = CATEGORIAS.filter((c) => c.blacklist);

  return (
    <div className={styles.wrapper}>
      {/* Toggle particular / mayorista */}
      <div className={styles.tipoToggle}>
        <button
          type="button"
          className={`${styles.tipoBtn} ${!esMayorista ? styles.tipoBtnActive : ""}`}
          onClick={() => handleTipo("particular")}
        >
          <span className={styles.tipoIcon}>🛒</span>
          <span className={styles.tipoLabel}>Importo para mí</span>
          <span className={styles.tipoDesc}>Particular · Fee 15%</span>
        </button>
        <button
          type="button"
          className={`${styles.tipoBtn} ${esMayorista ? styles.tipoBtnActive : ""}`}
          onClick={() => handleTipo("mayorista")}
        >
          <span className={styles.tipoIcon}>🏢</span>
          <span className={styles.tipoLabel}>Importo para mi empresa</span>
          <span className={styles.tipoDesc}>Mayorista · Fee 12%</span>
        </button>
      </div>

      {esMayorista && (
        <div className={styles.mayoristaBanner}>
          <div className={styles.mayoristaItems}>
            <span>✓ Fee reducido al 12% (vs 15% particular)</span>
            <span>✓ Precios escalonados por volumen acumulado</span>
            <span>✓ Gestión y soporte prioritario</span>
            <span>⚠ Mínimo USD 200 por importación</span>
          </div>
        </div>
      )}

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
            <label className={styles.label} htmlFor="precioUsdProducto">
              Precio del producto
              {esMayorista && <span className={styles.labelHint}> · mín. USD 200</span>}
            </label>
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
          <h3 className={styles.sectionTitle}>Peso y origen</h3>

          <div className={styles.fieldGrid2}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="pesoKg">Peso del paquete</label>
              <div className={styles.inputGroup}>
                <input
                  className={`${styles.input} ${styles.inputWithSuffix}`}
                  id="pesoKg"
                  name="pesoKg"
                  type="number"
                  min="0.1"
                  max="30"
                  step="0.1"
                  placeholder="0.0"
                  value={input.pesoKg || ""}
                  onChange={handleChange}
                />
                <span className={styles.inputSuffix}>kg</span>
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="origen">País de origen</label>
              <select
                className={styles.select}
                id="origen"
                name="origen"
                value={input.origen}
                onChange={handleChange}
              >
                {ORIGENES.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          <p className={styles.hint}>
            Máximo 30 kg por envío según el régimen Courier AFIP.
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
          {resultado.desglose.alertaOrigenEuropa && (
            <div className={styles.alertaEuropa} role="alert">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0, marginTop: 2 }}>
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <div>
                <strong>Producto de origen europeo</strong>
                <p>Si hace escala en EE.UU., puede aplicar un arancel adicional del 50% para productos mayores a USD 100. Nuestro equipo lo revisa antes de confirmar el precio final.</p>
              </div>
            </div>
          )}
          <ResultadoCotizacion
            desglose={resultado.desglose}
            cotizacionId={resultado.cotizacionId}
          />
        </div>
      )}
    </div>
  );
}
