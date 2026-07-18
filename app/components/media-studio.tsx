"use client";

import {
  Ban,
  CircleCheck,
  Clock3,
  Download,
  Headphones,
  Link2,
  LoaderCircle,
  LockKeyhole,
  RotateCcw,
  Sparkles,
  Video,
} from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { homeContent, localePath, type Locale } from "@/lib/i18n";
import { needsDownloadDetails } from "@/lib/media/client-job";
import type { ProcessingStage } from "@/lib/media/job-progress";
import MediaJobProgress from "./media-job-progress";
import TurnstileWidget from "./turnstile-widget";

type JobStatus = "idle" | "submitting" | "queued" | "processing" | "ready" | "failed" | "canceled";

type MediaJob = {
  id: string;
  status: Exclude<JobStatus, "idle" | "submitting">;
  processingStage?: ProcessingStage;
  progressPercent?: number;
  estimatedSecondsRemaining?: number | null;
  title?: string | null;
  failureCode?: string | null;
  downloadUrl?: string | null;
  expiresAt?: string | null;
  artifacts?: Array<{ kind: "video" | "audio" | "thumbnail"; contentType: string; fileSizeBytes: number; expiresAt: string | null; downloadUrl: string }>;
};

const jobCopy = {
  en: {
    queued: "Your media is in the queue.",
    queuedCopy: "Keep this page open. Processing starts automatically.",
    processing: "Preparing your media…",
    processingCopy: "Pullvio is checking the source, format, and output file.",
    ready: "Your download is ready.",
    readyCopy: "Files are kept for 24 hours only. Download them now before they are automatically deleted.",
    artifact: { video: "Download video", audio: "Download audio", thumbnail: "Download cover" },
    failed: "We couldn’t prepare this media.",
    canceled: "This media job was canceled.",
    cancel: "Cancel",
    retry: "Try another link",
    signIn: "Sign in to continue",
    challenge: "Please complete the security check, then submit the media link again.",
    quality: {
      label: "Video quality",
      options: {
        "720p": "720p · Smaller file",
        "1080p": "1080p · Recommended",
        "1440p": "1440p (2K) · Larger file",
        "2160p": "2160p (4K) · Largest file",
      },
    },
    errors: {
      INVALID_URL: "Paste a complete HTTPS media link.",
      UNSUPPORTED_SOURCE: "This source is not supported yet. Use one of Pullvio's listed platform downloaders.",
      AUDIO_ONLY_SOURCE: "SoundCloud links are available in Audio mode. Select Audio and try again.",
      QUOTA_EXCEEDED: "You’ve used five guest downloads in the last 24 hours.",
      ACTIVE_JOB_LIMIT: "Wait for your current job to finish before starting another.",
      RATE_LIMITED: "Too many requests were submitted. Wait a moment and try again.",
      CHALLENGE_REQUIRED: "Complete the security check before trying this media link again.",
      PROVIDER_BALANCE_EXHAUSTED: "Downloads from this platform are temporarily unavailable. Our team has been notified; please try again later.",
      SERVICE_DISABLED: "Media processing is temporarily unavailable while we finish production checks.",
      SOURCE_DISABLED: "This media source is temporarily unavailable while we prepare a reliable connection.",
      SOURCE_UNAVAILABLE: "The source is unavailable, restricted, or no longer public.",
      DURATION_LIMIT: "This media is longer than the current processing limit.",
      OUTPUT_SIZE_LIMIT: "The finished file would exceed the current size limit.",
      default: "The media could not be processed. Check the link and try again.",
    },
  },
  "zh-cn": {
    queued: "媒体任务已进入队列。",
    queuedCopy: "请保持页面打开，系统会自动开始处理。",
    processing: "正在准备媒体文件…",
    processingCopy: "Pullvio 正在检查来源、格式并生成文件。",
    ready: "文件已准备好。",
    readyCopy: "文件仅保留 24 小时，之后会自动删除，请尽快下载。",
    artifact: { video: "下载视频", audio: "下载音频", thumbnail: "下载封面" },
    failed: "暂时无法处理这个媒体。",
    canceled: "该媒体任务已取消。",
    cancel: "取消任务",
    retry: "尝试其他链接",
    signIn: "登录后继续",
    challenge: "请先完成人机验证，然后重新提交媒体链接。",
    quality: {
      label: "视频清晰度",
      options: {
        "720p": "720p · 文件较小",
        "1080p": "1080p · 推荐",
        "1440p": "1440p（2K）· 文件较大",
        "2160p": "2160p（4K）· 文件最大",
      },
    },
    errors: {
      INVALID_URL: "请粘贴完整的 HTTPS 媒体链接。",
      UNSUPPORTED_SOURCE: "暂不支持此来源，请使用 Pullvio 已列出的平台专用下载工具。",
      AUDIO_ONLY_SOURCE: "SoundCloud 链接仅支持音频模式，请选择“音频”后重试。",
      QUOTA_EXCEEDED: "过去 24 小时内，访客的 5 次下载额度已用完。",
      ACTIVE_JOB_LIMIT: "请等待当前任务完成后再提交新任务。",
      RATE_LIMITED: "提交过于频繁，请稍后再试。",
      CHALLENGE_REQUIRED: "请完成人机验证后，再次提交这个媒体链接。",
      PROVIDER_BALANCE_EXHAUSTED: "该平台的下载服务暂时不可用，我们已收到通知，请稍后再试。",
      SERVICE_DISABLED: "媒体处理正在完成生产检查，暂时不可用。",
      SOURCE_DISABLED: "该媒体来源暂时不可用，我们正在准备稳定的处理线路。",
      SOURCE_UNAVAILABLE: "来源不可用、受限或已不再公开。",
      DURATION_LIMIT: "该媒体超过当前支持的时长限制。",
      OUTPUT_SIZE_LIMIT: "生成的文件会超过当前大小限制。",
      default: "暂时无法处理该媒体，请检查链接后重试。",
    },
  },
  es: {
    queued: "Tu contenido está en la cola.",
    queuedCopy: "Mantén esta página abierta. El proceso comenzará automáticamente.",
    processing: "Preparando el archivo…",
    processingCopy: "Pullvio está comprobando la fuente, el formato y el resultado.",
    ready: "La descarga está lista.",
    readyCopy: "Los archivos se conservan solo 24 horas. Descárgalos antes de que se eliminen automáticamente.",
    artifact: { video: "Descargar vídeo", audio: "Descargar audio", thumbnail: "Descargar portada" },
    failed: "No hemos podido preparar este contenido.",
    canceled: "La tarea se ha cancelado.",
    cancel: "Cancelar",
    retry: "Probar otro enlace",
    signIn: "Inicia sesión para continuar",
    challenge: "Completa la verificación de seguridad y vuelve a enviar el enlace multimedia.",
    quality: {
      label: "Calidad de vídeo",
      options: {
        "720p": "720p · Archivo menor",
        "1080p": "1080p · Recomendado",
        "1440p": "1440p (2K) · Archivo mayor",
        "2160p": "2160p (4K) · Archivo máximo",
      },
    },
    errors: {
      INVALID_URL: "Pega un enlace multimedia HTTPS completo.",
      UNSUPPORTED_SOURCE: "Esta fuente aún no es compatible. Usa uno de los descargadores de plataforma publicados.",
      AUDIO_ONLY_SOURCE: "Los enlaces de SoundCloud solo están disponibles en el modo Audio.",
      QUOTA_EXCEEDED: "Has usado las cinco descargas de invitado en las últimas 24 horas.",
      ACTIVE_JOB_LIMIT: "Espera a que termine la tarea actual antes de iniciar otra.",
      RATE_LIMITED: "Se han enviado demasiadas solicitudes. Espera un momento.",
      CHALLENGE_REQUIRED: "Completa la verificación antes de volver a enviar este enlace multimedia.",
      PROVIDER_BALANCE_EXHAUSTED: "Las descargas de esta plataforma no están disponibles temporalmente. Ya hemos avisado al equipo; inténtalo más tarde.",
      SERVICE_DISABLED: "El procesamiento no está disponible mientras terminamos las comprobaciones de producción.",
      SOURCE_DISABLED: "Esta fuente no está disponible temporalmente mientras preparamos una conexión estable.",
      SOURCE_UNAVAILABLE: "La fuente no está disponible, está restringida o ya no es pública.",
      DURATION_LIMIT: "El contenido supera el límite de duración actual.",
      OUTPUT_SIZE_LIMIT: "El archivo final superaría el límite de tamaño actual.",
      default: "No se ha podido procesar el contenido. Comprueba el enlace e inténtalo de nuevo.",
    },
  },
} as const;

export default function MediaStudio({
  locale,
  placeholder,
  audioOnly = false,
  showQualitySelector = false,
}: {
  locale: Locale;
  placeholder?: string;
  audioOnly?: boolean;
  showQualitySelector?: boolean;
}) {
  const t = homeContent[locale].studio;
  const copy = jobCopy[locale];
  const [url, setUrl] = useState("");
  const [mode, setMode] = useState<"video" | "audio">(audioOnly ? "audio" : "video");
  const [status, setStatus] = useState<JobStatus>("idle");
  const [job, setJob] = useState<MediaJob | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [quality, setQuality] = useState("1080p");
  const [challengeRequired, setChallengeRequired] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const pollAttempts = useRef(0);
  const activeJobId = job?.id;
  const activeJobStatus = job?.status;

  useEffect(() => {
    if (!activeJobId || (activeJobStatus !== "queued" && activeJobStatus !== "processing")) return;
    let canceled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const poll = async () => {
      if (canceled) return;
      if (document.hidden) {
        timer = setTimeout(poll, 5000);
        return;
      }
      try {
        const response = await fetch(`/api/media/jobs/${activeJobId}`, { cache: "no-store" });
        if (!response.ok) throw new Error("status request failed");
        const payload = (await response.json()) as { job: MediaJob };
        if (canceled) return;
        setJob(payload.job);
        setStatus(payload.job.status);
        if (payload.job.status === "failed") setErrorCode(payload.job.failureCode ?? "default");
        if (payload.job.status === "queued" || payload.job.status === "processing") {
          pollAttempts.current += 1;
          timer = setTimeout(poll, Math.min(1500 + pollAttempts.current * 350, 5000));
        }
      } catch {
        if (!canceled) timer = setTimeout(poll, 5000);
      }
    };

    timer = setTimeout(poll, 1200);
    return () => {
      canceled = true;
      if (timer) clearTimeout(timer);
    };
  }, [activeJobId, activeJobStatus]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setErrorCode(null);
    try {
      const parsed = new URL(url.trim());
      if (parsed.protocol !== "https:") throw new Error("invalid URL");
    } catch {
      setStatus("failed");
      setErrorCode("INVALID_URL");
      return;
    }

    setStatus("submitting");
    const idempotencyKey = crypto.randomUUID();
    try {
      const response = await fetch("/api/media/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceUrl: url.trim(),
          mediaKind: mode,
          format: mode === "video" ? "mp4" : "mp3",
          quality: mode === "video" ? quality : "1080p",
          idempotencyKey,
          turnstileToken,
        }),
      });
      const payload = (await response.json()) as {
        job?: MediaJob;
        quota?: { remaining?: number | null };
        error?: { code?: string };
        challengeRequired?: boolean;
      };
      if (!response.ok || !payload.job) {
        if (payload.challengeRequired || payload.error?.code === "CHALLENGE_REQUIRED") {
          setChallengeRequired(true);
          setTurnstileToken(null);
          setStatus("idle");
          setErrorCode("CHALLENGE_REQUIRED");
          return;
        }
        setStatus("failed");
        setErrorCode(payload.error?.code ?? "default");
        return;
      }
      let submittedJob = payload.job;
      if (needsDownloadDetails(submittedJob)) {
        try {
          const detailResponse = await fetch(`/api/media/jobs/${submittedJob.id}`, { cache: "no-store" });
          if (!detailResponse.ok) throw new Error("job details unavailable");
          const detailPayload = (await detailResponse.json()) as { job: MediaJob };
          submittedJob = detailPayload.job;
        } catch {
          // Keep the durable job polling until its signed artifact links can be read.
          submittedJob = { ...submittedJob, status: "processing" };
        }
      }
      pollAttempts.current = 0;
      setRemaining(payload.quota?.remaining ?? null);
      setJob(submittedJob);
      setStatus(submittedJob.status);
      setChallengeRequired(false);
      setTurnstileToken(null);
    } catch {
      setStatus("failed");
      setErrorCode("default");
    }
  }

  async function cancel() {
    if (!job) return;
    try {
      const response = await fetch(`/api/media/jobs/${job.id}`, { method: "DELETE" });
      if (!response.ok) return;
      const payload = (await response.json()) as { job: MediaJob };
      setJob(payload.job);
      setStatus(payload.job.status === "processing" ? "processing" : payload.job.status);
    } catch {
      // Polling remains active and will converge to the durable server state.
    }
  }

  function reset() {
    setJob(null);
    setStatus("idle");
    setErrorCode(null);
    pollAttempts.current = 0;
  }

  const quotaText = remaining === null ? t.quota : `${remaining} ${locale === "zh-cn" ? "次访客下载剩余" : locale === "es" ? "descargas de invitado restantes" : "guest downloads remaining"}`;
  const errorMessage = copy.errors[errorCode as keyof typeof copy.errors] ?? copy.errors.default;
  const progressStage: ProcessingStage = job?.processingStage
    ?? (status === "queued" ? "queued" : status === "ready" ? "completed" : status === "failed" ? "failed" : status === "canceled" ? "canceled" : "fetching");
  const progressPercent = job?.progressPercent ?? (status === "ready" ? 100 : status === "processing" ? 5 : 0);

  return (
    <div className="studio-wrap">
      <div className="studio-glow" />
      <div className="studio">
        <div className="studio-topline">
          <div className="mode-switch">
            {!audioOnly && <button className={mode === "video" ? "active" : ""} onClick={() => setMode("video")} type="button" disabled={status === "submitting" || status === "queued" || status === "processing"}><Video size={16} />{t.video}</button>}
            <button className={mode === "audio" ? "active" : ""} onClick={() => setMode("audio")} type="button" disabled={status === "submitting" || status === "queued" || status === "processing"}><Headphones size={16} />{t.audio}</button>
          </div>
          <span className="quota"><span />{quotaText}</span>
        </div>

        <form onSubmit={submit} noValidate>
          <label htmlFor="media-url">{t.label}</label>
          <div className={`url-field ${status === "failed" ? "has-error" : ""}`}>
            <Link2 size={21} />
            <input id="media-url" inputMode="url" autoComplete="url" placeholder={placeholder ?? t.placeholder} value={url} onChange={(event) => { setUrl(event.target.value); if (status === "failed" && !job) { setStatus("idle"); setErrorCode(null); } }} disabled={status === "submitting" || status === "queued" || status === "processing"} />
            <button type="submit" disabled={status === "submitting" || status === "queued" || status === "processing" || (challengeRequired && !turnstileToken)}>
              {status === "submitting" ? <LoaderCircle className="spinner-icon" size={18} /> : <Sparkles size={18} />}
              <span>{status === "submitting" ? t.loading : t.submit}</span>
            </button>
          </div>
          {showQualitySelector && mode === "video" && (
            <div className="quality-field">
              <label htmlFor="media-quality">{copy.quality.label}</label>
              <select id="media-quality" value={quality} onChange={(event) => setQuality(event.target.value)} disabled={status === "submitting" || status === "queued" || status === "processing"}>
                {Object.entries(copy.quality.options).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
              </select>
            </div>
          )}
        </form>

        {challengeRequired && (
          <div className="media-challenge" role="status">
            <p>{copy.challenge}</p>
            <TurnstileWidget onToken={setTurnstileToken} />
          </div>
        )}

        {status !== "idle" && status !== "submitting" && (
          <div className={`media-job-status is-${status}`} role="status" aria-live="polite">
            <span className="media-job-icon">
              {status === "queued" && <Clock3 size={20} />}
              {status === "processing" && <LoaderCircle className="spinner-icon" size={20} />}
              {status === "ready" && <CircleCheck size={20} />}
              {(status === "failed" || status === "canceled") && <Ban size={20} />}
            </span>
            <div className="media-job-summary">
              <strong>{status === "queued" ? copy.queued : status === "processing" ? copy.processing : status === "ready" ? copy.ready : status === "canceled" ? copy.canceled : copy.failed}</strong>
              <p>{status === "queued" ? copy.queuedCopy : status === "processing" ? copy.processingCopy : status === "ready" ? copy.readyCopy : status === "failed" ? errorMessage : ""}</p>
              {(status === "queued" || status === "processing") && <MediaJobProgress locale={locale} stage={progressStage} percent={progressPercent} estimatedSecondsRemaining={job?.estimatedSecondsRemaining} />}
            </div>
            <div className="media-job-actions">
              {(status === "queued" || status === "processing") && <button type="button" className="secondary" onClick={cancel}>{copy.cancel}</button>}
              {status === "ready" && job?.artifacts?.map((artifact) => <a key={artifact.kind} href={artifact.downloadUrl}><Download size={17} />{copy.artifact[artifact.kind]}</a>)}
              {status === "ready" && !job?.artifacts?.length && job?.downloadUrl && <a href={job.downloadUrl}><Download size={17} />{t.download}</a>}
              {(status === "failed" || status === "canceled" || (status === "ready" && !job?.downloadUrl)) && <button type="button" onClick={reset}><RotateCcw size={17} />{copy.retry}</button>}
              {status === "failed" && errorCode === "QUOTA_EXCEEDED" && <a href={localePath(locale, "/auth/sign-in")}>{copy.signIn}</a>}
            </div>
          </div>
        )}

        <div className="studio-footer"><p><LockKeyhole size={15} />{t.legal}</p><div>{audioOnly ? <><span>MP3</span><span>SOURCE <b>AUDIO</b></span></> : <><span>MP4</span><span>MP3</span><span>4K <b>SOURCE</b></span></>}</div></div>
      </div>
    </div>
  );
}
