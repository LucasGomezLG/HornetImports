import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createAdminClient } from "@/lib/supabase/admin";
import { cookies } from "next/headers";
import type { Database } from "@/lib/supabase/types";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (!code) return NextResponse.redirect(`${origin}/login`);

  const cookieStore = await cookies();

  // Definir la respuesta de redirect primero para poder settear cookies en ella
  const redirectResponse = NextResponse.redirect(`${origin}${next}`);

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          // Setear cookies tanto en el store como en la respuesta de redirect
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
            redirectResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/login?error=callback`);
  }

  const user = data.user;

  // Garantizar profile (backup del trigger) — solo para signup
  if (next !== "/actualizar-contrasena") {
    try {
      const db = createAdminClient();
      const { data: existing } = await db
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single();

      if (!existing) {
        const meta = user.user_metadata ?? {};
        await db.from("profiles").insert({
          id: user.id,
          email: user.email!,
          tipo: (meta.tipo as "comprador" | "vendedor") ?? "comprador",
          nombre: (meta.nombre as string) ?? null,
        });
      }
    } catch {
      // No bloquear el redirect si falla la creación del profile
    }
  }

  return redirectResponse;
}
