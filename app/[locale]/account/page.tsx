import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AccountPage from "../../components/account-page";
import { localizedContent, type LocalizedLocale } from "@/lib/i18n";
import { resolveAccountPagination, type AccountSearchParams } from "@/lib/account-pagination";
export const metadata: Metadata = { title: "Account | Pullvio", robots: { index: false, follow: false } };
export default async function Page({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<AccountSearchParams> }) { const { locale } = await params; if (!(locale in localizedContent)) notFound(); const pagination = resolveAccountPagination(await searchParams); return <AccountPage locale={locale as LocalizedLocale} {...pagination} />; }
