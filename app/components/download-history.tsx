"use client";

import { Download, ExternalLink, LoaderCircle, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { localePath, type Locale } from "@/lib/i18n";

type DownloadJob = {
  id: string; source_url: string; source_host: string; title: string | null; media_kind: string; requested_format: string; requested_quality: string; status: string; file_size_bytes: number | null; failure_code: string | null; created_at: string;
};

const statusCopy = {
  en: { queued: "Queued", processing: "Processing", ready: "Ready", failed: "Failed", canceled: "Canceled", expired: "Expired" },
  "zh-cn": { queued: "排队中", processing: "处理中", ready: "已完成", failed: "失败", canceled: "已取消", expired: "已过期" },
  es: { queued: "En cola", processing: "Procesando", ready: "Lista", failed: "Fallida", canceled: "Cancelada", expired: "Caducada" },
} as const;

const deletableStatuses = new Set(["ready", "failed", "canceled", "expired"]);

function formatBytes(bytes: number | null, locale: Locale) {
  if (bytes === null) return null;
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unit = units[0];
  for (let index = 1; value >= 1024 && index < units.length; index += 1) { value /= 1024; unit = units[index]; }
  return `${new Intl.NumberFormat(locale === "zh-cn" ? "zh-CN" : locale, { maximumFractionDigits: 1 }).format(value)} ${unit}`;
}

export default function DownloadHistory({ locale, initialJobs, copy }: { locale: Locale; initialJobs: DownloadJob[]; copy: { eyebrow: string; title: string; description: string; empty: string; emptyCopy: string; start: string; delete: string; deleteError: string } }) {
  const [jobs, setJobs] = useState(initialJobs);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState("");
  const dateFormatter = new Intl.DateTimeFormat(locale === "zh-cn" ? "zh-CN" : locale, { dateStyle: "medium", timeStyle: "short" });

  async function remove(id: string) {
    const supabase = createClient();
    if (!supabase) { setError(copy.deleteError); return; }
    setDeleting(id); setError("");
    const { error: deleteError } = await supabase.from("download_jobs").delete().eq("id", id);
    setDeleting(null);
    if (deleteError) { setError(copy.deleteError); return; }
    setJobs((current) => current.filter((job) => job.id !== id));
  }

  return (
    <section className="account-history-card">
      <div className="account-history-heading"><div><div className="account-card-label"><Download size={19} /><span>{copy.eyebrow}</span></div><h2>{copy.title}</h2><p>{copy.description}</p></div><Link href={localePath(locale)}>{copy.start}</Link></div>
      {error && <p className="account-inline-error" role="alert">{error}</p>}
      {jobs.length === 0 ? <div className="account-history-empty"><Download size={25} /><strong>{copy.empty}</strong><span>{copy.emptyCopy}</span></div> : <div className="account-history-list">{jobs.map((job) => {
        const label = statusCopy[locale][job.status as keyof typeof statusCopy.en] ?? job.status;
        const size = formatBytes(job.file_size_bytes, locale);
        return <article key={job.id} className="account-history-row"><div className="account-history-main"><span className={`account-job-status status-${job.status}`}>{label}</span><div><a href={job.source_url} target="_blank" rel="noopener noreferrer nofollow"><strong>{job.title || job.source_host}</strong><ExternalLink size={13} /></a><span>{job.source_host} · {job.requested_format.toUpperCase()} · {job.requested_quality}{size ? ` · ${size}` : ""}</span></div></div><div className="account-history-actions"><time dateTime={job.created_at}>{dateFormatter.format(new Date(job.created_at))}</time>{deletableStatuses.has(job.status) && <button type="button" onClick={() => remove(job.id)} disabled={deleting === job.id} aria-label={copy.delete} title={copy.delete}>{deleting === job.id ? <LoaderCircle className="spinner-icon" size={16} /> : <Trash2 size={16} />}</button>}</div></article>;
      })}</div>}
    </section>
  );
}
