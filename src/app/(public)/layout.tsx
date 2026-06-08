import { createClient } from "@/lib/supabase/server";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileBottomNav from "@/components/ui/MobileBottomNav";
import type { TipoCuenta } from "@/lib/supabase/types";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let authUser: { nombre: string; tipo: TipoCuenta } | null = null;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("nombre, tipo")
      .eq("id", user.id)
      .single();

    if (profile) {
      authUser = {
        nombre: profile.nombre ?? user.email?.split("@")[0] ?? "Mi cuenta",
        tipo: profile.tipo,
      };
    }
  }

  return (
    <>
      <Header user={authUser} />
      <main>{children}</main>
      <Footer />
      <MobileBottomNav />
    </>
  );
}
