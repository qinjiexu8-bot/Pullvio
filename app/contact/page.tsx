import type { Metadata } from "next";
import ContentPage from "../components/content-page";
import { policyPages } from "@/lib/policy-pages";
const page = policyPages.contact;
export const metadata: Metadata = { title: "Contact Pullvio | Product, Privacy & Copyright", description: page.description, alternates: { canonical: "/contact", languages: { en: "/contact", "zh-CN": "/zh-cn/contact", es: "/es/contact", "x-default": "/contact" } } };
export default function Page() { return <ContentPage {...page} updated="July 12, 2026" links={[["Privacy policy", "/privacy"], ["Copyright policy", "/copyright"]]}>{page.body}</ContentPage>; }
