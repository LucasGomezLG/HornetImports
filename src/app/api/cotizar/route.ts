import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { calcularCotizacion } from "@/lib/cotizador/calcular";
import { logger } from "@/lib/utils/logger";
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
    logger.warn("COTIZADOR", "Falló fetch tipo de cambio, usando fallback 1200");
    return 1200;
  }
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "anon";

  if (!checkRL(request)) {
    logger.warn("COTIZADOR", "Rate limit aplicado", { ip });
    return NextResponse.json({ ok: false, razon: "rate_limit" }, { status: 429 });
  }

  const body = await request.json() as InputCotizacion;

  logger.info("COTIZADOR", "Cotización solicitada", {
    producto: body.nombreProducto,
    categoria: body.categoriaId,
    precioUsd: body.precioUsdProducto,
    pesoKg: body.pesoKg,
    tipo: body.tipo,
    tipoServicio: body.tipoServicio,
    utm: body.utmSource,
    ip,
  });

  const esForwarding = body.tipoServicio === "forwarding";
  if (!body.nombreProducto?.trim() || !body.categoriaId) {
    logger.warn("COTIZADOR", "Input inválido: falta nombre o categoría", { ip });
    return NextResponse.json({ ok: false, razon: "precio_invalido" }, { status: 400 });
  }
  if (!esForwarding && !body.urlProducto?.trim()) {
    logger.warn("COTIZADOR", "Input inválido: falta URL", { ip });
    return NextResponse.json({ ok: false, razon: "precio_invalido" }, { status: 400 });
  }

  const tipoCambio = await getTipoCambio();
  const resultado = calcularCotizacion(body, tipoCambio);

  if (!resultado.ok) {
    logger.warn("COTIZADOR", "Cotización rechazada", { razon: resultado.razon, producto: body.nombreProducto });
    return NextResponse.json(resultado);
  }

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
      tipo_servicio: body.tipoServicio ?? "completo",
      utm_source: body.utmSource ?? null,
    })
    .select("id")
    .single();

  if (error || !cotizacion) {
    logger.error("COTIZADOR", "Error guardando cotización en DB", {
      error: error?.message,
      userId: user?.id ?? "anon",
      producto: body.nombreProducto,
    });
    return NextResponse.json({ ok: true, desglose: resultado.desglose, cotizacionId: null });
  }

  logger.info("COTIZADOR", "Cotización guardada", {
    cotizacionId: cotizacion.id,
    userId: user?.id ?? "anon",
    totalArs: resultado.desglose.totalArs,
    totalUsd: resultado.desglose.total,
  });

  return NextResponse.json({ ok: true, desglose: resultado.desglose, cotizacionId: cotizacion.id });
}
