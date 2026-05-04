export interface Categoria {
  id: string;
  nombre: string;
  tasaArancel: number; // ratio decimal (0.35 = 35%)
  blacklist: boolean;
}

export const CATEGORIAS: Categoria[] = [
  // Whitelist — cotización automática
  { id: "autopartes", nombre: "Autopartes y repuestos", tasaArancel: 0.35, blacklist: false },
  { id: "herramientas", nombre: "Herramientas y equipamiento", tasaArancel: 0.35, blacklist: false },
  { id: "indumentaria", nombre: "Ropa y calzado", tasaArancel: 0.35, blacklist: false },
  { id: "hogar", nombre: "Hogar y decoración", tasaArancel: 0.35, blacklist: false },
  { id: "deporte", nombre: "Deportes y fitness", tasaArancel: 0.35, blacklist: false },
  { id: "juguetes", nombre: "Juguetes y entretenimiento", tasaArancel: 0.35, blacklist: false },
  { id: "libros", nombre: "Libros y materiales educativos", tasaArancel: 0.0, blacklist: false },
  { id: "accesorios", nombre: "Accesorios y bijouterie", tasaArancel: 0.35, blacklist: false },
  // Blacklist — requiere revisión manual
  { id: "tecnologia", nombre: "Electrónica / Tecnología", tasaArancel: 0.16, blacklist: true },
  { id: "alimentos", nombre: "Alimentos y bebidas", tasaArancel: 0.35, blacklist: true },
  { id: "cosmeticos", nombre: "Cosméticos y perfumería", tasaArancel: 0.35, blacklist: true },
  { id: "otros", nombre: "Otro rubro", tasaArancel: 0.35, blacklist: true },
];

export function getCategoriaById(id: string): Categoria | undefined {
  return CATEGORIAS.find((c) => c.id === id);
}
