"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { obtenerTipoCambio } from "@/lib/utils/exchange-rate";

async function verificarVendedor() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles").select("tipo").eq("id", user.id).single();
  if (profile?.tipo !== "vendedor" && profile?.tipo !== "admin") return null;
  return user;
}

export async function guardarListing(
  id: string | null,
  _prev: { error: string | null; success: boolean },
  formData: FormData
): Promise<{ error: string | null; success: boolean }> {
  const supabase = await createClient();
  const user = await verificarVendedor();
  if (!user) return { error: "Sin permisos.", success: false };

  const nombre = (formData.get("nombre") as string | null)?.trim() ?? "";
  const descripcion = (formData.get("descripcion") as string | null)?.trim() || null;
  const categoria = (formData.get("categoria") as string | null)?.trim() ?? "";
  const precio_usd = parseFloat((formData.get("precio_usd") as string | null) ?? "0");
  const stock = parseInt((formData.get("stock") as string | null) ?? "0", 10);

  if (!nombre) return { error: "El nombre es obligatorio.", success: false };
  if (!categoria) return { error: "La categoría es obligatoria.", success: false };
  if (isNaN(precio_usd) || precio_usd <= 0) return { error: "El precio debe ser mayor a 0.", success: false };
  if (isNaN(stock) || stock < 0) return { error: "El stock no puede ser negativo.", success: false };

  const tipoCambio = await obtenerTipoCambio();
  const precio_ars = Math.ceil(precio_usd * tipoCambio);

  if (id) {
    const { error } = await supabase
      .from("listings")
      .update({ nombre, descripcion, categoria, precio_usd, precio_ars, stock })
      .eq("id", id)
      .eq("vendedor_id", user.id);
    if (error) return { error: "No se pudo actualizar el producto.", success: false };
  } else {
    const { error } = await supabase
      .from("listings")
      .insert({ nombre, descripcion, categoria, precio_usd, precio_ars, stock, vendedor_id: user.id });
    if (error) return { error: "No se pudo crear el producto.", success: false };
  }

  revalidatePath("/vendedor/productos");
  revalidatePath("/marketplace");
  return { error: null, success: true };
}

export async function toggleListingActivo(id: string, activo: boolean): Promise<void> {
  const supabase = await createClient();
  const user = await verificarVendedor();
  if (!user) return;
  await supabase.from("listings").update({ activo: !activo }).eq("id", id).eq("vendedor_id", user.id);
  revalidatePath("/vendedor/productos");
  revalidatePath("/marketplace");
}

export async function eliminarListing(id: string): Promise<void> {
  const supabase = await createClient();
  const user = await verificarVendedor();
  if (!user) return;
  await supabase.from("listings").delete().eq("id", id).eq("vendedor_id", user.id);
  revalidatePath("/vendedor/productos");
  revalidatePath("/marketplace");
}
