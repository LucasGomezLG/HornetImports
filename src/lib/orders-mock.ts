export type OrderStatus = "en_proceso" | "en_transito" | "entregado" | "cancelado";

export interface Order {
  id: string;
  fecha: string;
  producto: string;
  categoria: string;
  estado: OrderStatus;
  precioUsd: number;
  origen: string;
  comprador: string;
  tracking: string;
}

export const STATUS_LABEL: Record<OrderStatus, string> = {
  en_proceso:  "En proceso",
  en_transito: "En tránsito",
  entregado:   "Entregado",
  cancelado:   "Cancelado",
};

export const ORDERS_MOCK: Order[] = [
  {
    id: "HI-0041",
    fecha: "2026-05-03",
    producto: "Kit de distribución Chevrolet Cruze 1.4T",
    categoria: "autopartes",
    estado: "en_transito",
    precioUsd: 89.9,
    origen: "China",
    comprador: "Carlos M.",
    tracking: "CN9182736450AR",
  },
  {
    id: "HI-0040",
    fecha: "2026-05-02",
    producto: "Hub USB-C 7 en 1 aluminio",
    categoria: "electronica",
    estado: "en_proceso",
    precioUsd: 39.0,
    origen: "China",
    comprador: "Sofía R.",
    tracking: "CN9182736449AR",
  },
  {
    id: "HI-0039",
    fecha: "2026-04-28",
    producto: "Purificador de aire HEPA H13",
    categoria: "hogar",
    estado: "entregado",
    precioUsd: 89.0,
    origen: "China",
    comprador: "Matías L.",
    tracking: "CN9182736448AR",
  },
  {
    id: "HI-0038",
    fecha: "2026-04-25",
    producto: "Pastillas de freno delanteras Ford Ka",
    categoria: "autopartes",
    estado: "entregado",
    precioUsd: 32.5,
    origen: "Brasil",
    comprador: "Laura V.",
    tracking: "BR8172635449AR",
  },
  {
    id: "HI-0037",
    fecha: "2026-04-20",
    producto: "Llave de torque digital 1/2\"",
    categoria: "herramientas",
    estado: "entregado",
    precioUsd: 89.0,
    origen: "China",
    comprador: "Carlos M.",
    tracking: "CN9182736447AR",
  },
  {
    id: "HI-0036",
    fecha: "2026-04-15",
    producto: "Campera impermeable trekking unisex",
    categoria: "indumentaria",
    estado: "cancelado",
    precioUsd: 75.0,
    origen: "China",
    comprador: "Pedro G.",
    tracking: "",
  },
];

export const ADMIN_STATS = {
  pedidosHoy: 3,
  ingresosUsd: 1248,
  vendedoresActivos: 7,
  cotizacionesPendientes: 12,
};
