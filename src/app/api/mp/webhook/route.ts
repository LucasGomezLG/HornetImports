import { NextRequest, NextResponse } from "next/server";
import { obtenerPago } from "@/lib/mp/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendAlertaNuevoPedido } from "@/lib/email/send";
import { logger } from "@/lib/utils/logger";

const ESTADOS_CANCELACION = new Set(["cancelled", "refunded", "charged_back"]);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { type?: string; data?: { id?: string }; action?: string };

    const paymentId = body.data?.id;
    const type = body.type ?? body.action;

    logger.info("MP_WEBHOOK", "Webhook recibido", { type, paymentId });

    if (!paymentId || !type?.includes("payment")) {
      logger.info("MP_WEBHOOK", "Evento ignorado (no es payment)", { type, paymentId });
      return NextResponse.json({ ok: true });
    }

    const pago = await obtenerPago(paymentId);
    const pedidoId = pago.external_reference;

    logger.info("MP_WEBHOOK", "Pago obtenido", { paymentId, pedidoId, status: pago.status });

    if (!pedidoId) {
      logger.warn("MP_WEBHOOK", "Pago sin external_reference", { paymentId });
      return NextResponse.json({ ok: true });
    }

    const db = createAdminClient();

    if (pago.status === "approved") {
      const { data: pedido } = await db
        .from("pedidos")
        .select("id, producto_nombre, user_id")
        .eq("id", pedidoId)
        .single();

      if (!pedido) {
        logger.error("MP_WEBHOOK", "Pedido no encontrado", { pedidoId, paymentId });
        return NextResponse.json({ ok: true });
      }

      await db.from("pedidos").update({ estado: "comprado" }).eq("id", pedidoId);
      logger.info("MP_WEBHOOK", "Pedido marcado como comprado", { pedidoId, producto: pedido.producto_nombre });

      if (pedido.user_id) {
        const { data: profile } = await db
          .from("profiles").select("email").eq("id", pedido.user_id).single();
        if (profile?.email) {
          await sendAlertaNuevoPedido(pedido.producto_nombre, pedidoId, profile.email).catch((err) => {
            logger.error("MP_WEBHOOK", "Error enviando email de alerta", { error: String(err), pedidoId });
          });
        }
      }
    } else if (ESTADOS_CANCELACION.has(pago.status ?? "")) {
      await db
        .from("pedidos")
        .update({ estado: "cancelado" })
        .eq("id", pedidoId)
        .in("estado", ["en_proceso", "comprado"]);
      logger.info("MP_WEBHOOK", "Pedido cancelado", { pedidoId, mpStatus: pago.status });
    } else {
      logger.info("MP_WEBHOOK", "Estado de pago sin acción", { pedidoId, mpStatus: pago.status });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    logger.error("MP_WEBHOOK", "Error procesando webhook", { error: String(err) });
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true });
}
