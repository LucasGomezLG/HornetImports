"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendLinkCotizacion, sendCotizacionRechazada } from "@/lib/email/send";

export async function enviarLinkCotizacion(
  cotizacionId: string,
  emailUsuario: string,
  nombreProducto: string
): Promise<{ error: string } | void> {
  const db = createAdminClient();
  const { data: c } = await db
    .from("cotizaciones")
    .select("id, estado")
    .eq("id", cotizacionId)
    .single();

  if (!c || c.estado !== "pendiente")
    return { error: "Solo se puede enviar el link a cotizaciones pendientes." };

  try {
    await sendLinkCotizacion(emailUsuario, nombreProducto, cotizacionId);
  } catch {
    return { error: "Error al enviar el email. Verificá RESEND_API_KEY." };
  }
}

export async function rechazarCotizacion(
  cotizacionId: string,
  emailUsuario: string | null,
  nombreProducto: string,
  motivo: string
): Promise<{ error: string } | void> {
  const db = createAdminClient();
  const { error } = await db
    .from("cotizaciones")
    .update({ estado: "rechazada" })
    .eq("id", cotizacionId);

  if (error) return { error: "No se pudo actualizar la cotización." };

  if (emailUsuario) {
    try {
      await sendCotizacionRechazada(emailUsuario, nombreProducto, motivo || undefined);
    } catch {
      // no bloquear si el email falla
    }
  }

  revalidatePath("/admin/cotizaciones");
}
