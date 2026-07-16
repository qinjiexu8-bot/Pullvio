"use client";

import {
  BellRing,
  CircleCheck,
  Headphones,
  Link2,
  LoaderCircle,
  LockKeyhole,
  Mail,
  Sparkles,
  Video,
  X,
} from "lucide-react";
import { FormEvent, RefObject, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { homeContent, localePath, type Locale } from "@/lib/i18n";

const waitlistCopy = {
  en: {
    eyebrow: "EARLY ACCESS",
    title: "Media downloads are coming soon.",
    copy: "We’re finishing the processing experience now. Leave your email and we’ll let you know as soon as it’s ready.",
    email: "Email address",
    placeholder: "you@example.com",
    submit: "Notify me",
    submitting: "Joining…",
    successTitle: "You’re on the list.",
    successCopy: "We’ll email you when Pullvio media downloads are ready.",
    error: "We couldn’t save your email right now. Please try again.",
    privacy: "We’ll only use your email for Pullvio product updates.",
    privacyLink: "Privacy policy",
    close: "Close",
    done: "Done",
  },
  "zh-cn": {
    eyebrow: "抢先体验",
    title: "媒体下载功能即将上线。",
    copy: "我们正在完成媒体处理体验。留下您的邮箱，功能开放后我们会第一时间通知您。",
    email: "邮箱地址",
    placeholder: "you@example.com",
    submit: "上线时通知我",
    submitting: "正在登记…",
    successTitle: "登记成功。",
    successCopy: "Pullvio 媒体下载功能开放后，我们会通过邮件通知您。",
    error: "暂时无法保存您的邮箱，请稍后再试。",
    privacy: "您的邮箱仅用于发送 Pullvio 产品上线通知。",
    privacyLink: "隐私政策",
    close: "关闭",
    done: "完成",
  },
  es: {
    eyebrow: "ACCESO ANTICIPADO",
    title: "Las descargas multimedia llegarán pronto.",
    copy: "Estamos terminando la experiencia de procesamiento. Déjanos tu correo y te avisaremos en cuanto esté disponible.",
    email: "Correo electrónico",
    placeholder: "tu@ejemplo.com",
    submit: "Avisarme",
    submitting: "Registrando…",
    successTitle: "Ya estás en la lista.",
    successCopy: "Te avisaremos por correo cuando las descargas de Pullvio estén disponibles.",
    error: "No hemos podido guardar tu correo. Inténtalo de nuevo.",
    privacy: "Solo usaremos tu correo para novedades del producto Pullvio.",
    privacyLink: "Política de privacidad",
    close: "Cerrar",
    done: "Listo",
  },
} as const;

function WaitlistModal({ locale, onClose, triggerRef }: { locale: Locale; onClose: () => void; triggerRef: RefObject<HTMLButtonElement | null> }) {
  const t = waitlistCopy[locale];
  const emailRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const trigger = triggerRef.current;
    document.body.style.overflow = "hidden";
    emailRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      trigger?.focus();
    };
  }, [onClose, triggerRef]);

  async function joinWaitlist(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, company, locale }),
      });
      if (!response.ok) throw new Error("Waitlist request failed");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="waitlist-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="waitlist-modal" role="dialog" aria-modal="true" aria-labelledby="waitlist-title">
        <button className="waitlist-close" type="button" aria-label={t.close} onClick={onClose}><X size={18} /></button>
        {status === "success" ? (
          <div className="waitlist-success" role="status">
            <span className="waitlist-icon success"><CircleCheck size={27} /></span>
            <span className="waitlist-kicker">{t.eyebrow}</span>
            <h2 id="waitlist-title">{t.successTitle}</h2>
            <p>{t.successCopy}</p>
            <button type="button" onClick={onClose}>{t.done}</button>
          </div>
        ) : (
          <>
            <span className="waitlist-icon"><BellRing size={25} /></span>
            <span className="waitlist-kicker">{t.eyebrow}</span>
            <h2 id="waitlist-title">{t.title}</h2>
            <p>{t.copy}</p>
            <form onSubmit={joinWaitlist}>
              <label htmlFor="waitlist-email">{t.email}</label>
              <div className="waitlist-field"><Mail size={18} /><input ref={emailRef} id="waitlist-email" type="email" inputMode="email" autoComplete="email" placeholder={t.placeholder} value={email} onChange={(event) => { setEmail(event.target.value); setStatus("idle"); }} required maxLength={320} /></div>
              <label className="waitlist-honeypot" aria-hidden="true">Company<input name="company" aria-hidden="true" tabIndex={-1} autoComplete="off" value={company} onChange={(event) => setCompany(event.target.value)} /></label>
              {status === "error" && <p className="waitlist-message" role="alert">{t.error}</p>}
              <button className="waitlist-submit" type="submit" disabled={status === "submitting"}>{status === "submitting" ? <LoaderCircle className="spinner-icon" size={18} /> : <BellRing size={17} />}{status === "submitting" ? t.submitting : t.submit}</button>
            </form>
            <small>{t.privacy} <a href={localePath(locale, "/privacy")}>{t.privacyLink}</a></small>
          </>
        )}
      </section>
    </div>
  );
}

export default function MediaStudio({ locale, placeholder }: { locale: Locale; placeholder?: string }) {
  const t = homeContent[locale].studio;
  const [url, setUrl] = useState("");
  const [mode, setMode] = useState<"video" | "audio">("video");
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  function submit(event: FormEvent) {
    event.preventDefault();
    setWaitlistOpen(true);
  }

  return (
    <>
      <div className="studio-wrap"><div className="studio-glow" /><div className="studio">
        <div className="studio-topline">
          <div className="mode-switch"><button className={mode === "video" ? "active" : ""} onClick={() => setMode("video")} type="button"><Video size={16} />{t.video}</button><button className={mode === "audio" ? "active" : ""} onClick={() => setMode("audio")} type="button"><Headphones size={16} />{t.audio}</button></div>
          <span className="quota"><span />{t.quota}</span>
        </div>
        <form onSubmit={submit} noValidate><label htmlFor="media-url">{t.label}</label><div className="url-field"><Link2 size={21} /><input id="media-url" inputMode="url" placeholder={placeholder ?? t.placeholder} value={url} onChange={(event) => setUrl(event.target.value)} /><button ref={triggerRef} type="submit"><Sparkles size={18} /><span>{t.submit}</span></button></div></form>
        <div className="studio-footer"><p><LockKeyhole size={15} />{t.legal}</p><div><span>MP4</span><span>MP3</span><span>4K <b>PRO</b></span></div></div>
      </div></div>
      {waitlistOpen && createPortal(<WaitlistModal locale={locale} onClose={() => setWaitlistOpen(false)} triggerRef={triggerRef} />, document.body)}
    </>
  );
}
