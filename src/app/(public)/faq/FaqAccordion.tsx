"use client";

import { useState } from "react";
import styles from "./page.module.css";

interface FaqItem {
  q: string;
  a: string;
}

interface FaqGroup {
  grupo: string;
  items: FaqItem[];
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      aria-hidden="true"
      style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export default function FaqAccordion({ grupos }: { grupos: FaqGroup[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const toggle = (key: string) => setOpen((prev) => (prev === key ? null : key));

  return (
    <>
      {grupos.map((grupo) => (
        <div key={grupo.grupo} className={styles.grupo}>
          <h2 className={styles.grupoTitle}>{grupo.grupo}</h2>
          <div className={styles.accordion}>
            {grupo.items.map((item) => {
              const key = `${grupo.grupo}-${item.q}`;
              const isOpen = open === key;
              return (
                <div key={key} className={`${styles.item} ${isOpen ? styles.itemOpen : ""}`}>
                  <button
                    type="button"
                    className={styles.question}
                    onClick={() => toggle(key)}
                    aria-expanded={isOpen}
                  >
                    <span>{item.q}</span>
                    <ChevronIcon open={isOpen} />
                  </button>
                  {isOpen && (
                    <div className={styles.answer}>
                      <p>{item.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </>
  );
}
