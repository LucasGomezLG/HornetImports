export type UserRole = "particular" | "mayorista" | "vendedor" | "admin";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface Cotizacion {
  id: string;
  userId: string;
  url: string;
  pesoKg: number;
  largo: number;
  ancho: number;
  alto: number;
  categoriaId: string;
  precioProductoUsd: number;
  totalUsd: number;
  estado: CotizacionEstado;
  createdAt: string;
}

export type CotizacionEstado =
  | "borrador"
  | "pendiente_revision"
  | "aprobada"
  | "pagada"
  | "en_transito"
  | "entregada"
  | "cancelada";

export interface Producto {
  id: string;
  nombre: string;
  precioUsd: number;
  imagenUrl: string;
  categoriaId: string;
  stock: number;
}
