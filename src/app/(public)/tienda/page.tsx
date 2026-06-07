import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import ProductGrid from "@/components/tienda/ProductGrid";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Tienda | Hornet Imports",
  description:
    "Productos importados y pre-cotizados listos para comprar. Flete, impuestos y todo incluido en el precio.",
};

export default async function TiendaPage() {
  const supabase = await createClient();
  const { data: productos } = await supabase
    .from("tienda_productos")
    .select("id, nombre, descripcion, categoria, precio_usd, stock, destacado")
    .eq("activo", true)
    .order("destacado", { ascending: false })
    .order("nombre");

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>Tienda</p>
          <h1 className={styles.title}>Productos ya cotizados, listos para comprar</h1>
          <p className={styles.subtitle}>
            Catálogo curado de productos importados repetidamente. El precio que
            ves incluye flete, impuestos y nuestro fee. Sin re-cotizar.
          </p>
        </div>
      </section>

      <section className={styles.gridSection}>
        <ProductGrid productos={productos ?? []} />
      </section>
    </>
  );
}
