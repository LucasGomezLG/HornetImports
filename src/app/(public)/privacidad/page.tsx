import type { Metadata } from "next";
import styles from "../terminos/page.module.css";

export const metadata: Metadata = {
  title: "Política de Privacidad | Hornet Imports",
};

const SECCIONES = [
  {
    titulo: "1. Datos que recopilamos",
    contenido:
      "Recopilamos nombre, email, dirección de entrega y datos de uso de la plataforma. También registramos información de los productos cotizados e importados para mejorar el servicio.",
  },
  {
    titulo: "2. Uso de los datos",
    contenido:
      "Usamos tus datos para procesar importaciones, enviarte actualizaciones de tu pedido, y mejorar la plataforma. No vendemos ni compartimos tus datos personales con terceros, salvo lo necesario para el despacho aduanero (AFIP, couriers).",
  },
  {
    titulo: "3. Cookies",
    contenido:
      "Usamos cookies de sesión para mantener tu inicio de sesión activo. No usamos cookies de seguimiento ni publicidad de terceros.",
  },
  {
    titulo: "4. Seguridad",
    contenido:
      "Los datos se almacenan con cifrado en reposo y en tránsito (TLS). Las contraseñas se guardan con hash bcrypt. Nunca almacenamos datos de tarjetas de crédito.",
  },
  {
    titulo: "5. Retención de datos",
    contenido:
      "Mantenemos tus datos mientras la cuenta esté activa. Al eliminar tu cuenta, tus datos personales se borran en un plazo de 30 días, excepto los registros contables que exige la legislación argentina.",
  },
  {
    titulo: "6. Tus derechos",
    contenido:
      "Tenés derecho a acceder, rectificar y eliminar tus datos personales. Para ejercer estos derechos, escribinos a privacidad@hornetimports.com.",
  },
  {
    titulo: "7. Cambios en esta política",
    contenido:
      "Notificaremos cambios significativos por email con 7 días de anticipación.",
  },
];

export default function PrivacidadPage() {
  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>Legal</p>
          <h1 className={styles.title}>Política de Privacidad</h1>
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
