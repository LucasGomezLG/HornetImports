"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./Header.module.css";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const NAV_LINKS = [
  { href: "/cotizar", label: "Cotizador" },
  { href: "/tienda", label: "Tienda" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/seguimiento", label: "Seguimiento" },
];

function HamburgerIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const close = () => setMenuOpen(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <header className={styles.header}>
        <div className={styles.inner}>
          <Link href="/" className={styles.logo} onClick={close}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${BASE}/logo.png`} alt="Hornet Imports" width={40} height={40} />
            <span className={styles.logoText}>Hornet Imports</span>
          </Link>

          <nav className={styles.nav}>
            {NAV_LINKS.map(({ href, label }) => (
              <Link key={href} href={href} className={styles.navLink}>{label}</Link>
            ))}
          </nav>

          <div className={styles.headerRight}>
            <Link href="/login" className={styles.btnLogin}>Ingresar</Link>
            <Link href="/cotizar" className={styles.btnCta}>Cotizá ahora</Link>
          </div>

          <button
            className={styles.hamburger}
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir menú"
            aria-expanded={menuOpen}
          >
            <HamburgerIcon />
          </button>
        </div>
      </header>

      {/* Overlay */}
      <div
        className={`${styles.overlay} ${menuOpen ? styles.overlayVisible : ""}`}
        onClick={close}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside className={`${styles.drawer} ${menuOpen ? styles.drawerOpen : ""}`} aria-label="Menú de navegación">
        <div className={styles.drawerHeader}>
          <Link href="/" className={styles.logo} onClick={close}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${BASE}/logo.png`} alt="Hornet Imports" width={36} height={36} />
            <span className={styles.logoText}>Hornet Imports</span>
          </Link>
          <button className={styles.closeBtn} onClick={close} aria-label="Cerrar menú">
            <CloseIcon />
          </button>
        </div>

        <nav className={styles.drawerNav}>
          {NAV_LINKS.map(({ href, label }) => (
            <Link key={href} href={href} className={styles.drawerLink} onClick={close}>
              <span>{label}</span>
              <ChevronRight />
            </Link>
          ))}
        </nav>

        <div className={styles.drawerFooter}>
          <Link href="/login" className={styles.drawerBtnLogin} onClick={close}>
            Ingresar
          </Link>
          <Link href="/cotizar" className={styles.drawerBtnCta} onClick={close}>
            Cotizá ahora →
          </Link>
        </div>
      </aside>
    </>
  );
}
