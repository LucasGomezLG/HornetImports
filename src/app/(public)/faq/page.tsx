import type { Metadata } from "next";
import Link from "next/link";
import FaqAccordion from "./FaqAccordion";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "Preguntas frecuentes | Hornet Imports" };

const FAQS = [
  {
    grupo: "Sobre el servicio",
    items: [
      {
        q: "¿Qué es Hornet Imports?",
        a: "Somos una plataforma argentina de importación y marketplace. Podés cotizar y encargar cualquier producto del exterior (Amazon, AliExpress, eBay, etc.), comprar en nuestra tienda pre-cotizada o vender tus productos con la comisión más baja del mercado (8–12% vs el 13–17% de Mercado Libre).",
      },
      {
        q: "¿De qué países importamos?",
        a: "China, Estados Unidos, Brasil, Europa y cualquier origen que opere bajo régimen courier o carga general. El 90% de los pedidos salen de China o EE.UU. Los tiempos varían según el origen: China 15–20 días, EE.UU. 8–12 días, Europa 12–18 días.",
      },
      {
        q: "¿Cómo se compara con importar por cuenta propia?",
        a: "Importar solo requiere cuenta en el courier, banco habilitado para pago internacional, gestión del DUA y un despachante. Con nosotros, ninguno de esos pasos corre por tu cuenta. Gestionamos todo y el precio que ves en el cotizador incluye flete, impuestos y fee de servicio, sin sorpresas.",
      },
    ],
  },
  {
    grupo: "Tiempos y logística",
    items: [
      {
        q: "¿Cuánto tarda el envío?",
        a: "Entre 15 y 25 días hábiles puerta a puerta desde la confirmación del pedido. Esto incluye el tiempo de compra al proveedor, consolidación, embarque, aduana argentina y última milla. Tenés tracking en tiempo real en cada etapa.",
      },
      {
        q: "¿Cuánto puedo importar? ¿Hay un límite?",
        a: "Bajo el régimen courier, el límite es USD 3.000 por envío para personas físicas. Si necesitás más, podés hacer múltiples envíos en diferentes meses o gestionar por régimen de importación general (B2B). Para empresas, el límite es mayor — consultanos.",
      },
      {
        q: "¿Qué productos no acepta la plataforma?",
        a: "No importamos armas, explosivos, drogas, productos biológicos sin certificación, divisas, medicamentos sin receta profesional certificada, tabaco a granel y cualquier producto prohibido por el Código Aduanero argentino. Tampoco artículos con restricciones de marca sin licencia (réplicas, falsificaciones).",
      },
      {
        q: "¿Qué pasa si el paquete llega dañado o no llega?",
        a: "Todos los envíos incluyen cobertura básica de hasta USD 200 por daño en tránsito. Si el paquete no llega o llega dañado, abrimos un reclamo al courier y te actualizamos en 48 hs. Recomendamos el seguro adicional para envíos de valor superior a USD 200.",
      },
    ],
  },
  {
    grupo: "Costos y pago",
    items: [
      {
        q: "¿Cómo se calcula el precio total?",
        a: "El cotizador suma: precio del producto + flete internacional (según peso real o volumétrico, el mayor) + arancel de importación (según categoría) + IVA 21% + tasa estadística 3% + fee del servicio (incluye cobertura cambiaria). Todo se muestra antes de confirmar.",
      },
      {
        q: "¿Cómo pago? ¿En pesos o dólares?",
        a: "El pago se hace en pesos argentinos via Mercado Pago (tarjeta, transferencia o cuotas). Usamos el tipo de cambio oficial al momento del pago con una cobertura cambiaria incluida en el fee. No manejamos cripto ni transferencias directas al exterior.",
      },
      {
        q: "¿Hay restricciones por CEPO o AFIP?",
        a: "Operamos bajo el régimen courier (Courier Internacional / Envíos Postales), que está habilitado para personas físicas con CUIT o CUIL. No requiere apertura de carta de crédito ni autorización BCRA especial. El DUA lo gestiona nuestro equipo.",
      },
    ],
  },
  {
    grupo: "Marketplace y vendedores",
    items: [
      {
        q: "¿Cuánto es la comisión para vender?",
        a: "Entre 8% y 12% según categoría (indumentaria 8%, artesanías 9%, hogar 10%, herramientas 11%, electrónica 12%). No hay mensualidad ni costo de alta. Solo pagás comisión cuando efectivamente vendés.",
      },
      {
        q: "¿Necesito CUIT para vender?",
        a: "Sí. Validamos el CUIT contra el padrón de AFIP de forma automática. El proceso tarda menos de 2 minutos y no requiere presentar documentación adicional en papel.",
      },
      {
        q: "¿Cómo cobro mis ventas?",
        a: "Integramos Mercado Pago. El dinero de cada venta va directo a tu cuenta MP descontando la comisión automáticamente. No hay período de retención de fondos adicional al que aplica Mercado Pago por defecto.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>Preguntas frecuentes</p>
          <h1 className={styles.heroTitle}>Todo lo que necesitás saber</h1>
          <p className={styles.heroSubtitle}>
            Si no encontrás tu respuesta acá, escribinos a{" "}
            <a href="mailto:hola@hornetimports.com" className={styles.heroEmail}>
              hola@hornetimports.com
            </a>
          </p>
        </div>
      </section>

      <section className={styles.faqSection}>
        <div className={styles.container}>
          <FaqAccordion grupos={FAQS} />
        </div>
      </section>

      <section className={styles.cta}>
        <div className={styles.ctaInner}>
          <h2 className={styles.ctaTitle}>¿Listo para importar?</h2>
          <p className={styles.ctaSubtitle}>
            Cotizá tu primer producto en menos de 2 minutos.
          </p>
          <div className={styles.ctaBtns}>
            <Link href="/cotizar" className={styles.btnPrimary}>
              Cotizá ahora →
            </Link>
            <Link href="/como-funciona" className={styles.btnSecondary}>
              Ver cómo funciona
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
