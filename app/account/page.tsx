import type { Metadata } from "next";
import AccountPage from "../components/account-page";
export const metadata: Metadata = { title: "Account | Pullvio", robots: { index: false, follow: false } };
export default function Page() { return <AccountPage locale="en" />; }
