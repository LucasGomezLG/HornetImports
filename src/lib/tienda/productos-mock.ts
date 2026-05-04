export interface ProductoTienda {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  precioUsd: number;
  stock: number;
  destacado: boolean;
}

export const CATEGORIAS_TIENDA = [
  { id: "todos", label: "Todos" },
  { id: "autopartes", label: "Autopartes" },
  { id: "herramientas", label: "Herramientas" },
  { id: "hogar", label: "Hogar" },
  { id: "deporte", label: "Deporte" },
  { id: "accesorios", label: "Accesorios" },
];

export const PRODUCTOS_MOCK: ProductoTienda[] = [
  // Autopartes
  {
    id: "ap-001",
    nombre: "Filtro de aceite Toyota Corolla 2014–2022",
    descripcion: "Filtro original OEM compatible con motores 1.8L y 2.0L.",
    categoria: "autopartes",
    precioUsd: 18.9,
    stock: 12,
    destacado: false,
  },
  {
    id: "ap-002",
    nombre: "Pastillas de freno delanteras Ford Ka",
    descripcion: "Set de 4 pastillas de cerámica de alto rendimiento.",
    categoria: "autopartes",
    precioUsd: 32.5,
    stock: 8,
    destacado: true,
  },
  {
    id: "ap-003",
    nombre: "Kit de distribución Chevrolet Cruze 1.4T",
    descripcion: "Cadena + tensor + polea. Compatible con motor turbo 1.4.",
    categoria: "autopartes",
    precioUsd: 89.9,
    stock: 5,
    destacado: true,
  },
  {
    id: "ap-004",
    nombre: "Sensor de oxígeno universal Bosch",
    descripcion: "Sonda lambda universal 4 cables. Rosca M18 × 1.5.",
    categoria: "autopartes",
    precioUsd: 45.0,
    stock: 7,
    destacado: false,
  },
  {
    id: "ap-005",
    nombre: "Par de faros LED Honda Civic 2022+",
    descripcion: "Luz de día DRL integrada, plug & play, par completo.",
    categoria: "autopartes",
    precioUsd: 124.0,
    stock: 3,
    destacado: false,
  },
  {
    id: "ap-006",
    nombre: "Amortiguador trasero Volkswagen Gol KYB",
    descripcion: "Gas presurizado KYB para Gol Trend 2009–2018.",
    categoria: "autopartes",
    precioUsd: 67.0,
    stock: 6,
    destacado: false,
  },
  // Herramientas
  {
    id: "he-001",
    nombre: 'Llave de torque digital 1/2" 20–200 Nm',
    descripcion: "Pantalla LCD, memoria de 9 ajustes, alarma sonora.",
    categoria: "herramientas",
    precioUsd: 89.0,
    stock: 4,
    destacado: true,
  },
  {
    id: "he-002",
    nombre: "Set de llaves combinadas 20 piezas Cr-V",
    descripcion: "Acero Cr-V pulido satinado. Medidas 6 mm a 32 mm.",
    categoria: "herramientas",
    precioUsd: 54.0,
    stock: 9,
    destacado: false,
  },
  {
    id: "he-003",
    nombre: "Destornillador eléctrico inalámbrico 4V",
    descripcion: "Batería de litio, 28 puntas incluidas, torque 3.5 Nm.",
    categoria: "herramientas",
    precioUsd: 67.5,
    stock: 6,
    destacado: false,
  },
  {
    id: "he-004",
    nombre: "Multímetro digital profesional AC/DC",
    descripcion: "True RMS, temperatura, capacitancia. Bolso incluido.",
    categoria: "herramientas",
    precioUsd: 38.9,
    stock: 11,
    destacado: false,
  },
  // Hogar
  {
    id: "ho-001",
    nombre: "Purificador de aire HEPA H13 280 m³/h",
    descripcion: "Filtro verdadero H13, modo nocturno, WiFi. Hasta 35 m².",
    categoria: "hogar",
    precioUsd: 89.0,
    stock: 4,
    destacado: true,
  },
  {
    id: "ho-002",
    nombre: "Cafetera pour-over acero inoxidable 600 ml",
    descripcion: "Filtro permanente, jarra térmica, libre de BPA.",
    categoria: "hogar",
    precioUsd: 42.0,
    stock: 7,
    destacado: false,
  },
  // Deporte
  {
    id: "de-001",
    nombre: "Rodilleras de escalada bouldering premium",
    descripcion: "Neopreno reforzado, velcro ajustable, par.",
    categoria: "deporte",
    precioUsd: 38.0,
    stock: 5,
    destacado: false,
  },
  {
    id: "de-002",
    nombre: "Soporte lumbar para ciclismo y running",
    descripcion: "Velcro anatómico, transpirable, talla S–XL.",
    categoria: "deporte",
    precioUsd: 24.9,
    stock: 8,
    destacado: false,
  },
  // Accesorios
  {
    id: "ac-001",
    nombre: "Soporte magnético para celular — auto",
    descripcion: "Imán N52, para rejilla de ventilación, universal.",
    categoria: "accesorios",
    precioUsd: 19.9,
    stock: 15,
    destacado: false,
  },
  {
    id: "ac-002",
    nombre: "Organizador de cables escritorio 6 clips",
    descripcion: "Silicona premium, adhesivo 3M, colores surtidos.",
    categoria: "accesorios",
    precioUsd: 14.9,
    stock: 20,
    destacado: false,
  },
];
