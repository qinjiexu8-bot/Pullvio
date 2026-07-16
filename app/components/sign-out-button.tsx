"use client";
import { LogOut } from "lucide-react";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { localePath, type Locale } from "@/lib/i18n";

export default function SignOutButton({ locale }: { locale: Locale }) {
  const { signOut } = useClerk();
  const router = useRouter();
  const label = locale === "zh-cn" ? "退出登录" : locale === "es" ? "Cerrar sesión" : "Sign out";
  return <button className="account-signout" type="button" onClick={async () => { await signOut(); router.push(localePath(locale, "/login")); router.refresh(); }}><LogOut size={16} />{label}</button>;
}
