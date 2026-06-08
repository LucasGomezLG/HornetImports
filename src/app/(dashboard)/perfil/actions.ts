"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/utils/logger";

export async function actualizarPerfil(
  _prev: { error: string | null; success: boolean },
  formData: FormData
): Promise<{ error: string | null; success: boolean }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    logger.warn("PERFIL", "Intento de actualización sin sesión");
    return { error: "No autenticado.", success: false };
  }

  const nombre = (formData.get("nombre") as string | null)?.trim() ?? "";
  const apellido = (formData.get("apellido") as string | null)?.trim() ?? "";
  const telefono = (formData.get("telefono") as string | null)?.trim() ?? "";

  if (!nombre) return { error: "El nombre es obligatorio.", success: false };

  const db = createAdminClient();
  const { error } = await db
    .from("profiles")
    .update({ nombre, apellido: apellido || null, telefono: telefono || null })
    .eq("id", user.id);

  if (error) {
    logger.error("PERFIL", "Error actualizando perfil", { userId: user.id, error: error.message });
    return { error: "No se pudo guardar. Intentá de nuevo.", success: false };
  }

  logger.info("PERFIL", "Perfil actualizado", { userId: user.id, nombre, telefono: telefono || null });

  revalidatePath("/dashboard");
  revalidatePath("/perfil");
  return { error: null, success: true };
}
