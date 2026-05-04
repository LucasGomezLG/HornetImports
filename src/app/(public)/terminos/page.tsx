import type { Metadata } from "next";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Términos y Condiciones | Hornet Imports",
};

const SECCIONES = [
  {
    titulo: "1. Aceptación de los términos",
    contenido:
      "Al usar la plataforma Hornet Imports, aceptás estos términos en su totalidad. Si no estás de acuerdo con alguna parte, no debés usar el servicio.",
  },
  {
    titulo: "2. Descripción del servicio",
    contenido:
      "Hornet Imports es una plataforma que facilita la importación de productos desde el exterior a la República Argentina bajo el régimen Courier (hasta 30 kg y USD 3.000 por envío). También operamos un marketplace local donde vendedores publican productos ya importados.",
  },
  {
    titulo: "3. Cotizaciones y precios",
    contenido:
      "Las cotizaciones generadas por el sistema son estimaciones. El precio final puede variar ±5% según el tipo de cambio vigente al momento del despacho aduanero, el peso volumétrico real del paquete y otros factores. La confirmación de precio definitivo se realiza antes del cobro.",
  },
  {
    titulo: "4. Plazos de entrega",
    contenido:
      "Los plazos estimados son de 15 a 25 días hábiles desde la confirmación del pago. Pueden extenderse por demoras en aduana, fuerza mayor o situaciones externas a Hornet Imports. No nos hacemos responsables por demoras atribuibles a terceros.",
  },
  {
    titulo: "5. Productos prohibidos",
    contenido:
      "No aceptamos la importación de armas, explosivos, drogas, medicamentos sin prescripción, productos que violen derechos de propiedad intelectual, ni cualquier artículo prohibido por la legislación argentina vigente.",
  },
  {
    titulo: "6. Devoluciones y reclamos",
    contenido:
      "Una vez que el paquete está en tránsito internacional, no se aceptan cancelaciones. Los reclamos por productos dañados o incorrectos deben presentarse dentro de los 5 días hábiles de recibida la mercadería, con evidencia fotográfica.",
  },
  {
    titulo: "7. Responsabilidad",
    contenido:
      "Hornet Imports actúa como intermediario en el proceso de importación. No somos responsables por cambios en las regulaciones aduaneras, retenciones de aduana, ni por la calidad intrínseca de los productos adquiridos a terceros.",
  },
  {
    titulo: "8. Cambios en los términos",
    contenido:
      "Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios serán notificados por email y entrarán en vigencia 7 días después de su publicación.",
  },
];

export default function TerminosPage() {
  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>Legal</p>
          <h1 className={styles.title}>Términos y Condiciones</h1>
          <p className={styles.subtitle}>Última actualización: mayo 2026</p>
        </div>
      </section>

      <section className={styles.content}>
        <div className={styles.container}>
          {SECCIONES.map((s) => (
            <div key={s.titulo} className={styles.seccion}>
              <h2 className={styles.seccionTitulo}>{s.titulo}</h2>
              <p className={styles.seccionTexto}>{s.contenido}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
