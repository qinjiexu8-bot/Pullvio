"use client";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { localePath, type Locale } from "@/lib/i18n";

export default function SignOutButton({ locale }: { locale: Locale }) {
  const router = useRouter();
  return <button className="account-signout" type="button" onClick={async () => { const supabase = createClient(); await supabase?.auth.signOut(); router.push(localePath(locale, "/login")); router.refresh(); }}><LogOut size={16} />Sign out</button>;
}
