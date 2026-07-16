import { auth } from "@clerk/nextjs/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  const clerkAuth = await auth();
  return createSupabaseClient<Database>(url, key, {
    accessToken: async () => clerkAuth.getToken(),
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
