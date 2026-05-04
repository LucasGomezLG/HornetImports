import { getCategoriaById } from "./categorias";
import type { InputCotizacion, CotizacionDesglose, CotizacionResult } from "./types";

// Tarifas y límites operativos
const TARIFA_FLETE_USD_KG = 18;
const FEE_SERVICIO_RATIO = 0.15;
const IVA_RATIO = 0.21;
const TASA_ESTADISTICA_RATIO = 0.03;
const PRECIO_MINIMO_USD = 25;
const PESO_MAX_KG = 30;
const VOLUMEN_MAX_M3 = 0.1; // blacklist: voluminosos > 0.1 m³ (per docs)

function redondearAlMedio(valor: number): number {
  // Round up to nearest 0.5 kg (standard courier billing)
  return Math.ceil(valor * 2) / 2;
}

export function calcularCotizacion(input: InputCotizacion): CotizacionResult {
  const categoria = getCategoriaById(input.categoriaId);

  if (!categoria || categoria.blacklist) {
    return { ok: false, razon: "categoria_blacklist" };
  }

  if (input.precioUsdProducto <= 0) {
    return { ok: false, razon: "precio_invalido" };
  }

  if (input.precioUsdProducto < PRECIO_MINIMO_USD) {
    return { ok: false, razon: "precio_minimo" };
  }

  if (input.pesoKg <= 0 || input.largo <= 0 || input.ancho <= 0 || input.alto <= 0) {
    return { ok: false, razon: "dimensiones_invalidas" };
  }

  const volumenM3 = (input.largo * input.ancho * input.alto) / 1_000_000;
  if (input.pesoKg > PESO_MAX_KG || volumenM3 > VOLUMEN_MAX_M3) {
    return { ok: false, razon: "volumen_excedido" };
  }

  // Peso volumétrico: divisor 5000 cm³/kg estándar aéreo
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

  const total =
    cif + arancelImportacion + ivaImportacion + tasaEstadistica + feeServicio;

  const desglose: CotizacionDesglose = {
    precioProducto: input.precioUsdProducto,
    pesoFacturable,
    costoFlete,
    arancelImportacion,
    ivaImportacion,
    tasaEstadistica,
    feeServicio,
    total,
  };

  return { ok: true, desglose };
}
