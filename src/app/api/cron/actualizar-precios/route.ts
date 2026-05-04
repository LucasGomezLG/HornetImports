import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Vercel Cron llama este endpoint diariamente a las 08:00 hora Argentina (11:00 UTC).
// Requiere CRON_SECRET en env vars de Vercel.
export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const res = await fetch("https://dolarapi.com/v1/dolares/blue");
    if (!res.ok) throw new Error("dolarapi error");
    const { venta } = await res.json() as { venta: number };

    const db = createAdminClient();

    // Actualiza precio_ars de todos los listings activos que tengan precio_usd definido
    const { data: listings } = await db
      .from("listings")
      .select("id, precio_usd")
      .eq("activo", true)
      .not("precio_usd", "is", null);

    if (!listings?.length) {
      return NextResponse.json({ ok: true, actualizados: 0, tipoCambio: venta });
    }

    const updates = listings.map((l) =>
      db
        .from("listings")
        .update({ precio_ars: Math.round((l.precio_usd as number) * venta) })
        .eq("id", l.id)
    );

    await Promise.all(updates);

    return NextResponse.json({ ok: true, actualizados: listings.length, tipoCambio: venta });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
