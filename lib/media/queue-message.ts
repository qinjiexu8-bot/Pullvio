export type MediaQueueMessage = {
  schemaVersion: 2;
  action: "process";
  jobId: string;
};

export function buildMediaQueueMessage(jobId: string): MediaQueueMessage {
  return { schemaVersion: 2, action: "process", jobId };
}
