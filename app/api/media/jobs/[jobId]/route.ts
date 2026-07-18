import { NextRequest } from "next/server";
import {
  assertSameOrigin,
  jsonNoStore,
  mediaErrorResponse,
  resolveMediaIdentity,
} from "@/lib/media/http";
import { createArtifactDownloadUrl } from "@/lib/media/delivery";
import { cancelOwnedMediaJob, getMediaArtifacts, getOwnedMediaJob } from "@/lib/media/repository";
import { clampProgress, estimateSecondsRemaining } from "@/lib/media/job-progress";

export const runtime = "nodejs";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type Context = { params: Promise<{ jobId: string }> };
const ARTIFACT_ORDER: Record<string, number> = { video: 0, audio: 1, thumbnail: 2 };

export async function GET(request: NextRequest, context: Context) {
  try {
    const { jobId } = await context.params;
    if (!UUID_PATTERN.test(jobId)) return notFound();
    const identity = await resolveMediaIdentity(request, { createAnonymous: false });
    if (!identity) return notFound();
    const job = await getOwnedMediaJob(identity.owner, jobId);
    if (!job) return notFound();
    let artifacts: SerializedArtifact[] = [];
    if (job.status === "ready") {
      const rows = await getMediaArtifacts(jobId);
      artifacts = (await Promise.all(rows.map(async (artifact) => ({
        kind: artifact.artifact_kind,
        contentType: artifact.content_type,
        fileSizeBytes: artifact.file_size_bytes,
        expiresAt: artifact.expires_at,
        downloadUrl: await createArtifactDownloadUrl(artifact.storage_path, artifact.expires_at),
      })))).filter((artifact) => Boolean(artifact.downloadUrl))
        .sort((left, right) => (ARTIFACT_ORDER[left.kind] ?? 99) - (ARTIFACT_ORDER[right.kind] ?? 99));
    }
    return jsonNoStore({ job: serializeJob(job, artifacts) });
  } catch (error) {
    return mediaErrorResponse(error);
  }
}

export async function DELETE(request: NextRequest, context: Context) {
  try {
    assertSameOrigin(request);
    const { jobId } = await context.params;
    if (!UUID_PATTERN.test(jobId)) return notFound();
    const identity = await resolveMediaIdentity(request, { createAnonymous: false });
    if (!identity) return notFound();
    const job = await cancelOwnedMediaJob(identity.owner, jobId);
    return job ? jsonNoStore({ job: serializeJob(job, []) }) : notFound();
  } catch (error) {
    return mediaErrorResponse(error);
  }
}

function notFound() {
  return jsonNoStore(
    { error: { code: "JOB_NOT_FOUND", message: "The media job was not found." } },
    { status: 404 },
  );
}

type SerializedArtifact = {
  kind: string;
  contentType: string;
  fileSizeBytes: number;
  expiresAt: string | null;
  downloadUrl: string | null;
};

function serializeJob(job: Record<string, unknown>, artifacts: SerializedArtifact[]) {
  const primary = artifacts.find((artifact) => artifact.kind === job.media_kind);
  const thumbnail = artifacts.find((artifact) => artifact.kind === "thumbnail");
  return {
    id: job.id,
    status: job.status,
    processingStage: job.processing_stage,
    progressPercent: clampProgress(job.progress_percent),
    estimatedSecondsRemaining: estimateSecondsRemaining({
      status: job.status,
      stage: job.processing_stage,
      progressPercent: job.progress_percent,
      startedAt: job.started_at,
    }),
    mediaKind: job.media_kind,
    format: job.requested_format,
    quality: job.requested_quality,
    platform: job.source_platform,
    title: job.title,
    thumbnailUrl: thumbnail?.downloadUrl ?? null,
    fileSizeBytes: job.file_size_bytes,
    failureCode: job.failure_code,
    cancellationRequested: Boolean(job.cancellation_requested_at),
    createdAt: job.created_at,
    startedAt: job.started_at,
    completedAt: job.completed_at,
    updatedAt: job.updated_at,
    expiresAt: primary?.expiresAt ?? null,
    downloadUrl: primary?.downloadUrl ?? null,
    artifacts,
  };
}
