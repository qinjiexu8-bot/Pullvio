"use client";

import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, LoaderCircle, LockKeyhole, Mail, Play } from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { localePath, type Locale } from "@/lib/i18n";
import LanguageMenu from "./language-menu";

type Mode = "login" | "signup" | "forgot" | "reset";

const copy = {
  en: {
    loginTitle: "Welcome back.", signupTitle: "Create your Pullvio account.", forgotTitle: "Reset your password.", resetTitle: "Choose a new password.",
    loginCopy: "Sign in to manage Pro, saved links, and billing.", signupCopy: "Keep recent links, sync your account, and unlock Pro when you need it.", forgotCopy: "Enter your email and we’ll send you a secure reset link.", resetCopy: "Use at least eight characters for your new password.",
    home: "Home", benefits: ["Free downloads stay available without an account", "One account for history, billing, and Pro", "Cancel Pro from your account at any time"],
    google: "Continue with Google", or: "or use email", email: "Email address", password: "Password", confirmPassword: "Confirm password", forgot: "Forgot password?", login: "Sign in", signup: "Create account", send: "Send reset link", update: "Update password", noAccount: "New to Pullvio?", hasAccount: "Already have an account?", create: "Create one", backLogin: "Back to sign in", terms: "By continuing, you agree to Pullvio’s Terms and Privacy Policy.", secure: "Secure account access", secureCopy: "Sessions use encrypted, server-verified cookies. Pullvio never stores your raw password.", configured: "Authentication is not configured yet. Add the Supabase environment variables to enable this form.", checkEmail: "Check your inbox to verify your email before signing in.", resetSent: "A password reset link has been sent if that account exists.", mismatch: "The passwords do not match.", short: "Use a password with at least 8 characters.",
  },
  "zh-cn": {
    loginTitle: "欢迎回来。", signupTitle: "创建 Pullvio 账户。", forgotTitle: "重置密码。", resetTitle: "设置新密码。",
    loginCopy: "登录后管理 Pro、保存记录与账单。", signupCopy: "同步最近链接，需要时即可升级 Pro。", forgotCopy: "输入邮箱，我们会向您发送安全的重置链接。", resetCopy: "新密码至少需要 8 个字符。",
    home: "首页", benefits: ["免费工具无需账户即可继续使用", "一个账户管理历史、账单与 Pro", "随时可以在账户中取消 Pro"],
    google: "使用 Google 继续", or: "或使用邮箱", email: "邮箱地址", password: "密码", confirmPassword: "确认密码", forgot: "忘记密码？", login: "登录", signup: "创建账户", send: "发送重置链接", update: "更新密码", noAccount: "还没有 Pullvio 账户？", hasAccount: "已经有账户？", create: "立即创建", backLogin: "返回登录", terms: "继续即表示您同意 Pullvio 的服务条款和隐私政策。", secure: "安全的账户访问", secureCopy: "会话使用加密且经服务端验证的 Cookie。Pullvio 不会保存您的明文密码。", configured: "认证服务尚未配置。添加 Supabase 环境变量后即可启用。", checkEmail: "请检查邮箱并完成验证，然后再登录。", resetSent: "如果该账户存在，密码重置邮件已经发送。", mismatch: "两次输入的密码不一致。", short: "密码至少需要 8 个字符。",
  },
  es: {
    loginTitle: "Te damos la bienvenida.", signupTitle: "Crea tu cuenta de Pullvio.", forgotTitle: "Restablece tu contraseña.", resetTitle: "Elige una contraseña nueva.",
    loginCopy: "Inicia sesión para gestionar Pro, tus enlaces y la facturación.", signupCopy: "Sincroniza tus enlaces y activa Pro cuando lo necesites.", forgotCopy: "Introduce tu correo y te enviaremos un enlace seguro.", resetCopy: "Usa al menos ocho caracteres para la nueva contraseña.",
    home: "Inicio", benefits: ["Las descargas gratis siguen disponibles sin cuenta", "Una cuenta para el historial, la facturación y Pro", "Cancela Pro desde tu cuenta cuando quieras"],
    google: "Continuar con Google", or: "o usa el correo", email: "Correo electrónico", password: "Contraseña", confirmPassword: "Confirmar contraseña", forgot: "¿Olvidaste tu contraseña?", login: "Iniciar sesión", signup: "Crear cuenta", send: "Enviar enlace", update: "Actualizar contraseña", noAccount: "¿Aún no tienes cuenta?", hasAccount: "¿Ya tienes una cuenta?", create: "Crear una", backLogin: "Volver al inicio de sesión", terms: "Al continuar, aceptas los Términos y la Política de privacidad de Pullvio.", secure: "Acceso seguro", secureCopy: "Las sesiones usan cookies cifradas y verificadas por el servidor. Pullvio no guarda tu contraseña original.", configured: "La autenticación aún no está configurada. Añade las variables de Supabase para activar el formulario.", checkEmail: "Revisa tu correo y verifica la cuenta antes de iniciar sesión.", resetSent: "Si la cuenta existe, se ha enviado un enlace para restablecer la contraseña.", mismatch: "Las contraseñas no coinciden.", short: "La contraseña debe tener al menos 8 caracteres.",
  },
} as const;

export default function AuthForm({ mode, locale }: { mode: Mode; locale: Locale }) {
  const t = copy[locale];
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const titles = { login: t.loginTitle, signup: t.signupTitle, forgot: t.forgotTitle, reset: t.resetTitle };
  const descriptions = { login: t.loginCopy, signup: t.signupCopy, forgot: t.forgotCopy, reset: t.resetCopy };

  async function googleLogin() {
    const supabase = createClient();
    if (!supabase) return setMessage(t.configured);
    await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(localePath(locale, "/account"))}` } });
  }

  async function submit(event: FormEvent) {
    event.preventDefault(); setMessage(""); setSuccess(false);
    if ((mode === "signup" || mode === "reset") && password.length < 8) return setMessage(t.short);
    if ((mode === "signup" || mode === "reset") && password !== confirmPassword) return setMessage(t.mismatch);
    const supabase = createClient();
    if (!supabase) return setMessage(t.configured);
    setBusy(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push(localePath(locale, "/account")); router.refresh();
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(localePath(locale, "/account"))}` } });
        if (error) throw error; setSuccess(true); setMessage(t.checkEmail);
      } else if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(localePath(locale, "/reset-password"))}` });
        if (error) throw error; setSuccess(true); setMessage(t.resetSent);
      } else {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error; router.push(localePath(locale, "/account")); router.refresh();
      }
    } catch (error) { setMessage(error instanceof Error ? error.message : "Authentication failed."); }
    finally { setBusy(false); }
  }

  return (
    <main className="auth-page">
      <header className="auth-header"><a className="brand" href={localePath(locale)}><span className="brand-mark"><span /><Play size={13} fill="currentColor" strokeWidth={0} /></span><span>pullvio</span></a><div><LanguageMenu locale={locale} /><a href={localePath(locale)}><ArrowLeft size={16} />{t.home}</a></div></header>
      <section className="auth-shell">
        <div className="auth-promise"><span className="kicker">PULLVIO ACCOUNT</span><h1>{titles[mode]}</h1><p>{descriptions[mode]}</p><div className="auth-security"><LockKeyhole size={21} /><div><strong>{t.secure}</strong><span>{t.secureCopy}</span></div></div><ul>{t.benefits.map((benefit) => <li key={benefit}><Check size={16} />{benefit}</li>)}</ul></div>
        <div className="auth-card">
          {(mode === "login" || mode === "signup") && <><button className="google-button" type="button" onClick={googleLogin}><span>G</span>{t.google}</button><div className="auth-divider"><span>{t.or}</span></div></>}
          <form onSubmit={submit}>
            {mode !== "reset" && <label>{t.email}<div className="auth-field"><Mail size={18} /><input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></div></label>}
            {mode !== "forgot" && <label>{t.password}{mode === "login" && <a href={localePath(locale, "/forgot-password")}>{t.forgot}</a>}<div className="auth-field"><LockKeyhole size={18} /><input type={showPassword ? "text" : "password"} autoComplete={mode === "login" ? "current-password" : "new-password"} value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label="Show password">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></label>}
            {(mode === "signup" || mode === "reset") && <label>{t.confirmPassword}<div className="auth-field"><LockKeyhole size={18} /><input type={showPassword ? "text" : "password"} autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required minLength={8} /></div></label>}
            {message && <p className={`auth-message ${success ? "success" : ""}`} role="status">{message}</p>}
            <button className="auth-submit" type="submit" disabled={busy}>{busy ? <LoaderCircle className="spinner-icon" size={18} /> : null}{mode === "login" ? t.login : mode === "signup" ? t.signup : mode === "forgot" ? t.send : t.update}<ArrowRight size={17} /></button>
          </form>
          <p className="auth-switch">{mode === "login" ? <>{t.noAccount} <a href={localePath(locale, "/signup")}>{t.create}</a></> : mode === "signup" ? <>{t.hasAccount} <a href={localePath(locale, "/login")}>{t.login}</a></> : <a href={localePath(locale, "/login")}>{t.backLogin}</a>}</p>
          <small className="auth-terms">{t.terms}</small>
        </div>
      </section>
    </main>
  );
}
