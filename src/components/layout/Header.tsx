"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Header.module.css";


const NAV_LINKS = [
  {
    href: "/cotizar",
    label: "Cotizador",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="8" x2="16" y2="8"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="16" x2="12" y2="16"/>
      </svg>
    ),
  },
  {
    href: "/tienda",
    label: "Tienda",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
      </svg>
    ),
  },
  {
    href: "/marketplace",
    label: "Marketplace",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
  },
  {
    href: "/seguimiento",
    label: "Seguimiento",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
  },
];

const DRAWER_NEGOCIOS = [
  {
    href: "/vender",
    label: "Vendé aquí",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
      </svg>
    ),
  },
  {
    href: "/mayorista",
    label: "Para empresas",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
      </svg>
    ),
  },
];

const DRAWER_EMPRESA = [
  {
    href: "/como-funciona",
    label: "Cómo funciona",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    ),
  },
  {
    href: "/faq",
    label: "Preguntas frecuentes",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 9a3 3 0 015.83 1c0 2-3 3-3 3"/><circle cx="12" cy="17" r=".5" fill="currentColor"/>
      </svg>
    ),
  },
  {
    href: "/nosotros",
    label: "Sobre nosotros",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 10-16 0"/>
      </svg>
    ),
  },
];

function ChevronRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname === `${href}/`;

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
            <img src={"/logo.png"} alt="Hornet Imports" width={36} height={36} />
            <span className={styles.logoText}>Hornet Imports</span>
          </Link>

          <nav className={styles.nav}>
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`${styles.navLink} ${isActive(href) ? styles.navLinkActive : ""}`}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className={styles.headerRight}>
            <Link href="/login" className={styles.btnLogin}>Ingresar</Link>
            <Link href="/cotizar" className={styles.btnCta}>Cotizá ahora</Link>
          </div>

          {/* Hamburger animado */}
          <button
            className={`${styles.hamburger} ${menuOpen ? styles.hamburgerOpen : ""}`}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuOpen}
          >
            <span className={styles.bar} />
            <span className={styles.bar} />
            <span className={styles.bar} />
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
      <aside
        className={`${styles.drawer} ${menuOpen ? styles.drawerOpen : ""}`}
        aria-label="Menú de navegación"
        aria-hidden={!menuOpen}
      >
        <div className={styles.drawerHeader}>
          <Link href="/" className={styles.drawerLogo} onClick={close}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={"/logo.png"} alt="Hornet Imports" width={32} height={32} />
            <span className={styles.drawerLogoText}>Hornet Imports</span>
          </Link>
          <button
            className={styles.closeBtn}
            onClick={close}
            aria-label="Cerrar menú"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <nav className={styles.drawerNav}>
          <p className={styles.drawerSectionLabel}>Plataforma</p>
          {NAV_LINKS.map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              className={`${styles.drawerLink} ${isActive(href) ? styles.drawerLinkActive : ""}`}
              onClick={close}
            >
              <span className={styles.drawerLinkLeft}>
                <span className={styles.drawerLinkIcon}>{icon}</span>
                <span>{label}</span>
              </span>
              <ChevronRight />
            </Link>
          ))}

          <p className={styles.drawerSectionLabel} style={{ marginTop: "var(--space-4)" }}>Negocios</p>
          {DRAWER_NEGOCIOS.map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              className={`${styles.drawerLink} ${isActive(href) ? styles.drawerLinkActive : ""}`}
              onClick={close}
            >
              <span className={styles.drawerLinkLeft}>
                <span className={styles.drawerLinkIcon}>{icon}</span>
                <span>{label}</span>
              </span>
              <ChevronRight />
            </Link>
          ))}

          <p className={styles.drawerSectionLabel} style={{ marginTop: "var(--space-4)" }}>Empresa</p>
          {DRAWER_EMPRESA.map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              className={`${styles.drawerLink} ${isActive(href) ? styles.drawerLinkActive : ""}`}
              onClick={close}
            >
              <span className={styles.drawerLinkLeft}>
                <span className={styles.drawerLinkIcon}>{icon}</span>
                <span>{label}</span>
              </span>
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
