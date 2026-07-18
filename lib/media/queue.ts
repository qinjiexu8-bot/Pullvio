import "server-only";
import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import { awsCredentialsProvider } from "@vercel/oidc-aws-credentials-provider";
import { buildMediaQueueMessage } from "./queue-message";

function createQueueClient(region: string, roleArn: string | undefined) {
  return new SQSClient({
    region,
    ...(roleArn
      ? { credentials: awsCredentialsProvider({ roleArn, roleSessionName: "pullvio-vercel-producer" }) }
      : {}),
  });
}

export async function dispatchMediaJob(jobId: string) {
  const queueUrl = process.env.PULLVIO_SQS_QUEUE_URL;
  const region = process.env.AWS_REGION ?? "us-east-1";
  if (!queueUrl) throw new Error("PULLVIO_SQS_QUEUE_URL is not configured.");

  const client = createQueueClient(region, process.env.AWS_ROLE_ARN);
  const response = await client.send(
    new SendMessageCommand({
      QueueUrl: queueUrl,
      MessageBody: JSON.stringify(buildMediaQueueMessage(jobId)),
      MessageAttributes: {
        schemaVersion: { DataType: "Number", StringValue: "2" },
      },
    }),
  );

  if (!response.MessageId) throw new Error("SQS did not return a message identifier.");
  return response.MessageId;
}
