"use server";

import { createClient } from "@/lib/supabase/server";
import { crearPreferencia } from "@/lib/mp/client";
import { sendPedidoConfirmado, sendAlertaNuevoPedido } from "@/lib/email/send";

export type MetodoPago = "mp" | "transferencia" | "cripto" | "efectivo";

export async function confirmarPedido(
  cotizacionId: string,
  metodoPago: MetodoPago = "mp"
): Promise<{ error: string } | { mpUrl: string } | { redirect: string }> {
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
      tipo_servicio: cotizacion.tipo_servicio ?? "completo",
    })
    .select("id")
    .single();

  if (pedidoError || !pedido) return { error: "Error al crear el pedido. Intentá de nuevo." };

  await supabase
    .from("cotizaciones")
    .update({ estado: "aprobada" })
    .eq("id", cotizacionId);

  const email = user.email ?? "";

  // Pago online con MercadoPago
  if (metodoPago === "mp" && process.env.MP_ACCESS_TOKEN) {
    try {
      const preferencia = await crearPreferencia(
        pedido.id,
        cotizacion.nombre_producto,
        cotizacion.costo_total_ars
      );
      if (preferencia.init_point) {
        return { mpUrl: preferencia.init_point };
      }
    } catch {
      // Si MP falla, caemos al flujo de efectivo
    }
  }

  // Pago en efectivo o fallback sin MP
  try { await sendPedidoConfirmado(email, cotizacion.nombre_producto, pedido.id); } catch { /* */ }
  try { await sendAlertaNuevoPedido(cotizacion.nombre_producto, pedido.id, email); } catch { /* */ }

  return { redirect: "/pedidos" };
}
