import type { Locale } from "@/lib/i18n";
import { clampProgress, type ProcessingStage } from "@/lib/media/job-progress";

const progressCopy = {
  en: {
    stage: {
      queued: "Queued",
      fetching: "Getting media",
      processing_audio: "Processing audio",
      processing_cover: "Preparing cover",
      uploading: "Uploading files",
      completed: "Completed",
      failed: "Processing failed",
      canceled: "Canceled",
      expired: "Expired",
    },
    calculating: "Estimating time…",
    underMinute: "Less than a minute remaining",
    minutes: (value: number) => `About ${value} min remaining`,
  },
  "zh-cn": {
    stage: {
      queued: "排队中",
      fetching: "正在获取媒体",
      processing_audio: "正在处理音频",
      processing_cover: "正在生成封面",
      uploading: "正在上传文件",
      completed: "已完成",
      failed: "处理失败",
      canceled: "已取消",
      expired: "已过期",
    },
    calculating: "正在估算所需时间…",
    underMinute: "预计不到 1 分钟",
    minutes: (value: number) => `预计约 ${value} 分钟`,
  },
  es: {
    stage: {
      queued: "En cola",
      fetching: "Obteniendo contenido",
      processing_audio: "Procesando audio",
      processing_cover: "Preparando portada",
      uploading: "Subiendo archivos",
      completed: "Completada",
      failed: "Proceso fallido",
      canceled: "Cancelada",
      expired: "Caducada",
    },
    calculating: "Calculando el tiempo…",
    underMinute: "Queda menos de un minuto",
    minutes: (value: number) => `Quedan unos ${value} min`,
  },
} as const;

export default function MediaJobProgress({
  locale,
  stage,
  percent,
  estimatedSecondsRemaining = null,
  compact = false,
}: {
  locale: Locale;
  stage: ProcessingStage;
  percent: number;
  estimatedSecondsRemaining?: number | null;
  compact?: boolean;
}) {
  const copy = progressCopy[locale];
  const progress = clampProgress(percent);
  const active = stage === "queued" || stage === "fetching" || stage === "processing_audio" || stage === "processing_cover" || stage === "uploading";
  const eta = !active
    ? null
    : estimatedSecondsRemaining === null
      ? copy.calculating
      : estimatedSecondsRemaining < 60
        ? copy.underMinute
        : copy.minutes(Math.max(1, Math.round(estimatedSecondsRemaining / 60)));

  return (
    <div className={`media-progress${compact ? " is-compact" : ""}`}>
      <div className="media-progress-meta">
        <span>{copy.stage[stage]}</span>
        <span>{progress}%</span>
      </div>
      <div
        className="media-progress-track"
        role="progressbar"
        aria-label={copy.stage[stage]}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
      >
        <span style={{ width: `${progress}%` }} />
      </div>
      {eta && !compact && <small>{eta}</small>}
    </div>
  );
}
