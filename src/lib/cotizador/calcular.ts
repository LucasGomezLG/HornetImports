import { getCategoriaById } from "./categorias";
import type { InputCotizacion, CotizacionDesglose } from "./types";

const TARIFA_FLETE_USD_KG = 18;
const FEE_PARTICULAR = 0.15;
const FEE_MAYORISTA = 0.12;
const IVA_RATIO = 0.21;
const TASA_ESTADISTICA_RATIO = 0.03;
const PRECIO_MINIMO_PARTICULAR = 25;
const PRECIO_MINIMO_MAYORISTA = 200;
const PESO_MAX_KG = 30;
const EUROPA_UMBRAL_USD = 100;

function redondearAlMedio(valor: number): number {
  return Math.ceil(valor * 2) / 2;
}

export type RazonRechazo =
  | "categoria_blacklist"
  | "precio_invalido"
  | "precio_minimo"
  | "precio_minimo_mayorista"
  | "peso_excedido";

export type ResultadoCalculo =
  | { ok: true; desglose: CotizacionDesglose }
  | { ok: false; razon: RazonRechazo };

export function calcularCotizacion(
  input: InputCotizacion,
  tipoCambio: number
): ResultadoCalculo {
  const categoria = getCategoriaById(input.categoriaId);
  const esMayorista = input.tipo === "mayorista";

  if (!categoria || categoria.blacklist) return { ok: false, razon: "categoria_blacklist" };
  if (input.precioUsdProducto <= 0) return { ok: false, razon: "precio_invalido" };

  const precioMinimo = esMayorista ? PRECIO_MINIMO_MAYORISTA : PRECIO_MINIMO_PARTICULAR;
  if (input.precioUsdProducto < precioMinimo) {
    return { ok: false, razon: esMayorista ? "precio_minimo_mayorista" : "precio_minimo" };
  }

  if (input.pesoKg <= 0 || input.pesoKg > PESO_MAX_KG) return { ok: false, razon: "peso_excedido" };

  const feeRatio = esMayorista ? FEE_MAYORISTA : FEE_PARTICULAR;
  const pesoFacturable = redondearAlMedio(input.pesoKg);
  const costoFlete = pesoFacturable * TARIFA_FLETE_USD_KG;
  const cif = input.precioUsdProducto + costoFlete;

  const arancelImportacion = cif * categoria.tasaArancel;
  const ivaImportacion = (cif + arancelImportacion) * IVA_RATIO;
  const tasaEstadistica = cif * TASA_ESTADISTICA_RATIO;
  const feeServicio = cif * feeRatio;

  const total = cif + arancelImportacion + ivaImportacion + tasaEstadistica + feeServicio;
  const totalArs = total * tipoCambio;

  const alertaOrigenEuropa =
    input.origen === "europa" && input.precioUsdProducto > EUROPA_UMBRAL_USD;

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
      feeRatio,
      total,
      tipoCambio,
      totalArs,
      tipoImportacion: input.tipo,
      alertaOrigenEuropa,
    },
  };
}
