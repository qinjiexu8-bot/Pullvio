import type { Metadata } from "next";
import ContentPage from "../components/content-page";
import { policyPages } from "@/lib/policy-pages";
const page = policyPages.about;
export const metadata: Metadata = { title: "About Pullvio | Product Principles", description: page.description, alternates: { canonical: "/about", languages: { en: "/about", "zh-CN": "/zh-cn/about", es: "/es/about", "x-default": "/about" } } };
export default function Page() { return <ContentPage {...page} updated="July 17, 2026" links={[["Read the product guides", "/guides"], ["Contact Pullvio", "/contact"]]}>{page.body}</ContentPage>; }
