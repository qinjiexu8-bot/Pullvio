type DownloadableJob = {
  status: string;
  downloadUrl?: string | null;
  artifacts?: Array<{ downloadUrl?: string | null }>;
};

export function needsDownloadDetails(job: DownloadableJob) {
  if (job.status !== "ready") return false;
  if (job.downloadUrl) return false;
  return !job.artifacts?.some((artifact) => Boolean(artifact.downloadUrl));
}
