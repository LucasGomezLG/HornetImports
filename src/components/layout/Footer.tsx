import Link from "next/link";
import Image from "next/image";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <Image src="/logo.png" alt="Hornet Imports" width={32} height={32} />
          <span className={styles.brandText}>Hornet Imports</span>
        </div>

        <nav className={styles.links}>
          <Link href="/cotizar" className={styles.link}>Cotizador</Link>
          <Link href="/tienda" className={styles.link}>Tienda</Link>
          <Link href="/marketplace" className={styles.link}>Marketplace</Link>
          <Link href="/seguimiento" className={styles.link}>Seguimiento</Link>
          <Link href="/mayorista" className={styles.link}>Mayoristas</Link>
        </nav>

        <p className={styles.copy}>
          © {new Date().getFullYear()} Hornet Imports. Argentina.
        </p>
      </div>
    </footer>
  );
}
