"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/utils/logger";

export async function login(
  _prev: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const email = (formData.get("email") as string | null)?.trim() ?? "";
  const password = (formData.get("password") as string | null) ?? "";
  const redirectTo = (formData.get("redirectTo") as string | null) ?? "/dashboard";

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    logger.warn("LOGIN", "Error de autenticación", { email, error: error.message });
    const msg = error.message;
    if (msg === "Invalid login credentials")
      return { error: "Email o contraseña incorrectos." };
    if (msg === "Email not confirmed")
      return { error: "Confirmá tu email antes de ingresar." };
    if (msg.includes("rate") || msg.includes("Too many"))
      return { error: "Demasiados intentos. Esperá unos minutos." };
    return { error: "Ocurrió un error. Intentá de nuevo." };
  }

  logger.info("LOGIN", "Login exitoso", { email });
  redirect(redirectTo);
}
