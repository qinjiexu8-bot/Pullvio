import "server-only";
import type { Json } from "@/lib/database.types";
import { createAdminClient } from "@/lib/supabase/admin";
import type { SubmitJobInput } from "./contracts";
import { notifyProviderBalanceExhausted } from "./alerts";
import { providerFormatFor, VisolixClient, VisolixError } from "./visolix";

const RESULT_TTL_SECONDS = boundedNumber(
  process.env.PULLVIO_PROVIDER_URL_TTL_SECONDS,
  3600,
  300,
  86400,
);

type DirectStartResult = {
  cacheHit: boolean;
  status: string;
};

type ProviderRun = {
  id: string;
  status: string;
  provider_platform: string;
  provider_job_id: string | null;
  provider_progress: number;
  result_url: string | null;
  result_expires_at: string | null;
  next_poll_at: string | null;
};

export async function startDirectProviderJob(
  jobId: string,
  input: SubmitJobInput,
): Promise<DirectStartResult> {
  const supabase = createAdminClient();
  const { data: reused, error: reuseError } = await supabase.rpc(
    "reuse_direct_provider_result",
    { p_job_id: jobId },
  );
  if (reuseError) throw new Error(`Could not reuse provider result: ${reuseError.code}`);
  if (reused === true) return { cacheHit: true, status: "ready" };

  const providerFormat = providerFormatFor(input);
  const { data, error } = await supabase.rpc("begin_direct_provider_run", {
    p_job_id: jobId,
    p_provider_format: providerFormat,
  });
  if (error) throw new Error(`Could not begin provider run: ${error.code}`);
  const run = data?.[0];
  if (!run) throw new Error("The provider run returned no decision.");
  if (run.result_code === "COMPLETED") return { cacheHit: true, status: "ready" };
  if (run.result_code === "RESUME") return { cacheHit: false, status: "processing" };
  if (run.result_code === "AMBIGUOUS") {
    await failDirectProviderJob(jobId, new VisolixError(
      "PROVIDER_SUBMISSION_AMBIGUOUS",
      "The previous provider submission outcome is unknown.",
      { outcomeKnown: false },
    ));
    return { cacheHit: false, status: "failed" };
  }
  if (run.result_code !== "SUBMIT") {
    await failDirectProviderJob(jobId, new VisolixError(
      "PROVIDER_STATE_INVALID",
      "The provider job could not be started.",
    ));
    return { cacheHit: false, status: "failed" };
  }

  const { data: marked, error: markError } = await supabase.rpc(
    "mark_direct_provider_submission_started",
    { p_job_id: jobId },
  );
  if (markError || marked !== true) {
    throw new Error(`Could not mark provider submission: ${markError?.code ?? "STATE_CONFLICT"}`);
  }

  try {
    const submission = await new VisolixClient().submit(input);
    const providerJobId = submission.providerJobId ?? `direct:${jobId}`;
    const { data: recorded, error: recordError } = await supabase.rpc(
      "record_direct_provider_submission",
      {
        p_job_id: jobId,
        p_provider_job_id: providerJobId,
        p_provider_info: submission.info,
      },
    );
    if (recordError || recorded !== true) {
      throw new Error(`Could not record provider submission: ${recordError?.code ?? "STATE_CONFLICT"}`);
    }
    if (submission.downloadUrl) {
      const { data: completed, error: completeError } = await supabase.rpc(
        "record_direct_provider_progress",
        {
          p_job_id: jobId,
          p_progress: 1000,
          p_result_url: submission.downloadUrl,
          p_provider_info: submission.info,
          p_status_text: "Ready",
          p_result_ttl_seconds: RESULT_TTL_SECONDS,
        },
      );
      if (completeError || completed !== true) {
        throw new Error(
          `Could not record provider result: ${completeError?.code ?? "STATE_CONFLICT"}`,
        );
      }
      return { cacheHit: false, status: "ready" };
    }
    return { cacheHit: false, status: "processing" };
  } catch (error) {
    if (error instanceof VisolixError) {
      await failDirectProviderJob(jobId, error, input.sourcePlatform);
      return { cacheHit: false, status: "failed" };
    }
    await failDirectProviderJob(jobId, new VisolixError(
      "PROVIDER_SUBMISSION_AMBIGUOUS",
      "The provider submission outcome is unknown.",
      { outcomeKnown: false },
    ));
    return { cacheHit: false, status: "failed" };
  }
}

export async function syncDirectProviderJob(jobId: string) {
  const supabase = createAdminClient();
  const { data: run, error } = await supabase
    .from("media_provider_runs")
    .select("id,status,provider_platform,provider_job_id,provider_progress,result_url,result_expires_at,next_poll_at")
    .eq("job_id", jobId)
    .maybeSingle<ProviderRun>();
  if (error) throw new Error(`Could not read provider run: ${error.code}`);
  if (!run) return;

  if (
    run.status === "completed"
    && run.result_expires_at
    && Date.parse(run.result_expires_at) <= Date.now()
  ) {
    await supabase.rpc("expire_direct_provider_results");
    return;
  }
  if (!["submitted", "processing"].includes(run.status) || !run.provider_job_id) return;
  if (run.next_poll_at && Date.parse(run.next_poll_at) > Date.now()) return;

  const now = new Date().toISOString();
  const nextPollAt = new Date(Date.now() + 5_000).toISOString();
  let claim = supabase
    .from("media_provider_runs")
    .update({ next_poll_at: nextPollAt })
    .eq("id", run.id)
    .in("status", ["submitted", "processing"]);
  claim = run.next_poll_at
    ? claim.eq("next_poll_at", run.next_poll_at)
    : claim.is("next_poll_at", null);
  const { data: claimed, error: claimError } = await claim.select("id").maybeSingle();
  if (claimError) throw new Error(`Could not claim provider poll: ${claimError.code}`);
  if (!claimed) return;

  try {
    const progress = await new VisolixClient().progress(run.provider_job_id);
    const { data: recorded, error: recordError } = await supabase.rpc(
      "record_direct_provider_progress",
      {
        p_job_id: jobId,
        p_progress: progress.progress,
        p_result_url: progress.downloadUrl,
        p_provider_info: progress.info,
        p_status_text: progress.text,
        p_result_ttl_seconds: RESULT_TTL_SECONDS,
      },
    );
    if (recordError || recorded !== true) {
      throw new Error(`Could not record provider progress: ${recordError?.code ?? "STATE_CONFLICT"}`);
    }
  } catch (progressError) {
    if (progressError instanceof VisolixError) {
      if (progressError.code === "PROVIDER_BALANCE_EXHAUSTED") {
        await failDirectProviderJob(jobId, progressError, run.provider_platform);
      } else if (!["PROVIDER_UNAVAILABLE", "PROVIDER_RESPONSE_INVALID"].includes(progressError.code)) {
        await failDirectProviderJob(jobId, progressError);
      } else {
        await supabase
          .from("media_provider_runs")
          .update({
            next_poll_at: new Date(Date.now() + 10_000).toISOString(),
            last_http_status: progressError.httpStatus,
            last_error_code: progressError.code,
            last_error_info: { observedAt: now },
          })
          .eq("id", run.id);
      }
      return;
    }
    await supabase
      .from("media_provider_runs")
      .update({
        next_poll_at: new Date(Date.now() + 10_000).toISOString(),
        last_error_code: "PROVIDER_UNAVAILABLE",
        last_error_info: { observedAt: now },
      })
      .eq("id", run.id);
  }
}

export async function getDirectProviderArtifact(jobId: string, mediaKind: string) {
  const { data, error } = await createAdminClient()
    .from("media_provider_runs")
    .select("result_url,result_expires_at,status")
    .eq("job_id", jobId)
    .maybeSingle();
  if (error) throw new Error(`Could not read provider result: ${error.code}`);
  if (
    !data
    || data.status !== "completed"
    || !data.result_url
    || !data.result_expires_at
    || Date.parse(data.result_expires_at) <= Date.now()
  ) return null;
  return {
    kind: mediaKind,
    contentType: mediaKind === "audio" ? "audio/mpeg" : "video/mp4",
    fileSizeBytes: 0,
    expiresAt: data.result_expires_at,
    downloadUrl: data.result_url,
  };
}

export async function getDirectProviderArtifacts(jobIds: string[]) {
  if (jobIds.length === 0) return [];
  const { data, error } = await createAdminClient()
    .from("media_provider_runs")
    .select("job_id,result_url,result_expires_at,status")
    .in("job_id", jobIds)
    .eq("status", "completed");
  if (error) throw new Error(`Could not read provider results: ${error.code}`);
  return (data ?? []).filter((run) =>
    Boolean(
      run.result_url
      && run.result_expires_at
      && Date.parse(run.result_expires_at) > Date.now(),
    ),
  );
}

export async function cancelDirectProviderJob(jobId: string) {
  const { data, error } = await createAdminClient().rpc(
    "cancel_direct_provider_job",
    { p_job_id: jobId },
  );
  if (error) throw new Error(`Could not cancel provider job: ${error.code}`);
  return data === true;
}

async function failDirectProviderJob(
  jobId: string,
  error: VisolixError,
  platform = "unknown",
) {
  const supabase = createAdminClient();
  const errorInfo: Json = {
    provider: "visolix",
    outcomeKnown: error.outcomeKnown,
    diagnostics: error.diagnostics,
  };
  if (error.code === "PROVIDER_BALANCE_EXHAUSTED") {
    const { data: shouldNotify } = await supabase.rpc(
      "fail_direct_provider_balance",
      { p_job_id: jobId },
    );
    if (shouldNotify === true) await notifyProviderBalanceExhausted(platform);
    return;
  }
  await supabase.rpc("fail_direct_provider_job", {
    p_job_id: jobId,
    p_failure_code: error.code,
    p_http_status: error.httpStatus,
    p_error_info: errorInfo,
  });
}

function boundedNumber(value: string | undefined, fallback: number, minimum: number, maximum: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= minimum && parsed <= maximum ? parsed : fallback;
}
