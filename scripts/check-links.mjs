const baseUrl = new URL(process.env.BASE_URL || "http://localhost:3000");
const locales = ["", "/zh-cn", "/es"];
const pages = [
  "/",
  "/about",
  "/contact",
  "/guides",
  "/guides/mp4-vs-mp3",
  "/guides/video-resolution-guide",
  "/guides/save-online-media-legally",
  "/privacy",
  "/terms",
  "/copyright",
  "/acceptable-use",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/account",
];

const initialPaths = new Set();
for (const locale of locales) {
  for (const page of pages) {
    initialPaths.add(page === "/" ? locale || "/" : `${locale}${page}`);
  }
}

const queue = [...initialPaths];
const checked = new Map();
const fragments = [];
const failures = [];
let redirectCount = 0;

function internalUrl(href, from) {
  if (!href || /^(mailto:|tel:|javascript:)/i.test(href)) return null;
  const url = new URL(href, from);
  if (url.origin !== baseUrl.origin || url.pathname.startsWith("/_next/")) return null;
  return url;
}

async function request(path) {
  let url = new URL(path, baseUrl);
  const seen = new Set();
  let redirects = 0;

  while (redirects < 6) {
    if (seen.has(url.href)) throw new Error(`redirect loop at ${url.pathname}`);
    seen.add(url.href);
    const response = await fetch(url, { redirect: "manual" });
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) return { response, url, redirects };
      url = new URL(location, url);
      redirects += 1;
      continue;
    }
    return { response, url, redirects };
  }
  throw new Error(`too many redirects from ${path}`);
}

while (queue.length) {
  const path = queue.shift();
  if (checked.has(path)) continue;

  try {
    const { response, url, redirects } = await request(path);
    redirectCount += redirects;
    const html = await response.text();
    checked.set(path, { status: response.status, finalPath: url.pathname, html });

    if (response.status >= 400) {
      failures.push(`${path} -> HTTP ${response.status}`);
      continue;
    }

    for (const match of html.matchAll(/\shref=["']([^"']+)["']/gi)) {
      const target = internalUrl(match[1], url);
      if (!target) continue;
      const targetPath = `${target.pathname}${target.search}`;
      if (!checked.has(targetPath)) queue.push(targetPath);
      if (target.hash) fragments.push({ from: path, targetPath, id: decodeURIComponent(target.hash.slice(1)) });
    }
  } catch (error) {
    failures.push(`${path} -> ${error instanceof Error ? error.message : String(error)}`);
  }
}

for (const { from, targetPath, id } of fragments) {
  const target = checked.get(targetPath);
  if (!target || target.status >= 400) continue;
  const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (!new RegExp(`\\sid=["']${escaped}["']`).test(target.html)) {
    failures.push(`${from} -> ${targetPath}#${id} (missing fragment target)`);
  }
}

if (failures.length) {
  console.error(`Broken internal links (${failures.length}):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log(`Checked ${checked.size} internal URLs (${redirectCount} redirects); no broken pages or fragment targets.`);
}
