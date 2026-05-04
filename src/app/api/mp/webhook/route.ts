import { NextRequest, NextResponse } from "next/server";
import { obtenerPago } from "@/lib/mp/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendAlertaNuevoPedido } from "@/lib/email/send";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { type?: string; data?: { id?: string }; action?: string };

    // MP envía distintos formatos según el tipo de notificación
    const paymentId = body.data?.id;
    const type = body.type ?? body.action;

    if (!paymentId || !type?.includes("payment")) {
      return NextResponse.json({ ok: true });
    }

    const pago = await obtenerPago(paymentId);

    if (pago.status !== "approved") {
      return NextResponse.json({ ok: true });
    }

    const pedidoId = pago.external_reference;
    if (!pedidoId) return NextResponse.json({ ok: true });

    const db = createAdminClient();
    const { data: pedido } = await db
      .from("pedidos")
      .select("id, producto_nombre, user_id")
      .eq("id", pedidoId)
      .single();

    if (!pedido) return NextResponse.json({ ok: true });

    // Actualiza estado del pedido a "comprado" (pago confirmado por MP)
    await db.from("pedidos").update({ estado: "comprado" }).eq("id", pedidoId);

    // Alerta interna
    if (pedido.user_id) {
      const { data: profile } = await db
        .from("profiles")
        .select("email")
        .eq("id", pedido.user_id)
        .single();
      if (profile?.email) {
        await sendAlertaNuevoPedido(pedido.producto_nombre, pedidoId, profile.email).catch(() => { });
      }
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

// MP verifica la URL con un GET inicial
export async function GET() {
  return NextResponse.json({ ok: true });
}
