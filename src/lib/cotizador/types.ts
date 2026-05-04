export type OrigenProducto = "asia" | "europa" | "eeuu" | "otro";

export interface InputCotizacion {
  nombreProducto: string;
  urlProducto: string;
  precioUsdProducto: number;
  pesoKg: number;
  categoriaId: string;
  origen: OrigenProducto;
}

export interface CotizacionDesglose {
  precioProducto: number;
  pesoFacturable: number;
  costoFlete: number;
  arancelImportacion: number;
  ivaImportacion: number;
  tasaEstadistica: number;
  feeServicio: number;
  total: number;
  tipoCambio: number;
  totalArs: number;
  alertaOrigenEuropa: boolean;
}

export type RazonRechazo =
  | "categoria_blacklist"
  | "precio_invalido"
  | "precio_minimo"
  | "peso_excedido";

export type CotizacionResult =
  | { ok: true; desglose: CotizacionDesglose; cotizacionId: string | null }
  | { ok: false; razon: RazonRechazo };
