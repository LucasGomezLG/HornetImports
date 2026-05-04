export interface ListingMarketplace {
  id: string;
  nombre: string;
  descripcion: string;
  vendedor: string;
  categoria: string;
  precioUsd: number;
  calificacion: number;
}

export const CATEGORIAS_MARKETPLACE = [
  { id: "todos", label: "Todos" },
  { id: "autopartes", label: "Autopartes" },
  { id: "herramientas", label: "Herramientas" },
  { id: "electronica", label: "Electrónica" },
  { id: "hogar", label: "Hogar" },
  { id: "indumentaria", label: "Indumentaria" },
];

export const LISTINGS_MOCK: ListingMarketplace[] = [
  {
    id: "ml-001",
    nombre: "Batería para moto 12V 7Ah YTX7A-BS",
    descripcion: "Compatible con Honda, Yamaha, Zanella. Garantía 6 meses.",
    vendedor: "MotoPartes Rosario",
    categoria: "autopartes",
    precioUsd: 28.0,
    calificacion: 5,
  },
  {
    id: "ml-002",
    nombre: "Kit gomas de suspensión Fiat Palio",
    descripcion: "Trapecio delantero completo. Caucho reforzado.",
    vendedor: "RepuestosFast",
    categoria: "autopartes",
    precioUsd: 44.5,
    calificacion: 4,
  },
  {
    id: "ml-003",
    nombre: "Cinturón de herramientas cuero 12 bolsillos",
    descripcion: "Cuero genuino, argollas de acero, talla única ajustable.",
    vendedor: "ToolZone BA",
    categoria: "herramientas",
    precioUsd: 35.0,
    calificacion: 5,
  },
  {
    id: "ml-004",
    nombre: "Juego de brocas titanio 19 piezas",
    descripcion: "Revestimiento TiN, para madera, metal y plástico.",
    vendedor: "ToolZone BA",
    categoria: "herramientas",
    precioUsd: 22.9,
    calificacion: 4,
  },
  {
    id: "ml-005",
    nombre: "Hub USB-C 7 en 1 aluminio",
    descripcion: "HDMI 4K, USB 3.0 ×3, SD/MicroSD, PD 100W.",
    vendedor: "TechStore CABA",
    categoria: "electronica",
    precioUsd: 39.0,
    calificacion: 5,
  },
  {
    id: "ml-006",
    nombre: "Webcam 1080p con micrófono incorporado",
    descripcion: "Autofoco, luz LED regulable, plug & play USB.",
    vendedor: "TechStore CABA",
    categoria: "electronica",
    precioUsd: 48.0,
    calificacion: 4,
  },
  {
    id: "ml-007",
    nombre: "Silla de escritorio ergonómica mesh",
    descripcion: "Apoyabrazos 4D, lumbar ajustable, hasta 120 kg.",
    vendedor: "Muebles Flex GBA",
    categoria: "hogar",
    precioUsd: 189.0,
    calificacion: 5,
  },
  {
    id: "ml-008",
    nombre: "Lámpara de escritorio LED táctil 3 temperaturas",
    descripcion: "USB-C recargable, 5 niveles de brillo, brazo flexible.",
    vendedor: "Muebles Flex GBA",
    categoria: "hogar",
    precioUsd: 27.0,
    calificacion: 4,
  },
  {
    id: "ml-009",
    nombre: "Campera impermeable trekking unisex",
    descripcion: "Membrana 3 capas, capucha ajustable, bolsillos sellados.",
    vendedor: "OutdoorAR",
    categoria: "indumentaria",
    precioUsd: 75.0,
    calificacion: 5,
  },
  {
    id: "ml-010",
    nombre: "Zapatillas trail running trail grip",
    descripcion: "Suela Vibram, talle 37–46, varios colores.",
    vendedor: "OutdoorAR",
    categoria: "indumentaria",
    precioUsd: 92.0,
    calificacion: 4,
  },
  {
    id: "ml-011",
    nombre: "Soporte doble monitor hasta 32\" gas lift",
    descripcion: "Brazo articulado, gestión de cables integrada.",
    vendedor: "TechStore CABA",
    categoria: "electronica",
    precioUsd: 64.0,
    calificacion: 5,
  },
  {
    id: "ml-012",
    nombre: "Aceite sintético 5W40 bidón 4 litros",
    descripcion: "Certificación ACEA C3 / API SN. Apto turbo.",
    vendedor: "MotoPartes Rosario",
    categoria: "autopartes",
    precioUsd: 31.5,
    calificacion: 4,
  },
];
