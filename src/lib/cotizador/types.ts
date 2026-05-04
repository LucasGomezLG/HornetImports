export interface InputCotizacion {
  nombreProducto: string;
  urlProducto: string;
  precioUsdProducto: number;
  pesoKg: number;
  largo: number; // cm
  ancho: number; // cm
  alto: number;  // cm
  categoriaId: string;
}

export interface CotizacionDesglose {
  precioProducto: number;
  pesoFacturable: number;
  costoFlete: number;
  arancelImportacion: number;
  ivaImportacion: number;
  tasaEstadistica: number;
  feeServicio: number;
  total: number;       // USD
  tipoCambio: number;  // ARS por USD
  totalArs: number;    // ARS
}

export type RazonRechazo =
  | "categoria_blacklist"
  | "precio_invalido"
  | "dimensiones_invalidas"
  | "precio_minimo"
  | "volumen_excedido";

export type CotizacionResult =
  | { ok: true; desglose: CotizacionDesglose; cotizacionId: string }
  | { ok: false; razon: RazonRechazo };
