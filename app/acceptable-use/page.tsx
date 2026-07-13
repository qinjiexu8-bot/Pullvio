import type { Metadata } from "next";
import ContentPage from "../components/content-page";
import { policyPages } from "@/lib/policy-pages";
const page = policyPages["acceptable-use"];
export const metadata: Metadata = { title: "Acceptable Use Policy | Pullvio", description: page.description, alternates: { canonical: "/acceptable-use" } };
export default function Page() { return <ContentPage {...page} updated="July 12, 2026" links={[["Copyright policy", "/copyright"], ["Terms of use", "/terms"]]}>{page.body}</ContentPage>; }
