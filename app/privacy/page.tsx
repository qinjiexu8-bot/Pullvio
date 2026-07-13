import type { Metadata } from "next";
import ContentPage from "../components/content-page";
import { policyPages } from "@/lib/policy-pages";
const page = policyPages.privacy;
export const metadata: Metadata = { title: "Privacy Policy | Pullvio", description: page.description, alternates: { canonical: "/privacy" } };
export default function Page() { return <ContentPage {...page} updated="July 12, 2026" links={[["Terms of use", "/terms"], ["Contact privacy", "/contact"]]}>{page.body}</ContentPage>; }
