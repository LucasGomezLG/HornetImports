"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendLinkCotizacion, sendCotizacionRechazada } from "@/lib/email/send";
import { logger } from "@/lib/utils/logger";

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
  const admin = await verificarAdmin();
  if (!admin) {
    logger.warn("ADMIN_COTIZACIONES", "Acceso denegado: no es admin");
    return { error: "Sin permisos." };
  }

  const db = createAdminClient();
  const { data: c } = await db
    .from("cotizaciones").select("id, estado").eq("id", cotizacionId).single();

  if (!c || c.estado !== "pendiente") {
    logger.warn("ADMIN_COTIZACIONES", "Cotización no aprobable", { cotizacionId, estado: c?.estado });
    return { error: "Solo se puede aprobar cotizaciones pendientes." };
  }

  const { error } = await db
    .from("cotizaciones").update({ aprobada_por_admin: true }).eq("id", cotizacionId);

  if (error) {
    logger.error("ADMIN_COTIZACIONES", "Error aprobando cotización", { cotizacionId, error: error.message });
    return { error: "No se pudo actualizar la cotización." };
  }

  logger.info("ADMIN_COTIZACIONES", "Cotización aprobada", { cotizacionId, adminId: admin.id, email: emailUsuario });

  try {
    await sendLinkCotizacion(emailUsuario, nombreProducto, cotizacionId);
    logger.info("ADMIN_COTIZACIONES", "Email de aprobación enviado", { cotizacionId, email: emailUsuario });
  } catch (err) {
    logger.error("ADMIN_COTIZACIONES", "Error enviando email de aprobación", { cotizacionId, error: String(err) });
  }

  revalidatePath("/admin/cotizaciones");
}

export async function rechazarCotizacion(
  cotizacionId: string,
  emailUsuario: string | null,
  nombreProducto: string,
  motivo: string
): Promise<{ error: string } | void> {
  const admin = await verificarAdmin();
  if (!admin) {
    logger.warn("ADMIN_COTIZACIONES", "Acceso denegado: no es admin");
    return { error: "Sin permisos." };
  }

  const db = createAdminClient();
  const { error } = await db
    .from("cotizaciones").update({ estado: "rechazada" }).eq("id", cotizacionId);

  if (error) {
    logger.error("ADMIN_COTIZACIONES", "Error rechazando cotización", { cotizacionId, error: error.message });
    return { error: "No se pudo actualizar la cotización." };
  }

  logger.info("ADMIN_COTIZACIONES", "Cotización rechazada", { cotizacionId, adminId: admin.id, motivo });

  if (emailUsuario) {
    try {
      await sendCotizacionRechazada(emailUsuario, nombreProducto, motivo || undefined);
      logger.info("ADMIN_COTIZACIONES", "Email de rechazo enviado", { cotizacionId, email: emailUsuario });
    } catch (err) {
      logger.error("ADMIN_COTIZACIONES", "Error enviando email de rechazo", { cotizacionId, error: String(err) });
    }
  }

  revalidatePath("/admin/cotizaciones");
}
