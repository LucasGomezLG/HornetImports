import { getCategoriaById } from "./categorias";
import type { InputCotizacion, CotizacionDesglose } from "./types";

const TARIFA_FLETE_USD_KG = 18;
const FEE_SERVICIO_RATIO = 0.15;
const IVA_RATIO = 0.21;
const TASA_ESTADISTICA_RATIO = 0.03;
const PRECIO_MINIMO_USD = 25;
const PESO_MAX_KG = 30;
// Umbral para alerta de arancel extra en productos de origen europeo con escala en EE.UU.
const EUROPA_UMBRAL_USD = 100;

function redondearAlMedio(valor: number): number {
  return Math.ceil(valor * 2) / 2;
}

export type RazonRechazo =
  | "categoria_blacklist"
  | "precio_invalido"
  | "precio_minimo"
  | "peso_excedido";

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
  if (input.pesoKg <= 0 || input.pesoKg > PESO_MAX_KG) return { ok: false, razon: "peso_excedido" };

  const pesoFacturable = redondearAlMedio(input.pesoKg);
  const costoFlete = pesoFacturable * TARIFA_FLETE_USD_KG;
  const cif = input.precioUsdProducto + costoFlete;

  const arancelImportacion = cif * categoria.tasaArancel;
  const ivaImportacion = (cif + arancelImportacion) * IVA_RATIO;
  const tasaEstadistica = cif * TASA_ESTADISTICA_RATIO;
  const feeServicio = cif * FEE_SERVICIO_RATIO;

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
      total,
      tipoCambio,
      totalArs,
      alertaOrigenEuropa,
    },
  };
}
