"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { sendPedidoConfirmado, sendAlertaNuevoPedido } from "@/lib/email/send";

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

  const { data: pedido, error: pedidoError } = await supabase
    .from("pedidos")
    .insert({
      cotizacion_id: cotizacionId,
      user_id: user.id,
      producto_nombre: cotizacion.nombre_producto,
      producto_url: cotizacion.producto_url,
      precio_usd: cotizacion.precio_usd,
      costo_total_ars: cotizacion.costo_total_ars,
      estado: "en_proceso",
    })
    .select("id")
    .single();

  if (pedidoError || !pedido) return { error: "Error al crear el pedido. Intentá de nuevo." };

  await supabase
    .from("cotizaciones")
    .update({ estado: "aprobada" })
    .eq("id", cotizacionId);

  // Emails en background — no bloquean el redirect si fallan
  const email = user.email ?? "";
  const producto = cotizacion.nombre_producto;
  try { await sendPedidoConfirmado(email, producto, pedido.id); } catch { /* */ }
  try { await sendAlertaNuevoPedido(producto, pedido.id, email); } catch { /* */ }

  redirect("/pedidos");
}
