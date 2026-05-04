import Link from "next/link";
import styles from "./Header.module.css";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const NAV_LINKS = [
  { href: "/cotizar", label: "Cotizador" },
  { href: "/tienda", label: "Tienda" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/seguimiento", label: "Seguimiento" },
];

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${BASE}/logo.png`}
            alt="Hornet Imports"
            width={40}
            height={40}
          />
          <span className={styles.logoText}>Hornet Imports</span>
        </Link>

        <nav className={styles.nav}>
          {NAV_LINKS.map(({ href, label }) => (
            <Link key={href} href={href} className={styles.navLink}>
              {label}
            </Link>
          ))}
        </nav>

        <div className={styles.headerRight}>
          <Link href="/login" className={styles.btnLogin}>
            Ingresar
          </Link>
          <Link href="/cotizar" className={styles.btnCta}>
            Cotizá ahora
          </Link>
        </div>
      </div>
    </header>
  );
}
