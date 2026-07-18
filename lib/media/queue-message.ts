export type MediaQueueMessage = {
  schemaVersion: 1;
  jobId: string;
};

export function buildMediaQueueMessage(jobId: string): MediaQueueMessage {
  return { schemaVersion: 1, jobId };
}
