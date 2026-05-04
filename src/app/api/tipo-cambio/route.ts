import { NextResponse } from "next/server";

// Solo se usa si dolarapi.com falla EN el primer request (cold start).
// Después de la primera respuesta exitosa se usa cache.rate como fallback real.
// Actualizar este valor periódicamente si el blue cambia significativamente.
const FALLBACK_RATE = 1320;
let cache: { rate: number; ts: number } | null = null;
const CACHE_TTL = 60 * 60 * 1000; // 1 hora

export async function GET() {
  if (cache && Date.now() - cache.ts < CACHE_TTL) {
    return NextResponse.json({ rate: cache.rate, source: "cache" });
  }

  try {
    const res = await fetch("https://dolarapi.com/v1/dolares/blue", {
      next: { revalidate: 3600 },
    });

    if (!res.ok) throw new Error("dolarapi error");

    const data = await res.json();
    const rate = data.venta as number;

    cache = { rate, ts: Date.now() };
    return NextResponse.json({ rate, source: "live" });
  } catch {
    const rate = cache?.rate ?? FALLBACK_RATE;
    return NextResponse.json({ rate, source: "fallback" });
  }
}
