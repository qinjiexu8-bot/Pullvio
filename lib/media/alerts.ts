import "server-only";

export async function notifyProviderBalanceExhausted(platform: string) {
  const webhook = process.env.PULLVIO_FEISHU_WEBHOOK_URL;
  if (!webhook) return false;
  try {
    const parsed = new URL(webhook);
    if (parsed.protocol !== "https:" || parsed.hostname !== "open.feishu.cn") return false;
    const response = await fetch(parsed, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        msg_type: "text",
        content: {
          text: [
            "Pullvio provider alert",
            "Visolix balance is insufficient (HTTP 402).",
            `Platform: ${platform}`,
            "All Visolix-backed download sources have been paused.",
          ].join("\n"),
        },
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    return response.ok;
  } catch {
    return false;
  }
}
