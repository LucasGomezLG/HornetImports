import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { calcularCotizacion } from "@/lib/cotizador/calcular";
import type { InputCotizacion } from "@/lib/cotizador/types";
import type { Database, Json } from "@/lib/supabase/types";

const rlMap = new Map<string, { count: number; reset: number }>();
function checkRL(req: NextRequest): boolean {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "anon";
  const now = Date.now();
  const e = rlMap.get(ip);
  if (!e || now > e.reset) { rlMap.set(ip, { count: 1, reset: now + 60_000 }); return true; }
  if (e.count >= 10) return false;
  e.count++;
  return true;
}

async function getTipoCambio(): Promise<number> {
  try {
    const res = await fetch("https://dolarapi.com/v1/dolares/blue");
    if (!res.ok) throw new Error();
    const data = await res.json();
    return data.venta as number;
  } catch {
    return 1200;
  }
}

export async function POST(request: NextRequest) {
  if (!checkRL(request)) {
    return NextResponse.json({ ok: false, razon: "rate_limit" }, { status: 429 });
  }

  const body = await request.json() as InputCotizacion;

  if (!body.nombreProducto?.trim() || !body.urlProducto?.trim() || !body.categoriaId) {
    return NextResponse.json({ ok: false, razon: "precio_invalido" }, { status: 400 });
  }

  const tipoCambio = await getTipoCambio();
  const resultado = calcularCotizacion(body, tipoCambio);

  if (!resultado.ok) {
    return NextResponse.json(resultado);
  }

  // Guardar en Supabase
  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const { data: cotizacion, error } = await supabase
    .from("cotizaciones")
    .insert({
      user_id: user?.id ?? null,
      producto_url: body.urlProducto,
      nombre_producto: body.nombreProducto,
      precio_usd: body.precioUsdProducto,
      peso_kg: body.pesoKg,
      categoria: body.categoriaId,
      costo_total_ars: resultado.desglose.totalArs,
      desglose: resultado.desglose as unknown as Json,
      estado: "pendiente",
    })
    .select("id")
    .single();

  if (error || !cotizacion) {
    // Devolver resultado sin ID si falla el guardado (no bloquear al usuario)
    return NextResponse.json({ ok: true, desglose: resultado.desglose, cotizacionId: null });
  }

  return NextResponse.json({
    ok: true,
    desglose: resultado.desglose,
    cotizacionId: cotizacion.id,
  });
}
