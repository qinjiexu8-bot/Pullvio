import type { Metadata } from "next";
import ContentPage from "../components/content-page";
import { policyPages } from "@/lib/policy-pages";
const page = policyPages.copyright;
export const metadata: Metadata = { title: "Copyright & Takedown Policy | Pullvio", description: page.description, alternates: { canonical: "/copyright", languages: { en: "/copyright", "zh-CN": "/zh-cn/copyright", es: "/es/copyright", "x-default": "/copyright" } } };
export default function Page() { return <ContentPage {...page} updated="July 12, 2026" links={[["Acceptable use", "/acceptable-use"], ["Contact Pullvio", "/contact"]]}>{page.body}</ContentPage>; }
