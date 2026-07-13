import type { Metadata } from "next";
import ContentPage from "../components/content-page";
import { policyPages } from "@/lib/policy-pages";
const page = policyPages.contact;
export const metadata: Metadata = { title: "Contact Pullvio | Beta, Privacy & Copyright", description: page.description, alternates: { canonical: "/contact" } };
export default function Page() { return <ContentPage {...page} updated="July 12, 2026" links={[["Privacy policy", "/privacy"], ["Copyright policy", "/copyright"]]}>{page.body}</ContentPage>; }
