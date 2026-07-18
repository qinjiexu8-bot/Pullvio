export const processingStages = [
  "queued",
  "fetching",
  "processing_audio",
  "processing_cover",
  "uploading",
  "completed",
  "failed",
  "canceled",
  "expired",
] as const;

export type ProcessingStage = (typeof processingStages)[number];

export function clampProgress(value: unknown) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.min(100, Math.max(0, Math.round(value)))
    : 0;
}

export function estimateSecondsRemaining({
  status,
  stage,
  progressPercent,
  startedAt,
  now = Date.now(),
}: {
  status: unknown;
  stage: unknown;
  progressPercent: unknown;
  startedAt: unknown;
  now?: number;
}) {
  if (status !== "processing" || typeof stage !== "string") return null;
  if (stage === "processing_audio") return 45;
  if (stage === "processing_cover") return 20;
  if (stage === "uploading") return 20;
  if (stage !== "fetching" || typeof startedAt !== "string") return null;

  const started = Date.parse(startedAt);
  const progress = clampProgress(progressPercent);
  const measured = (progress - 5) / 65;
  if (!Number.isFinite(started) || measured < 0.08) return null;

  const elapsedSeconds = Math.max(1, (now - started) / 1000);
  const providerSeconds = elapsedSeconds * ((1 - measured) / measured);
  return Math.round(Math.min(3600, Math.max(10, providerSeconds + 35)));
}
