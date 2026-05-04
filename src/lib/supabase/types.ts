export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type TipoCuenta = "comprador" | "vendedor" | "admin";
export type EstadoCotizacion = "pendiente" | "aprobada" | "rechazada" | "expirada";
export type EstadoPedido =
  | "en_proceso"
  | "comprado"
  | "en_transito"
  | "en_aduana"
  | "entregado"
  | "cancelado";

export interface Database {
  public: {
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          nombre: string | null;
          apellido: string | null;
          telefono: string | null;
          cuit: string | null;
          tipo: TipoCuenta;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          nombre?: string | null;
          apellido?: string | null;
          telefono?: string | null;
          cuit?: string | null;
          tipo?: TipoCuenta;
          created_at?: string;
        };
        Update: {
          nombre?: string | null;
          apellido?: string | null;
          telefono?: string | null;
          cuit?: string | null;
          tipo?: TipoCuenta;
        };
        Relationships: [];
      };
      cotizaciones: {
        Row: {
          id: string;
          user_id: string | null;
          producto_url: string;
          nombre_producto: string;
          precio_usd: number;
          peso_kg: number;
          categoria: string;
          costo_total_ars: number;
          desglose: Json;
          estado: EstadoCotizacion;
          aprobada_por_admin: boolean;
          tipo_servicio: string;
          utm_source: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          producto_url: string;
          nombre_producto: string;
          precio_usd: number;
          peso_kg: number;
          categoria: string;
          costo_total_ars: number;
          desglose?: Json;
          estado?: EstadoCotizacion;
          aprobada_por_admin?: boolean;
          tipo_servicio?: string;
          utm_source?: string | null;
          created_at?: string;
        };
        Update: {
          estado?: EstadoCotizacion;
          costo_total_ars?: number;
          aprobada_por_admin?: boolean;
        };
        Relationships: [];
      };
      pedidos: {
        Row: {
          id: string;
          cotizacion_id: string | null;
          user_id: string;
          producto_nombre: string;
          producto_url: string | null;
          precio_usd: number;
          costo_total_ars: number;
          estado: EstadoPedido;
          tracking_code: string | null;
          tracking_codigo_cliente: string | null;
          tipo_servicio: string;
          origen: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          cotizacion_id?: string | null;
          user_id: string;
          producto_nombre: string;
          producto_url?: string | null;
          precio_usd: number;
          costo_total_ars: number;
          estado?: EstadoPedido;
          tracking_code?: string | null;
          tracking_codigo_cliente?: string | null;
          tipo_servicio?: string;
          origen?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          estado?: EstadoPedido;
          tracking_code?: string | null;
          tracking_codigo_cliente?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      listings: {
        Row: {
          id: string;
          vendedor_id: string;
          nombre: string;
          descripcion: string | null;
          precio_usd: number | null;
          precio_ars: number;
          categoria: string;
          imagen_url: string | null;
          stock: number;
          activo: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          vendedor_id: string;
          nombre: string;
          descripcion?: string | null;
          precio_usd?: number | null;
          precio_ars: number;
          categoria: string;
          imagen_url?: string | null;
          stock?: number;
          activo?: boolean;
          created_at?: string;
        };
        Update: {
          nombre?: string;
          descripcion?: string | null;
          precio_ars?: number;
          categoria?: string;
          imagen_url?: string | null;
          stock?: number;
          activo?: boolean;
        };
        Relationships: [];
      };
    };
  };
}
