import { NextRequest, NextResponse } from "next/server";
import { obtenerPago } from "@/lib/mp/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendAlertaNuevoPedido } from "@/lib/email/send";

const ESTADOS_CANCELACION = new Set(["cancelled", "refunded", "charged_back"]);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { type?: string; data?: { id?: string }; action?: string };

    const paymentId = body.data?.id;
    const type = body.type ?? body.action;

    if (!paymentId || !type?.includes("payment")) {
      return NextResponse.json({ ok: true });
    }

    const pago = await obtenerPago(paymentId);
    const pedidoId = pago.external_reference;
    if (!pedidoId) return NextResponse.json({ ok: true });

    const db = createAdminClient();

    if (pago.status === "approved") {
      const { data: pedido } = await db
        .from("pedidos")
        .select("id, producto_nombre, user_id")
        .eq("id", pedidoId)
        .single();

      if (!pedido) return NextResponse.json({ ok: true });

      await db.from("pedidos").update({ estado: "comprado" }).eq("id", pedidoId);

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
    } else if (ESTADOS_CANCELACION.has(pago.status ?? "")) {
      await db
        .from("pedidos")
        .update({ estado: "cancelado" })
        .eq("id", pedidoId)
        .in("estado", ["en_proceso", "comprado"]);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true });
}
