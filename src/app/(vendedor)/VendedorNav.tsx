"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "@/components/ui/LogoutButton";
import styles from "./layout.module.css";

const NAV = [
  {
    href: "/vendedor/productos",
    label: "Mis productos",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
      </svg>
    ),
  },
  {
    href: "/marketplace",
    label: "Ver marketplace",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    ),
  },
];

export default function VendedorNav({
  children,
  nombre,
}: {
  children: React.ReactNode;
  nombre: string;
}) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const currentLabel = NAV.find((n) => isActive(n.href))?.label ?? "Panel de vendedor";

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarTop}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoIcon}>V</span>
            <div>
              <span className={styles.logoText}>Hornet Imports</span>
              <span className={styles.logoSub}>Panel vendedor</span>
            </div>
          </Link>
        </div>

        <nav className={styles.nav}>
          {NAV.map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              className={`${styles.navLink} ${isActive(href) ? styles.navLinkActive : ""}`}
            >
              <span className={styles.navIcon}>{icon}</span>
              {label}
            </Link>
          ))}
        </nav>

        <div className={styles.sidebarBottom}>
          <Link href="/dashboard" className={styles.backLink}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Mi cuenta
          </Link>
          <Link href="/" className={styles.backLink}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Volver al sitio
          </Link>
          <LogoutButton className={styles.logoutBtn} />
        </div>
      </aside>

      <div className={styles.main}>
        <header className={styles.topbar}>
          <span className={styles.topbarTitle}>{currentLabel}</span>
          <div className={styles.topbarRight}>
            <span className={styles.vendedorBadge}>Vendedor</span>
            <div className={styles.avatar}>{nombre[0]?.toUpperCase() ?? "V"}</div>
          </div>
        </header>
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
