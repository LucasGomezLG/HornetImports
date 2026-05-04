import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PedidosList from "./PedidosList";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "Mis pedidos | Hornet Imports" };

export default async function PedidosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: pedidos } = await supabase
    .from("pedidos")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Mis pedidos</h1>
        <Link href="/cotizar" className={styles.btnNuevo}>+ Nueva cotización</Link>
      </div>
      <PedidosList pedidos={pedidos ?? []} />
    </div>
  );
}
