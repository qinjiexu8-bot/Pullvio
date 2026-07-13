import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AccountPage from "../../components/account-page";
import { localizedContent, type LocalizedLocale } from "@/lib/i18n";
export const metadata: Metadata = { title: "Account | Pullvio", robots: { index: false, follow: false } };
export default async function Page({ params }: { params: Promise<{ locale: string }> }) { const { locale } = await params; if (!(locale in localizedContent)) notFound(); return <AccountPage locale={locale as LocalizedLocale} />; }
