"use client";

import { useSession } from "@clerk/nextjs";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { useMemo } from "react";
import type { Database } from "@/lib/database.types";

export function useSupabaseClient() {
  const { session } = useSession();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  return useMemo(() => {
    if (!url || !key) return null;
    return createSupabaseClient<Database>(url, key, {
      accessToken: async () => session?.getToken() ?? null,
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }, [key, session, url]);
}
