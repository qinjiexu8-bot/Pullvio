"use client";

import { ChevronLeft, ChevronRight, Clock3, Download, ExternalLink, LoaderCircle, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSupabaseClient } from "@/lib/supabase/client";
import { localePath, type Locale } from "@/lib/i18n";
import { ACCOUNT_PAGE_SIZES, accountPageNumbers } from "@/lib/account-pagination";

type DownloadJob = {
  id: string; source_url: string; source_host: string; title: string | null; media_kind: string; requested_format: string; requested_quality: string; status: string; file_size_bytes: number | null; failure_code: string | null; created_at: string; artifacts?: Array<{ kind: string; contentType: string; fileSizeBytes: number; expiresAt: string | null; downloadUrl: string }>;
};

const statusCopy = {
  en: { queued: "Queued", processing: "Processing", ready: "Ready", failed: "Failed", canceled: "Canceled", expired: "Expired" },
  "zh-cn": { queued: "排队中", processing: "处理中", ready: "已完成", failed: "失败", canceled: "已取消", expired: "已过期" },
  es: { queued: "En cola", processing: "Procesando", ready: "Lista", failed: "Fallida", canceled: "Cancelada", expired: "Caducada" },
} as const;

const deletableStatuses = new Set(["ready", "failed", "canceled", "expired"]);
const artifactOrder: Record<string, number> = { video: 0, audio: 1, thumbnail: 2 };

function formatBytes(bytes: number | null, locale: Locale) {
  if (bytes === null) return null;
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unit = units[0];
  for (let index = 1; value >= 1024 && index < units.length; index += 1) { value /= 1024; unit = units[index]; }
  return `${new Intl.NumberFormat(locale === "zh-cn" ? "zh-CN" : locale, { maximumFractionDigits: 1 }).format(value)} ${unit}`;
}

export default function DownloadHistory({ locale, initialJobs, page, pageSize, totalJobs, copy }: { locale: Locale; initialJobs: DownloadJob[]; page: number; pageSize: number; totalJobs: number; copy: { eyebrow: string; title: string; description: string; empty: string; emptyCopy: string; start: string; delete: string; deleteError: string; retention: string; artifact: Record<string, string> } }) {
  const supabase = useSupabaseClient();
  const router = useRouter();
  const [jobs, setJobs] = useState(initialJobs);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState("");
  const dateFormatter = new Intl.DateTimeFormat(locale === "zh-cn" ? "zh-CN" : locale, { dateStyle: "medium", timeStyle: "short" });
  const totalPages = Math.max(1, Math.ceil(totalJobs / pageSize));
  const pageLabels = locale === "zh-cn"
    ? { rows: "每页", previous: "上一页", next: "下一页", of: "条，共" }
    : locale === "es"
      ? { rows: "Por página", previous: "Anterior", next: "Siguiente", of: "de" }
      : { rows: "Rows per page", previous: "Previous", next: "Next", of: "of" };

  function pageHref(nextPage: number, nextSize = pageSize) {
    return `${localePath(locale, "/account")}?page=${nextPage}&pageSize=${nextSize}`;
  }

  async function remove(id: string) {
    if (!supabase) { setError(copy.deleteError); return; }
    setDeleting(id); setError("");
    const { error: deleteError } = await supabase.from("download_jobs").delete().eq("id", id);
    setDeleting(null);
    if (deleteError) { setError(copy.deleteError); return; }
    const remainingJobs = jobs.filter((job) => job.id !== id);
    setJobs(remainingJobs);
    if (remainingJobs.length === 0 && page > 1) router.push(pageHref(page - 1));
    else router.refresh();
  }

  return (
    <section className="account-history-card">
      <div className="account-history-heading"><div><div className="account-card-label"><Download size={19} /><span>{copy.eyebrow}</span></div><h2>{copy.title}</h2><p>{copy.description}</p></div><Link href={localePath(locale)}>{copy.start}</Link></div>
      <p className="account-retention-notice"><Clock3 size={17} />{copy.retention}</p>
      {error && <p className="account-inline-error" role="alert">{error}</p>}
      {jobs.length === 0 ? <div className="account-history-empty"><Download size={25} /><strong>{copy.empty}</strong><span>{copy.emptyCopy}</span></div> : <div className="account-history-list">{jobs.map((job) => {
        const label = statusCopy[locale][job.status as keyof typeof statusCopy.en] ?? job.status;
        const size = formatBytes(job.file_size_bytes, locale);
        const artifacts = [...(job.artifacts ?? [])].sort((left, right) => (artifactOrder[left.kind] ?? 99) - (artifactOrder[right.kind] ?? 99));
        return <article key={job.id} className="account-history-row"><div className="account-history-main"><span className={`account-job-status status-${job.status}`}>{label}</span><div><a href={job.source_url} target="_blank" rel="noopener noreferrer nofollow"><strong>{job.title || job.source_host}</strong><ExternalLink size={13} /></a><span>{job.source_host} · {job.requested_format.toUpperCase()} · {job.requested_quality}{size ? ` · ${size}` : ""}</span>{artifacts.length > 0 && <div className="account-artifact-links">{artifacts.map((artifact) => <a key={artifact.kind} href={artifact.downloadUrl}><Download size={14} />{copy.artifact[artifact.kind] ?? artifact.kind}<small>{formatBytes(artifact.fileSizeBytes, locale)}</small></a>)}</div>}</div></div><div className="account-history-actions"><time dateTime={job.created_at}>{dateFormatter.format(new Date(job.created_at))}</time>{deletableStatuses.has(job.status) && <button type="button" onClick={() => remove(job.id)} disabled={deleting === job.id} aria-label={copy.delete} title={copy.delete}>{deleting === job.id ? <LoaderCircle className="spinner-icon" size={16} /> : <Trash2 size={16} />}</button>}</div></article>;
      })}</div>}
      {totalJobs > 0 && <nav className="account-history-pagination" aria-label={copy.title}>
        <label>{pageLabels.rows}<select value={pageSize} onChange={(event) => router.push(pageHref(1, Number(event.target.value)))}>{ACCOUNT_PAGE_SIZES.map((sizeOption) => <option key={sizeOption} value={sizeOption}>{sizeOption}</option>)}</select></label>
        <span>{Math.min((page - 1) * pageSize + 1, totalJobs)}–{Math.min(page * pageSize, totalJobs)} {pageLabels.of} {totalJobs}</span>
        <div>
          <Link className={page <= 1 ? "is-disabled" : ""} aria-disabled={page <= 1} tabIndex={page <= 1 ? -1 : undefined} href={page <= 1 ? pageHref(1) : pageHref(page - 1)} aria-label={pageLabels.previous}><ChevronLeft size={16} /></Link>
          {accountPageNumbers(page, totalPages).map((pageNumber, index) => pageNumber === "ellipsis" ? <span key={`ellipsis-${index}`}>…</span> : <Link key={pageNumber} className={pageNumber === page ? "is-current" : ""} aria-current={pageNumber === page ? "page" : undefined} href={pageHref(pageNumber)}>{pageNumber}</Link>)}
          <Link className={page >= totalPages ? "is-disabled" : ""} aria-disabled={page >= totalPages} tabIndex={page >= totalPages ? -1 : undefined} href={page >= totalPages ? pageHref(totalPages) : pageHref(page + 1)} aria-label={pageLabels.next}><ChevronRight size={16} /></Link>
        </div>
      </nav>}
    </section>
  );
}
