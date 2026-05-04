import type { Metadata } from "next";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import TrackingForm, { type PedidoReal } from "@/components/seguimiento/TrackingForm";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Seguimiento | Hornet Imports",
  description: "Rastreá el estado de tu importación.",
};

export default async function SeguimientoPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let pedidos: PedidoReal[] = [];

  if (user) {
    const { data } = await supabase
      .from("pedidos")
      .select("id, producto_nombre, estado, tracking_code, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    pedidos = (data ?? []) as PedidoReal[];
  }

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>Seguimiento</p>
          <h1 className={styles.title}>¿Dónde está tu paquete?</h1>
          <p className={styles.subtitle}>
            Ingresá tu ID de pedido o código de tracking para ver el estado de tu importación.
          </p>
        </div>
      </section>

      <section className={styles.trackSection}>
        <Suspense>
          <TrackingForm pedidos={pedidos} />
        </Suspense>
      </section>
    </>
  );
}
