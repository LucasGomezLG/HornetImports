import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createAdminClient } from "@/lib/supabase/admin";
import { cookies } from "next/headers";
import { logger } from "@/lib/utils/logger";
import type { Database } from "@/lib/supabase/types";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (!code) {
    logger.warn("AUTH_CALLBACK", "Callback sin código", { next });
    return NextResponse.redirect(`${origin}/login`);
  }

  const cookieStore = await cookies();
  const redirectResponse = NextResponse.redirect(`${origin}${next}`);

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
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
    logger.error("AUTH_CALLBACK", "Error intercambiando código", { error: error?.message });
    return NextResponse.redirect(`${origin}/login?error=callback`);
  }

  const user = data.user;
  logger.info("AUTH_CALLBACK", "Sesión establecida", { userId: user.id, email: user.email, next });

  if (next !== "/actualizar-contrasena") {
    try {
      const db = createAdminClient();
      const { data: existing } = await db
        .from("profiles").select("id").eq("id", user.id).single();

      if (!existing) {
        const meta = user.user_metadata ?? {};
        await db.from("profiles").insert({
          id: user.id,
          email: user.email!,
          tipo: (meta.tipo as "comprador" | "vendedor") ?? "comprador",
          nombre: (meta.nombre as string) ?? null,
        });
        logger.info("AUTH_CALLBACK", "Profile creado via callback", { userId: user.id, tipo: meta.tipo ?? "comprador" });
      } else {
        logger.info("AUTH_CALLBACK", "Profile ya existía", { userId: user.id });
      }
    } catch (err) {
      logger.error("AUTH_CALLBACK", "Error creando profile", { userId: user.id, error: String(err) });
    }
  }

  return redirectResponse;
}
