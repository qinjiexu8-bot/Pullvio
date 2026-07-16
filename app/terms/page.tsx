import type { Metadata } from "next";
import ContentPage from "../components/content-page";
import { policyPages } from "@/lib/policy-pages";
const page = policyPages.terms;
export const metadata: Metadata = { title: "Terms of Use | Pullvio", description: page.description, alternates: { canonical: "/terms", languages: { en: "/terms", "zh-CN": "/zh-cn/terms", es: "/es/terms", "x-default": "/terms" } } };
export default function Page() { return <ContentPage {...page} updated="July 12, 2026" links={[["Acceptable use", "/acceptable-use"], ["Copyright policy", "/copyright"]]}>{page.body}</ContentPage>; }
