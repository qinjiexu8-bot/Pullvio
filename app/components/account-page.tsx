import { CalendarDays, CreditCard, Gauge, History, ShieldCheck, Sparkles } from "lucide-react";
import { auth, currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { localePath, type Locale } from "@/lib/i18n";
import AccountProfileForm from "./account-profile-form";
import DownloadHistory from "./download-history";
import SignOutButton from "./sign-out-button";
import SiteHeader from "./site-header";

const accountCopy = {
  en: {
    eyebrow: "YOUR ACCOUNT", title: "Your Pullvio workspace.", pending: "Supabase connection pending", authReady: "Authentication is ready", authReadyCopy: "Add the Supabase environment variables to load real account data.", dataError: "We could not refresh all account data. Try reloading this page.",
    plan: "CURRENT PLAN", free: "Pullvio Free", pro: "Pullvio Pro", freeCopy: "3 saves per day · up to 1080p · standard processing", proCopy: "Fair-use limits · up to 4K · priority processing", explore: "Explore Pro", manage: "Plan details", usage: "TODAY'S USAGE", usageTitle: "Daily allowance", used: "Started", succeeded: "Completed", remaining: "Remaining", fairUse: "Fair use", downloads: "DOWNLOAD HISTORY", downloadsTitle: "Your recent media jobs", downloadsCopy: "Track links submitted from your account and remove completed records you no longer need.", emptyHistory: "No account downloads yet", emptyHistoryCopy: "Your first signed-in download will appear here.", start: "Start a download", delete: "Remove from history", deleteError: "This record could not be removed. Please try again.",
    billing: "BILLING", billingFree: "No active subscription", billingFreeCopy: "You are using Pullvio Free. Upgrade to Pro for higher limits, 4K, long-form media, and priority processing.", billingProCopy: "Your Pro subscription is connected to this account.", renews: "Current period ends", status: "Status",
  },
  "zh-cn": {
    eyebrow: "个人中心", title: "您的 Pullvio 工作区。", pending: "Supabase 连接等待中", authReady: "认证服务已经就绪", authReadyCopy: "添加 Supabase 环境变量后即可读取真实账户数据。", dataError: "部分账户数据暂时无法刷新，请重新加载页面。",
    plan: "当前方案", free: "Pullvio 免费版", pro: "Pullvio Pro", freeCopy: "每天 3 次 · 最高 1080p · 标准处理", proCopy: "合理使用额度 · 最高 4K · 优先处理", explore: "了解 Pro", manage: "方案详情", usage: "今日用量", usageTitle: "每日额度", used: "已发起", succeeded: "已完成", remaining: "剩余", fairUse: "合理使用", downloads: "下载记录", downloadsTitle: "最近的媒体任务", downloadsCopy: "查看从当前账户提交的链接，并删除不再需要的已完成记录。", emptyHistory: "暂无账户下载记录", emptyHistoryCopy: "登录状态下完成的第一个下载任务会显示在这里。", start: "开始下载", delete: "从历史中删除", deleteError: "暂时无法删除这条记录，请重试。",
    billing: "账单", billingFree: "当前没有有效订阅", billingFreeCopy: "您正在使用 Pullvio 免费版。升级 Pro 可获得更高额度、4K、长视频与优先处理。", billingProCopy: "您的 Pro 订阅已连接至当前账户。", renews: "当前周期结束", status: "状态",
  },
  es: {
    eyebrow: "TU CUENTA", title: "Tu espacio de Pullvio.", pending: "Conexión con Supabase pendiente", authReady: "La autenticación está lista", authReadyCopy: "Añade las variables de Supabase para cargar datos reales de la cuenta.", dataError: "No se han podido actualizar todos los datos. Recarga la página.",
    plan: "PLAN ACTUAL", free: "Pullvio Gratis", pro: "Pullvio Pro", freeCopy: "3 descargas al día · hasta 1080p · proceso estándar", proCopy: "Uso razonable · hasta 4K · proceso prioritario", explore: "Ver Pro", manage: "Detalles del plan", usage: "USO DE HOY", usageTitle: "Límite diario", used: "Iniciadas", succeeded: "Completadas", remaining: "Restantes", fairUse: "Uso razonable", downloads: "HISTORIAL", downloadsTitle: "Tus tareas recientes", downloadsCopy: "Consulta los enlaces enviados desde tu cuenta y elimina los registros terminados que ya no necesites.", emptyHistory: "Aún no hay descargas", emptyHistoryCopy: "Tu primera descarga con sesión iniciada aparecerá aquí.", start: "Iniciar una descarga", delete: "Eliminar del historial", deleteError: "No se ha podido eliminar este registro. Inténtalo de nuevo.",
    billing: "FACTURACIÓN", billingFree: "No hay una suscripción activa", billingFreeCopy: "Estás usando Pullvio Gratis. Pasa a Pro para obtener límites mayores, 4K, contenido largo y proceso prioritario.", billingProCopy: "Tu suscripción Pro está conectada a esta cuenta.", renews: "Fin del periodo actual", status: "Estado",
  },
} as const;

const activeStatuses = new Set(["active", "trialing", "past_due"]);

function formatDate(value: string | null, locale: Locale) {
  if (!value) return null;
  return new Intl.DateTimeFormat(locale === "zh-cn" ? "zh-CN" : locale, { dateStyle: "medium" }).format(new Date(value));
}

export default async function AccountPage({ locale }: { locale: Locale }) {
  const t = accountCopy[locale];
  const { userId } = await auth();
  if (!userId) redirect(localePath(locale, "/login"));

  const clerkUser = await currentUser();
  const supabase = await createClient();

  let profile = null;
  let subscription = null;
  let usage = null;
  let recentJobs: Array<{
    id: string; source_url: string; source_host: string; title: string | null; media_kind: string; requested_format: string; requested_quality: string; status: string; file_size_bytes: number | null; failure_code: string | null; created_at: string;
  }> = [];
  let hasDataError = false;

  if (supabase) {
    const today = new Date().toISOString().slice(0, 10);
    const [profileResult, subscriptionResult, usageResult] = await Promise.all([
      supabase.from("profiles").select("display_name, avatar_url, locale, theme").eq("id", userId).maybeSingle(),
      supabase.from("subscriptions").select("plan_code, status, current_period_end, cancel_at_period_end").eq("user_id", userId).order("updated_at", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("usage_daily").select("quota_limit, jobs_started, jobs_succeeded, jobs_failed, bytes_output, processing_seconds").eq("user_id", userId).eq("usage_date", today).maybeSingle(),
    ]);
    profile = profileResult.data;
    subscription = subscriptionResult.data;
    usage = usageResult.data;
    hasDataError = Boolean(profileResult.error || subscriptionResult.error || usageResult.error);

    if (!profile && !profileResult.error) {
      const profileCreateResult = await supabase.from("profiles").insert({
        id: userId,
        display_name: clerkUser?.fullName || null,
        avatar_url: clerkUser?.imageUrl || null,
        locale,
      }).select("display_name, avatar_url, locale, theme").single();
      profile = profileCreateResult.data;
      hasDataError ||= Boolean(profileCreateResult.error);
    }

    const jobsResult = await supabase.from("download_jobs")
      .select("id, source_url, source_host, title, media_kind, requested_format, requested_quality, status, file_size_bytes, failure_code, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);
    recentJobs = jobsResult.data ?? [];
    hasDataError ||= Boolean(jobsResult.error);
  }

  const isPro = Boolean(subscription?.plan_code === "pro" && activeStatuses.has(subscription.status));
  const quota = usage?.quota_limit ?? (isPro ? null : 3);
  const used = usage?.jobs_started ?? 0;
  const remaining = quota === null ? t.fairUse : Math.max(quota - used, 0).toString();
  const email = clerkUser?.primaryEmailAddress?.emailAddress || clerkUser?.emailAddresses[0]?.emailAddress || t.pending;
  const displayName = profile?.display_name || clerkUser?.fullName || "";
  const subscriptionEnd = formatDate(subscription?.current_period_end ?? null, locale);

  return (
    <main className="account-page">
      <SiteHeader locale={locale} simple account />
      <section className="account-shell">
        <div className="account-heading-row">
          <div className="account-heading"><span className="kicker">{t.eyebrow}</span><h1>{t.title}</h1><p>{email}</p></div>
          <SignOutButton locale={locale} />
        </div>

        {!supabase && <div className="setup-notice"><ShieldCheck size={21} /><div><strong>{t.authReady}</strong><p>{t.authReadyCopy}</p></div></div>}
        {hasDataError && <div className="account-data-notice" role="status">{t.dataError}</div>}

        <div className="account-overview-grid">
          <AccountProfileForm userId={userId} email={email} initialName={displayName} initialLocale={(profile?.locale as Locale | undefined) ?? locale} initialTheme={profile?.theme ?? "system"} locale={locale} disabled={!supabase} />

          <article className={`account-plan-card ${isPro ? "is-pro" : ""}`}>
            <div className="account-card-label"><Sparkles size={19} /><span>{t.plan}</span></div>
            <div><h2>{isPro ? t.pro : t.free}</h2><p>{isPro ? t.proCopy : t.freeCopy}</p></div>
            <Link href={`${localePath(locale)}#pricing`}>{isPro ? t.manage : t.explore}</Link>
          </article>
        </div>

        <section className="account-usage-card">
          <div className="account-section-heading"><div className="account-card-label"><Gauge size={19} /><span>{t.usage}</span></div><h2>{t.usageTitle}</h2></div>
          <div className="account-stat-grid">
            <div><strong>{used}</strong><span>{t.used}</span></div>
            <div><strong>{usage?.jobs_succeeded ?? 0}</strong><span>{t.succeeded}</span></div>
            <div><strong>{remaining}</strong><span>{t.remaining}</span></div>
          </div>
        </section>

        <DownloadHistory locale={locale} initialJobs={recentJobs} copy={{ eyebrow: t.downloads, title: t.downloadsTitle, description: t.downloadsCopy, empty: t.emptyHistory, emptyCopy: t.emptyHistoryCopy, start: t.start, delete: t.delete, deleteError: t.deleteError }} />

        <section className="account-billing-card">
          <div className="account-card-label"><CreditCard size={19} /><span>{t.billing}</span></div>
          <div className="account-billing-copy"><h2>{isPro ? t.pro : t.billingFree}</h2><p>{isPro ? t.billingProCopy : t.billingFreeCopy}</p></div>
          {isPro && <div className="account-billing-meta"><span><CalendarDays size={15} />{t.renews}: <strong>{subscriptionEnd ?? "—"}</strong></span><span><History size={15} />{t.status}: <strong>{subscription?.status}</strong></span></div>}
        </section>
      </section>
    </main>
  );
}
