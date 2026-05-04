"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function normalizarCUIT(raw: string): string {
  return raw.replace(/[-\s]/g, "");
}

function validarCUIT(cuit: string): boolean {
  return /^\d{11}$/.test(cuit);
}

function formatearCUIT(cuit: string): string {
  return `${cuit.slice(0, 2)}-${cuit.slice(2, 10)}-${cuit.slice(10)}`;
}

export async function actualizarPerfil(
  _prev: { error: string | null; success: boolean },
  formData: FormData
): Promise<{ error: string | null; success: boolean }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "No autenticado.", success: false };

  const nombre = (formData.get("nombre") as string | null)?.trim() ?? "";
  const apellido = (formData.get("apellido") as string | null)?.trim() ?? "";
  const telefono = (formData.get("telefono") as string | null)?.trim() ?? "";
  const cuitRaw = (formData.get("cuit") as string | null)?.trim() ?? "";

  if (!nombre) return { error: "El nombre es obligatorio.", success: false };

  let cuitFormatted: string | null = null;
  if (cuitRaw) {
    const clean = normalizarCUIT(cuitRaw);
    if (!validarCUIT(clean)) {
      return { error: "CUIT/CUIL inválido. Ingresá los 11 dígitos (ej: 20-12345678-9).", success: false };
    }
    cuitFormatted = formatearCUIT(clean);
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      nombre,
      apellido: apellido || null,
      telefono: telefono || null,
      cuit: cuitFormatted,
    })
    .eq("id", user.id);

  if (error) {
    if (error.code === "23505") return { error: "Ese CUIT ya está registrado en otra cuenta.", success: false };
    return { error: "No se pudo guardar. Intentá de nuevo.", success: false };
  }

  revalidatePath("/dashboard");
  revalidatePath("/perfil");
  return { error: null, success: true };
}
