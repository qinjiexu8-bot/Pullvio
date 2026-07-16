"use client";

import { Check, LoaderCircle, UserRound } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSupabaseClient } from "@/lib/supabase/client";
import { localePath, type Locale } from "@/lib/i18n";

const copy = {
  en: { eyebrow: "PROFILE", title: "Account preferences", name: "Display name", email: "Email", language: "Language", theme: "Theme", system: "System", light: "Light", dark: "Dark", save: "Save changes", saved: "Preferences saved", error: "Changes could not be saved. Please try again." },
  "zh-cn": { eyebrow: "个人资料", title: "账户偏好", name: "显示名称", email: "邮箱", language: "语言", theme: "主题", system: "跟随系统", light: "浅色", dark: "深色", save: "保存更改", saved: "偏好已保存", error: "暂时无法保存更改，请重试。" },
  es: { eyebrow: "PERFIL", title: "Preferencias de la cuenta", name: "Nombre visible", email: "Correo", language: "Idioma", theme: "Tema", system: "Sistema", light: "Claro", dark: "Oscuro", save: "Guardar cambios", saved: "Preferencias guardadas", error: "No se han podido guardar los cambios. Inténtalo de nuevo." },
} as const;

function applyTheme(theme: string) {
  if (theme === "system") {
    localStorage.removeItem("pullvio-theme");
    document.documentElement.dataset.theme = matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  } else {
    localStorage.setItem("pullvio-theme", theme);
    document.documentElement.dataset.theme = theme;
  }
}

export default function AccountProfileForm({ userId, email, initialName, initialLocale, initialTheme, locale, disabled }: { userId: string; email: string; initialName: string; initialLocale: Locale; initialTheme: string; locale: Locale; disabled: boolean }) {
  const t = copy[locale];
  const supabase = useSupabaseClient();
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [language, setLanguage] = useState<Locale>(initialLocale);
  const [theme, setTheme] = useState(initialTheme);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => { applyTheme(initialTheme); }, [initialTheme]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!supabase || !userId) { setSuccess(false); setMessage(t.error); return; }
    setBusy(true); setMessage("");
    const { error } = await supabase.from("profiles").update({ display_name: name.trim() || null, locale: language, theme }).eq("id", userId);
    setBusy(false);
    if (error) { setSuccess(false); setMessage(t.error); return; }

    applyTheme(theme);
    setSuccess(true); setMessage(t.saved);
    if (language !== locale) router.replace(localePath(language, "/account"));
    router.refresh();
  }

  return (
    <form className="account-profile-card" onSubmit={submit}>
      <div className="account-card-label"><UserRound size={19} /><span>{t.eyebrow}</span></div>
      <h2>{t.title}</h2>
      <div className="account-profile-fields">
        <label><span>{t.name}</span><input value={name} onChange={(event) => setName(event.target.value)} maxLength={120} disabled={disabled || busy} /></label>
        <label><span>{t.email}</span><input value={email} readOnly disabled /></label>
        <label><span>{t.language}</span><select value={language} onChange={(event) => setLanguage(event.target.value as Locale)} disabled={disabled || busy}><option value="en">English</option><option value="zh-cn">简体中文</option><option value="es">Español</option></select></label>
        <label><span>{t.theme}</span><select value={theme} onChange={(event) => setTheme(event.target.value)} disabled={disabled || busy}><option value="system">{t.system}</option><option value="light">{t.light}</option><option value="dark">{t.dark}</option></select></label>
      </div>
      <div className="account-form-footer"><button type="submit" disabled={disabled || busy}>{busy ? <LoaderCircle className="spinner-icon" size={16} /> : <Check size={16} />}{t.save}</button>{message && <span className={success ? "success" : "error"} role="status">{message}</span>}</div>
    </form>
  );
}
