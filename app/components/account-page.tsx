import { Gauge, ShieldCheck, Sparkles } from "lucide-react";
import { auth, currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createArtifactDownloadUrl } from "@/lib/media/delivery";
import { localePath, type Locale } from "@/lib/i18n";
import AccountProfileForm from "./account-profile-form";
import DownloadHistory from "./download-history";
import SignOutButton from "./sign-out-button";
import SiteHeader from "./site-header";

const accountCopy = {
  en: {
    eyebrow: "YOUR ACCOUNT", title: "Your Pullvio workspace.", pending: "Supabase connection pending", authReady: "Authentication is ready", authReadyCopy: "Add the Supabase environment variables to load real account data.", dataError: "We could not refresh all account data. Try reloading this page.",
    plan: "FREE ACCOUNT", free: "Pullvio Free Account", freeCopy: "No fixed download cap · MP4 and MP3 · up to 4K when the source provides it", explore: "Start downloading", usage: "ACCOUNT USAGE", usageTitle: "Fair-use activity", used: "Started", succeeded: "Completed", remaining: "Access", fairUse: "Fair use", downloads: "DOWNLOAD HISTORY", downloadsTitle: "Your recent media jobs", downloadsCopy: "Download available video, audio, and cover files. Files are kept for 24 hours only, so save them promptly.", emptyHistory: "No account downloads yet", emptyHistoryCopy: "Your first signed-in download will appear here.", start: "Start a download", delete: "Remove from history", deleteError: "This record could not be removed. Please try again.", retention: "Files are automatically deleted after 24 hours.", artifact: { video: "Video", audio: "Audio", thumbnail: "Cover" },
  },
  "zh-cn": {
    eyebrow: "个人中心", title: "您的 Pullvio 工作区。", pending: "Supabase 连接等待中", authReady: "认证服务已经就绪", authReadyCopy: "添加 Supabase 环境变量后即可读取真实账户数据。", dataError: "部分账户数据暂时无法刷新，请重新加载页面。",
    plan: "免费账号", free: "Pullvio 免费账号", freeCopy: "不设固定下载次数 · 支持 MP4 与 MP3 · 来源提供时最高可选 4K", explore: "开始下载", usage: "账号用量", usageTitle: "合理使用记录", used: "已发起", succeeded: "已完成", remaining: "使用额度", fairUse: "合理使用", downloads: "下载记录", downloadsTitle: "最近的媒体任务", downloadsCopy: "可下载任务对应的视频、音频和封面文件。文件仅保留 24 小时，请及时保存。", emptyHistory: "暂无账户下载记录", emptyHistoryCopy: "登录状态下完成的第一个下载任务会显示在这里。", start: "开始下载", delete: "从历史中删除", deleteError: "暂时无法删除这条记录，请重试。", retention: "文件将在 24 小时后自动删除。", artifact: { video: "视频", audio: "音频", thumbnail: "封面" },
  },
  es: {
    eyebrow: "TU CUENTA", title: "Tu espacio de Pullvio.", pending: "Conexión con Supabase pendiente", authReady: "La autenticación está lista", authReadyCopy: "Añade las variables de Supabase para cargar datos reales de la cuenta.", dataError: "No se han podido actualizar todos los datos. Recarga la página.",
    plan: "CUENTA GRATUITA", free: "Cuenta gratuita de Pullvio", freeCopy: "Sin límite fijo · MP4 y MP3 · hasta 4K cuando la fuente lo ofrece", explore: "Empezar a descargar", usage: "USO DE LA CUENTA", usageTitle: "Actividad de uso razonable", used: "Iniciadas", succeeded: "Completadas", remaining: "Acceso", fairUse: "Uso razonable", downloads: "HISTORIAL", downloadsTitle: "Tus tareas recientes", downloadsCopy: "Descarga los archivos de vídeo, audio y portada disponibles. Solo se conservan durante 24 horas.", emptyHistory: "Aún no hay descargas", emptyHistoryCopy: "Tu primera descarga con sesión iniciada aparecerá aquí.", start: "Iniciar una descarga", delete: "Eliminar del historial", deleteError: "No se ha podido eliminar este registro. Inténtalo de nuevo.", retention: "Los archivos se eliminan automáticamente después de 24 horas.", artifact: { video: "Vídeo", audio: "Audio", thumbnail: "Portada" },
  },
} as const;

export default async function AccountPage({ locale, page, pageSize }: { locale: Locale; page: number; pageSize: number }) {
  const t = accountCopy[locale];
  const { userId } = await auth();
  if (!userId) redirect(localePath(locale, "/login"));

  const clerkUser = await currentUser();
  const supabase = await createClient();

  let profile = null;
  let usage = null;
  let recentJobs: Array<{
    id: string; source_url: string; source_host: string; title: string | null; media_kind: string; requested_format: string; requested_quality: string; status: string; file_size_bytes: number | null; failure_code: string | null; created_at: string; artifacts?: Array<{ kind: string; contentType: string; fileSizeBytes: number; expiresAt: string | null; downloadUrl: string }>;
  }> = [];
  let totalJobs = 0;
  let hasDataError = false;

  if (supabase) {
    const today = new Date().toISOString().slice(0, 10);
    const [profileResult, usageResult] = await Promise.all([
      supabase.from("profiles").select("display_name, avatar_url, locale, theme").eq("id", userId).maybeSingle(),
      supabase.from("usage_daily").select("quota_limit, jobs_started, jobs_succeeded, jobs_failed, bytes_output, processing_seconds").eq("user_id", userId).eq("usage_date", today).maybeSingle(),
    ]);
    profile = profileResult.data;
    usage = usageResult.data;
    hasDataError = Boolean(profileResult.error || usageResult.error);

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
      .select("id, source_url, source_host, title, media_kind, requested_format, requested_quality, status, file_size_bytes, failure_code, created_at", { count: "exact" })
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);
    recentJobs = jobsResult.data ?? [];
    totalJobs = jobsResult.count ?? 0;
    hasDataError ||= Boolean(jobsResult.error);
    const totalPages = Math.max(1, Math.ceil(totalJobs / pageSize));
    if (!jobsResult.error && totalJobs > 0 && page > totalPages) {
      redirect(`${localePath(locale, "/account")}?page=${totalPages}&pageSize=${pageSize}`);
    }
    const readyJobIds = recentJobs.filter((job) => job.status === "ready").map((job) => job.id);
    if (readyJobIds.length > 0) {
      const artifactsResult = await createAdminClient().from("download_artifacts")
        .select("job_id,artifact_kind,content_type,file_size_bytes,storage_path,expires_at")
        .in("job_id", readyJobIds);
      hasDataError ||= Boolean(artifactsResult.error);
      const signedArtifacts = await Promise.all((artifactsResult.data ?? []).map(async (artifact) => ({
        jobId: artifact.job_id,
        kind: artifact.artifact_kind,
        contentType: artifact.content_type,
        fileSizeBytes: artifact.file_size_bytes,
        expiresAt: artifact.expires_at,
        downloadUrl: await createArtifactDownloadUrl(artifact.storage_path, artifact.expires_at),
      })));
      recentJobs = recentJobs.map((job) => ({
        ...job,
        artifacts: signedArtifacts.filter((artifact) => artifact.jobId === job.id && artifact.downloadUrl).map((artifact) => ({
          kind: artifact.kind,
          contentType: artifact.contentType,
          fileSizeBytes: artifact.fileSizeBytes,
          expiresAt: artifact.expiresAt,
          downloadUrl: artifact.downloadUrl as string,
        })),
      }));
    }
  }

  const used = usage?.jobs_started ?? 0;
  const remaining = t.fairUse;
  const email = clerkUser?.primaryEmailAddress?.emailAddress || clerkUser?.emailAddresses[0]?.emailAddress || t.pending;
  const displayName = profile?.display_name || clerkUser?.fullName || "";

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

          <article className="account-plan-card is-pro">
            <div className="account-card-label"><Sparkles size={19} /><span>{t.plan}</span></div>
            <div><h2>{t.free}</h2><p>{t.freeCopy}</p></div>
            <Link href={`${localePath(locale)}#top`}>{t.explore}</Link>
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

        <DownloadHistory key={`${page}-${pageSize}`} locale={locale} initialJobs={recentJobs} page={page} pageSize={pageSize} totalJobs={totalJobs} copy={{ eyebrow: t.downloads, title: t.downloadsTitle, description: t.downloadsCopy, empty: t.emptyHistory, emptyCopy: t.emptyHistoryCopy, start: t.start, delete: t.delete, deleteError: t.deleteError, retention: t.retention, artifact: t.artifact }} />
      </section>
    </main>
  );
}
