import "server-only";
import type { SubmitJobInput } from "./contracts";
import { createAdminClient } from "@/lib/supabase/admin";

export type MediaOwner =
  | { kind: "user"; userId: string }
  | { kind: "anonymous"; anonymousSubject: string };

export type ReservationResult = {
  resultCode: string;
  jobId: string | null;
  status: string | null;
  createdAt: string | null;
  quotaLimit: number | null;
  quotaRemaining: number | null;
  duplicate: boolean;
};

export async function reserveMediaJob(
  owner: MediaOwner,
  networkSubject: string | null,
  input: SubmitJobInput,
): Promise<ReservationResult> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("reserve_media_job", {
    p_user_id: (owner.kind === "user" ? owner.userId : null) as unknown as string,
    p_anonymous_subject: (owner.kind === "anonymous" ? owner.anonymousSubject : null) as unknown as string,
    p_network_subject: networkSubject as unknown as string,
    p_source_url: input.sourceUrl,
    p_source_host: input.sourceHost,
    p_source_platform: input.sourcePlatform,
    p_media_kind: input.mediaKind,
    p_requested_format: input.format,
    p_requested_quality: input.quality,
    p_idempotency_key: input.idempotencyKey,
  });

  if (error) throw new Error(`Media reservation failed: ${error.code}`);
  const row = data?.[0];
  if (!row) throw new Error("Media reservation returned no decision.");
  return {
    resultCode: row.result_code,
    jobId: row.job_id,
    status: row.job_status,
    createdAt: row.job_created_at,
    quotaLimit: row.quota_limit,
    quotaRemaining: row.quota_remaining,
    duplicate: row.is_duplicate,
  };
}

export async function mediaProviderChallengeRequired(owner: MediaOwner, networkSubject: string | null) {
  const { data, error } = await createAdminClient().rpc("media_provider_challenge_required", {
    p_user_id: owner.kind === "user" ? owner.userId : null,
    p_anonymous_subject: owner.kind === "anonymous" ? owner.anonymousSubject : null,
    p_network_subject: networkSubject,
  });
  if (error) throw new Error(`Could not evaluate media provider challenge: ${error.code}`);
  return data === true;
}

export async function markMediaJobDispatched(jobId: string) {
  const { data, error } = await createAdminClient().rpc("mark_media_job_dispatched", {
    p_job_id: jobId,
  });
  if (error) throw new Error(`Could not mark media job dispatched: ${error.code}`);
  return data;
}

export async function reuseCachedMediaJob(jobId: string) {
  const { data, error } = await createAdminClient().rpc("reuse_cached_media_job", {
    p_job_id: jobId,
  });
  if (error) throw new Error(`Could not reuse cached media job: ${error.code}`);
  return data;
}

export async function failUndispatchedMediaJob(jobId: string) {
  const { data, error } = await createAdminClient().rpc("fail_undispatched_media_job", {
    p_job_id: jobId,
  });
  if (error) throw new Error(`Could not compensate media dispatch failure: ${error.code}`);
  return data;
}

const PUBLIC_JOB_FIELDS = "id,status,processing_stage,progress_percent,media_kind,requested_format,requested_quality,source_platform,title,thumbnail_url,file_size_bytes,failure_code,cancellation_requested_at,created_at,started_at,completed_at,updated_at" as const;

function ownerQuery<T extends { eq: (column: string, value: string) => T }>(query: T, owner: MediaOwner) {
  return owner.kind === "user"
    ? query.eq("user_id", owner.userId)
    : query.eq("anonymous_subject", owner.anonymousSubject);
}

export async function getOwnedMediaJob(owner: MediaOwner, jobId: string) {
  let query = createAdminClient()
    .from("download_jobs")
    .select(PUBLIC_JOB_FIELDS)
    .eq("id", jobId);
  query = ownerQuery(query, owner);
  const { data, error } = await query.maybeSingle();
  if (error) throw new Error(`Could not read media job: ${error.code}`);
  return data;
}

export async function getMediaArtifacts(jobId: string) {
  const { data, error } = await createAdminClient()
    .from("download_artifacts")
    .select("artifact_kind,storage_path,content_type,file_size_bytes,expires_at")
    .eq("job_id", jobId)
    .order("artifact_kind", { ascending: true });
  if (error) throw new Error(`Could not read media artifacts: ${error.code}`);
  return data ?? [];
}

export async function cancelOwnedMediaJob(owner: MediaOwner, jobId: string) {
  const current = await getOwnedMediaJob(owner, jobId);
  if (!current) return null;
  if (["ready", "failed", "canceled", "expired"].includes(current.status)) return current;

  const now = new Date().toISOString();
  const update = current.status === "queued"
    ? { status: "canceled", cancellation_requested_at: now, completed_at: now }
    : { cancellation_requested_at: now };

  let query = createAdminClient()
    .from("download_jobs")
    .update(update)
    .eq("id", jobId)
    .eq("status", current.status);
  query = ownerQuery(query, owner);
  const { error } = await query;
  if (error) throw new Error(`Could not cancel media job: ${error.code}`);
  return getOwnedMediaJob(owner, jobId);
}
