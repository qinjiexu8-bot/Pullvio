import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AuthForm from "../../components/auth-form";
import ContentPage from "../../components/content-page";
import { localePath, localizedContent, type LocalizedLocale } from "@/lib/i18n";
import { localizedPolicyPages } from "@/lib/localized-pages";

const modes = { login: "login", signup: "signup", "forgot-password": "forgot", "reset-password": "reset" } as const;
const legalPages = ["contact", "privacy", "terms", "copyright", "acceptable-use"] as const;
type LegalPage = (typeof legalPages)[number];
type Props = { params: Promise<{ locale: string; auth: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, auth } = await params;
  if (locale in localizedContent && legalPages.includes(auth as LegalPage)) {
    const language = locale as LocalizedLocale;
    const page = localizedPolicyPages[language][auth as LegalPage];
    return {
      title: `${page.title} | Pullvio`,
      description: page.description,
      alternates: {
        canonical: localePath(language, `/${auth}`),
        languages: { en: `/${auth}`, "zh-CN": `/zh-cn/${auth}`, es: `/es/${auth}`, "x-default": `/${auth}` },
      },
    };
  }
  const labels: Record<string, string> = { login: "Sign in", signup: "Create account", "forgot-password": "Reset password", "reset-password": "Choose a new password" };
  return { title: `${labels[auth] || "Account"} | Pullvio`, robots: { index: false, follow: true } };
}

export default async function LocalizedAuthPage({ params }: Props) {
  const { locale, auth } = await params;
  if (!(locale in localizedContent)) notFound();
  const language = locale as LocalizedLocale;
  if (auth in modes) return <AuthForm mode={modes[auth as keyof typeof modes]} locale={language} />;
  if (!legalPages.includes(auth as LegalPage)) notFound();
  const page = localizedPolicyPages[language][auth as LegalPage];
  const links = language === "zh-cn"
    ? [["隐私政策", "/zh-cn/privacy"], ["服务条款", "/zh-cn/terms"], ["联系我们", "/zh-cn/contact"]] as Array<[string, string]>
    : [["Privacidad", "/es/privacy"], ["Términos", "/es/terms"], ["Contacto", "/es/contact"]] as Array<[string, string]>;
  return <ContentPage {...page} locale={language} updated={language === "zh-cn" ? "2026 年 7 月 17 日" : "17 de julio de 2026"} links={links}>{page.body}</ContentPage>;
}
