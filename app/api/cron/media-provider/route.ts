import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { syncDirectProviderJob } from "@/lib/media/direct-provider";
import { createAdminClient } from "@/lib/supabase/admin";

export const maxDuration = 60;

export async function GET(request: Request) {
  if (!isAuthorized(request.headers.get("authorization"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date().toISOString();
  const { data: runs, error } = await createAdminClient()
    .from("media_provider_runs")
    .select("job_id")
    .in("status", ["submitted", "processing"])
    .or(`next_poll_at.is.null,next_poll_at.lte.${now}`)
    .order("next_poll_at", { ascending: true, nullsFirst: true })
    .limit(20);

  if (error) {
    return NextResponse.json({ error: "Could not load provider jobs." }, { status: 500 });
  }

  const settled = await Promise.allSettled(
    (runs ?? []).map((run) => syncDirectProviderJob(run.job_id)),
  );
  const failed = settled.filter((result) => result.status === "rejected").length;
  return NextResponse.json({
    checked: settled.length,
    succeeded: settled.length - failed,
    failed,
  });
}

function isAuthorized(value: string | null) {
  const secret = process.env.CRON_SECRET;
  if (!secret || secret.length < 32 || !value?.startsWith("Bearer ")) return false;
  const supplied = value.slice("Bearer ".length);
  const expectedBuffer = Buffer.from(secret);
  const suppliedBuffer = Buffer.from(supplied);
  return expectedBuffer.length === suppliedBuffer.length
    && timingSafeEqual(expectedBuffer, suppliedBuffer);
}
