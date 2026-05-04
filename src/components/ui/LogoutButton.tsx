"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Props {
  className?: string;
}

export default function LogoutButton({ className }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <button
      type="button"
      className={className}
      onClick={handleLogout}
      disabled={loading}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
      </svg>
      {loading ? "Saliendo..." : "Cerrar sesión"}
    </button>
  );
}
