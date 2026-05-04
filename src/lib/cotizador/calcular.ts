import { getCategoriaById } from "./categorias";
import type { InputCotizacion, CotizacionDesglose } from "./types";

// Tarifa promedio courier China/EEUU, peso facturable (real vs volumétrico)
const TARIFA_FLETE_USD_KG = 18;
// Fee de servicio de importación + cobertura cambiaria (≠ comisión del marketplace 8-12%)
const FEE_SERVICIO_RATIO = 0.15;
// Impuestos fijos AFIP régimen courier
const IVA_RATIO = 0.21;
const TASA_ESTADISTICA_RATIO = 0.03;
// Mínimo operativo para cubrir costos de gestión
const PRECIO_MINIMO_USD = 25;
// Límites del régimen courier argentino (AFIP)
const PESO_MAX_KG = 30;
const VOLUMEN_MAX_M3 = 0.1;

function redondearAlMedio(valor: number): number {
  return Math.ceil(valor * 2) / 2;
}

export type RazonRechazo =
  | "categoria_blacklist"
  | "precio_invalido"
  | "dimensiones_invalidas"
  | "precio_minimo"
  | "volumen_excedido";

export type ResultadoCalculo =
  | { ok: true; desglose: CotizacionDesglose }
  | { ok: false; razon: RazonRechazo };

export function calcularCotizacion(
  input: InputCotizacion,
  tipoCambio: number
): ResultadoCalculo {
  const categoria = getCategoriaById(input.categoriaId);

  if (!categoria || categoria.blacklist) return { ok: false, razon: "categoria_blacklist" };
  if (input.precioUsdProducto <= 0) return { ok: false, razon: "precio_invalido" };
  if (input.precioUsdProducto < PRECIO_MINIMO_USD) return { ok: false, razon: "precio_minimo" };
  if (input.pesoKg <= 0 || input.largo <= 0 || input.ancho <= 0 || input.alto <= 0)
    return { ok: false, razon: "dimensiones_invalidas" };

  const volumenM3 = (input.largo * input.ancho * input.alto) / 1_000_000;
  if (input.pesoKg > PESO_MAX_KG || volumenM3 > VOLUMEN_MAX_M3)
    return { ok: false, razon: "volumen_excedido" };

  const pesoVolumetricoKg = (input.largo * input.ancho * input.alto) / 5000;
  const pesoFacturable = Math.max(
    redondearAlMedio(input.pesoKg),
    redondearAlMedio(pesoVolumetricoKg)
  );

  const costoFlete = pesoFacturable * TARIFA_FLETE_USD_KG;
  const cif = input.precioUsdProducto + costoFlete;

  const arancelImportacion = cif * categoria.tasaArancel;
  const ivaImportacion = (cif + arancelImportacion) * IVA_RATIO;
  const tasaEstadistica = cif * TASA_ESTADISTICA_RATIO;
  const feeServicio = cif * FEE_SERVICIO_RATIO;

  const total = cif + arancelImportacion + ivaImportacion + tasaEstadistica + feeServicio;
  const totalArs = total * tipoCambio;

  return {
    ok: true,
    desglose: {
      precioProducto: input.precioUsdProducto,
      pesoFacturable,
      costoFlete,
      arancelImportacion,
      ivaImportacion,
      tasaEstadistica,
      feeServicio,
      total,
      tipoCambio,
      totalArs,
    },
  };
}
