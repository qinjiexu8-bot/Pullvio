import type { Metadata } from "next";
import AccountPage from "../components/account-page";
import { resolveAccountPagination, type AccountSearchParams } from "@/lib/account-pagination";
export const metadata: Metadata = { title: "Account | Pullvio", robots: { index: false, follow: false } };
export default async function Page({ searchParams }: { searchParams: Promise<AccountSearchParams> }) { const pagination = resolveAccountPagination(await searchParams); return <AccountPage locale="en" {...pagination} />; }
