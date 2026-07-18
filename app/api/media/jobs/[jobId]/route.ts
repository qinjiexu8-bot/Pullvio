import { NextRequest } from "next/server";
import {
  assertSameOrigin,
  jsonNoStore,
  mediaErrorResponse,
  resolveMediaIdentity,
} from "@/lib/media/http";
import { createArtifactDownloadUrl } from "@/lib/media/delivery";
import { cancelOwnedMediaJob, getMediaArtifact, getOwnedMediaJob } from "@/lib/media/repository";

export const runtime = "nodejs";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type Context = { params: Promise<{ jobId: string }> };

export async function GET(request: NextRequest, context: Context) {
  try {
    const { jobId } = await context.params;
    if (!UUID_PATTERN.test(jobId)) return notFound();
    const identity = await resolveMediaIdentity(request, { createAnonymous: false });
    if (!identity) return notFound();
    const job = await getOwnedMediaJob(identity.owner, jobId);
    if (!job) return notFound();
    let downloadUrl: string | null = null;
    if (job.status === "ready") {
      const artifact = await getMediaArtifact(jobId);
      if (artifact) downloadUrl = await createArtifactDownloadUrl(artifact.storage_path, artifact.expires_at);
    }
    return jsonNoStore({ job: serializeJob(job, downloadUrl) });
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
    return job ? jsonNoStore({ job: serializeJob(job, null) }) : notFound();
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

function serializeJob(job: Record<string, unknown>, downloadUrl: string | null) {
  return {
    id: job.id,
    status: job.status,
    mediaKind: job.media_kind,
    format: job.requested_format,
    quality: job.requested_quality,
    platform: job.source_platform,
    title: job.title,
    thumbnailUrl: job.thumbnail_url,
    fileSizeBytes: job.file_size_bytes,
    failureCode: job.failure_code,
    cancellationRequested: Boolean(job.cancellation_requested_at),
    createdAt: job.created_at,
    startedAt: job.started_at,
    completedAt: job.completed_at,
    updatedAt: job.updated_at,
    downloadUrl,
  };
}
