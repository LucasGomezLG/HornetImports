const FALLBACK_RATE = 1320;

export async function obtenerTipoCambio(): Promise<number> {
  try {
    const res = await fetch("https://dolarapi.com/v1/dolares/blue", {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error();
    const data = await res.json();
    return (data.venta as number) ?? FALLBACK_RATE;
  } catch {
    return FALLBACK_RATE;
  }
}
