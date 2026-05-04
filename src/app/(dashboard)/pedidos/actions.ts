"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function guardarTrackingCliente(
  pedidoId: string,
  trackingCode: string
): Promise<{ error: string } | void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "No autenticado." };

  const trimmed = trackingCode.trim();
  if (!trimmed) return { error: "Ingresá un número de tracking válido." };

  const { error } = await supabase
    .from("pedidos")
    .update({ tracking_codigo_cliente: trimmed })
    .eq("id", pedidoId)
    .eq("user_id", user.id);

  if (error) return { error: "No se pudo guardar. Intentá de nuevo." };
  revalidatePath("/pedidos");
}
