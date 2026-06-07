"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

export async function guardarProducto(
  id: string | null,
  _prev: { error: string | null; success: boolean },
  formData: FormData
): Promise<{ error: string | null; success: boolean }> {
  const db = createAdminClient();

  const nombre = (formData.get("nombre") as string | null)?.trim() ?? "";
  const descripcion = (formData.get("descripcion") as string | null)?.trim() || null;
  const categoria = (formData.get("categoria") as string | null)?.trim() ?? "";
  const precio_usd = parseFloat((formData.get("precio_usd") as string | null) ?? "0");
  const stock = parseInt((formData.get("stock") as string | null) ?? "0", 10);
  const destacado = formData.get("destacado") === "on";

  if (!nombre) return { error: "El nombre es obligatorio.", success: false };
  if (!categoria) return { error: "La categoría es obligatoria.", success: false };
  if (isNaN(precio_usd) || precio_usd <= 0) return { error: "El precio debe ser mayor a 0.", success: false };
  if (isNaN(stock) || stock < 0) return { error: "El stock no puede ser negativo.", success: false };

  if (id) {
    const { error } = await db
      .from("tienda_productos")
      .update({ nombre, descripcion, categoria, precio_usd, stock, destacado })
      .eq("id", id);
    if (error) return { error: "No se pudo actualizar el producto.", success: false };
  } else {
    const { error } = await db
      .from("tienda_productos")
      .insert({ nombre, descripcion, categoria, precio_usd, stock, destacado });
    if (error) return { error: "No se pudo crear el producto.", success: false };
  }

  revalidatePath("/admin/tienda");
  revalidatePath("/tienda");
  return { error: null, success: true };
}

export async function toggleActivo(id: string, activo: boolean): Promise<void> {
  const db = createAdminClient();
  await db.from("tienda_productos").update({ activo: !activo }).eq("id", id);
  revalidatePath("/admin/tienda");
  revalidatePath("/tienda");
}

export async function eliminarProducto(id: string): Promise<void> {
  const db = createAdminClient();
  await db.from("tienda_productos").delete().eq("id", id);
  revalidatePath("/admin/tienda");
  revalidatePath("/tienda");
}
