export function buildArtifactUrl(domain: string, storagePath: string) {
  const base = domain.startsWith("http") ? domain : `https://${domain}`;
  const encodedPath = storagePath.split("/").map(encodeURIComponent).join("/");
  return `${base.replace(/\/$/, "")}/${encodedPath}`;
}
