"use server";

import { createClient } from "@/lib/supabase/server";
import { crearPreferencia } from "@/lib/mp/client";
import { sendPedidoConfirmado, sendAlertaNuevoPedido } from "@/lib/email/send";
import { logger } from "@/lib/utils/logger";

export type MetodoPago = "mp" | "transferencia" | "cripto" | "efectivo";

export async function confirmarPedido(
  cotizacionId: string,
  metodoPago: MetodoPago = "mp"
): Promise<{ error: string } | { mpUrl: string } | { redirect: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    logger.warn("CONFIRMAR_PEDIDO", "Intento sin sesión", { cotizacionId });
    return { error: "Tenés que iniciar sesión para confirmar el pedido." };
  }

  const { data: cotizacion, error: cotError } = await supabase
    .from("cotizaciones")
    .select("*")
    .eq("id", cotizacionId)
    .eq("user_id", user.id)
    .single();

  if (cotError || !cotizacion) {
    logger.error("CONFIRMAR_PEDIDO", "Cotización no encontrada", { cotizacionId, userId: user.id, error: cotError?.message });
    return { error: "Cotización no encontrada." };
  }

  if (cotizacion.estado !== "pendiente") {
    logger.warn("CONFIRMAR_PEDIDO", "Cotización ya procesada", { cotizacionId, estado: cotizacion.estado });
    return { error: "Esta cotización ya fue procesada." };
  }

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

  if (pedidoError || !pedido) {
    logger.error("CONFIRMAR_PEDIDO", "Error creando pedido", { cotizacionId, userId: user.id, error: pedidoError?.message });
    return { error: "Error al crear el pedido. Intentá de nuevo." };
  }

  logger.info("CONFIRMAR_PEDIDO", "Pedido creado", {
    pedidoId: pedido.id,
    cotizacionId,
    userId: user.id,
    metodo: metodoPago,
    totalArs: cotizacion.costo_total_ars,
    totalUsd: cotizacion.precio_usd,
  });

  await supabase.from("cotizaciones").update({ estado: "aprobada" }).eq("id", cotizacionId);

  const email = user.email ?? "";

  if (metodoPago === "mp" && process.env.MP_ACCESS_TOKEN) {
    try {
      const preferencia = await crearPreferencia(pedido.id, cotizacion.nombre_producto, cotizacion.costo_total_ars);
      if (preferencia.init_point) {
        logger.info("CONFIRMAR_PEDIDO", "Preferencia MP creada", { pedidoId: pedido.id, initPoint: preferencia.init_point });
        return { mpUrl: preferencia.init_point };
      }
    } catch (err) {
      logger.error("CONFIRMAR_PEDIDO", "Error creando preferencia MP, fallback a transferencia", { pedidoId: pedido.id, error: String(err) });
    }
  }

  try { await sendPedidoConfirmado(email, cotizacion.nombre_producto, pedido.id); } catch (err) {
    logger.error("CONFIRMAR_PEDIDO", "Error enviando email confirmación", { pedidoId: pedido.id, error: String(err) });
  }
  try { await sendAlertaNuevoPedido(cotizacion.nombre_producto, pedido.id, email); } catch (err) {
    logger.error("CONFIRMAR_PEDIDO", "Error enviando alerta admin", { pedidoId: pedido.id, error: String(err) });
  }

  return { redirect: "/pedidos" };
}
