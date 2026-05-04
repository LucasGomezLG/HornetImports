import Link from "next/link";
import styles from "./Footer.module.css";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${BASE}/logo.png`} alt="Hornet Imports" width={32} height={32} />
          <span className={styles.brandText}>Hornet Imports</span>
        </div>

        <nav className={styles.links}>
          <Link href="/cotizar" className={styles.link}>Cotizador</Link>
          <Link href="/tienda" className={styles.link}>Tienda</Link>
          <Link href="/marketplace" className={styles.link}>Marketplace</Link>
          <Link href="/seguimiento" className={styles.link}>Seguimiento</Link>
          <Link href="/mayorista" className={styles.link}>Mayoristas</Link>
          <Link href="/vender" className={styles.link}>Vendé aquí</Link>
          <Link href="/nosotros" className={styles.link}>Nosotros</Link>
          <Link href="/terminos" className={styles.link}>Términos</Link>
          <Link href="/privacidad" className={styles.link}>Privacidad</Link>
        </nav>

        <p className={styles.copy}>
          © {new Date().getFullYear()} Hornet Imports. Argentina.
        </p>
      </div>
    </footer>
  );
}
