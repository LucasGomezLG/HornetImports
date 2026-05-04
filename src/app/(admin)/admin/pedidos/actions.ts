"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import type { EstadoPedido } from "@/lib/supabase/types";

export async function actualizarPedido(
  pedidoId: string,
  estado: EstadoPedido,
  trackingCode: string
): Promise<{ error: string } | void> {
  const db = createAdminClient();

  const { error } = await db
    .from("pedidos")
    .update({
      estado,
      tracking_code: trackingCode.trim() || null,
    })
    .eq("id", pedidoId);

  if (error) return { error: "No se pudo actualizar." };
  revalidatePath("/admin/pedidos");
}
