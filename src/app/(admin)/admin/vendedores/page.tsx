import type { Metadata } from "next";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "Vendedores | Admin Hornet Imports" };

const VENDEDORES_MOCK = [
  { id: "V-001", nombre: "TechParts AR", email: "ventas@techparts.com.ar", cuit: "30-71234567-8", listings: 12, ventas: 34, estado: "activo" },
  { id: "V-002", nombre: "Motomania", email: "info@motomania.ar", cuit: "20-28765432-1", listings: 8, ventas: 21, estado: "activo" },
  { id: "V-003", nombre: "Casa Digital", email: "casadigital@gmail.com", cuit: "23-39876543-9", listings: 5, ventas: 9, estado: "activo" },
  { id: "V-004", nombre: "ImportAuto SA", email: "contacto@importauto.com", cuit: "30-60987654-7", listings: 0, ventas: 0, estado: "pendiente" },
  { id: "V-005", nombre: "TechGadgets", email: "hola@techgadgets.ar", cuit: "20-41234567-3", listings: 3, ventas: 2, estado: "suspendido" },
];

const ESTADO_COLOR: Record<string, string> = {
  activo: "green",
  pendiente: "orange",
  suspendido: "red",
};

const ESTADO_LABEL: Record<string, string> = {
  activo: "Activo",
  pendiente: "Pendiente",
  suspendido: "Suspendido",
};

export default function AdminVendedoresPage() {
  const activos = VENDEDORES_MOCK.filter((v) => v.estado === "activo").length;
  const pendientes = VENDEDORES_MOCK.filter((v) => v.estado === "pendiente").length;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Vendedores</h1>
          <p className={styles.subtitle}>{activos} activos · {pendientes} pendientes de aprobación</p>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>CUIT</th>
                <th>Listings</th>
                <th>Ventas</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {VENDEDORES_MOCK.map((v) => (
                <tr key={v.id}>
                  <td className={styles.tdId}>{v.id}</td>
                  <td className={styles.tdNombre}>{v.nombre}</td>
                  <td className={styles.tdEmail}>{v.email}</td>
                  <td className={styles.tdCuit}>{v.cuit}</td>
                  <td className={styles.tdNum}>{v.listings}</td>
                  <td className={styles.tdNum}>{v.ventas}</td>
                  <td>
                    <span className={`${styles.statusChip} ${styles[`status_${ESTADO_COLOR[v.estado]}`]}`}>
                      {ESTADO_LABEL[v.estado]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
