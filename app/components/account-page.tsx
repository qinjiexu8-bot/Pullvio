import { CreditCard, History, ShieldCheck, Sparkles } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { localePath, type Locale } from "@/lib/i18n";
import SignOutButton from "./sign-out-button";
import SiteHeader from "./site-header";

const accountCopy = {
  en: { eyebrow: "YOUR ACCOUNT", title: "Good to have you here.", pending: "Supabase connection pending", authReady: "Authentication UI is ready", authReadyCopy: "Add the Supabase environment variables to connect real accounts.", recent: "RECENT LINKS", recentTitle: "Your download history.", recentCopy: "Free accounts keep recent source links. Pro unlocks the complete history across devices.", start: "Start a download", plan: "CURRENT PLAN", free: "Pullvio Free", freeCopy: "3 saves per day · up to 1080p · standard processing", explore: "Explore Pro", billing: "BILLING", billingTitle: "No active subscription.", billingCopy: "Receipts, payment method, and cancellation controls are available here for Pro subscriptions." },
  "zh-cn": { eyebrow: "个人中心", title: "很高兴再次见到您。", pending: "Supabase 连接等待中", authReady: "认证界面已经就绪", authReadyCopy: "添加 Supabase 环境变量后即可连接真实账户。", recent: "最近链接", recentTitle: "您的下载记录。", recentCopy: "免费账户保留最近的来源链接，Pro 可跨设备查看完整历史。", start: "开始下载", plan: "当前方案", free: "Pullvio 免费版", freeCopy: "每天 3 次 · 最高 1080p · 标准处理", explore: "了解 Pro", billing: "账单", billingTitle: "当前没有有效订阅。", billingCopy: "Pro 订阅的收据、付款方式与取消操作将在这里管理。" },
  es: { eyebrow: "TU CUENTA", title: "Nos alegra volver a verte.", pending: "Conexión con Supabase pendiente", authReady: "La interfaz de acceso está lista", authReadyCopy: "Añade las variables de Supabase para conectar cuentas reales.", recent: "ENLACES RECIENTES", recentTitle: "Tu historial de descargas.", recentCopy: "Las cuentas gratuitas conservan enlaces recientes. Pro desbloquea el historial completo entre dispositivos.", start: "Iniciar una descarga", plan: "PLAN ACTUAL", free: "Pullvio Gratis", freeCopy: "3 descargas al día · hasta 1080p · proceso estándar", explore: "Ver Pro", billing: "FACTURACIÓN", billingTitle: "No hay una suscripción activa.", billingCopy: "Los recibos, el método de pago y la cancelación de Pro se gestionarán aquí." },
} as const;

export default async function AccountPage({ locale }: { locale: Locale }) {
  const t = accountCopy[locale];
  const supabase = await createClient();
  const { data } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
  if (supabase && !data.user) redirect(localePath(locale, "/login"));
  const email = data.user?.email || t.pending;
  return <main className="account-page"><SiteHeader locale={locale} simple account /><section className="account-shell"><div className="account-heading-row"><div className="account-heading"><span className="kicker">{t.eyebrow}</span><h1>{t.title}</h1><p>{email}</p></div><SignOutButton locale={locale} /></div>{!supabase && <div className="setup-notice"><ShieldCheck size={21} /><div><strong>{t.authReady}</strong><p>{t.authReadyCopy}</p></div></div>}<div className="account-grid"><article><div><History size={22} /><span>{t.recent}</span></div><h2>{t.recentTitle}</h2><p>{t.recentCopy}</p><a href={localePath(locale)}>{t.start}</a></article><article className="account-pro"><div><Sparkles size={22} /><span>{t.plan}</span></div><h2>{t.free}</h2><p>{t.freeCopy}</p><a href={`${localePath(locale)}#pricing`}>{t.explore}</a></article><article><div><CreditCard size={22} /><span>{t.billing}</span></div><h2>{t.billingTitle}</h2><p>{t.billingCopy}</p></article></div></section></main>;
}
