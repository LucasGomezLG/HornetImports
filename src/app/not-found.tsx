import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className={styles.page}>
        <div className={styles.content}>
          <span className={styles.code}>404</span>
          <h1 className={styles.title}>Página no encontrada</h1>
          <p className={styles.subtitle}>
            El link que seguiste no existe o fue movido.
          </p>
          <div className={styles.ctaBtns}>
            <Link href="/" className={styles.btnPrimary}>
              Volver al inicio
            </Link>
            <Link href="/cotizar" className={styles.btnSecondary}>
              Ir al cotizador
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
