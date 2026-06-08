"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendLinkCotizacion, sendCotizacionRechazada } from "@/lib/email/send";

async function verificarAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles").select("tipo").eq("id", user.id).single();
  return profile?.tipo === "admin" ? user : null;
}

export async function aprobarCotizacion(
  cotizacionId: string,
  emailUsuario: string,
  nombreProducto: string
): Promise<{ error: string } | void> {
  if (!await verificarAdmin()) return { error: "Sin permisos." };

  const db = createAdminClient();
  const { data: c } = await db
    .from("cotizaciones").select("id, estado").eq("id", cotizacionId).single();

  if (!c || c.estado !== "pendiente")
    return { error: "Solo se puede aprobar cotizaciones pendientes." };

  const { error } = await db
    .from("cotizaciones")
    .update({ aprobada_por_admin: true })
    .eq("id", cotizacionId);

  if (error) return { error: "No se pudo actualizar la cotización." };

  try {
    await sendLinkCotizacion(emailUsuario, nombreProducto, cotizacionId);
  } catch { /* email falla silenciosamente */ }

  revalidatePath("/admin/cotizaciones");
}

export async function rechazarCotizacion(
  cotizacionId: string,
  emailUsuario: string | null,
  nombreProducto: string,
  motivo: string
): Promise<{ error: string } | void> {
  if (!await verificarAdmin()) return { error: "Sin permisos." };

  const db = createAdminClient();
  const { error } = await db
    .from("cotizaciones")
    .update({ estado: "rechazada" })
    .eq("id", cotizacionId);

  if (error) return { error: "No se pudo actualizar la cotización." };

  if (emailUsuario) {
    try {
      await sendCotizacionRechazada(emailUsuario, nombreProducto, motivo || undefined);
    } catch { /* no bloquear si el email falla */ }
  }

  revalidatePath("/admin/cotizaciones");
}
