"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function confirmarPedido(
  cotizacionId: string
): Promise<{ error: string } | void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Tenés que iniciar sesión para confirmar el pedido." };

  const { data: cotizacion, error: cotError } = await supabase
    .from("cotizaciones")
    .select("*")
    .eq("id", cotizacionId)
    .eq("user_id", user.id)
    .single();

  if (cotError || !cotizacion) return { error: "Cotización no encontrada." };
  if (cotizacion.estado !== "pendiente") return { error: "Esta cotización ya fue procesada." };

  const { error: pedidoError } = await supabase.from("pedidos").insert({
    cotizacion_id: cotizacionId,
    user_id: user.id,
    producto_nombre: cotizacion.nombre_producto,
    producto_url: cotizacion.producto_url,
    precio_usd: cotizacion.precio_usd,
    costo_total_ars: cotizacion.costo_total_ars,
    estado: "en_proceso",
  });

  if (pedidoError) return { error: "Error al crear el pedido. Intentá de nuevo." };

  await supabase
    .from("cotizaciones")
    .update({ estado: "aprobada" })
    .eq("id", cotizacionId);

  redirect("/pedidos");
}
