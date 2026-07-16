import { SignIn, SignUp } from "@clerk/nextjs";
import { Check, LockKeyhole, Play } from "lucide-react";
import { localePath, type Locale } from "@/lib/i18n";
import LanguageMenu from "./language-menu";

type Mode = "login" | "signup" | "forgot" | "reset";

const copy = {
  en: {
    loginTitle: "Welcome back.", signupTitle: "Create your Pullvio account.", forgotTitle: "Reset your password.", resetTitle: "Choose a new password.",
    loginCopy: "Sign in to manage Pro, saved links, and billing.", signupCopy: "Keep recent links, sync your account, and unlock Pro when you need it.", forgotCopy: "Use the secure recovery option in the sign-in form.", resetCopy: "Finish the secure recovery flow to choose a new password.",
    home: "Home", benefits: ["Free downloads stay available without an account", "One account for history, billing, and Pro", "Cancel Pro from your account at any time"],
    secure: "Secure account access", secureCopy: "Clerk protects sign-in, email verification, sessions, and password recovery. Pullvio never stores your raw password.",
  },
  "zh-cn": {
    loginTitle: "欢迎回来。", signupTitle: "创建 Pullvio 账户。", forgotTitle: "重置密码。", resetTitle: "设置新密码。",
    loginCopy: "登录后管理 Pro、保存记录与账单。", signupCopy: "同步最近链接，需要时即可升级 Pro。", forgotCopy: "请使用登录表单中的安全找回功能。", resetCopy: "完成安全验证后即可设置新密码。",
    home: "首页", benefits: ["免费工具无需账户即可继续使用", "一个账户管理历史、账单与 Pro", "随时可以在账户中取消 Pro"],
    secure: "安全的账户访问", secureCopy: "Clerk 负责登录、邮箱验证、会话与密码找回。Pullvio 不会保存您的明文密码。",
  },
  es: {
    loginTitle: "Te damos la bienvenida.", signupTitle: "Crea tu cuenta de Pullvio.", forgotTitle: "Restablece tu contraseña.", resetTitle: "Elige una contraseña nueva.",
    loginCopy: "Inicia sesión para gestionar Pro, tus enlaces y la facturación.", signupCopy: "Sincroniza tus enlaces y activa Pro cuando lo necesites.", forgotCopy: "Usa la opción de recuperación segura del formulario de acceso.", resetCopy: "Completa la recuperación segura para elegir una contraseña nueva.",
    home: "Inicio", benefits: ["Las descargas gratis siguen disponibles sin cuenta", "Una cuenta para el historial, la facturación y Pro", "Cancela Pro desde tu cuenta cuando quieras"],
    secure: "Acceso seguro", secureCopy: "Clerk protege el acceso, la verificación del correo, las sesiones y la recuperación. Pullvio nunca guarda tu contraseña original.",
  },
} as const;

const clerkAppearance = {
  variables: {
    colorPrimary: "#3ce3a5",
    colorBackground: "transparent",
    colorForeground: "var(--ink)",
    colorInput: "transparent",
    colorInputForeground: "var(--ink)",
    colorMutedForeground: "var(--muted)",
    borderRadius: "12px",
    fontFamily: "var(--font-body), sans-serif",
  },
  elements: {
    rootBox: "pullvio-clerk-root",
    cardBox: "pullvio-clerk-card-box",
    card: "pullvio-clerk-card",
    headerTitle: "pullvio-clerk-hidden",
    headerSubtitle: "pullvio-clerk-hidden",
    footer: "pullvio-clerk-footer",
  },
} as const;

export default function AuthForm({ mode, locale }: { mode: Mode; locale: Locale }) {
  const t = copy[locale];
  const titles = { login: t.loginTitle, signup: t.signupTitle, forgot: t.forgotTitle, reset: t.resetTitle };
  const descriptions = { login: t.loginCopy, signup: t.signupCopy, forgot: t.forgotCopy, reset: t.resetCopy };
  const accountUrl = localePath(locale, "/account");
  const loginUrl = localePath(locale, "/login");
  const signupUrl = localePath(locale, "/signup");

  return (
    <main className="auth-page">
      <header className="auth-header"><a className="brand" href={localePath(locale)}><span className="brand-mark"><span /><Play size={13} fill="currentColor" strokeWidth={0} /></span><span>pullvio</span></a><div><LanguageMenu locale={locale} /><a href={localePath(locale)}>{t.home}</a></div></header>
      <section className="auth-shell">
        <div className="auth-promise"><span className="kicker">PULLVIO ACCOUNT</span><h1>{titles[mode]}</h1><p>{descriptions[mode]}</p><div className="auth-security"><LockKeyhole size={21} /><div><strong>{t.secure}</strong><span>{t.secureCopy}</span></div></div><ul>{t.benefits.map((benefit) => <li key={benefit}><Check size={16} />{benefit}</li>)}</ul></div>
        <div className="auth-card clerk-auth-host">
          {mode === "signup" ? (
            <SignUp routing="hash" forceRedirectUrl={accountUrl} fallbackRedirectUrl={accountUrl} signInUrl={loginUrl} appearance={clerkAppearance} />
          ) : (
            <SignIn routing="hash" forceRedirectUrl={accountUrl} fallbackRedirectUrl={accountUrl} signUpUrl={signupUrl} appearance={clerkAppearance} />
          )}
        </div>
      </section>
    </main>
  );
}
