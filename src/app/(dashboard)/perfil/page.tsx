import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PerfilForm from "./PerfilForm";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "Mi perfil | Hornet Imports" };

export default async function PerfilPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Mi perfil</h1>
        <p className={styles.subtitle}>Tus datos de contacto para la gestión de importaciones.</p>
      </div>

      <div className={styles.card}>
        <PerfilForm
          nombre={profile?.nombre ?? ""}
          apellido={profile?.apellido ?? ""}
          telefono={profile?.telefono ?? ""}
          email={user.email ?? ""}
        />
      </div>
    </div>
  );
}
