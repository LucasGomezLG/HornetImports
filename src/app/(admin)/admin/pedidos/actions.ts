"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/utils/logger";
import type { EstadoPedido } from "@/lib/supabase/types";

async function verificarAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles").select("tipo").eq("id", user.id).single();
  return profile?.tipo === "admin" ? user : null;
}

export async function actualizarPedido(
  pedidoId: string,
  estado: EstadoPedido,
  trackingCode: string
): Promise<{ error: string } | void> {
  const admin = await verificarAdmin();
  if (!admin) {
    logger.warn("ADMIN_PEDIDOS", "Acceso denegado: no es admin");
    return { error: "Sin permisos." };
  }

  const db = createAdminClient();
  const { error } = await db
    .from("pedidos")
    .update({ estado, tracking_code: trackingCode.trim() || null })
    .eq("id", pedidoId);

  if (error) {
    logger.error("ADMIN_PEDIDOS", "Error actualizando pedido", { pedidoId, estado, error: error.message });
    return { error: "No se pudo actualizar." };
  }

  logger.info("ADMIN_PEDIDOS", "Pedido actualizado", { pedidoId, estado, adminId: admin.id, tracking: trackingCode || null });
  revalidatePath("/admin/pedidos");
}
