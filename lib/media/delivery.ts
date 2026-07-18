import "server-only";
import { GetSecretValueCommand, SecretsManagerClient } from "@aws-sdk/client-secrets-manager";
import { getSignedUrl } from "@aws-sdk/cloudfront-signer";
import { awsCredentialsProvider } from "@vercel/oidc-aws-credentials-provider";
import { buildArtifactUrl } from "./delivery-url";

let signingKeyCache: { value: string; expiresAt: number } | null = null;

function createSecretsClient() {
  const region = process.env.AWS_REGION ?? "us-east-1";
  const roleArn = process.env.AWS_ROLE_ARN;
  return new SecretsManagerClient({
    region,
    ...(roleArn
      ? { credentials: awsCredentialsProvider({ roleArn, roleSessionName: "pullvio-vercel-delivery" }) }
      : {}),
  });
}

async function getSigningPrivateKey() {
  if (signingKeyCache && signingKeyCache.expiresAt > Date.now()) return signingKeyCache.value;
  const secretId = process.env.PULLVIO_CLOUDFRONT_SIGNING_SECRET_ID;
  if (!secretId) throw new Error("CloudFront signing secret is not configured.");
  const response = await createSecretsClient().send(new GetSecretValueCommand({ SecretId: secretId }));
  if (!response.SecretString) throw new Error("CloudFront signing secret has no string value.");

  let privateKey = response.SecretString;
  if (privateKey.trimStart().startsWith("{")) {
    const parsed = JSON.parse(privateKey) as { privateKey?: unknown };
    if (typeof parsed.privateKey !== "string") throw new Error("CloudFront signing secret is malformed.");
    privateKey = parsed.privateKey;
  }
  if (!privateKey.includes("BEGIN") || !privateKey.includes("PRIVATE KEY")) {
    throw new Error("CloudFront signing key is malformed.");
  }

  signingKeyCache = { value: privateKey, expiresAt: Date.now() + 5 * 60 * 1000 };
  return privateKey;
}

export async function createArtifactDownloadUrl(storagePath: string, artifactExpiresAt: string | null) {
  const domain = process.env.PULLVIO_CLOUDFRONT_DOMAIN;
  const keyPairId = process.env.PULLVIO_CLOUDFRONT_PUBLIC_KEY_ID;
  if (!domain || !keyPairId) throw new Error("CloudFront delivery configuration is incomplete.");

  const maximumExpiry = Date.now() + 30 * 60 * 1000;
  const artifactExpiry = artifactExpiresAt ? Date.parse(artifactExpiresAt) : maximumExpiry;
  const expiresAt = Math.min(maximumExpiry, artifactExpiry);
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now() + 30_000) return null;

  return getSignedUrl({
    url: buildArtifactUrl(domain, storagePath),
    keyPairId,
    privateKey: await getSigningPrivateKey(),
    dateLessThan: new Date(expiresAt).toISOString(),
  });
}
