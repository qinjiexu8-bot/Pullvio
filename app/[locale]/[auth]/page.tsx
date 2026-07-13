import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AuthForm from "../../components/auth-form";
import { localizedContent, type LocalizedLocale } from "@/lib/i18n";

const modes = { login: "login", signup: "signup", "forgot-password": "forgot", "reset-password": "reset" } as const;
type Props = { params: Promise<{ locale: string; auth: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { auth } = await params;
  const labels: Record<string, string> = { login: "Sign in", signup: "Create account", "forgot-password": "Reset password", "reset-password": "Choose a new password" };
  return { title: `${labels[auth] || "Account"} | Pullvio`, robots: { index: false, follow: false } };
}

export default async function LocalizedAuthPage({ params }: Props) {
  const { locale, auth } = await params;
  if (!(locale in localizedContent) || !(auth in modes)) notFound();
  return <AuthForm mode={modes[auth as keyof typeof modes]} locale={locale as LocalizedLocale} />;
}
