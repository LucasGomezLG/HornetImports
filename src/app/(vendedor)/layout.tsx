import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import VendedorNav from "./VendedorNav";

export default async function VendedorLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/vendedor/productos");

  const { data: profile } = await supabase
    .from("profiles")
    .select("tipo, nombre, email")
    .eq("id", user.id)
    .single();

  if (profile?.tipo !== "vendedor" && profile?.tipo !== "admin") {
    redirect("/dashboard");
  }

  const nombre = profile?.nombre ?? user.email?.split("@")[0] ?? "Vendedor";

  return <VendedorNav nombre={nombre}>{children}</VendedorNav>;
}
