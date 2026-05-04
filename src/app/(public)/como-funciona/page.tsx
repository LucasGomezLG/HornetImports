import type { Metadata } from "next";
import Link from "next/link";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Cómo funciona | Hornet Imports",
  description:
    "Guía completa del proceso de importación, compra en tienda y venta en el marketplace de Hornet Imports.",
};

const PASOS_IMPORTACION = [
  {
    num: "1",
    titulo: "Cotizás el producto",
    desc: "Pegás el link del producto (Amazon, AliExpress, cualquier tienda), cargás el precio en USD y las dimensiones. El cotizador calcula en segundos el costo total con flete, aranceles e IVA.",
  },
  {
    num: "2",
    titulo: "Confirmás el pedido",
    desc: "Si el precio te conviene, creás una cuenta y hacés el pedido. Pagás en pesos con Mercado Pago (tarjeta, transferencia o cuotas).",
  },
  {
    num: "3",
    titulo: "Compramos por vos",
    desc: "Nuestro equipo compra el producto al proveedor usando tu cotización aprobada. Confirmamos la compra en menos de 24 horas hábiles.",
  },
  {
    num: "4",
    titulo: "El producto viaja hacia Argentina",
    desc: "Una vez despachado, recibís el código de tracking. Podés seguir el envío en tiempo real desde nuestro panel de seguimiento.",
  },
  {
    num: "5",
    titulo: "Aduana y despacho",
    desc: "Nuestro equipo gestiona el DUA, la factura comercial y el packing list. Vos no hacés nada en este paso.",
  },
  {
    num: "6",
    titulo: "Recibís en tu domicilio",
    desc: "El courier entrega en la dirección que registraste. Si hay algún inconveniente con el despacho, te avisamos y gestionamos la solución.",
  },
];

const PASOS_TIENDA = [
  {
    num: "1",
    titulo: "Explorás el catálogo",
    desc: "Productos importados repetidamente, con precio total ya calculado. Sin necesidad de cotizar ni esperar.",
  },
  {
    num: "2",
    titulo: "Comprás con un click",
    desc: "El precio que ves incluye todo. Pagás con Mercado Pago y listo.",
  },
  {
    num: "3",
    titulo: "Recibís en 15–25 días",
    desc: "Tracking en tiempo real desde el despacho hasta la entrega en tu domicilio.",
  },
];

const PASOS_VENDER = [
  {
    num: "1",
    titulo: "Creás tu cuenta gratis",
    desc: "Registro con email o Google. Validación automática de CUIT contra padrón AFIP. Listo en menos de 5 minutos.",
  },
  {
    num: "2",
    titulo: "Publicás tus productos",
    desc: "Formulario simple: foto, descripción, precio y stock. Tu tienda queda activa con URL propia el mismo día.",
  },
  {
    num: "3",
    titulo: "Llegan las ventas",
    desc: "Los compradores pagan via Mercado Pago en tu tienda. Recibís una notificación por cada venta.",
  },
  {
    num: "4",
    titulo: "Cobrás automáticamente",
    desc: "El dinero va directo a tu cuenta MP. La comisión (8–12% según categoría) se descuenta automáticamente. Sin esperas, sin papeleo.",
  },
];

export default function ComoFuncionaPage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>Guía completa</p>
          <h1 className={styles.heroTitle}>
            Cómo funciona<br />
            <span className={styles.accent}>Hornet Imports</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Tres formas de usar la plataforma. Elegís según tu necesidad.
          </p>
          <div className={styles.indexRow}>
            <a href="#importar" className={styles.indexChip}>Importar a pedido</a>
            <a href="#tienda" className={styles.indexChip}>Comprar en tienda</a>
            <a href="#vender" className={styles.indexChip}>Vender en marketplace</a>
          </div>
        </div>
      </section>

      {/* ── Importar ─────────────────────────────────────── */}
      <section className={styles.modulo} id="importar">
        <div className={styles.container}>
          <div className={styles.moduloHeader}>
            <div className={styles.moduloBadge}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="8" x2="16" y2="8"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="16" x2="12" y2="16"/>
              </svg>
              Importar a pedido
            </div>
            <h2 className={styles.moduloTitle}>Del link al domicilio en 6 pasos</h2>
            <p className={styles.moduloSubtitle}>
              Para cualquier producto de cualquier tienda del mundo. Vos elegís, nosotros gestionamos todo.
            </p>
          </div>
          <div className={styles.pasos}>
            {PASOS_IMPORTACION.map((p, i) => (
              <div key={p.num} className={styles.pasoItem}>
                <div className={styles.pasoLeft}>
                  <div className={styles.pasoNum}>{p.num}</div>
                  {i < PASOS_IMPORTACION.length - 1 && <div className={styles.pasoLine} />}
                </div>
                <div className={styles.pasoContent}>
                  <h3 className={styles.pasoTitulo}>{p.titulo}</h3>
                  <p className={styles.pasoDesc}>{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className={styles.moduloCta}>
            <Link href="/cotizar" className={styles.btnPrimary}>Cotizá tu primer producto →</Link>
          </div>
        </div>
      </section>

      {/* ── Tienda ───────────────────────────────────────── */}
      <section className={`${styles.modulo} ${styles.moduloAlt}`} id="tienda">
        <div className={styles.container}>
          <div className={styles.moduloHeader}>
            <div className={styles.moduloBadge}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              Tienda pre-cotizada
            </div>
            <h2 className={styles.moduloTitle}>Sin cotizar, sin esperar</h2>
            <p className={styles.moduloSubtitle}>
              Catálogo de productos importados repetidamente. Precio total ya calculado.
            </p>
          </div>
          <div className={styles.pasosHorizontal}>
            {PASOS_TIENDA.map((p, i) => (
              <div key={p.num} className={styles.pasoH}>
                <div className={styles.pasoHNum}>{p.num}</div>
                <h3 className={styles.pasoHTitulo}>{p.titulo}</h3>
                <p className={styles.pasoHDesc}>{p.desc}</p>
                {i < PASOS_TIENDA.length - 1 && <div className={styles.arrowRight} aria-hidden="true">→</div>}
              </div>
            ))}
          </div>
          <div className={styles.moduloCta}>
            <Link href="/tienda" className={styles.btnSecondary}>Ver productos disponibles →</Link>
          </div>
        </div>
      </section>

      {/* ── Vender ───────────────────────────────────────── */}
      <section className={styles.modulo} id="vender">
        <div className={styles.container}>
          <div className={styles.moduloHeader}>
            <div className={styles.moduloBadge}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
              </svg>
              Vender en el marketplace
            </div>
            <h2 className={styles.moduloTitle}>De la cuenta a la primera venta en un día</h2>
            <p className={styles.moduloSubtitle}>
              Publicá gratis. Comisión 8–12%. Sin mensualidad, sin trámites.
            </p>
          </div>
          <div className={styles.pasos}>
            {PASOS_VENDER.map((p, i) => (
              <div key={p.num} className={styles.pasoItem}>
                <div className={styles.pasoLeft}>
                  <div className={styles.pasoNum}>{p.num}</div>
                  {i < PASOS_VENDER.length - 1 && <div className={styles.pasoLine} />}
                </div>
                <div className={styles.pasoContent}>
                  <h3 className={styles.pasoTitulo}>{p.titulo}</h3>
                  <p className={styles.pasoDesc}>{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className={styles.moduloCta}>
            <Link href="/registro?plan=vendedor" className={styles.btnPrimary}>Crear cuenta gratis →</Link>
            <Link href="/vender" className={styles.btnOutline}>Ver beneficios completos</Link>
          </div>
        </div>
      </section>

      {/* ── FAQ link ─────────────────────────────────────── */}
      <section className={styles.faqLink}>
        <div className={styles.faqLinkInner}>
          <p className={styles.faqLinkText}>¿Todavía tenés dudas?</p>
          <Link href="/faq" className={styles.btnAccent}>Ver preguntas frecuentes →</Link>
        </div>
      </section>
    </>
  );
}
